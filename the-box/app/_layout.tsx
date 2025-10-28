import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import CustomBackIcon from "../assets/images/back-icon.png";
import Splash from "../components/Splash";
import "../global.css";
import { supabase } from "../supabase";

const CustomLeftButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ height: "100%", justifyContent: "center" }}
    >
      <Image
        source={CustomBackIcon}
        style={{ width: 40, height: 40, marginRight: 7 }}
      />
    </TouchableOpacity>
  );
};

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
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="create-idea"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Draft",
          headerShadowVisible: false,
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTitleStyle: {
            fontSize: 48,
            fontWeight: "bold",
            color: "#1877F2",
          },
        }}
      />
    </Stack>
  );
}
