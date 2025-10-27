import Input from "@/components/forms/Input";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../supabase";

export default function ManagerRegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handlePasswordBlur = () => {
    setShowPassword(false);
  };

  // TODO - we shouldn't show alert, instead custom message (component? modal?)
  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    if (password.length < 8) {
      return Alert.alert(
        "Error",
        "Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character."
      );
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            role: "manager",
          },
        },
      });
      if (error) throw error;
      // TODO - we shouldn't show alert, instead custom message (component? modal?)
      Alert.alert(
        "Check your email",
        "We sent you a confirmation link. After confirming, please log in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/manager-login") }]
      );
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 px-5 justify-center">
      <Text className="text-2xl font-bold mb-7 text-center font-sf-pro text-brand-black">
        Manager Registration
      </Text>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <View className="relative">
        <Input
          placeholder="Password "
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={handlePasswordBlur}
          secureTextEntry={!showPassword}
          editable={!loading}
          className="mb-0"
        />
        <TouchableOpacity
          className="absolute right-0 top-0 h-full px-4 justify-center"
          onPress={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={20}
            color="#0E121A80"
          />
        </TouchableOpacity>
      </View>

      <Input
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        editable={!loading}
      />

      <TouchableOpacity
        className={`mt-2.5 rounded-[7px] px-4 py-4 items-center ${
          loading ? "bg-gray-300" : "bg-brand-blue"
        }`}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-semibold font-sf-pro">
          {loading ? "Creating Account..." : "Register"}
        </Text>
      </TouchableOpacity>

      <Pressable
        className="mt-5 items-center"
        onPress={() => router.push("/(auth)/manager-login")}
      >
        <Text className="text-brand-blue text-sm font-sf-pro">
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}
