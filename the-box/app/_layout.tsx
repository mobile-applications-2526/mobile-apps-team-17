import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import CustomBackIcon from "../assets/images/back-icon.png";
import Splash from "../components/Splash";
import "../global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PageHeader from "../components/PageHeader";

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
    let mounted = true;

    const checkAndRedirect = async () => {
      if (!mounted) return;
      try {
        const userString = await AsyncStorage.getItem("user");
        const hasUser = !!userString;
        const inAuthGroup = segments[0] === "(auth)";

        if (hasUser) {
          if (inAuthGroup) router.replace("/(tabs)");
        } else {
          if (!inAuthGroup && pathname !== "/(auth)/login") {
            router.replace("/(auth)/login");
          }
        }
      } catch (err) {
        console.error("Failed to read user from AsyncStorage:", err);
        if (!mounted) return;
        // on error assume not authenticated
        if (pathname !== "/(auth)/login") router.replace("/(auth)/login");
      }
    };

    if (splashTimerDone) checkAndRedirect();

    return () => {
      mounted = false;
    };
  }, [splashTimerDone, segments, pathname, router]);

  if (!splashTimerDone) {
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
          headerTitle: () => <PageHeader title="Draft" />,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTitleAlign: "left",
        }}
      />
    </Stack>
  );
}
