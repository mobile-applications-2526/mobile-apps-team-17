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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddIcon from "../../assets/images/add-icon.png";
import ReturnIcon from "../../assets/images/return-icon.png";
import { notifyNewComment } from "@/utils/notificationService";

export default function DiscussionScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [filterType, setFilterType] = useState<"all" | "manager">("all");
  const [error, setError] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatusLoading, setFollowStatusLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

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
    }
    checkAnonymousMode();

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

  const checkFollowStatus = useCallback(async () => {
    try {
      setFollowStatusLoading(true);
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const { data, error } = await supabase
        .from("users_followed_ideas")
        .select("id")
        .eq("user_id", user.id)
        .eq("idea_id", id);

      if (error) {
        console.error("Error checking follow status:", error);
        return;
      }

      setIsFollowing(data && data.length > 0);
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setFollowStatusLoading(false);
    }
  }, [id]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

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
        .select(
          `
        *,
        users:created_by (
          full_name,
          department
        )
      `
        )
        .eq("idea_id", id)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      const mappedComments =
        commentsData?.map((comment: any) => ({
          ...comment,
          user_name: comment.users?.full_name,
          user_department: comment.users?.department,
        })) || [];

      setComments(mappedComments || []);
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
      let isManager = true;
      if (isAnonymous) {
        isManager = false;
      }

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
        .select(
          `
          *,
          users:created_by (
            full_name,
            department
          )
        `
        );

      if (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
        return;
      }

      if (isManager) {
        const { error: updateError } = await supabase
          .from("ideas")
          .update({ status: "commented by manager" })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating idea status:", updateError);
        } else {
          setIdea((prevIdea) =>
            prevIdea ? { ...prevIdea, status: "commented by manager" } : null
          );
        }
      }

      const newComment = {
        ...data[0],
        user_name: data[0].users?.full_name,
        user_department: data[0].users?.department,
      };

      setComments([newComment, ...comments]);
      setCommentText("");
      setShowCommentInput(false);
      Keyboard.dismiss();

      // Send notification to followers
      await notifyNewComment(id as string);
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

  const handleFollow = async (
    ideaId: string,
    isCurrentlyFollowing: boolean
  ) => {
    try {
      const userProfileString = await AsyncStorage.getItem("user");

      if (userProfileString) {
        let userProfile: { id?: string } | null = null;
        try {
          userProfile = JSON.parse(userProfileString);
        } catch (e) {
          setError("Invalid user profile stored locally");
          return;
        }
        if (!isCurrentlyFollowing) {
          if (isFollowing) {
            return;
          }

          const { error } = await supabase
            .from("users_followed_ideas")
            .insert({
              user_id: userProfile?.id,
              idea_id: ideaId,
            });

          if (error) {
            console.error("Error following idea:", error);
            setError(error.message);
            return;
          }
          setIsFollowing(true);
        } else {
          const { error } = await supabase
            .from("users_followed_ideas")
            .delete()
            .eq("user_id", userProfile?.id)
            .eq("idea_id", ideaId);

          if (error) {
            console.error("Error unfollowing idea:", error);
            setError(error.message);
            return;
          }
          setIsFollowing(false);
        }

        return Promise.resolve();
      }
    } catch (error) {
      console.error("Error in handleFollow:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "white" }}
      keyboardVerticalOffset={0}
    >
      <View className="flex-1 bg-white">
        <View className="mt-4">
          {idea && (
            <IdeaCard
              idea={idea}
              initialIsFollowing={isFollowing}
              isCommentActive={true}
              isFollowLoading={followStatusLoading}
              onComment={() => {
                return;
              }}
              onFollow={(isCurrentlyFollowing) =>
                handleFollow(idea.id, isCurrentlyFollowing)
              }
            />
          )}
        </View>

        <View className="px-5 mt-5">
          <Text className="text-brand-blue text-[32px] font-bold mb-2">
            Comments
          </Text>

          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              onPress={() => setFilterType("all")}
              className={`rounded-full py-2 px-6 border items-center justify-center ${
                filterType === "all"
                  ? "bg-[#1877F2] border-[#1877F2]"
                  : "bg-white border-brand-black"
              }`}
            >
              <Text
                className={`font-medium text-base ${
                  filterType === "all" ? "text-white" : "text-brand-black"
                }`}
              >
                All comments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterType("manager")}
              className={`flex-1 rounded-full py-2 px-2 border items-center justify-center ${
                filterType === "manager"
                  ? "bg-[#1877F2] border-[#1877F2]"
                  : "bg-white border-brand-black"
              }`}
            >
              <Text
                className={`font-medium text-base ${
                  filterType === "manager" ? "text-white" : "text-brand-black"
                }`}
              >
                Comments by manager
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          className="px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: showCommentInput ? 280 : 180,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
            filteredComments.map((comment, index) => (
              <View
                key={comment.id}
                className={`mb-3 pb-3 pt-2 ${
                  index !== filteredComments.length - 1
                    ? "border-b border-gray-300"
                    : ""
                }`}
              >
                <Text className="text-gray-500 text-xs">
                  {formatDate(comment.created_at)}
                </Text>

                {comment.commenter_role === "manager" && (
                  <Text className="text-brand-blue text-base">
                    <Text className="font-bold">{comment.user_name}</Text>
                    {comment.user_name && comment.user_department && ", "}
                    {comment.user_department}
                  </Text>
                )}

                <Text className="text-brand-black text-base leading-5">
                  {comment.content}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View
        className="px-4 bg-white"
        style={{
          // position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Math.max(insets.bottom, 20),
        }}
      >
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
                className="bg-white border border-brand-blue rounded-2xl px-4 py-3 mb-3 text-brand-black text-base min-h-[100px]"
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
                  className="bg-white border border-brand-blue rounded-2xl py-4 px-5 flex-row items-center justify-center"
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
