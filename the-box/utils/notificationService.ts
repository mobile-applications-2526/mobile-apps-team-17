import * as Notifications from 'expo-notifications';
import { supabase } from '@/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Get push token for notifications
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1877F2',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
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
        title: 'The Box',
        body: 'Check for new comments and updates',
        data: { type: 'daily_check' },
      },
      trigger: {
        // type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        // hour: 10,
        // minute: 0,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 30,
        repeats: true,
      },
    });

    console.log('Daily notification check scheduled for 10:00 AM');
  } catch (error) {
    console.error('Error scheduling daily notifications:', error);
  }
}

export async function checkAndScheduleNotifications() {
  try {
    const userString = await AsyncStorage.getItem('user');
    if (!userString) return;

    const user = JSON.parse(userString);
    
    // Get followed ideas
    const { data: followedIdeas, error } = await supabase
      .from('users_followed_ideas')
      .select('idea:idea_id(id, status, created_at)')
      .eq('user_id', user.id);

    if (error || !followedIdeas) {
      console.error('Error fetching followed ideas:', error);
      return;
    }

    // Check for commented ideas in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentComments, error: commentsError } = await supabase
      .from('comments')
      .select('idea_id, created_at')
      .gte('created_at', oneDayAgo);

    if (commentsError) {
      console.error('Error fetching recent comments:', commentsError);
      return;
    }

    // Filter followed ideas that have new comments
    const ideasWithNewComments = followedIdeas.filter((item: any) => {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      return idea && recentComments?.some((comment: any) => comment.idea_id === idea.id);
    });

    // Schedule notifications for ideas with new comments
    for (const item of ideasWithNewComments) {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      if (idea) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Comment',
            body: 'Someone commented on an idea you follow',
            data: { ideaId: idea.id, type: 'new_comment' },
          },
          trigger: null, // Send immediately
        });
      }
    }

    // Check for ideas with status updates
    const ideasWithStatusUpdates = followedIdeas.filter((item: any) => {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      return idea && (idea.status === 'commented by manager' || 
             idea.status === 'accepted' || 
             idea.status === 'declined');
    });

    // Notify about status updates
    for (const item of ideasWithStatusUpdates) {
      const idea = Array.isArray(item.idea) ? item.idea[0] : item.idea;
      if (idea) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Status Update',
            body: `An idea you follow has been ${idea.status}`,
            data: { ideaId: idea.id, type: 'status_update' },
          },
          trigger: null, // Send immediately
        });
      }
    }

    console.log('Notifications scheduled successfully');
  } catch (error) {
    console.error('Error checking and scheduling notifications:', error);
  }
}

export function handleNotificationResponse(response: Notifications.NotificationResponse): string | null {
  try {
    const data = response.notification.request.content.data;
    if (data && data.ideaId) {
      return data.ideaId as string;
    }
    return null;
  } catch (error) {
    console.error('Error handling notification response:', error);
    return null;
  }
}