import IdeaCard from "@/components/IdeaCard";
import Splash from "@/components/Splash";
import { supabase } from "@/supabase";
import { Idea } from "@/types/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [followedIdeas, setFollowedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const userFollowedIdeas = async () => {
    const userProfileString = await AsyncStorage.getItem("user");

    if (userProfileString) {
      let userProfile: { id?: string } | null = null;
      try {
        userProfile = JSON.parse(userProfileString);
      } catch (e) {
        setError("Invalid user profile stored locally");
        return;
      }
      const { data, error } = await supabase
        .from("users_followed_ideas")
        .select("idea:idea_id(*)")
        .eq("user_id", userProfile?.id);
      if (error) {
        setError(error.message);
      } else {
        // console.log(data, "this is the data");
        // Extract the idea objects from the nested structure
        const followedIdeas = data?.map((item: any) => item.idea).flat() ?? [];
        setFollowedIdeas(followedIdeas ?? []);
        console.log(followedIdeas, "followed ideas");
      }
    }
  };

  // TODO - to implement
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
          const { data, error } = await supabase
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
          userFollowedIdeas();
        } else {
          const { error } = await supabase
            .from("users_followed_ideas")
            .delete()
            .eq("user_id", userProfile?.id)
            .eq("idea_id", ideaId);

          if (error) {
            console.error("Error following idea:", error);
            setError(error.message);
            return;
          }
          userFollowedIdeas();
        }

        return Promise.resolve();
      }
    } catch (error) {
      console.error("Error in handleFollow:", error);
    }
  };

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const userProfileString = await AsyncStorage.getItem("user");

      if (!userProfileString) {
        setError("User profile not found");
        setLoading(false);
        return;
      }

      let userProfile: { company_id?: string } | null = null;
      try {
        userProfile = JSON.parse(userProfileString);
      } catch (e) {
        setError("Invalid user profile stored locally");
        setLoading(false);
        return;
      }

      if (!userProfile?.company_id) {
        setError("User profile missing company_id");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ideas")
        .select(
          "id, subject, department, description, status, created_at, company_id"
        )
        .eq("company_id", userProfile.company_id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setIdeas(data ?? []);
      }
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    userFollowedIdeas();
  }, [load]);

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
            initialIsFollowing={followedIdeas.some((i) => i.id === item.id)}
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
