import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <Text className="text-4xl font-bold text-brand-black mb-2 font-sf-pro">
        Welcome to The Box
      </Text>
      <Text className="text-base text-gray-600 font-sf-pro mb-6">
        Anonymous Workplace Ideas
      </Text>

      <View className="gap-4 w-full">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/manager-login")}
          activeOpacity={0.8}
          className="bg-brand-blue rounded-[7px] py-4 px-6 items-center shadow-lg"
        >
          <Text className="text-white text-lg font-semibold font-sf-pro">
            I'm a Manager
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/employee-register")}
          activeOpacity={0.8}
          className="bg-brand-blue rounded-[7px] py-4 px-6 items-center shadow-lg"
        >
          <Text className="text-white text-lg font-semibold font-sf-pro">
            I'm an Employee
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
