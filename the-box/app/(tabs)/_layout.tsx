import { supabase } from "@/supabase";
import { Tabs, useRouter } from "expo-router";
import { Pressable, Image, ActionSheetIOS, Button } from "react-native";
import MoreIcon from "../../assets/images/more-icon.png";
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { Text } from 'react-native';
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const router = useRouter();

  const [openMenu, setOpenMenu] = React.useState(false);

  const [user, setUser] = React.useState(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);

        if ((parsed as any).role == "manager") {
          setOpenMenu(true);
        }
      }
    } catch (err) {
      console.error("Failed to load user from AsyncStorage:", err);
      router.replace("/(auth)/welcome");
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handGenerateCode = async () => {
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const YYYY = now.getFullYear();
      const MM = pad(now.getMonth() + 1);
      const DD = pad(now.getDate());
      const ss = pad(now.getSeconds());
      const mm = pad(now.getMinutes());
      const hh = pad(now.getHours());

      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:'\",.<>/?\\|~";
      const random = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

      const code = `${YYYY}${MM}${DD}${ss}${mm}${hh}-${random}`;

      const created_by = (user as any)?.id ?? (user as any)?.user_id ?? null;
      const created_at = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // +7 days (YYYY-MM-DD)

      const { data, error } = await supabase
        .from("access_codes")
        .insert([
          {
            code,
            created_by,
            created_at,
            expires_at,
            used_at: null,
            used_by: null,
            status: "available",
            device_id: null,
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting access code:", error);
        alert("Failed to create access code");
        return;
      }

      alert(`Access code created: ${code}`);

    } catch (err) {
      console.error("Unexpected error creating access code:", err);
      alert("Unexpected error creating access code");
    }
  }

  const showMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Create code', 'Cancel'],
        cancelButtonIndex: 1
      },
      (buttonIndex) => {
        if (buttonIndex === 0) handGenerateCode();
      }
    );
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
          <>
          <Pressable
            onPress={handleLogout}
            style={{
              marginRight: 15,
              padding: 8,
            }}
          >
            <Image source={LogoutIcon} style={{ width: 40, height: 40 }} />
          </Pressable>
          {openMenu && (
            <Pressable
              onPress={showMenu}
              style={{
                marginRight: 15,
                padding: 8,
              }}
            >
              <Image source={MoreIcon} style={{ width: 24, height: 24 }} />
            </Pressable>
          )}
          </>
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
