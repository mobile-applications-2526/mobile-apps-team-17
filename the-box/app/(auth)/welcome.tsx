import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white ">
      <View className="flex-1 justify-center px-6 mb-20">
        <Text className="text-xl font-bold text-brand-black mb-3 font-sf-pro">
          Login as
        </Text>

        <View className="gap-3 w-full">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/manager-login")}
            activeOpacity={0.8}
            className="bg-brand-blue rounded-[7px] py-3 px-6 items-center shadow-lg"
          >
            <Text className="text-white text-xl font-bold font-sf-pro">
              Manager
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/employee-register")}
            activeOpacity={0.8}
            className="bg-brand-blue rounded-[7px] py-3 px-6 items-center shadow-lg"
          >
            <Text className="text-white text-xl font-bold font-sf-pro">
              Employee
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
