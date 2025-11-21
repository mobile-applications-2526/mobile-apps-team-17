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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AddIcon from "../../assets/images/add-icon.png";
import FunnelIcon from "../../assets/images/funnel-simple.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Search from "../../assets/images/search-icon.png";

// TODO - to implement
const handleFollow = (ideaId: string, isCurrentlyFollowing: boolean) => {
  console.log(
    `Idea ${ideaId} follow status toggled to ${!isCurrentlyFollowing}`
  );
  return Promise.resolve();
};

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [followedIdeas, setFollowedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglePage, setTogglePage] = useState<'all' | 'following'>('all');
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
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
        const followedIdeas = data?.map((item: any) => item.idea).flat() ?? [];
        setFollowedIdeas(followedIdeas ?? []);
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
          setUnfollowingIds(prev => new Set(prev).add(String(ideaId)));
          
          const { error } = await supabase
            .from("users_followed_ideas")
            .delete()
            .eq("user_id", userProfile?.id)
            .eq("idea_id", ideaId);

          if (error) {
            console.error("Error following idea:", error);
            setError(error.message);
            setUnfollowingIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(String(ideaId));
              return newSet;
            });
            return;
          }
          
          setFollowedIdeas(prev => prev.filter(idea => idea.id !== ideaId));
          
          setTimeout(() => {
            setUnfollowingIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(String(ideaId));
              return newSet;
            });
          }, 300);
          
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

  const filteredIdeas = ideas.filter((idea) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      idea.description.toLowerCase().includes(q)
    );
  });

  return (
        <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
    <View className="flex-1">
      <View className=" w-full flex flex-row items-center pb-2 justify-center gap-2">
          <TouchableOpacity className={`rounded-3xl ${togglePage === 'all' ? ' bg-brand-blue py-[0.6rem]' : 'bg-white border border-black py-2'} px-12`}  onPress={() => setTogglePage('all')}>
            <Text className={`${togglePage === 'all' ? 'text-white' : 'text-black'}`}>All Posts</Text>
          </TouchableOpacity>
        <TouchableOpacity className={`rounded-3xl ${togglePage === 'following' ? ' bg-brand-blue py-[0.6rem]' : 'bg-white border border-black py-2'} px-12`} onPress={() => setTogglePage('following')}>
            <Text className={`${togglePage === 'following' ? 'text-white' : 'text-black'}`}>Following</Text>
          </TouchableOpacity>
          <View className="border border-black rounded-full p-1">
            <Image source={FunnelIcon} className="" style={{ width: 18, height: 18 }} resizeMode="contain" />
          </View>
      </View>
      {togglePage === 'all' ? <FlatList
        data={filteredIdeas}
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
        keyboardShouldPersistTaps="handled"
      /> : <FlatList
        data={followedIdeas.filter(idea => !unfollowingIds.has(String(idea.id)))}
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
            initialIsFollowing={true}
            onFollow={(isCurrentlyFollowing) =>
              handleFollow(item.id, isCurrentlyFollowing)
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-[100px] px-10">
            <Text className="text-xl font-semibold text-[#333] mb-2 text-center">
              No followed ideas yet.
            </Text>
            {/* <Text className="text-base text-[#666] text-center">
              Be the first to share an idea!
            </Text> */}
          </View>
        }
      />}
      

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
          <View className="flex-1 rounded-3xl border border-brand-blue bg-white justify-center mb-2">
            <View className="flex-row items-center my-1 mx-2">
              <View className="rounded-full items-center justify-center">
                <Image
                  source={Search}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>

              <TextInput
                className="flex-1 text-center text-base font-sf-pro text-brand-blue pb-2"
                placeholder="Search by keywords"
                placeholderTextColor="#1876f25d"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-brand-blue rounded-2xl py-4 px-5 flex-row items-center justify-start"
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
    </KeyboardAvoidingView>
  );
}
