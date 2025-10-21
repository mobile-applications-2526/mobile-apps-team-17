import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { supabase } from '../../supabase';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React from 'react';

type Company = { name: string };

export default function HomeScreen() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase.from('companies').select('name');

      if (error) {
        setErrorMsg(error.message);
        setCompanies(null);
      } else {
        setCompanies(data ?? []);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Companies</ThemedText>
        {loading && <ThemedText>Loading…</ThemedText>}
        {errorMsg && <ThemedText>{`Error: ${errorMsg}`}</ThemedText>}
        {companies?.map((c, idx) => (
          <ThemedText key={`${c.name}-${idx}`}>• {c.name}</ThemedText>
        ))}
        {!loading && !errorMsg && companies?.length === 0 && (
          <ThemedText>(no companies yet)</ThemedText>
        )}
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepContainer: { gap: 8, marginBottom: 8 },
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' },
});
