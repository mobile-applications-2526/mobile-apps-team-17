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
      return '1 day ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <View className="bg-white rounded-2xl mx-4 mb-3 border border-gray-200 overflow-hidden">
      <View className="p-4">
        <Text className="text-gray-500 text-xs mb-2">
          {formatDate(idea.created_at)}
        </Text>

        <Text className="text-black text-base leading-5 mb-3">
          {idea.description}
        </Text>

        <View className="mb-3">
          <View 
            className="self-start rounded-full px-4 py-1.5"
            style={{ backgroundColor: '#1877F2' }}
          >
            <Text className="text-white text-xs font-semibold">
              {idea.status}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-1.5 bg-white border border-gray-300 rounded-lg px-4 py-2 active:opacity-70"
            onPress={onComment}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#000" />
            <Text className="text-black text-sm font-medium">Comment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center justify-center gap-1.5 bg-white border border-gray-300 rounded-lg px-4 py-2 active:opacity-70"
            onPress={onFollow}
          >
            <Ionicons name="notifications-outline" size={18} color="#000" />
            <Text className="text-black text-sm font-medium">Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default IdeaCard;