import { supabase } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function TabLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTitleStyle: {
          fontSize: 48,
          fontWeight: "bold",
          color: "#1877F2",
        },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerRight: () => (
          <Pressable
            onPress={handleLogout}
            style={{
              marginRight: 15,
              padding: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </Pressable>
        ),
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
    </Tabs>
  );
}
