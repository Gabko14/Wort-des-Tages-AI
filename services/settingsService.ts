import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppError } from '@/utils/appError';

const SETTINGS_KEY = 'user_settings';

export type FrequencyRange = 'selten' | 'mittel' | 'haeufig';

export interface AppSettings {
  wordCount: number;
  wordTypes: {
    substantiv: boolean;
    verb: boolean;
    adjektiv: boolean;
  };
  frequencyRanges: FrequencyRange[];
  notificationsEnabled: boolean;
  notificationTime: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  wordCount: 3,
  wordTypes: {
    substantiv: true,
    verb: true,
    adjektiv: true,
  },
  frequencyRanges: ['mittel'],
  notificationsEnabled: false,
  notificationTime: '09:00',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migration: alte frequencyRange (Singular) → frequencyRanges (Array)
      let frequencyRanges = parsed.frequencyRanges;
      if (!frequencyRanges && parsed.frequencyRange) {
        frequencyRanges = [parsed.frequencyRange];
      }

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        wordTypes: { ...DEFAULT_SETTINGS.wordTypes, ...parsed.wordTypes },
        frequencyRanges: frequencyRanges ?? DEFAULT_SETTINGS.frequencyRanges,
      };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    throw new AppError(
      'settings_save_failed',
      'Einstellungen konnten nicht gespeichert werden.',
      err
    );
  }
}

const FREQUENCY_CLASS_MAP: Record<FrequencyRange, string[]> = {
  selten: ['0', '1'],
  mittel: ['2', '3'],
  haeufig: ['4', '5', '6'],
};

export function getFrequencyClasses(ranges: FrequencyRange[]): string[] {
  const classes = new Set<string>();
  for (const range of ranges) {
    for (const cls of FREQUENCY_CLASS_MAP[range]) {
      classes.add(cls);
    }
  }
  return Array.from(classes);
}

export function getSelectedWordTypes(wordTypes: AppSettings['wordTypes']): string[] {
  const types: string[] = [];
  if (wordTypes.substantiv) types.push('Substantiv');
  if (wordTypes.verb) types.push('Verb');
  if (wordTypes.adjektiv) types.push('Adjektiv');
  return types;
}
