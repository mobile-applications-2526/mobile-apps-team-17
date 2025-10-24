import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to The Box</Text>
      <Text style={styles.subtitle}>Anonymous Workplace Ideas</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="I'm a Manager"
          onPress={() => router.push('/(auth)/manager-login')}
        />
        
        <Button
          title="I'm an Employee"
          onPress={() => router.push('/(auth)/employee-register')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
    maxWidth: 300,
  },
});