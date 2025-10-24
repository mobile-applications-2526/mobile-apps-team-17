import '../global.css';
import { Slot, usePathname, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

    useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup && pathname !== '/(auth)/welcome') {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup && pathname !== '/(tabs)') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, pathname, router]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Slot />
  );
}