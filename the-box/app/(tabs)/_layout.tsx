import { supabase } from "@/supabase";
import { Tabs, useRouter } from "expo-router";
import { ActionSheetIOS, Image, Pressable } from "react-native";
import LogoutIcon from "../../assets/images/logout-icon.png";
import MoreIcon from "../../assets/images/more-icon.png";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';

export default function TabLayout() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);

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
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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

  const showMenuCopy = (code: string) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Copy code', 'Cancel'],
        cancelButtonIndex: 1,
        title: "Generated employee code: " + code,
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          await Clipboard.setStringAsync(code);
          alert("Code copied to clipboard.");
        };
      }
    );
  };

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
      const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

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

      showMenuCopy(code);

    } catch (err) {
      console.error("Unexpected error creating access code:", err);
      alert("Unexpected error creating access code");
    }
  }

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
              <Image source={MoreIcon} style={{ width: 40, height: 40 }} />
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
