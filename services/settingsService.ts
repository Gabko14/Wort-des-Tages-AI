import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'user_settings';

export type FrequencyRange = 'selten' | 'mittel' | 'haeufig';

export interface AppSettings {
  wordCount: number;
  wordTypes: {
    substantiv: boolean;
    verb: boolean;
    adjektiv: boolean;
  };
  frequencyRange: FrequencyRange;
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
  frequencyRange: 'mittel',
  notificationsEnabled: false,
  notificationTime: '09:00',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getFrequencyClasses(range: FrequencyRange): string[] {
  switch (range) {
    case 'selten':
      return ['0', '1'];
    case 'mittel':
      return ['2', '3'];
    case 'haeufig':
      return ['4', '5', '6'];
  }
}

export function getSelectedWordTypes(
  wordTypes: AppSettings['wordTypes']
): string[] {
  const types: string[] = [];
  if (wordTypes.substantiv) types.push('Substantiv');
  if (wordTypes.verb) types.push('Verb');
  if (wordTypes.adjektiv) types.push('Adjektiv');
  return types;
}
