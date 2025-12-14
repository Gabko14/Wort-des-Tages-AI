import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAndroidId, getIosIdForVendorAsync } from 'expo-application';

const STORAGE_KEY = 'device_id';
let cachedId: string | null = null;

function fallbackId(): string {
  const random = Math.random().toString(16).slice(2);
  return `dev-${Date.now()}-${random}`;
}

async function generateDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    try {
      const androidId = getAndroidId();
      if (androidId) return androidId;
    } catch {
      return fallbackId();
    }
  }

  if (Platform.OS === 'ios') {
    try {
      const iosId = await getIosIdForVendorAsync();
      if (iosId) return iosId;
    } catch {
      return fallbackId();
    }
  }

  return fallbackId();
}

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedId = stored;
      return stored;
    }
  } catch (err) {
    console.error('Failed to read device ID from storage:', err);
  }

  const newId = await generateDeviceId();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, newId);
  } catch (err) {
    console.error('Failed to persist device ID:', err);
  }
  cachedId = newId;
  return newId;
}
