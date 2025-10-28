import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function EmployeeRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // TODO - implement
  const handleAnonymousLogin = async () => {
    setLoading(true);

    return null;
  };

  return (
    <View className="bg-white flex-1 px-5 justify-center">
      <View className="mb-10">
        <Text className="text-xl font-bold text-brand-black mb-3 font-sf-pro">
          Login as
        </Text>

        <View className="flex-row gap-3 w-full mb-3">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 border-2 border-gray-300 rounded-[7px] py-2 px-6 items-center"
            onPress={() => router.push("/(auth)/manager-login")}
          >
            <Text className="text-gray-400 text-lg font-bold font-sf-pro">
              Manager
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 bg-brand-blue rounded-[7px] py-2 px-6 items-center shadow-lg"
          >
            <Text className="text-white text-lg font-bold font-sf-pro">
              Employee
            </Text>
          </TouchableOpacity>
        </View>

        <View className="border-2 border-brand-black rounded-[7px] p-4 mb-3">
          <Text className="text-base font-sf-pro text-brand-black leading-5">
            In order to keep it anonymous, you do not need an account to use
            this app as an employee.{"\n"}
            {"\n"}
            By tapping the "Login" button below, your device will be
            automatically assigned a randomised ID without any of your personal
            information asked or saved.
          </Text>
        </View>

        <TouchableOpacity
          className={`rounded-[7px] px-4 py-3 items-center ${
            loading ? "bg-gray-300" : "bg-brand-blue"
          }`}
          onPress={handleAnonymousLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-lg font-bold font-sf-pro">
              Login
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
