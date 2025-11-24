import PageHeader from "@/components/PageHeader";
import { Stack, useRouter } from "expo-router";
import { Image, Pressable } from "react-native";
import BackIcon from "../../assets/images/back-icon.png";

export default function DiscussionLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTitle: () => <PageHeader title="Discussion" />,
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ paddingRight: 4 }}>
            <Image source={BackIcon} style={{ width: 36, height: 36 }} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
