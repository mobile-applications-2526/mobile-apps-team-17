import { Idea } from "@/types/index";
import React from "react";
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  idea: Idea;
  onComment?: () => void;
  onFollow?: () => void;
};

const IdeaCard: React.FC<Props> = ({ idea }) => {
  function onFollow(event: GestureResponderEvent): void {
    throw new Error("Function not implemented.");
  }
  function onComment(event: GestureResponderEvent): void {
    throw new Error("Function not implemented.");
  }

  return (
    <View className="bg-bg rounded-3xl p-5 mx-4 mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <Text className="text-blue-500 text-lg font-semibold">
          #{idea.subject?.toLowerCase().replace(/\s+/g, "-")}
        </Text>
        <Text className="text-gray-500 text-sm">{idea.created_at}</Text>
      </View>

      <View className="mb-4">
        <Text className="text-black text-base font-semibold leading-6 mb-2">
          {idea.description}
        </Text>

        {idea.department && (
          <Text className="text-red-500 text-sm font-semibold mb-4">
            - to {idea.department}
          </Text>
        )}
      </View>

      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-red-500 rounded-2xl py-3 px-4">
          <Text className="text-black text-xs font-semibold text-center">
            To be resolved before
          </Text>
          <Text className="text-black text-base font-bold text-center mt-1">
            {idea.updated_at}
          </Text>
        </View>
        <View className="flex-1 bg-green-500 rounded-2xl py-3 px-4">
          <Text className="text-black text-xs font-semibold text-center">
            Status
          </Text>
          <Text className="text-black text-base font-bold text-center mt-1">
            {idea.status}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-gray-300 rounded-2xl py-3 flex-row items-center justify-center gap-2 active:opacity-80"
          onPress={onComment}
        >
          <Text className="text-lg"></Text>
          <Text className="text-black text-base font-semibold">Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-yellow-400 rounded-2xl py-3 flex-row items-center justify-center gap-2"
          onPress={onFollow}
        >
          <Text className="text-lg"></Text>
          <Text className="text-black text-base font-semibold">
            Follow this post
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IdeaCard;
