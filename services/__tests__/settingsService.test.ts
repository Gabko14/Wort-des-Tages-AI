import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_SETTINGS,
  getFrequencyClasses,
  getSelectedWordTypes,
  loadSettings,
  saveSettings,
} from '../settingsService';

describe('settingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadSettings', () => {
    it('should return default settings when none are stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const settings = await loadSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should merge stored settings with defaults', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ wordCount: 5, wordTypes: { verb: false } })
      );

      const settings = await loadSettings();

      expect(settings.wordCount).toBe(5);
      expect(settings.wordTypes.substantiv).toBe(true);
      expect(settings.wordTypes.verb).toBe(false);
      expect(settings.frequencyClasses).toEqual(DEFAULT_SETTINGS.frequencyClasses);
    });

    it('should fall back to defaults when parsing fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('not-json');

      const settings = await loadSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should migrate old frequencyRange (singular) to frequencyClasses', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ frequencyRange: 'selten' })
      );

      const settings = await loadSettings();

      expect(settings.frequencyClasses).toEqual(['0', '1']);
    });

    it('should migrate old frequencyRanges (array) to frequencyClasses', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ frequencyRanges: ['mittel', 'haeufig'] })
      );

      const settings = await loadSettings();

      expect(settings.frequencyClasses).toEqual(['2', '3', '4', '5', '6']);
    });

    it('should preserve new frequencyClasses format', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ frequencyClasses: ['2', '4'] })
      );

      const settings = await loadSettings();

      expect(settings.frequencyClasses).toEqual(['2', '4']);
    });
  });

  describe('saveSettings', () => {
    it('should persist settings to AsyncStorage', async () => {
      await saveSettings(DEFAULT_SETTINGS);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_settings',
        JSON.stringify(DEFAULT_SETTINGS)
      );
    });

    it('should throw an AppError when persistence fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('fail'));

      await expect(saveSettings(DEFAULT_SETTINGS)).rejects.toMatchObject({
        code: 'settings_save_failed',
      });
    });
  });

  describe('getFrequencyClasses', () => {
    it('should pass through frequency classes directly', () => {
      expect(getFrequencyClasses(['2', '3', '4'])).toEqual(['2', '3', '4']);
      expect(getFrequencyClasses(['0', '1'])).toEqual(['0', '1']);
      expect(getFrequencyClasses(['5', '6'])).toEqual(['5', '6']);
    });

    it('should return empty array for empty input', () => {
      expect(getFrequencyClasses([])).toEqual([]);
    });
  });

  describe('getSelectedWordTypes', () => {
    it('should return only enabled word types', () => {
      const wordTypes = getSelectedWordTypes({
        substantiv: true,
        verb: false,
        adjektiv: true,
        mehrwortausdruck: false,
        adverb: true,
      });

      expect(wordTypes).toEqual(['Substantiv', 'Adjektiv', 'Adverb']);
    });
  });
});
