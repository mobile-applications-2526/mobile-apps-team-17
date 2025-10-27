import { supabase } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";
import Input from "../../components/forms/Input";

export default function ManagerLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handlePasswordBlur = () => {
    setShowPassword(false);
  };

  // TODO - we shouldn't show alert, instead custom message (component? modal?)
  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter email and password");
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
      if (authError) throw authError;

      const { data: rpc, error: rpcError } = await supabase.rpc(
        "register_manager",
        {
          p_email: email.trim().toLowerCase(),
          p_full_name: authData.user?.user_metadata?.full_name ?? "",
          p_company_name: authData.user?.user_metadata?.company_name ?? "",
        }
      );

      if (rpcError) {
        const msg = (rpcError as any).message ?? "";
        if (!msg.toLowerCase().includes("already")) throw rpcError;
      } else if (
        rpc &&
        rpc.success === false &&
        !String(rpc.error).toLowerCase().includes("already")
      ) {
        throw new Error(rpc.error);
      }

      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("id, role, company_id, full_name, email")
        .eq("id", authData.user.id)
        .single();

      if (userErr || !userRow) throw new Error("User profile not found");
      if (userRow.role !== "manager") {
        await supabase.auth.signOut();
        throw new Error("This login is for managers only");
      }

      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userRow.id);

      router.replace("/(tabs)");
    } catch (e: any) {
      // TODO - we shouldn't show alert, instead custom message (component? modal?)
      Alert.alert("Login Failed", e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 px-5 justify-center">
      <Text className="text-2xl font-bold mb-7 text-center font-sf-pro text-brand-black">
        Manager Login
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
          placeholder="Password"
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

      <TouchableOpacity
        className={`mt-2.5 rounded-[7px] px-4 py-4 items-center ${
          loading ? "bg-gray-300" : "bg-brand-blue"
        }`}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-semibold font-sf-pro">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <Pressable
        className="mt-5 items-center"
        onPress={() => router.push("/(auth)/manager-register")}
      >
        <Text className="text-brand-blue text-sm font-sf-pro">
          Don't have an account? Register
        </Text>
      </Pressable>
    </View>
  );
}
