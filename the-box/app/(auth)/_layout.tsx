import { Stack, useRouter } from "expo-router";
import { Image, TouchableOpacity } from "react-native";
import CustomBackIcon from "../../assets/images/back-icon.png";

const CustomLeftButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ height: "100%", justifyContent: "center" }}
    >
      <Image
        source={CustomBackIcon}
        style={{ width: 40, height: 40, marginRight: 7 }}
      />
    </TouchableOpacity>
  );
};

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
        headerTitleAlign: "left",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: "Welcome",
        }}
      />
      <Stack.Screen
        name="manager-register"
        options={{
          headerTitle: "Signup",
          headerLeft: () => <CustomLeftButton />,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="employee-register"
        options={{
          headerTitle: "Signup",
          headerLeft: () => <CustomLeftButton />,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
