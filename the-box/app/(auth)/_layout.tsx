import { Stack, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
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

const CustomHeaderTitle = (props: any) => (
  <View style={{ flex: 1, flexDirection: "row" }}>
    <Text
      style={{
        fontSize: 48,
        fontWeight: "bold",
        color: "#1877F2",
      }}
    >
      {props.children}
    </Text>
  </View>
);

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: () => <CustomHeaderTitle>Welcome</CustomHeaderTitle>,
        }}
      />
      <Stack.Screen
        name="manager-register"
        options={{
          headerTitle: () => <CustomHeaderTitle>Signup</CustomHeaderTitle>,
          headerLeft: () => <CustomLeftButton />,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
