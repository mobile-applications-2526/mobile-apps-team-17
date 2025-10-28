import { Idea } from "@/types/index";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import BellActiveIcon from "../assets/images/bell-active-icon.png";
import BellIcon from "../assets/images/bell-icon.png";
import CommentIcon from "../assets/images/comment-icon.png";

type Props = {
  idea: Idea;
  initialIsFollowing: boolean;
  onComment?: () => void;
  onFollow?: (isCurrentlyFollowing: boolean) => Promise<void>;
};

const IdeaCard: React.FC<Props> = ({
  idea,
  initialIsFollowing,
  onComment,
  onFollow,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "1 day ago";
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <View className="mx-4 mb-10">
      <View className="bg-white rounded-[7px] border-2 border-brand-black p-3 mb-1">
        <Text className="text-gray-500 text-xs mb-1">
          {formatDate(idea.created_at)}
        </Text>

        <Text className="text-brand-black text-lg leading-5">
          {idea.description}
        </Text>
      </View>

      <View className="flex-row justify-between items-center gap-2">
        <View
          className="rounded-lg px-4 py-2.5"
          style={{ backgroundColor: "#1877F2" }}
        >
          <Text className="text-white text-sm font-semibold">
            {idea.status}
          </Text>
        </View>

        <View className="flex-row flex-1 bg-white border-2 border-brand-black rounded-lg overflow-hidden">
          <TouchableOpacity
            className="flex-row flex-1 items-center justify-center gap-3 px-3 py-2"
            onPress={onComment}
            activeOpacity={0.7}
          >
            <Image source={CommentIcon} style={{ width: 20, height: 20 }} />
            <Text className="text-brand-black text-sm font-semibold">
              Comment
            </Text>
          </TouchableOpacity>

          <View className="w-px bg-brand-black" />

          <TouchableOpacity
            className="flex-row flex-1 items-center justify-center gap-3 px-3 py-2"
            onPress={handleFollowPress}
            activeOpacity={0.7}
          >
            <Image
              source={isFollowing ? BellActiveIcon : BellIcon}
              style={{ width: 20, height: 20 }}
            />
            <Text
              className={
                isFollowing
                  ? "text-brand-blue text-sm font-semibold"
                  : "text-brand-black text-sm font-semibold"
              }
            >
              Follow
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default IdeaCard;
