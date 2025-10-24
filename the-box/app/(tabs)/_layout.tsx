import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { supabase } from '@/supabase';
import { HapticTab } from '../../components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
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
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1877F2',
        },
        headerShadowVisible: false,
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
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#1877F2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Draft',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}