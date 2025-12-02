import { Idea } from "@/types/index";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import BellActiveIcon from "../assets/images/bell-active-icon.png";
import BellIcon from "../assets/images/bell-icon.png";
import CommentActiveIcon from "../assets/images/comment-active-icon.png";
import CommentIcon from "../assets/images/comment-icon.png";

type Props = {
  idea: Idea;
  initialIsFollowing: boolean;
  isCommentActive?: boolean;
  isFollowLoading?: boolean;
  onComment?: () => void;
  onFollow?: (isCurrentlyFollowing: boolean) => Promise<void>;
};

const IdeaCard: React.FC<Props> = ({
  idea,
  initialIsFollowing,
  isCommentActive = false,
  isFollowLoading = false,
  onComment,
  onFollow,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);


  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollowPress = async () => {
    if (onFollow) {
      const newState = !isFollowing;
      setIsFollowing(newState);

      try {
        await onFollow(isFollowing);
      } catch (error) {
        console.error("Failed to update follow status:", error);
        setIsFollowing(!newState);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Now";
    if (diffHours < 1) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    
      return `${diffDays} days ago`;
  };

  const capitalizeStatus = (status: string) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View className="mx-4">
      <View className="bg-white rounded-[10px] border border-brand-black p-3 mb-1">
        <Text className="text-gray-500 text-xs mb-1">
          {formatDate(idea.created_at)}
        </Text>

        <Text className="text-brand-black text-lg leading-5 mb-1">
          {idea.description}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="rounded-[10px] px-4 py-2.5 border border-brand-black bg-white">
          <Text className="text-brand-blue text-sm font-semibold">
            {capitalizeStatus(idea.status)}
          </Text>
        </View>

        <View className="flex-1 flex-row gap-2">
          <View
            className={`flex-1 border rounded-[10px] ${
              isCommentActive
                ? "border-brand-blue bg-brand-blue"
                : "border-brand-black bg-white"
            }`}
          >
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 px-3 py-2"
              onPress={onComment}
              activeOpacity={0.7}
            >
              <Image
                source={isCommentActive ? CommentActiveIcon : CommentIcon}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          </View>

          <View
            className={`flex-1 border rounded-[10px] ${
              isFollowLoading
                ? "border-brand-black bg-white"
                : isFollowing
                  ? "border-brand-blue bg-brand-blue"
                  : "border-brand-black bg-white"
            }`}
          >
            <TouchableOpacity
              className="flex-row items-center justify-center px-3 py-2"
              onPress={handleFollowPress}
              activeOpacity={0.7}
              disabled={isFollowLoading}
            >
              {isFollowLoading ? (
                <ActivityIndicator size="small" color="#1877F2" />
              ) : (
                <Image
                  source={isFollowing ? BellActiveIcon : BellIcon}
                  style={{ width: 20, height: 20 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IdeaCard;
