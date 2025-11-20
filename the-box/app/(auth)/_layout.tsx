import { Stack, useRouter } from "expo-router";
import { Image, Platform, TouchableOpacity } from "react-native";
import CustomBackIcon from "../../assets/images/back-icon.png";
import PageHeader from "@/components/PageHeader";

const CustomLeftButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ justifyContent: "center" }}
    >
      <Image
        source={CustomBackIcon}
        style={{ width: 36, height: 36, marginRight: Platform.OS === "ios" ? 0 : 20 }}
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
        headerShadowVisible: false,
        headerTitleAlign: "left",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: () => <PageHeader title="Welcome" />,
        }}
      />
      <Stack.Screen
        name="manager-register"
        options={{
          headerTitle: () => <PageHeader title="Signup" />,
          headerLeft: () => <CustomLeftButton />,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
