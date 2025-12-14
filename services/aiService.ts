import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/config/supabase';
import { Wort } from '@/services/database';
import { EnrichedWord } from '@/types/ai';
import { AppError } from '@/utils/appError';

import { getDeviceId } from './deviceService';

const CACHE_PREFIX = 'enriched_words';

function buildCacheKey(words: Wort[]): string {
  const ids = words.map((w) => w.id).sort((a, b) => a - b);
  return `${CACHE_PREFIX}_${ids.join('-')}`;
}

async function getCached(key: string): Promise<EnrichedWord[] | null> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as EnrichedWord[];
  } catch {
    return null;
  }
}

async function setCache(key: string, data: EnrichedWord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore cache write errors
  }
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function enrichWords(words: Wort[]): Promise<EnrichedWord[]> {
  if (words.length === 0) return [];
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'KI ist nicht verfügbar (Konfiguration fehlt).');
  }

  const cacheKey = buildCacheKey(words);
  const cached = await getCached(cacheKey);
  if (cached) {
    return cached;
  }

  const deviceId = await getDeviceId();

  const payload = {
    deviceId,
    words: words.map((w) => ({
      id: w.id,
      lemma: w.lemma,
      wortklasse: w.wortklasse,
    })),
  };

  const client = supabase;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let data: unknown;
    let error: unknown;
    try {
      const result = await client.functions.invoke('ai-enrich', { body: payload });
      data = result.data;
      error = result.error;
    } catch (err) {
      error = err;
    }

    if (!error) {
      const enriched = (data as any)?.enrichedWords;
      if (Array.isArray(enriched)) {
        await setCache(cacheKey, enriched as EnrichedWord[]);
        return enriched as EnrichedWord[];
      }
      return [];
    }

    lastError = error;

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw new AppError('ai_enrich_failed', 'KI ist gerade nicht verfügbar.', lastError);
}
