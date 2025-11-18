import IdeaCard from "@/components/IdeaCard";
import { supabase } from "@/supabase";
import { Comment, Idea } from "@/types/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddIcon from "../../assets/images/add-icon.png";
import ReturnIcon from "../../assets/images/return-icon.png";

export default function DiscussionScreen() {
  const { id } = useLocalSearchParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [filterType, setFilterType] = useState<"all" | "manager">("all");
  const [error, setError] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const loadIdeaAndComments = useCallback(async () => {
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setIdea(data);
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("idea_id", id)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading discussion:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, refreshing]);

  useEffect(() => {
    loadIdeaAndComments();
  }, [loadIdeaAndComments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIdeaAndComments();
  };

  const filteredComments =
    filterType === "manager"
      ? comments.filter((comment) => comment.commenter_role === "manager")
      : comments;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const isManager = currentUser?.role === "manager";
      const insertData: any = {
        idea_id: id,
        content: commentText.trim(),
        commenter_role: isManager ? "manager" : "employee",
      };

      if (isManager && currentUser?.id) {
        insertData.created_by = currentUser.id;
      }

      const { data, error } = await supabase
        .from("comments")
        .insert([insertData])
        .select();

      if (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
        return;
      }

      setComments([data[0], ...comments]);
      setCommentText("");
      setShowCommentInput(false);
      Keyboard.dismiss();
    } catch (err) {
      console.error("Unexpected error adding comment:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleCancelComment = () => {
    setCommentText("");
    setShowCommentInput(false);
    Keyboard.dismiss();
  };

  // TODO - to implement
  const handleFollow = (ideaId: string, isCurrentlyFollowing: boolean) => {
    console.log(
      `Idea ${ideaId} follow status toggled to ${!isCurrentlyFollowing}`
    );
    return Promise.resolve();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: showCommentInput ? 300 : 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mt-4">
          {idea && (
            <IdeaCard
              idea={idea}
              initialIsFollowing={false}
              onComment={() => {
                return;
              }}
              onFollow={(isCurrentlyFollowing) =>
                handleFollow(idea.id, isCurrentlyFollowing)
              }
            />
          )}
        </View>

        <View className="px-5 mb-4">
          <Text className="text-brand-blue text-[32px] font-bold mb-2">
            Comments
          </Text>

          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              onPress={() => setFilterType("all")}
              className={`rounded-full py-2 px-5 border ${
                filterType === "all"
                  ? "bg-[#1877F2] border-[#1877F2]"
                  : "bg-white border-brand-black"
              }`}
            >
              <Text
                className={`font-bold text-base ${
                  filterType === "all" ? "text-white" : "text-brand-black"
                }`}
              >
                All comments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterType("manager")}
              className={`rounded-full py-2 px-5 border ${
                filterType === "manager"
                  ? "bg-[#1877F2] border-[#1877F2]"
                  : "bg-white border-brand-black"
              }`}
            >
              <Text
                className={`font-bold text-base ${
                  filterType === "manager" ? "text-white" : "text-brand-black"
                }`}
              >
                Comments by manager
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            {filteredComments.length === 0 ? (
              <View className="items-center justify-center mt-[100px] px-10">
                <Text className="text-xl font-semibold text-[#333] mb-2 text-center">
                  No comments yet.
                </Text>
                <Text className="text-base text-[#666] text-center">
                  Be the first to leave a comment!
                </Text>
              </View>
            ) : (
              filteredComments.map((comment) => (
                <View
                  key={comment.id}
                  className="mb-3 border-b border-gray-300 pb-3"
                >
                  <Text className="text-gray-500 text-xs">
                    {formatDate(comment.created_at)}
                  </Text>

                  {comment.commenter_role === "manager" && (
                    <Text className="text-[#1877F2] font-bold text-base">
                      Manager
                    </Text>
                  )}

                  <Text className="text-brand-black text-base leading-5">
                    {comment.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-5 left-4 right-4">
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
          {showCommentInput ? (
            <>
              <TextInput
                className="bg-white border-[1.5px] border-brand-blue rounded-2xl px-4 py-3 mb-3 text-brand-black text-base min-h-[100px]"
                placeholder="Write your comment here..."
                placeholderTextColor="#999"
                multiline
                value={commentText}
                onChangeText={setCommentText}
                autoFocus
                style={{ textAlignVertical: "top" }}
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-[#1877F2] rounded-2xl py-4 px-5 flex-row items-center justify-center"
                  onPress={handleAddComment}
                  activeOpacity={0.8}
                  disabled={!commentText.trim()}
                  style={{
                    opacity: commentText.trim() ? 1 : 0.5,
                  }}
                >
                  <Image
                    source={AddIcon}
                    style={{ width: 29, height: 29, marginRight: 10 }}
                  />
                  <Text className="text-white text-lg font-bold">
                    Add comment
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white border-[1.5px] border-brand-blue rounded-2xl py-4 px-5 flex-row items-center justify-center"
                  onPress={handleCancelComment}
                  activeOpacity={0.8}
                >
                  <Image
                    source={ReturnIcon}
                    style={{ width: 29, height: 29, marginRight: 10 }}
                  />
                  <Text className="text-brand-blue text-lg font-bold">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              className="bg-[#1877F2] rounded-2xl py-4 px-5 flex-row items-center justify-start"
              onPress={() => setShowCommentInput(true)}
              activeOpacity={0.8}
            >
              <Image source={AddIcon} style={{ width: 29, height: 29 }} />

              <View className="flex-1 items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  Add comment
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
