import IdeaCard from "@/components/IdeaCard";
import { Idea } from "@/types";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data to test
const mockIdeas: Idea[] = [
  {
    id: "1",
    subject: "toilet hygiene",
    department: "HR",
    description:
      "Hey guys, I notice that the woman toilet on 2F of B building was not very clean this morning. Could this be dealt with ASAP?",
    status: "Commented by manager",
    created_at: "3h ago",
    updated_at: "25-10-2026",
    created_by: "user-123",
    comment_count: 0,
    vote_count: 0,
  },
  {
    id: "2",
    subject: "Project 101",
    department: "IT",
    description:
      "I would like to suggest that we talk to the client first, instead of assuming what they actually want.",
    status: "In review",
    created_at: "4h ago",
    updated_at: "20-10-2026",
    created_by: "user-456",
    comment_count: 0,
    vote_count: 0,
  },
];

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4">
        {/* Header */}
        <Text className="text-4xl font-bold text-black px-4 mb-6">Home</Text>

        {/* Ideas List */}
        {mockIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}

        {/* Bottom spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
