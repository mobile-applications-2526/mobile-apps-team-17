import IdeaCard from "@/components/IdeaCard";
import { Idea } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

// to delete
const mockIdeas: Idea[] = [
  {
    id: "1",
    subject: "toilet hygiene",
    department: "Facility Dept.",
    description:
      "Hey guys, I notice that the woman toilet on 2F of B building was not very clean this morning. Could this be dealt with ASAP?",
    status: "Commented by manager",
    created_at: "3h ago",
    due_date: "25-10-2025",
    created_by: "user-123",
    comment_count: 0,
    vote_count: 0,
  },
  {
    id: "2",
    subject: "Project 101",
    department: "eCommerce Dept.",
    description:
      "I would like to suggest that we talk to the client first, instead of assuming what they actually want.",
    status: "In review",
    created_at: "4h ago",
    due_date: "20-10-2025",
    created_by: "user-456",
    comment_count: 0,
    vote_count: 0,
  },
  {
    id: "3",
    subject: "lunchmenu",
    department: "",
    description:
      "Hi everyone, I would like to bring attention to the lunch at the cafeteria yesterday. The ramen soup was too salty...",
    status: "Closed",
    created_at: "3 days ago",
    due_date: "02-11-2026",
    created_by: "user-456",
    comment_count: 0,
    vote_count: 0,
  },
];

export default function Home() {
  const handleAddIdea = () => {
    console.log("Add new idea pressed");
  };

  return (
    <SafeAreaViewContext className="flex-1 bg-white">
      <Text className="text-4xl font-bold text-brand-text px-4 mb-2 mt-5">
        Home
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4">
        {mockIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </ScrollView>

      <View className="bg-white rounded-3xl p-4 shadow-lg">
        <TouchableOpacity
          onPress={handleAddIdea}
          className="bg-brand-green rounded-2xl py-4 px-6 flex-row items-center justify-center gap-4 active:opacity-80"
        >
          <View className="w-12 h-12 bg-black rounded-full items-center justify-center">
            <Ionicons name="add" size={28} color="#8AE98D" />
          </View>
          <Text className="text-brand-text text-lg font-bold">
            Ideas, Opinions and More
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaViewContext>
  );
}
