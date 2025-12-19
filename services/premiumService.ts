import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/config/supabase';
import { getDeviceId } from '@/services/deviceService';
import { PremiumStatus } from '@/types/premium';
import { AppError } from '@/utils/appError';

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

interface CheckEntitlementResponse {
  isPremium?: boolean;
  source?: string;
  expiresAt?: string;
  autoRenewing?: boolean;
}

export async function checkPremiumStatus(): Promise<PremiumStatus> {
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'Premium-Status kann nicht geprüft werden.');
  }

  const deviceId = await getDeviceId();
  let data: CheckEntitlementResponse | null = null;
  let error: unknown;

  try {
    const client = supabase;
    const result = await client.functions.invoke<CheckEntitlementResponse>('check-entitlement', {
      body: { deviceId },
    });
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
    isPremium: data?.isPremium ?? false,
    source: data?.source as PremiumStatus['source'],
    expiresAt: data?.expiresAt,
    autoRenewing: data?.autoRenewing,
  };

  await persistStatus(status);
  return status;
}

interface GrantPremiumOptions {
  adminSecret?: string;
}

export async function grantPremium(
  source: 'dev' | 'google_play' | 'apple' = 'dev',
  options?: GrantPremiumOptions
): Promise<boolean> {
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'Premium kann nicht aktiviert werden.');
  }

  const deviceId = await getDeviceId();
  let error: unknown;

  try {
    const client = supabase;

    // Build headers for dev access with admin secret
    const headers: Record<string, string> = {};
    if (source === 'dev' && options?.adminSecret) {
      headers['X-Admin-Secret'] = options.adminSecret;
    }

    const result = await client.functions.invoke('grant-premium', {
      body: { deviceId, source },
      headers,
    });
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

export function getCachedPremiumStatus(): PremiumStatus | null {
  return cachedStatus;
}

/**
 * Load cached premium status from AsyncStorage on app start.
 * Call this early in the app lifecycle.
 */
export async function loadCachedPremiumStatus(): Promise<PremiumStatus | null> {
  if (cachedStatus) {
    return cachedStatus;
  }

  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    if (stored) {
      cachedStatus = JSON.parse(stored) as PremiumStatus;

      // Check if cached subscription has expired
      if (
        cachedStatus.isPremium &&
        cachedStatus.source === 'google_play' &&
        cachedStatus.expiresAt
      ) {
        const expiryDate = new Date(cachedStatus.expiresAt);
        if (expiryDate < new Date()) {
          // Cached status shows expired - update cache but don't modify server
          cachedStatus = { ...cachedStatus, isPremium: false };
          await persistStatus(cachedStatus);
        }
      }

      return cachedStatus;
    }
  } catch (err) {
    console.error('Failed to load cached premium status:', err);
  }

  return null;
}

/**
 * Clear premium status cache. Useful for testing or after logout.
 */
export async function clearPremiumCache(): Promise<void> {
  cachedStatus = null;
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.error('Failed to clear premium cache:', err);
  }
}
