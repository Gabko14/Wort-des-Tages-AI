import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/config/supabase';
import { PremiumStatus } from '@/types/premium';
import { AppError } from '@/utils/appError';

import { getDeviceId } from './deviceService';

const CACHE_KEY = 'premium_status_cache';
let cachedStatus: PremiumStatus | null = null;

async function persistStatus(status: PremiumStatus) {
  cachedStatus = status;
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(status));
  } catch (err) {
    console.error('Failed to persist premium status:', err);
  }
}

async function loadCachedStatus(): Promise<PremiumStatus | null> {
  if (cachedStatus) return cachedStatus;
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(CACHE_KEY);
  } catch (err) {
    console.error('Failed to read cached premium status:', err);
    return null;
  }
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
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'Premium-Status kann nicht geprüft werden.');
  }

  const deviceId = await getDeviceId();
  let data: unknown;
  let error: unknown;
  try {
    const client = supabase;
    const result = await client.functions.invoke('check-entitlement', { body: { deviceId } });
    data = result.data;
    error = result.error;
  } catch (err) {
    error = err;
  }

  if (error) {
    throw new AppError(
      'premium_check_failed',
      'Premium-Status konnte nicht geprüft werden.',
      error
    );
  }

  const status: PremiumStatus = {
    isPremium: (data as any)?.isPremium ?? false,
    source: (data as any)?.source ?? undefined,
  };

  await persistStatus(status);
  return status;
}

export async function grantPremium(
  source: 'dev' | 'google_play' | 'apple' = 'dev'
): Promise<boolean> {
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'Premium kann nicht aktiviert werden.');
  }

  const deviceId = await getDeviceId();
  let error: unknown;
  try {
    const client = supabase;
    const result = await client.functions.invoke('grant-premium', { body: { deviceId, source } });
    error = result.error;
  } catch (err) {
    error = err;
  }

  if (error) {
    throw new AppError('premium_grant_failed', 'Premium konnte nicht aktiviert werden.', error);
  }

  await persistStatus({ isPremium: true, source });
  return true;
}

export function isPremiumCached(): boolean {
  return cachedStatus?.isPremium ?? false;
}
