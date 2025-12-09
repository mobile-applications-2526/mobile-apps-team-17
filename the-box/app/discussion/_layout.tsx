import PageHeader from "@/components/PageHeader";
import { Stack, useRouter } from "expo-router";
import { Image, Pressable, View } from "react-native";
import BackIcon from "../../assets/images/back-icon.png";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Incognito from "../../assets/images/incognito.png";

export default function DiscussionLayout() {
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
  }, []);


  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTitle: () => (
            <View className="flex-row">
              <PageHeader title="Discussion" />
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
        headerTitleAlign: "left",
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ paddingRight: 4 }}>
            <Image source={BackIcon} style={{ width: 36, height: 36 }} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
