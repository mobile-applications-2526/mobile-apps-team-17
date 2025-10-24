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
  return (
    <View className="bg-brand-card rounded-3xl p-5 mx-4 mb-4">
      <View className="flex-row justify-between items-start">
        <Text className="text-brand-blue text-lg font-semibold">
          #{idea.subject?.toLowerCase().replace(/\s+/g, "-")}
        </Text>
        <Text className="text-black text-sm">{idea.created_at}</Text>
      </View>

      <Text className="text-black text-lg font-semibold leading-6 mb-4">
        {idea.description}

        {/* {idea.department && (
          <Text className="text-brand-red text-base font-semibold">
            - to {idea.department}
          </Text>
        )} */}
      </Text>

      <View className="flex-row gap-2 mb-4 flex-wrap">
        {/* <View className="bg-brand-red rounded-full py-2 px-4">
          <Text className="text-black text-xs font-semibold">
            Due {idea.due_date}
          </Text>
        </View> */}
        <View className="bg-brand-green rounded-full py-2 px-4">
          <Text className="text-black text-xs font-semibold">
            {idea.status}
          </Text>
        </View>
      </View>

      {/* <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-brand-gray rounded-2xl py-3 flex-row items-center justify-center gap-2 active:opacity-80"
          onPress={onComment}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#000" />
          <Text className="text-black text-base font-semibold">Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-brand-gray rounded-2xl py-3 flex-row items-center justify-center gap-2 active:opacity-80"
          onPress={onFollow}
        >
          <Ionicons name="notifications-outline" size={20} color="#000" />
          <Text className="text-black text-base font-semibold">Follow</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default IdeaCard;
