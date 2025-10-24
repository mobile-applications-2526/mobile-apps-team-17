// app/(auth)/manager-login.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabase';

export default function ManagerLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!email || !password) {
    return Alert.alert('Error', 'Please enter email and password');
  }

  setLoading(true);
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (authError) throw authError;

    const { data: rpc, error: rpcError } = await supabase.rpc('register_manager', {
      p_email: email.trim().toLowerCase(),
      p_full_name: authData.user?.user_metadata?.full_name ?? '',
      p_company_name: authData.user?.user_metadata?.company_name ?? ''
    });

    if (rpcError) {
      const msg = (rpcError as any).message ?? '';
      if (!msg.toLowerCase().includes('already')) throw rpcError;
    } else if (rpc && rpc.success === false && !String(rpc.error).toLowerCase().includes('already')) {
      throw new Error(rpc.error);
    }

    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id, role, company_id, full_name, email')
      .eq('id', authData.user.id)
      .single();

    if (userErr || !userRow) throw new Error('User profile not found');
    if (userRow.role !== 'manager') {
      await supabase.auth.signOut();
      throw new Error('This login is for managers only');
    }

    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userRow.id);

    router.replace('/(tabs)');
  } catch (e: any) {
    Alert.alert('Login Failed', e.message ?? 'Unknown error');
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => router.push('/(auth)/manager-register')}
      >
        <Text style={styles.linkText}>
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});