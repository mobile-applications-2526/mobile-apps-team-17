import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="manager-login" />
      <Stack.Screen name="manager-register" />
      <Stack.Screen name="employee-register" />
    </Stack>
  );
}