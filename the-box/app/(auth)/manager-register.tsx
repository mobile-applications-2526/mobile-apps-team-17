import Input from "@/components/forms/Input";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
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
    <View className="bg-white flex-1 px-5 justify-center">
      <View className="mb-20">
        <Text className="text-xl font-bold text-brand-black mb-3 font-sf-pro">
          Sign up as
        </Text>

        <View className="bg-brand-blue rounded-[7px] py-3 px-6 items-center shadow-lg mb-3">
          <Text className=" text-white text-xl font-bold font-sf-pro">
            Manager
          </Text>
        </View>

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
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={handlePasswordBlur}
            secureTextEntry={!showPassword}
            editable={!loading}
            className="mb-0"
          />
          <TouchableOpacity
            className="absolute right-0 top-0 py-4 px-4 flex-row items-center"
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
          className={`rounded-[7px] px-4 py-3 items-center ${
            loading ? "bg-gray-300" : "bg-brand-blue"
          }`}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xl font-bold font-sf-pro">
            {loading ? "Creating Account..." : "Signup"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
