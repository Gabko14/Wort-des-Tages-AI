import { Platform } from 'react-native';

import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NotificationRequest } from 'expo-notifications';

import { getNotificationContent } from '@/services/gamificationService';
import { AppError } from '@/utils/appError';

let didWarnExpoGo = false;

export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

async function getNotificationsModule() {
  if (isExpoGo()) {
    if (!didWarnExpoGo) {
      didWarnExpoGo = true;
      console.warn('Notifications are disabled in Expo Go for this app.');
    }
    return null;
  }

  let Notifications: typeof import('expo-notifications');
  try {
    Notifications = await import('expo-notifications');
  } catch (err) {
    throw new AppError(
      'notifications_unavailable',
      'Benachrichtigungen sind nicht verfügbar.',
      err
    );
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (err) {
    console.error('Failed to set notification handler:', err);
  }

  return Notifications;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Tägliche Erinnerung',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    throw new AppError(
      'notifications_permission_failed',
      'Benachrichtigungen konnten nicht aktiviert werden.',
      err
    );
  }
}

export async function scheduleDailyNotification(timeString: string): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return null;
    }

    await cancelAllNotifications();

    const [hours, minutes] = timeString.split(':').map(Number);
    const isValidTime =
      Number.isFinite(hours) &&
      Number.isFinite(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59;
    if (!isValidTime) {
      return null;
    }

    // Get dynamic notification content based on streak status
    const { title, body } = await getNotificationContent();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return identifier;
  } catch (err) {
    throw new AppError(
      'notifications_schedule_failed',
      'Benachrichtigung konnte nicht geplant werden.',
      err
    );
  }
}

export async function cancelAllNotifications(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    throw new AppError(
      'notifications_schedule_failed',
      'Benachrichtigungen konnten nicht deaktiviert werden.',
      err
    );
  }
}

export async function getScheduledNotifications(): Promise<NotificationRequest[]> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return [];
  }

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (err) {
    throw new AppError(
      'notifications_schedule_failed',
      'Benachrichtigungen konnten nicht geladen werden.',
      err
    );
  }
}

export async function sendTestNotification(): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Wort des Tages',
        body: 'Dies ist eine Testbenachrichtigung!',
        data: { screen: 'home' },
      },
      trigger: null, // null means show immediately
    });

    return true;
  } catch (err) {
    throw new AppError(
      'notifications_test_failed',
      'Testbenachrichtigung konnte nicht gesendet werden.',
      err
    );
  }
}

/**
 * Refresh the scheduled notification content with latest streak data.
 * Call this when the app opens to keep notification content up-to-date.
 *
 * @param timeString - The notification time (e.g., "09:00")
 * @returns true if notification was refreshed, false if notifications are not enabled
 */
export async function refreshNotificationContent(timeString: string): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length === 0) {
      // No notifications scheduled, nothing to refresh
      return false;
    }

    // Re-schedule with fresh content
    const identifier = await scheduleDailyNotification(timeString);
    return identifier !== null;
  } catch {
    // Silent fail - refreshing content is non-critical
    return false;
  }
}
