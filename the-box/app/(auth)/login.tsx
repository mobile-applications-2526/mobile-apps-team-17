import Input from "@/components/forms/Input";
import { supabase } from "@/supabase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"employee" | "manager">("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeLoginCode, setEmployeeLoginCode] = useState<string>("");
  const [errors, setErrors] = useState({
    employeeCode: "",
    email: "",
    password: "",
    auth: "",
  });

  useEffect(() => {
    setShowPassword(false);
    setEmail("");
    setPassword("");
    setErrors({
      employeeCode: "",
      email: "",
      password: "",
      auth: "",
    });
  }, [role]);

  const handleEmployeeLogin = async () => {
    if (!employeeLoginCode || !employeeLoginCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        employeeCode: "Access code is required",
      }));
      return;
    }

    setLoading(true);

    const { data: codeRow, error: codeErr } = await supabase
      .from("access_codes")
      .select("*")
      .eq("code", employeeLoginCode)
      .single();

    if (codeErr || !codeRow) {
      setErrors((prev) => ({ ...prev, employeeCode: "Invalid access code" }));
      setLoading(false);
      return;
    }

    if (codeRow.status !== "available") {
      setErrors((prev) => ({
        ...prev,
        employeeCode: "This access code has already been used or expired",
      }));
      setLoading(false);
      return;
    }

    const { data: managerRow, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", codeRow.created_by)
      .single();

    const { data: addEmployee, error } = await supabase
      .from("users")
      .insert([
        {
          company_id: managerRow.company_id,
          role: "employee",
          full_name: null,
          email: null,
          created_at: new Date().toISOString(),
          last_login: null,
          is_active: true,
          password: null,
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

    if (updateCodeErr || !updatedCode) {
      setErrors((prev) => ({
        ...prev,
        auth: "Authentication error. Please try again",
      }));
      setLoading(false);
      return;
    }

    console.log(addEmployee);

    if (
      error ||
      !addEmployee ||
      !Array.isArray(addEmployee) ||
      addEmployee.length === 0
    ) {
      setErrors((prev) => ({
        ...prev,
        auth: "Failed to create account. Please try again",
      }));
      setLoading(false);
      return;
    }

    // store the created user object (first item in the inserted rows)
    await AsyncStorage.setItem("user", JSON.stringify(addEmployee[0]));

    // WHY!!!!!!
    router.replace("/(tabs)");
    setLoading(false);
  };

  const handleManagerLogin = async () => {
    const newErrors: any = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setLoading(true);

    try {
      // Lookup manager by email/password in users table (replace auth flow)
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("id, role, company_id, full_name, email")
        .eq("email", email.trim().toLowerCase())
        .eq("password", password)
        .maybeSingle();

      if (userErr) throw userErr;
      if (!userRow) throw new Error("auth_failed");
      if (userRow.role !== "manager") {
        throw new Error("auth_failed");
      }

      // update last_login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userRow.id);

      // persist manager profile locally
      await AsyncStorage.setItem("user", JSON.stringify(userRow));

      router.replace("/(tabs)");
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, auth: "Invalid email or password" }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin =
    role === "employee" ? handleEmployeeLogin : handleManagerLogin;

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
        keyboardShouldPersistTaps="handled"
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
              {errors.auth && (
                <View className="mb-3 px-1">
                  <Text className="text-red-500 text-sm font-sf-pro">
                    {errors.auth}
                  </Text>
                </View>
              )}
              <Input
                placeholder="Email"
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: "", auth: "" }));
                }}
                error={errors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
              <View className="relative">
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    setErrors((prev) => ({ ...prev, password: "", auth: "" }));
                  }}
                  onBlur={handlePasswordBlur}
                  error={errors.password}
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
              {errors.auth && (
                <View className="mb-3 px-1">
                  <Text className="text-red-500 text-sm font-sf-pro">
                    {errors.auth}
                  </Text>
                </View>
              )}
              <Input
                placeholder="Enter code"
                value={employeeLoginCode}
                onChangeText={(text: string) => {
                  setEmployeeLoginCode(text);
                  setErrors((prev) => ({
                    ...prev,
                    employeeCode: "",
                    auth: "",
                  }));
                }}
                error={errors.employeeCode}
                editable={!loading}
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
