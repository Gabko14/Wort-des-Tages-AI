import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/config/supabase';
import { PremiumStatus } from '@/types/premium';

import { getDeviceId } from './deviceService';

const CACHE_KEY = 'premium_status_cache';
let cachedStatus: PremiumStatus | null = null;

async function persistStatus(status: PremiumStatus) {
  cachedStatus = status;
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(status));
}

async function loadCachedStatus(): Promise<PremiumStatus | null> {
  if (cachedStatus) return cachedStatus;
  const stored = await AsyncStorage.getItem(CACHE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as PremiumStatus;
    cachedStatus = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function checkPremiumStatus(): Promise<PremiumStatus> {
  const deviceId = await getDeviceId();
  const { data, error } = await supabase.functions.invoke('check-entitlement', {
    body: { deviceId },
  });

  if (error) {
    const fallback = (await loadCachedStatus()) ?? { isPremium: false };
    return fallback;
  }

  const status: PremiumStatus = {
    isPremium: data?.isPremium ?? false,
    source: data?.source ?? undefined,
  };

  await persistStatus(status);
  return status;
}

export async function grantPremium(
  source: 'dev' | 'google_play' | 'apple' = 'dev'
): Promise<boolean> {
  const deviceId = await getDeviceId();
  const { error } = await supabase.functions.invoke('grant-premium', {
    body: { deviceId, source },
  });

  if (error) {
    return false;
  }

  await persistStatus({ isPremium: true, source });
  return true;
}

export function isPremiumCached(): boolean {
  return cachedStatus?.isPremium ?? false;
}
