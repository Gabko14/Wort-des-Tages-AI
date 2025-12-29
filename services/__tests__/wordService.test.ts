import AsyncStorage from '@react-native-async-storage/async-storage';

import * as database from '../database';
import * as settingsService from '../settingsService';
import {
  clearTodaysWords,
  getOrGenerateTodaysWords,
  getTodaysWords,
  saveTodaysWords,
  selectRandomWords,
} from '../wordService';

jest.mock('../database');
jest.mock('../settingsService');

const mockDb = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
};

const mockWort = {
  id: 1,
  lemma: 'Beispiel',
  url: 'https://example.com',
  wortklasse: 'Substantiv',
  artikeldatum: '2024-01-01',
  artikeltyp: 'Artikel',
  frequenzklasse: '3',
};

const mockWort2 = {
  id: 2,
  lemma: 'Test',
  url: 'https://test.com',
  wortklasse: 'Adjektiv',
  artikeldatum: '2024-01-02',
  artikeltyp: 'Artikel',
  frequenzklasse: '2',
};

const mockSettings: settingsService.AppSettings = {
  wordCount: 3,
  wordTypes: {
    substantiv: true,
    verb: true,
    adjektiv: true,
    mehrwortausdruck: true,
    adverb: true,
  },
  frequencyRanges: ['mittel'],
  notificationsEnabled: false,
  notificationTime: '09:00',
};

describe('wordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (database.getDatabase as jest.Mock).mockResolvedValue(mockDb);
    (settingsService.loadSettings as jest.Mock).mockResolvedValue(mockSettings);
    (settingsService.getSelectedWordTypes as jest.Mock).mockReturnValue([
      'Substantiv',
      'Verb',
      'Adjektiv',
    ]);
    (settingsService.getFrequencyClasses as jest.Mock).mockReturnValue(['2', '3']);
  });

  describe('getTodaysWords', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-10T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return empty array when no cache exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getTodaysWords();

      expect(result).toEqual([]);
    });

    it('should return empty array when cache is for a different date', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ date: '2024-05-09', wordIds: [1, 2] })
      );

      const result = await getTodaysWords();

      expect(result).toEqual([]);
    });

    it('should return empty array when cache has invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('not-json');

      const result = await getTodaysWords();

      expect(result).toEqual([]);
    });

    it('should return words for today', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ date: '2024-05-10', wordIds: [1, 2] })
      );
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM wort WHERE id IN (?,?)',
        [1, 2]
      );
    });

    it('should return empty array when wordIds is empty', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ date: '2024-05-10', wordIds: [] })
      );

      const result = await getTodaysWords();

      expect(result).toEqual([]);
    });

    it('should preserve word order from cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ date: '2024-05-10', wordIds: [2, 1] })
      );
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getTodaysWords();

      expect(result).toEqual([mockWort2, mockWort]);
    });
  });

  describe('selectRandomWords', () => {
    it('should select random words with proper filters', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await selectRandomWords({
        count: 2,
        wordTypes: ['Substantiv', 'Adjektiv'],
        frequencyClasses: ['2', '3'],
      });

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY RANDOM()'),
        ['Substantiv', 'Adjektiv', '2', '3', 2]
      );
    });

    it('should filter by word types and frequency classes', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      await selectRandomWords({
        count: 5,
        wordTypes: ['Verb'],
        frequencyClasses: ['4', '5'],
      });

      const callArgs = mockDb.getAllAsync.mock.calls[0];
      expect(callArgs[0]).toContain('wortklasse IN (?)');
      expect(callArgs[0]).toContain('frequenzklasse IN (?,?)');
      expect(callArgs[1]).toEqual(['Verb', '4', '5', 5]);
    });

    it('should return empty array when no word types provided', async () => {
      const result = await selectRandomWords({
        count: 3,
        wordTypes: [],
        frequencyClasses: ['2', '3'],
      });

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).not.toHaveBeenCalled();
    });

    it('should return empty array when no frequency classes provided', async () => {
      const result = await selectRandomWords({
        count: 3,
        wordTypes: ['Substantiv'],
        frequencyClasses: [],
      });

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).not.toHaveBeenCalled();
    });

    it('should return empty array when no words available', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await selectRandomWords({
        count: 3,
        wordTypes: ['Substantiv'],
        frequencyClasses: ['2', '3'],
      });

      expect(result).toEqual([]);
    });
  });

  describe('saveTodaysWords', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-10T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should save words to AsyncStorage', async () => {
      await saveTodaysWords([mockWort, mockWort2]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'daily_words',
        JSON.stringify({ date: '2024-05-10', wordIds: [1, 2] })
      );
    });

    it('should handle any number of words', async () => {
      const manyWords = [mockWort, mockWort2, mockWort, mockWort2, mockWort, mockWort2];

      await saveTodaysWords(manyWords);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'daily_words',
        JSON.stringify({ date: '2024-05-10', wordIds: [1, 2, 1, 2, 1, 2] })
      );
    });
  });

  describe('clearTodaysWords', () => {
    it('should remove daily words from AsyncStorage', async () => {
      await clearTodaysWords();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('daily_words');
    });

    it('should wrap errors in an AppError', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('storage failure'));

      await expect(clearTodaysWords()).rejects.toMatchObject({ code: 'storage_clear_failed' });
    });
  });

  describe('getOrGenerateTodaysWords', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-10T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return existing words if available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ date: '2024-05-10', wordIds: [1, 2] })
      );
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should generate new words based on settings if none exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(settingsService.loadSettings).toHaveBeenCalled();
      expect(settingsService.getSelectedWordTypes).toHaveBeenCalled();
      expect(settingsService.getFrequencyClasses).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should use settings for word count when generating', async () => {
      const customSettings = { ...mockSettings, wordCount: 5 };
      (settingsService.loadSettings as jest.Mock).mockResolvedValue(customSettings);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      mockDb.getAllAsync.mockResolvedValueOnce([
        mockWort,
        mockWort2,
        mockWort,
        mockWort2,
        mockWort,
      ]);

      await getOrGenerateTodaysWords();

      const randomWordsCall = mockDb.getAllAsync.mock.calls[0];
      expect(randomWordsCall[1]).toContain(5);
    });

    it('should return empty array if no words can be generated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([]);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
