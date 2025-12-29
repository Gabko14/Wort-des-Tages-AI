import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppError } from '@/utils/appError';

const SETTINGS_KEY = 'user_settings';

// Valid frequency classes: '0' (rarest) to '6' (most common)
export type FrequencyClass = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export const ALL_FREQUENCY_CLASSES: FrequencyClass[] = ['0', '1', '2', '3', '4', '5', '6'];

export const DEFAULT_FREQUENCY_CLASSES: FrequencyClass[] = ['2', '3'];

export interface AppSettings {
  wordCount: number;
  wordTypes: {
    substantiv: boolean;
    verb: boolean;
    adjektiv: boolean;
    mehrwortausdruck: boolean;
    adverb: boolean;
  };
  frequencyClasses: FrequencyClass[];
  notificationsEnabled: boolean;
  notificationTime: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  wordCount: 3,
  wordTypes: {
    substantiv: true,
    verb: true,
    adjektiv: true,
    mehrwortausdruck: true,
    adverb: true,
  },
  frequencyClasses: DEFAULT_FREQUENCY_CLASSES,
  notificationsEnabled: false,
  notificationTime: '09:00',
};

// Migration map for old frequencyRanges to new frequencyClasses
const LEGACY_FREQUENCY_MAP: Record<string, FrequencyClass[]> = {
  selten: ['0', '1'],
  mittel: ['2', '3'],
  haeufig: ['4', '5', '6'],
};

function migrateFrequencyRanges(ranges: string[]): FrequencyClass[] {
  const classes = new Set<FrequencyClass>();
  for (const range of ranges) {
    const mapped = LEGACY_FREQUENCY_MAP[range];
    if (mapped) {
      for (const cls of mapped) {
        classes.add(cls);
      }
    }
  }
  return classes.size > 0 ? Array.from(classes) : DEFAULT_FREQUENCY_CLASSES;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migration: frequencyClasses (new) or frequencyRanges (old) or frequencyRange (oldest)
      let frequencyClasses = parsed.frequencyClasses;
      if (!frequencyClasses) {
        if (parsed.frequencyRanges) {
          frequencyClasses = migrateFrequencyRanges(parsed.frequencyRanges);
        } else if (parsed.frequencyRange) {
          frequencyClasses = migrateFrequencyRanges([parsed.frequencyRange]);
        }
      }

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        wordTypes: { ...DEFAULT_SETTINGS.wordTypes, ...parsed.wordTypes },
        frequencyClasses: frequencyClasses ?? DEFAULT_SETTINGS.frequencyClasses,
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

// Simple passthrough - frequencyClasses are now stored directly
export function getFrequencyClasses(classes: FrequencyClass[]): string[] {
  return classes;
}

export function getSelectedWordTypes(wordTypes: AppSettings['wordTypes']): string[] {
  const types: string[] = [];
  if (wordTypes.substantiv) types.push('Substantiv');
  if (wordTypes.verb) types.push('Verb');
  if (wordTypes.adjektiv) types.push('Adjektiv');
  if (wordTypes.mehrwortausdruck) types.push('Mehrwortausdruck');
  if (wordTypes.adverb) types.push('Adverb');
  return types;
}
