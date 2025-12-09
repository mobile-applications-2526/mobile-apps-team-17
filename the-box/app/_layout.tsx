import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import CustomBackIcon from "../assets/images/back-icon.png";
import Splash from "../components/Splash";
import "../global.css";
import PageHeader from "@/components/PageHeader";
import Incognito from "../assets/images/incognito.png";

const CustomLeftButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ height: "100%", justifyContent: "center" }}
    >
      <Image
        source={CustomBackIcon}
        style={{ width: 36, height: 36, marginRight: 7 }}
      />
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
        const checkAnonymous = async () => {
      try {
        const mode = await AsyncStorage.getItem("anonymous_mode");
        setIsAnonymous(mode === "true");
      } catch (e) {
        console.error("Failed to check anonymous mode", e);
      }
    };
    checkAnonymous();
  }, [pathname]);

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
    <ActionSheetProvider>
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
            headerTitle: () => (
              <View className="flex-row">
                <PageHeader title="Draft" />
                {isAnonymous && (
                  <Image
                    source={Incognito}
                    style={{ width: 20, height: 20}}
                    resizeMode="contain"
                  />
                )}
              </View>
            ),
            headerShadowVisible: false,
            headerBackVisible: false,
            headerStyle: {
              backgroundColor: "#ffffff",
            },
            headerTitleAlign: "left",
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
