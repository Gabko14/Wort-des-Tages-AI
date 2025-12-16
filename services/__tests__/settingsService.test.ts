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
      expect(settings.frequencyRange).toBe(DEFAULT_SETTINGS.frequencyRange);
    });

    it('should fall back to defaults when parsing fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('not-json');

      const settings = await loadSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
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
    it('should map ranges to class lists', () => {
      expect(getFrequencyClasses('selten')).toEqual(['0', '1']);
      expect(getFrequencyClasses('mittel')).toEqual(['2', '3']);
      expect(getFrequencyClasses('haeufig')).toEqual(['4', '5', '6']);
    });
  });

  describe('getSelectedWordTypes', () => {
    it('should return only enabled word types', () => {
      const wordTypes = getSelectedWordTypes({
        substantiv: true,
        verb: false,
        adjektiv: true,
      });

      expect(wordTypes).toEqual(['Substantiv', 'Adjektiv']);
    });
  });
});
