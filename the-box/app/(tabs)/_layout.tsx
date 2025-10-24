import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { supabase } from '@/supabase';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LogOut } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/welcome');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
      <Tabs
        screenOptions={{
          headerShown: true,
          headerRight: () => (
            <Pressable onPress={handleLogout} style={{ marginRight: 15 }}>
              <LogOut color="#007AFF" size={22} />
            </Pressable>
          ),
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Test',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    );
}
