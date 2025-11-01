import IdeaCard from "@/components/IdeaCard";
import Splash from "@/components/Splash";
import { supabase } from "@/supabase";
import { Idea } from "@/types/index";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddIcon from "../../assets/images/add-icon.png";

// TODO - to implement
const handleFollow = (ideaId: string, isCurrentlyFollowing: boolean) => {
  console.log(
    `Idea ${ideaId} follow status toggled to ${!isCurrentlyFollowing}`
  );
  return Promise.resolve();
};

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // const load = useCallback(async () => {
  //   setError(null);
  //   setLoading(true);

  //   try {
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser();
      // if (!user) {
      //   setError("Not authenticated");
      //   setLoading(false);
      //   return;
      // }

      // const { data: userProfile, error: profileError } = await supabase
      //   .from("users")
      //   .select("company_id")
      //   .eq("id", user.id)
      //   .single();

      // if (profileError) {
      //   setError(profileError.message);
      //   setLoading(false);
      //   return;
      // }

      // const { data, error } = await supabase
      //   .from("ideas")
      //   .select(
      //     "id, subject, department, description, status, created_at, company_id"
      //   )
      //   .eq("company_id", userProfile.company_id)
      //   .order("created_at", { ascending: false });

  //     if (error) {
  //       setError(error.message);
  //     } else {
  //       setIdeas(data ?? []);
  //     }
  //   } catch (err: any) {
  //     setError(err.message ?? "Unknown error");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   load();
  // }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    // await load();
    setRefreshing(false);
  };

  const handleAddIdea = () => {
    router.push("/create-idea");
  };

  if (loading) {
    return <Splash />;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={ideas}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            onComment={() => {
              console.log("Comment on idea:", item.id);
            }}
            initialIsFollowing={false}
            onFollow={(isCurrentlyFollowing) =>
              handleFollow(item.id, isCurrentlyFollowing)
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-[100px] px-10">
            <Text className="text-xl font-semibold text-[#333] mb-2 text-center">
              No ideas yet.
            </Text>
            <Text className="text-base text-[#666] text-center">
              Be the first to share an idea!
            </Text>
          </View>
        }
      />

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
          <TouchableOpacity
            className="bg-[#1877F2] rounded-2xl py-4 px-5 flex-row items-center justify-start"
            onPress={handleAddIdea}
            activeOpacity={0.8}
          >
            <Image source={AddIcon} style={{ width: 29, height: 29 }} />

            <View className="flex-1 items-center justify-center">
              <Text className="text-white text-lg font-bold">
                Ideas, Opinions and More
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
