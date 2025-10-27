import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import Splash from "../components/Splash";
import "../global.css";
import { supabase } from "../supabase";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  // for branding
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashTimerDone(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup && pathname !== "/(auth)/welcome") {
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup && pathname !== "/(tabs)") {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, pathname, router]);

  if (!splashTimerDone || isAuthenticated === null) {
    return <Splash />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="create-idea"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
