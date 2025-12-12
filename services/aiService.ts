import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/config/supabase';
import { Wort } from '@/services/database';
import { EnrichedWord } from '@/types/ai';

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

export async function enrichWords(
  words: Wort[]
): Promise<EnrichedWord[] | null> {
  if (words.length === 0) return null;

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

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { data, error } = await supabase.functions.invoke('ai-enrich', {
      body: payload,
    });

    if (!error) {
      const enriched = (data?.enrichedWords as EnrichedWord[]) ?? null;
      if (enriched) {
        await setCache(cacheKey, enriched);
      }
      return enriched;
    }

    lastError = error;

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  console.error('AI enrichment failed after retries:', lastError);
  return null;
}
