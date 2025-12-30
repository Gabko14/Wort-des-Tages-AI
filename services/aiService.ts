import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/config/supabase';
import { Wort } from '@/services/database';
import { getDeviceId } from '@/services/deviceService';
import { AiEnrichResponse, EnrichedWord } from '@/types/ai';
import { AppError } from '@/utils/appError';

const CACHE_PREFIX = 'enriched_word';

// Track in-flight requests to prevent duplicate API calls
const inFlightRequests = new Map<number, Promise<EnrichedWord>>();

function buildCacheKey(wordId: number): string {
  return `${CACHE_PREFIX}_${wordId}`;
}

async function getCached(key: string): Promise<EnrichedWord | null> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as EnrichedWord;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: EnrichedWord): Promise<void> {
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

/**
 * Enrich a single word with AI-generated content.
 * Results are cached per word. Deduplicates in-flight requests.
 */
export async function enrichWord(word: Wort): Promise<EnrichedWord> {
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'KI ist nicht verfügbar (Konfiguration fehlt).');
  }

  // Check cache first (synchronous-ish, fast path)
  const cacheKey = buildCacheKey(word.id);
  const cached = await getCached(cacheKey);
  if (cached) {
    return cached;
  }

  // Check if there's already an in-flight request for this word
  const existingRequest = inFlightRequests.get(word.id);
  if (existingRequest) {
    return existingRequest;
  }

  // Create new request and track it
  const request = doEnrichWord(word, cacheKey);
  inFlightRequests.set(word.id, request);

  try {
    return await request;
  } finally {
    inFlightRequests.delete(word.id);
  }
}

/**
 * Internal function that performs the actual API call with retries.
 */
async function doEnrichWord(word: Wort, cacheKey: string): Promise<EnrichedWord> {
  const deviceId = await getDeviceId();

  const payload = {
    deviceId,
    words: [
      {
        id: word.id,
        lemma: word.lemma,
        wortklasse: word.wortklasse,
      },
    ],
  };

  const client = supabase!;
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

    if (!error && data) {
      const response = data as AiEnrichResponse;
      const enriched = response.enrichedWords?.[0];
      if (enriched) {
        await setCache(cacheKey, enriched);
        return enriched;
      }
      throw new AppError('ai_enrich_empty', 'KI hat keine Daten zurückgegeben.');
    }

    lastError = error;

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw new AppError('ai_enrich_failed', 'KI ist gerade nicht verfügbar.', lastError);
}
