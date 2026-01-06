import { supabase } from "@/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return false;
    }

    // Get push token for notifications
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1877F2",
      });
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

export async function scheduleDailyNotificationCheck() {
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule notification for 10:00 AM every day
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "The Box",
        body: "Check for new comments and updates",
        data: { type: "daily_check" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10,
        minute: 0,
      },
    });

    console.log("Daily notification check scheduled for 10:00 AM");
  } catch (error) {
    console.error("Error scheduling daily notifications:", error);
  }
}

async function checkReviewDateNotifications(userId: string) {
  try {
    // Get all ideas from user's company with "Review date..." status
    const { data: userProfile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (!userProfile) return;

    const { data: ideas, error } = await supabase
      .from("ideas")
      .select("id, status, subject, description")
      .eq("company_id", userProfile.company_id)
      .like("status", "Review date%");

    if (error || !ideas || ideas.length === 0) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const idea of ideas) {
      // Extract date from status (format: "Review date: YYYY-MM-DD")
      const dateMatch = idea.status.match(
        /Review date[:\s]+(\d{4}-\d{2}-\d{2})/i
      );
      if (!dateMatch) continue;

      const [year, month, day] = dateMatch[1].split("-").map(Number);
      const reviewDate = new Date(year, month - 1, day);
      reviewDate.setHours(0, 0, 0, 0);

      const diffTime = reviewDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let notificationTitle = "";
      let notificationBody = "";

      if (diffDays === 0) {
        // Review date is today
        notificationTitle = "Review Date Today";
        notificationBody = `The review date for "${idea.subject || "an idea"}" is today!`;
      } else if (diffDays === 1) {
        // Review date is tomorrow (1 day away)
        notificationTitle = "Review Date Tomorrow";
        notificationBody = `The review date for "${idea.subject || "an idea"}" is tomorrow`;
      } else if (diffDays === 7) {
        // Review date is 1 week away
        notificationTitle = "Review Date in 1 Week";
        notificationBody = `The review date for "${idea.subject || "an idea"}" is in 1 week`;
      }

      // Send notification if it matches one of our criteria
      if (notificationTitle && notificationBody) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notificationTitle,
            body: notificationBody,
            data: { ideaId: idea.id, type: "review_date_reminder" },
          },
          trigger: null, // Send immediately
        });
      }
    }
  } catch (error) {
    console.error("Error checking review date notifications:", error);
  }
}

export async function checkAndScheduleNotifications() {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (!userString) return;

    const user = JSON.parse(userString);

    // Get followed ideas
    const { data: followedIdeas, error } = await supabase
      .from("users_followed_ideas")
      .select("idea:idea_id(id, status, created_at)")
      .eq("user_id", user.id);

    if (error || !followedIdeas) {
      console.error("Error fetching followed ideas:", error);
      return;
    }

    // Check for commented ideas in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentComments, error: commentsError } = await supabase
      .from("comments")
      .select("idea_id, created_at")
      .gte("created_at", oneDayAgo);

    if (commentsError) {
      console.error("Error fetching recent comments:", commentsError);
      return;
    }

    // Filter followed ideas that have new comments
    const ideasWithNewComments = followedIdeas.filter((item: any) => {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      return (
        idea &&
        recentComments?.some((comment: any) => comment.idea_id === idea.id)
      );
    });

    // Schedule notifications for ideas with new comments
    for (const item of ideasWithNewComments) {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      if (idea) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "New Comment",
            body: "Someone commented on an idea you follow",
            data: { ideaId: idea.id, type: "new_comment" },
          },
          trigger: null, // Send immediately
        });
      }
    }

    // Check for ideas with status updates
    const ideasWithStatusUpdates = followedIdeas.filter((item: any) => {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      return (
        idea &&
        (idea.status === "commented by manager" ||
          idea.status === "accepted" ||
          idea.status === "declined")
      );
    });

    // Notify about status updates
    for (const item of ideasWithStatusUpdates) {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      if (idea) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Status Update",
            body: `An idea you follow has been ${idea.status}`,
            data: { ideaId: idea.id, type: "status_update" },
          },
          trigger: null, // Send immediately
        });
      }
    }

    await checkReviewDateNotifications(user.id);

    console.log("Notifications scheduled successfully");
  } catch (error) {
    console.error("Error checking and scheduling notifications:", error);
  }
}

export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): string | null {
  try {
    const data = response.notification.request.content.data;
    if (data && data.ideaId) {
      return data.ideaId as string;
    }
    return null;
  } catch (error) {
    console.error("Error handling notification response:", error);
    return null;
  }
}

// New function to check review dates on app open
export async function checkReviewDatesOnAppOpen() {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (!userString) return;

    const user = JSON.parse(userString);
    await checkReviewDateNotifications(user.id);
  } catch (error) {
    console.error("Error checking review dates on app open:", error);
  }
}

// realtime subscriptions
let realtimeChannel: any = null;
let recentStatusChanges = new Set<string>();

// to prevent self-notification
export function trackStatusChange(ideaId: string) {
  recentStatusChanges.add(ideaId);
  // remove after 2 seconds
  setTimeout(() => {
    recentStatusChanges.delete(ideaId);
  }, 2000);
}

export async function setupRealtimeNotifications() {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (!userString) return;

    const user = JSON.parse(userString);

    if (realtimeChannel) {
      await supabase.removeChannel(realtimeChannel);
    }

    realtimeChannel = supabase
      .channel("app-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        async (payload) => {
          const newComment = payload.new as any;

          const { data: isFollowing } = await supabase
            .from("users_followed_ideas")
            .select("id")
            .eq("idea_id", newComment.idea_id)
            .eq("user_id", user.id)
            .single();

          const isOwnComment = newComment.created_by === user.id;

          // only notify if following and not user's own comment
          if (isFollowing && !isOwnComment) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "New Comment",
                body: "Someone commented on an idea you follow",
                data: { ideaId: newComment.idea_id, type: "new_comment" },
              },
              trigger: null,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ideas",
        },
        async (payload) => {
          const oldIdea = payload.old as any;
          const newIdea = payload.new as any;

          if (oldIdea.status === newIdea.status) return;

          const { data: isFollowing } = await supabase
            .from("users_followed_ideas")
            .select("id")
            .eq("idea_id", newIdea.id)
            .eq("user_id", user.id)
            .single();

          if (!isFollowing) return;
          if (newIdea.created_by === user.id) return;
          if (recentStatusChanges.has(newIdea.id)) return;
          const notifiableStatuses = [
            "commented by manager",
            "accepted",
            "declined",
          ];
          if (notifiableStatuses.includes(newIdea.status)) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Status Update",
                body: `An idea you follow has been ${newIdea.status}`,
                data: { ideaId: newIdea.id, type: "status_update" },
              },
              trigger: null,
            });
          }
        }
      )
      .subscribe();
  } catch (error) {
    console.error("Error setting up realtime notifications:", error);
  }
}

export async function cleanupRealtimeNotifications() {
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}
