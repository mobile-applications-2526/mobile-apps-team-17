import CustomDropdown from "@/components/DropdownMenu";
import IdeaCard from "@/components/IdeaCard";
import Splash from "@/components/Splash";
import { supabase } from "@/supabase";
import { Idea } from "@/types/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddIcon from "../../assets/images/add-icon.png";
import BackIcon from "../../assets/images/back-icon.png";
import FunnelIconActive from "../../assets/images/funnel-simple-2.png";
import FunnelIcon from "../../assets/images/funnel-simple.png";
import Search from "../../assets/images/search-icon.png";

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [followedIdeas, setFollowedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglePage, setTogglePage] = useState<"all" | "following">("all");
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get("window").width;
  const slideDistance = screenWidth * 1.1;

  type TimeFilter = "all" | "today" | "week" | "month" | "year";
  type StatusFilter =
    | "all"
    | "accepted"
    | "declined"
    | "to_be_reviewed"
    | "commented_by_manager";

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
        const followedIdeasRaw =
          data?.map((item: any) => item.idea).flat() ?? [];
        const uniqueFollowedIdeas = followedIdeasRaw.filter(
          (idea: Idea, index: number, self: Idea[]) =>
            index === self.findIndex((i) => i.id === idea.id)
        );
        // sort
        const sortedFollowedIdeas = uniqueFollowedIdeas.sort(
          (a: Idea, b: Idea) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setFollowedIdeas(sortedFollowedIdeas);
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
          const isAlreadyFollowing = followedIdeas.some(
            (idea) => idea.id === ideaId
          );
          if (isAlreadyFollowing) {
            return;
          }

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
          setUnfollowingIds((prev) => new Set(prev).add(String(ideaId)));

          const { error } = await supabase
            .from("users_followed_ideas")
            .delete()
            .eq("user_id", userProfile?.id)
            .eq("idea_id", ideaId);

          if (error) {
            console.error("Error following idea:", error);
            setError(error.message);
            setUnfollowingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(String(ideaId));
              return newSet;
            });
            return;
          }

          setFollowedIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));

          setTimeout(() => {
            setUnfollowingIds((prev) => {
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

  // Refresh followed ideas when screen comes into focus (returning from discussion)
  useFocusEffect(
    useCallback(() => {
      userFollowedIdeas();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    await userFollowedIdeas();
    setRefreshing(false);
  };

  const handleAddIdea = () => {
    router.push("/create-idea");
  };

  const handleFilteringPress = () => {
    const newState = !isFilterActive;
    setIsFilterActive(newState);

    if (!newState) {
      setIsTimeDropdownOpen(false);
      setIsStatusDropdownOpen(false);
    }

    Animated.spring(slideAnim, {
      toValue: newState ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
      velocity: 1,
    }).start();
  };

  const hasActiveFilters = useMemo(() => {
    return (
      timeFilter !== "all" ||
      statusFilter !== "all" ||
      searchQuery.trim().length > 0
    );
  }, [timeFilter, statusFilter, searchQuery]);

  const applyFilters = useCallback(
    (ideasList: Idea[]) => {
      let filtered = [...ideasList];

      // time filter
      if (timeFilter !== "all") {
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const startOfWeek = new Date(startOfToday);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let cutoffDate: Date;
        if (timeFilter === "today") {
          cutoffDate = startOfToday;
        } else if (timeFilter === "week") {
          cutoffDate = startOfWeek;
        } else if (timeFilter === "month") {
          cutoffDate = startOfMonth;
        } else {
          cutoffDate = startOfYear;
        }

        filtered = filtered.filter(
          (idea) => new Date(idea.created_at) >= cutoffDate
        );
      }

      // status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((idea) => {
          if (statusFilter === "accepted") {
            return idea.status === "accepted";
          } else if (statusFilter === "declined") {
            return idea.status === "declined";
          } else if (statusFilter === "commented_by_manager") {
            return idea.status === "commented by manager";
          } else if (statusFilter === "to_be_reviewed") {
            return idea.status?.startsWith("Review date:");
          }
          return true;
        });
      }

      // search filter
      const q = searchQuery.trim().toLowerCase();
      if (q.length > 0) {
        filtered = filtered.filter((idea) =>
          idea.description.toLowerCase().includes(q)
        );
      }

      return filtered;
    },
    [timeFilter, statusFilter, searchQuery]
  );

  const filteredIdeas = useMemo(() => {
    return applyFilters(ideas);
  }, [ideas, applyFilters]);

  const filteredFollowedIdeas = useMemo(() => {
    const filtered = followedIdeas.filter(
      (idea) => !unfollowingIds.has(String(idea.id))
    );
    return applyFilters(filtered);
  }, [followedIdeas, unfollowingIds, applyFilters]);

  if (loading) {
    return <Splash />;
  }

  const screenHeight = Dimensions.get("window").height;
  const bottomPadding = screenHeight * 0.2;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View className="flex-1 mt-5" style={{ overflow: "visible" }}>
        <View
          className="w-full pb-2 px-4"
          style={{
            zIndex: 1000,
            overflow: "visible",
          }}
        >
          <View
            className="w-full flex-row items-center gap-2"
            style={{ overflow: "hidden" }}
          >
            <Animated.View
              className="flex-1 flex-row gap-2"
              style={{
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -slideDistance],
                    }),
                  },
                ],
              }}
              pointerEvents={isFilterActive ? "none" : "auto"}
            >
              <TouchableOpacity
                className={`flex-1 rounded-3xl ${togglePage === "all" ? "bg-brand-blue py-[0.6rem]" : "bg-white border border-brand-black py-2"}`}
                onPress={() => setTogglePage("all")}
              >
                <Text
                  className={`text-center font-medium ${togglePage === "all" ? "text-white" : "text-brand-black"}`}
                >
                  All Posts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-3xl ${togglePage === "following" ? "bg-brand-blue py-[0.6rem]" : "bg-white border-brand-black border py-2"}`}
                onPress={() => setTogglePage("following")}
              >
                <Text
                  className={`text-center font-medium ${togglePage === "following" ? "text-white" : "text-brand-black"}`}
                >
                  Following
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -slideDistance],
                    }),
                  },
                ],
              }}
              pointerEvents={isFilterActive ? "none" : "auto"}
            >
              <TouchableOpacity
                onPress={handleFilteringPress}
                className={`rounded-full p-2 border ${
                  hasActiveFilters
                    ? "bg-brand-blue border-brand-blue"
                    : "bg-white border-black"
                }`}
              >
                <Image
                  source={hasActiveFilters ? FunnelIconActive : FunnelIcon}
                  style={{ width: 18, height: 18 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Animated.View
            className="flex-row gap-2 absolute left-4 right-4 top-0"
            style={{
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [slideDistance, 0],
                  }),
                },
              ],
              zIndex: 1000,
            }}
            pointerEvents={isFilterActive ? "auto" : "none"}
          >
            <TouchableOpacity
              onPress={handleFilteringPress}
              className="justify-start items-center"
            >
              <Image
                source={BackIcon}
                style={{ width: 34, height: 34 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View className="flex-1">
              <CustomDropdown
                options={[
                  { label: "All Dates", value: "all" },
                  { label: "Today", value: "today" },
                  { label: "This Week", value: "week" },
                  { label: "This Month", value: "month" },
                  { label: "This Year", value: "year" },
                ]}
                selectedValue={timeFilter}
                onValueChange={(value) => {
                  setTimeFilter(value as TimeFilter);
                }}
                placeholder="Select Date..."
                isOpen={isTimeDropdownOpen}
                onToggle={() => {
                  setIsTimeDropdownOpen(!isTimeDropdownOpen);
                  if (!isTimeDropdownOpen) {
                    setIsStatusDropdownOpen(false);
                  }
                }}
              />
            </View>

            <View className="flex-1">
              <CustomDropdown
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Accepted", value: "accepted" },
                  { label: "Declined", value: "declined" },
                  { label: "To be reviewed", value: "to_be_reviewed" },
                  {
                    label: "Commented by manager",
                    value: "commented_by_manager",
                  },
                ]}
                selectedValue={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                }}
                placeholder="Select Status..."
                isOpen={isStatusDropdownOpen}
                onToggle={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  if (!isStatusDropdownOpen) {
                    setIsTimeDropdownOpen(false);
                  }
                }}
              />
            </View>
          </Animated.View>
        </View>

        {togglePage === "all" ? (
          <FlatList
            data={filteredIdeas}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: bottomPadding,
            }}
            showsVerticalScrollIndicator={true}
            ItemSeparatorComponent={() => <View style={{ height: 29 }} />}
            renderItem={({ item }) => (
              <IdeaCard
                idea={item}
                onComment={() => {
                  router.push({
                    pathname: "/discussion/[id]",
                    params: { id: item.id },
                  });
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
          />
        ) : (
          <FlatList
            data={filteredFollowedIdeas}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: bottomPadding,
            }}
            showsVerticalScrollIndicator={true}
            ItemSeparatorComponent={() => <View style={{ height: 29 }} />}
            renderItem={({ item }) => (
              <IdeaCard
                idea={item}
                onComment={() => {
                  router.push({
                    pathname: "/discussion/[id]",
                    params: { id: item.id },
                  });
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
              </View>
            }
          />
        )}

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
