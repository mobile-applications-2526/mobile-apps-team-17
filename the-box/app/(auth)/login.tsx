import Input from "@/components/forms/Input";
import { supabase } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"employee" | "manager">("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeLoginCode, setEmployeeLoginCode] = useState(null);

  useEffect(() => {
    setShowPassword(false);
    setEmail("");
    setPassword("");
  }, []);

  // TODO - not sure why after logging in, it jumps back to login page
  const handleEmployeeLogin = async () => {
    setLoading(true);

    const { data: codeRow, error: codeErr } = await supabase
          .from("access_codes")
          .select("*")
          .eq("code", employeeLoginCode)
          .single();

    if (codeErr || !codeRow) {
      alert("Access code not found.");
      setLoading(false);
      return;
    }

    if (codeRow.status !== "available") {
      alert("Access code is used or expired.");
      setLoading(false);
      return;
    }

    const { data: managerRow, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", codeRow.created_by)
      .single();
    
    const { data: addEmployee, error } = await supabase
      .from('users')
      .insert([
        {
          company_id: managerRow.company_id,
          role: "employee",
          full_name: null,
          email: null,
          created_at: new Date().toISOString(),
          last_login: null,
          is_active: true
        },
      ])
      .select();
    
    // ensure a stable device id for this device (store it in AsyncStorage if missing)
    let device_id = "ABCD";
    if (!device_id) {
      device_id = `device-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      await AsyncStorage.setItem("deviceId", device_id);
    }

    // used_at in YYYY-MM-DD
    const used_at = new Date().toISOString().slice(0, 10);

    const { data: updatedCode, error: updateCodeErr } = await supabase
      .from("access_codes")
      .update({
        status: "used",
        used_at,
        device_id,
      })
      .eq("id", codeRow.id)
      .select()
      .single();

    // if (updateCodeErr || !updatedCode) {
    //   Alert.alert("Error", "Failed to mark access code as used");
    //   setLoading(false);
    //   return;
    // }

    console.log(addEmployee);

    if (error || !addEmployee || !Array.isArray(addEmployee) || addEmployee.length === 0) {
      Alert.alert("Error", "Failed to create employee account");
      setLoading(false);
      return;
    }

    // store the created user object (first item in the inserted rows)
    await AsyncStorage.setItem("user", JSON.stringify(addEmployee[0]));

    // WHY!!!!!!
    router.replace("/(tabs)");
    setLoading(false);
  };

  // TODO - we shouldn't show alert, instead custom message (component? modal?)
  const handleManagerLogin = async () => {
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

      await AsyncStorage.setItem("user", JSON.stringify(userRow));

      router.replace("/(tabs)");
    } catch (e: any) {
      // TODO - we shouldn't show alert, instead custom message (component? modal?)
      Alert.alert("Login Failed", e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin =
    role === "employee" ? handleEmployeeLogin : handleManagerLogin;

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handlePasswordBlur = () => {
    setShowPassword(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="bg-white px-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10">
          <Text className="text-xl font-bold text-brand-black mb-3 font-sf-pro">
            Login as
          </Text>
          <View className="flex-row gap-3 w-full mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              className={`flex-1 py-3 px-6 rounded-[10px] items-center ${
                role === "employee"
                  ? "bg-brand-blue"
                  : "border-[1.5px] border-gray-300"
              }`}
              onPress={() => setRole("employee")}
            >
              <Text
                className={`text-xl font-bold font-sf-pro ${
                  role === "employee" ? "text-white" : "text-gray-400"
                }`}
              >
                Employee
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              className={`flex-1 py-3 px-6 rounded-[10px] items-center ${
                role === "manager"
                  ? "bg-brand-blue"
                  : "border-[1.5px] border-gray-300"
              }`}
              onPress={() => setRole("manager")}
            >
              <Text
                className={`text-xl font-bold font-sf-pro ${
                  role === "manager" ? "text-white" : "text-gray-400"
                }`}
              >
                Manager
              </Text>
            </TouchableOpacity>
          </View>

          {role === "manager" && (
            <View>
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
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-0 top-0 py-4 px-4 flex-row items-center"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={22}
                    color="#0E121A80"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {role === "employee" && (
            <View>
              <Input 
                placeholder="Enter code"
                editable={!loading}
                onChange={(e: { nativeEvent: { text: any; }; }) => setEmployeeLoginCode(e.nativeEvent.text)}
              />

              <TouchableOpacity
                className={`rounded-[10px] px-4 py-3 items-center ${
                  loading ? "bg-gray-300" : "bg-brand-blue"
                }`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text className="text-white text-xl font-bold font-sf-pro">
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>
              <Text className="text-brand-black font-sf-pro mt-3 italic text-lg">
                * This code is a one-time-used code and does not link to any of
                your personal information.
              </Text>
            </View>
          )}

          {role === "manager" && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 rounded-[10px] px-4 py-3 items-center ${
                  loading ? "bg-gray-300" : "bg-brand-blue"
                }`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text className="text-white text-xl font-bold font-sf-pro">
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 border-[1.5px] border-brand-blue rounded-[10px] px-4 py-3 items-center"
                onPress={() => router.push("/(auth)/manager-register")}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text className="text-brand-blue text-xl font-bold font-sf-pro">
                  Signup
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
