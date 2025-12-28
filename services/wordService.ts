import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDatabase, Wort } from '@/services/database';
import {
  AppSettings,
  getFrequencyClasses,
  getSelectedWordTypes,
  loadSettings,
} from '@/services/settingsService';
import { AppError } from '@/utils/appError';

const DAILY_WORDS_KEY = 'daily_words';

interface DailyWordsCache {
  date: string;
  wordIds: number[];
}

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function getTodaysWords(): Promise<Wort[]> {
  const today = getTodayDateString();

  const stored = await AsyncStorage.getItem(DAILY_WORDS_KEY);
  if (!stored) {
    return [];
  }

  let cache: DailyWordsCache;
  try {
    cache = JSON.parse(stored);
  } catch {
    return [];
  }

  if (cache.date !== today || !cache.wordIds?.length) {
    return [];
  }

  const db = await getDatabase();
  const placeholders = cache.wordIds.map(() => '?').join(',');
  const words = await db.getAllAsync<Wort>(
    `SELECT * FROM wort WHERE id IN (${placeholders})`,
    cache.wordIds
  );

  // Preserve the stored order
  const wordsById = new Map(words.map((w) => [w.id, w]));
  return cache.wordIds.map((id) => wordsById.get(id)).filter((w): w is Wort => w !== undefined);
}

export interface WordSelectionOptions {
  count: number;
  wordTypes: string[];
  frequencyClasses: string[];
}

export async function selectRandomWords(options: WordSelectionOptions): Promise<Wort[]> {
  const db = await getDatabase();
  const { count, wordTypes, frequencyClasses } = options;

  if (wordTypes.length === 0 || frequencyClasses.length === 0) {
    return [];
  }

  const wordTypePlaceholders = wordTypes.map(() => '?').join(',');
  const frequencyPlaceholders = frequencyClasses.map(() => '?').join(',');

  const query = `
    SELECT * FROM wort 
    WHERE wortklasse IN (${wordTypePlaceholders})
    AND frequenzklasse IN (${frequencyPlaceholders})
    ORDER BY RANDOM() 
    LIMIT ?
  `;

  const params = [...wordTypes, ...frequencyClasses, count];

  const words = await db.getAllAsync<Wort>(query, params);
  return words;
}

export async function saveTodaysWords(words: Wort[]): Promise<void> {
  const today = getTodayDateString();
  const cache: DailyWordsCache = {
    date: today,
    wordIds: words.map((w) => w.id),
  };
  await AsyncStorage.setItem(DAILY_WORDS_KEY, JSON.stringify(cache));
}

function buildSelectionOptions(settings: AppSettings): WordSelectionOptions {
  return {
    count: settings.wordCount,
    wordTypes: getSelectedWordTypes(settings.wordTypes),
    frequencyClasses: getFrequencyClasses(settings.frequencyRanges),
  };
}

export async function getOrGenerateTodaysWords(): Promise<Wort[]> {
  let words = await getTodaysWords();

  if (words.length > 0) {
    return words;
  }

  const settings = await loadSettings();
  const options = buildSelectionOptions(settings);

  words = await selectRandomWords(options);

  if (words.length > 0) {
    await saveTodaysWords(words);
  }

  return words;
}

export async function clearTodaysWords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DAILY_WORDS_KEY);
  } catch (err) {
    throw new AppError(
      'storage_clear_failed',
      'Wörter des Tages konnten nicht zurückgesetzt werden.',
      err
    );
  }
}
