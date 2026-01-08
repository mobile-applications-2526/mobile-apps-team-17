import Input from "@/components/forms/Input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

// Profanity filter
import { Filter } from "bad-words";

export default function CreateIdeaScreen() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    description: "", // for input field errors
    general: "", // for other errors like system, etc
  });
  const [isAnonymous, setIsAnonymous] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const textareaHeight = screenHeight * 0.25;
  const profanityFilter = new Filter();

  const getLastFriday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const date = new Date(year, month + 1, 0); // last day of current month
    while (date.getDay() !== 5) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  };

  interface PredictResponse {
    prediction: string;
  }

  useEffect(() => {
    const checkAnonymousMode = async () => {
      try {
        const isAnonymousMode = await AsyncStorage.getItem("anonymous_mode");
        if (isAnonymousMode === "true") {
          setIsAnonymous(true);
        } else {
          setIsAnonymous(false);
        }
      } catch (error) {
        console.error("Failed to check anonymous mode:", error);
      }
    };
    checkAnonymousMode();
  }, []);

  // const analyzeText = async (textToAnalyze: string): Promise<string | undefined> => {
  //   try {
  //     const response = await fetch('http://127.0.0.1:8000/predict', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ text: textToAnalyze }),
  //     });

  //     const result = (await response.json()) as PredictResponse;
  //     return result.prediction;

  //     // Set state with the result

  //   } catch (error) {
  //     console.error("Error calling custom API:", error);
  //   }
  // };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setErrors((prev) => ({ ...prev, description: "Please write your idea" }));
      return;
    }

    if (profanityFilter.isProfane(description)) {
      Alert.alert("Profanity languages are strictly prohibited");
      return;
    }

    // const sentiment = await analyzeText(description);

    // if (sentiment) {
    //   Alert.alert(sentiment);
    //   return;
    // } else {
    //   Alert.alert("no sentiment check working");
    // }

    setLoading(true);
    try {
      // read stored user profile from AsyncStorage
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        setErrors((prev) => ({
          ...prev,
          general: "Authentication error. Please log in again",
        }));
        setLoading(false);
        return;
      }

      const storedUser = JSON.parse(userString) as any;

      const lastFriday = getLastFriday();

      // Hide manager's ID if in anonymous mode
      const isAnonymousMode = await AsyncStorage.getItem("anonymous_mode");
      let userId = storedUser.id;
      if (isAnonymousMode === "true") {
        userId = null;
      }

      const { data: newIdea, error } = await supabase
        .from("ideas")
        .insert({
          company_id: storedUser.company_id,
          subject: subject.trim() || null,
          department: department.trim() || null,
          description: description.trim(),
          status: `Review date: ${lastFriday.toISOString().split("T")[0]}`,
          created_by: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // auto-follow the idea if user not anonymous
      if (newIdea && userId) {
        const { error: followError } = await supabase
          .from("users_followed_ideas")
          .insert({
            user_id: storedUser.id,
            idea_id: newIdea.id,
          });

        if (followError) {
          console.error("Error auto-following idea:", followError);
        }
      }

      Alert.alert("Success", "Your idea has been submitted!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: "Failed to submit idea. Please try again",
      }));
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
      testID="create-idea-screen"
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 150 }}
        testID="create-idea-scroll-view"
      >
        <View className="bg-white p-6">
          {errors.general && (
            <View className="mb-3 px-1" testID="create-idea-general-error">
              <Text className="text-red-500 text-sm font-sf-pro">
                {errors.general}
              </Text>
            </View>
          )}

          <View className="mb-6">
            <Text className="text-xl font-bold text-brand-black mb-2 font-sf-pro">
              Topic (optional)
            </Text>

            <Input
              value={subject}
              onChangeText={setSubject}
              autoCapitalize="sentences"
              editable={!loading}
              testID="create-idea-subject-input"
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
              style={{ height: textareaHeight }}
              textAlignVertical="top"
              multiline={true}
              className="pt-4"
              testID="create-idea-description-input"
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
          testID="create-idea-footer"
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 rounded-2xl py-4 px-5 flex-row items-center justify-start relative ${
                loading ? "bg-gray-400" : "bg-brand-blue"
              }`}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              testID="create-idea-submit-button"
            >
              {loading ? (
                <ActivityIndicator color="white" testID="create-idea-loading" />
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
              testID="create-idea-cancel-button"
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
