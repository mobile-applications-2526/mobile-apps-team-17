import Input from "@/components/forms/Input";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PaperPlaneIcon from "../assets/images/paper-plane-icon.png";
import ReturnIcon from "../assets/images/return-icon.png";
import { supabase } from "../supabase";

export default function CreateIdeaScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Please enter your idea description");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "Not authenticated");
        setLoading(false);
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase.from("ideas").insert({
        company_id: userProfile.company_id,
        subject: subject.trim() || null,
        department: department.trim(),
        description: description.trim(),
        status: "Pending Review",
        created_by: user.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Success", "Your idea has been submitted!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to submit idea");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (description.trim() || subject.trim() || department.trim()) {
      Alert.alert(
        "Discard Idea?",
        "Are you sure you want to discard your idea?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      className="flex-1 bg-white"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="bg-white p-6">
          <View className="mb-6">
            <Text className="text-xl font-bold text-brand-black mb-2 font-sf-pro">
              Topic (optional)
            </Text>

            <Input
              value={subject}
              onChangeText={setSubject}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View className="">
            <Text className="text-xl font-bold text-brand-black mb-2 font-sf-pro">
              Your idea / opinion / feedback{" "}
              <Text className="text-red-500 font-bold">*</Text>
            </Text>
            <Input
              value={description}
              onChangeText={setDescription}
              autoCapitalize="sentences"
              editable={!loading}
              style={{ height: 200 }}
              textAlignVertical="top"
              multiline={true}
            />
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-5 left-4 right-4 z-10">
        <View
          className="p-3 rounded-3xl bg-white"
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 5,
          }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 rounded-2xl py-4 px-5 flex-row items-center justify-start relative ${
                loading ? "bg-gray-400" : "bg-brand-blue"
              }`}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Image
                    source={PaperPlaneIcon}
                    style={{ width: 24, height: 24 }}
                  />
                  <View className="absolute inset-0 flex-row items-center justify-center">
                    <Text className="text-white text-lg font-bold font-sf-pro ml-3">
                      Post
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 border-2 border-brand-blue rounded-2xl py-4 px-5 flex-row items-center justify-start bg-white relative"
              onPress={handleCancel}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Image source={ReturnIcon} style={{ width: 24, height: 24 }} />
              <View className="absolute inset-0 flex-row items-center justify-center ml-3">
                <Text className="text-brand-blue text-lg font-bold font-sf-pro">
                  Return
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
