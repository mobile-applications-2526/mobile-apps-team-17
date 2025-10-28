import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
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
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          headerTitle: "Welcome",
        }}
      />
      <Stack.Screen
        name="manager-login"
        options={{
          headerTitle: "Login",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="manager-register"
        options={{
          headerTitle: "Signup",
        }}
      />
      <Stack.Screen
        name="employee-register"
        options={{
          headerTitle: "Signup",
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
