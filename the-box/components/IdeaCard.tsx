import { Idea } from "@/types/index";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  idea: Idea;
  onComment?: () => void;
  onFollow?: () => void;
};

const IdeaCard: React.FC<Props> = ({ idea, onComment, onFollow }) => {
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
    <View className="mx-4 mb-3">
      <View className="bg-white rounded-[7px] border-2 border-brand-black p-4 mb-3">
        <Text className="text-gray-500 text-xs mb-2">
          {formatDate(idea.created_at)}
        </Text>

        {idea.subject && (
          <Text className="text-brand-black text-base font-semibold mb-2">
            {idea.subject}
          </Text>
        )}

        <Text className="text-brand-black text-base leading-5">
          {idea.description}
        </Text>
      </View>

      <View className="flex-row justify-between items-center gap-3">
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
            className="flex-row flex-1 items-center justify-center gap-1.5 px-3 py-2"
            onPress={onComment}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#0E121A" />
            <Text className="text-brand-black text-sm font-semibold">
              Comment
            </Text>
          </TouchableOpacity>

          <View className="w-px bg-brand-black" />

          <TouchableOpacity
            className="flex-row flex-1 items-center justify-center gap-1.5 px-3 py-2"
            onPress={onFollow}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={18} color="#1877F2" />
            <Text className="text-brand-blue text-sm font-semibold">
              Follow
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default IdeaCard;
