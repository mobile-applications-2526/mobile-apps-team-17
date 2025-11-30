import Input from "@/components/forms/Input";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isValidEmail, validatePassword } from "../../utils/validation";

export default function ManagerRegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    general: "",
  });

  const handlePasswordBlur = () => {
    setShowPassword(false);
  };

  const handleRegister = async () => {
    setErrors({
      email: "",
      password: "",
      fullName: "",
      companyName: "",
      general: "",
    });

    const newErrors: any = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error;
      }
    }

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!companyName.trim()) newErrors.companyName = "Company name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Insert manager directly into users table
      const now = new Date().toISOString();

      const { data: companyRow, error: errCompany } = await supabase
        .from("companies")
        .select("*")
        .eq("name", companyName)
        .single();

      if (errCompany || !companyRow) {
        setErrors((prev) => ({
          ...prev,
          companyName: "Company not found",
        }));
        setLoading(false);
        return;
      }

      const { data: inserted, error } = await supabase
        .from("users")
        .insert([
          {
            email: email.trim().toLowerCase(),
            password,
            full_name: fullName,
            role: "manager",
            company_id: companyRow.id,
            created_at: now,
            last_login: now,
            is_active: true,
          },
        ])
        .select();

      if (
        error ||
        !inserted ||
        !Array.isArray(inserted) ||
        inserted.length === 0
      ) {
        setErrors((prev) => ({
          ...prev,
          general: "Failed to create account. Please try again",
        }));
        setLoading(false);
        return;
      }

      const manager = inserted[0];

      // Persist created manager locally so app treats them as signed in
      await AsyncStorage.setItem("user", JSON.stringify(manager));

      // Navigate into app
      router.replace("/(tabs)");
    } catch (e: any) {
      setErrors((prev) => ({
        ...prev,
        general: e.message || "Registration failed. Please try again",
      }));
    } finally {
      setLoading(false);
    }
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
        <View className="mb-20">
          <Text className="text-xl font-bold text-brand-black mb-3 font-sf-pro">
            Sign up as
          </Text>

          <View className="bg-brand-blue rounded-[7px] py-3 px-6 items-center mb-3">
            <Text className=" text-white text-xl font-bold font-sf-pro">
              Manager
            </Text>
          </View>

          {errors.general && (
            <View className="mb-3 px-1">
              <Text className="text-red-500 text-sm font-sf-pro">
                {errors.general}
              </Text>
            </View>
          )}

          <Input
            placeholder="Email"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: "", general: "" }));
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
                setErrors((prev) => ({ ...prev, password: "", general: "" }));
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
            onChangeText={(text: string) => {
              setFullName(text);
              setErrors((prev) => ({ ...prev, fullName: "", general: "" }));
            }}
            error={errors.fullName}
            editable={!loading}
            autoCapitalize="words"
          />

          <Input
            placeholder="Company Name"
            value={companyName}
            onChangeText={(text: string) => {
              setCompanyName(text);
              setErrors((prev) => ({ ...prev, companyName: "", general: "" }));
            }}
            error={errors.companyName}
            editable={!loading}
            autoCapitalize="words"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
