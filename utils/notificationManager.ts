
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logSystem } from './activityLogger';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationManager {
  private static instance: NotificationManager;
  private notificationIdentifier: string | null = null;

  private constructor() {
    console.log('NotificationManager initialized');
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting notification permissions...');
      await logSystem('NOTIFICATION_PERMISSION_REQUEST', 'Requesting notification permissions');

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        await logSystem('NOTIFICATION_PERMISSION_DENIED', 'User denied notification permissions');
        return false;
      }

      console.log('Notification permissions granted');
      await logSystem('NOTIFICATION_PERMISSION_GRANTED', 'User granted notification permissions');

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('streak-reminders', {
          name: 'Streak Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7C3AED',
          sound: 'default',
        });
        console.log('Android notification channel created');
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      await logSystem('NOTIFICATION_PERMISSION_ERROR', 'Error requesting notification permissions', {
        error: String(error),
      });
      return false;
    }
  }

  async scheduleDailyStreakReminder(): Promise<void> {
    try {
      console.log('Scheduling daily streak reminder...');

      // Cancel existing notification if any
      if (this.notificationIdentifier) {
        await Notifications.cancelScheduledNotificationAsync(this.notificationIdentifier);
        console.log('Cancelled existing streak reminder');
      }

      // Schedule notification for every day at 8 PM
      this.notificationIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Keep Your Streak Alive!',
          body: 'Don\'t forget to tap your streak today! Your progress is waiting.',
          data: { type: 'streak_reminder' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Daily streak reminder scheduled:', this.notificationIdentifier);
      await logSystem('STREAK_REMINDER_SCHEDULED', 'Daily streak reminder scheduled', {
        notificationId: this.notificationIdentifier,
        time: '20:00',
      });
    } catch (error) {
      console.error('Error scheduling streak reminder:', error);
      await logSystem('STREAK_REMINDER_SCHEDULE_ERROR', 'Error scheduling streak reminder', {
        error: String(error),
      });
    }
  }

  async cancelStreakReminder(): Promise<void> {
    try {
      if (this.notificationIdentifier) {
        await Notifications.cancelScheduledNotificationAsync(this.notificationIdentifier);
        console.log('Streak reminder cancelled');
        await logSystem('STREAK_REMINDER_CANCELLED', 'Streak reminder cancelled', {
          notificationId: this.notificationIdentifier,
        });
        this.notificationIdentifier = null;
      }
    } catch (error) {
      console.error('Error cancelling streak reminder:', error);
      await logSystem('STREAK_REMINDER_CANCEL_ERROR', 'Error cancelling streak reminder', {
        error: String(error),
      });
    }
  }

  async sendImmediateNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // Immediate notification
      });
      console.log('Immediate notification sent:', title);
      await logSystem('IMMEDIATE_NOTIFICATION_SENT', 'Immediate notification sent', { title, body });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      await logSystem('IMMEDIATE_NOTIFICATION_ERROR', 'Error sending immediate notification', {
        error: String(error),
      });
    }
  }

  async getAllScheduledNotifications(): Promise<Notifications.Notification[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
