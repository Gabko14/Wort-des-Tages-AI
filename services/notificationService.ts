import { Platform } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;
let notificationsAvailable = true;

async function getNotifications() {
  if (Notifications) return Notifications;

  try {
    Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    return Notifications;
  } catch {
    notificationsAvailable = false;
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const notifications = await getNotifications();
  if (!notifications || !notificationsAvailable) return false;

  try {
    if (Platform.OS === 'android') {
      await notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Tägliche Erinnerung',
        importance: notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } =
      await notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    notificationsAvailable = false;
    return false;
  }
}

export async function scheduleDailyNotification(
  timeString: string
): Promise<string | null> {
  const notifications = await getNotifications();
  if (!notifications || !notificationsAvailable) return null;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    await cancelAllNotifications();

    const [hours, minutes] = timeString.split(':').map(Number);

    const identifier = await notifications.scheduleNotificationAsync({
      content: {
        title: 'Wort des Tages 📚',
        body: 'Zeit für deine täglichen Wörter! Lerne heute neue Vokabeln.',
        data: { screen: 'home' },
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return identifier;
  } catch {
    notificationsAvailable = false;
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  const notifications = await getNotifications();
  if (!notifications || !notificationsAvailable) return;

  try {
    await notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    notificationsAvailable = false;
  }
}

export async function getScheduledNotifications(): Promise<unknown[]> {
  const notifications = await getNotifications();
  if (!notifications || !notificationsAvailable) return [];

  try {
    return notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}

export function isNotificationsAvailable(): boolean {
  return notificationsAvailable;
}
