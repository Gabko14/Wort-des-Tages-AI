import * as database from '../database';
import * as settingsService from '../settingsService';
import {
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
  },
  frequencyRange: 'mittel',
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
    it('should return empty array when no entry for today exists', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await getTodaysWords();

      expect(result).toEqual([]);
    });

    it('should return words for today', async () => {
      const todaysEntry = {
        fk_wort1: 1,
        fk_wort2: 2,
        fk_wort3: 0,
        fk_wort4: 0,
        fk_wort5: 0,
      };
      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM wort WHERE id IN (?,?)',
        [1, 2]
      );
    });

    it('should return empty array when all word IDs are 0', async () => {
      const todaysEntry = {
        fk_wort1: 0,
        fk_wort2: 0,
        fk_wort3: 0,
        fk_wort4: 0,
        fk_wort5: 0,
      };
      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);

      const result = await getTodaysWords();

      expect(result).toEqual([]);
    });

    it('should handle mixed valid and zero word IDs', async () => {
      const todaysEntry = {
        fk_wort1: 1,
        fk_wort2: 0,
        fk_wort3: 2,
        fk_wort4: 0,
        fk_wort5: 0,
      };
      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM wort WHERE id IN (?,?)',
        [1, 2]
      );
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
    it('should save words to database with padding zeros', async () => {
      await saveTodaysWords([mockWort, mockWort2]);

      expect(mockDb.runAsync).toHaveBeenCalled();
      const callArgs = mockDb.runAsync.mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO wort_des_tages');
      expect(callArgs[1].length).toBe(6);
      expect(callArgs[1][2]).toBe(0);
      expect(callArgs[1][3]).toBe(0);
      expect(callArgs[1][4]).toBe(0);
    });

    it('should handle more than 5 words by truncating', async () => {
      const manyWords = [mockWort, mockWort2, mockWort, mockWort2, mockWort, mockWort2];

      await saveTodaysWords(manyWords);

      const callArgs = mockDb.runAsync.mock.calls[0];
      expect(callArgs[1].length).toBe(6);
      expect(callArgs[1].slice(0, 5)).toEqual([1, 2, 1, 2, 1]);
    });
  });

  describe('clearTodaysWords', () => {
    it('should delete todays entry from the database', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-10T12:00:00Z'));

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { clearTodaysWords } = require('../wordService');
      await clearTodaysWords();

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM wort_des_tages WHERE date = ?', [
        '2024-05-10',
      ]);

      jest.useRealTimers();
    });

    it('should wrap deletion errors in an AppError', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-11T12:00:00Z'));
      mockDb.runAsync.mockRejectedValueOnce(new Error('db failure'));

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { clearTodaysWords } = require('../wordService');

      await expect(clearTodaysWords()).rejects.toMatchObject({ code: 'db_clear_failed' });

      jest.useRealTimers();
    });
  });

  describe('getOrGenerateTodaysWords', () => {
    it('should return existing words if available', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({
        fk_wort1: 1,
        fk_wort2: 2,
        fk_wort3: 0,
        fk_wort4: 0,
        fk_wort5: 0,
      });
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });

    it('should generate new words based on settings if none exist', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(settingsService.loadSettings).toHaveBeenCalled();
      expect(settingsService.getSelectedWordTypes).toHaveBeenCalled();
      expect(settingsService.getFrequencyClasses).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalled();
    });

    it('should use settings for word count when generating', async () => {
      const customSettings = { ...mockSettings, wordCount: 5 };
      (settingsService.loadSettings as jest.Mock).mockResolvedValue(customSettings);

      mockDb.getFirstAsync.mockResolvedValueOnce(null);
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
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([]);
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });
});
