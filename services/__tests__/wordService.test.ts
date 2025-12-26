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

    it('should preserve word order from database foreign keys (fk_wort1, fk_wort2, etc.)', async () => {
      // Test the bug fix: SQL IN clause doesn't guarantee order, so we need to preserve it manually
      const mockWort3 = {
        id: 3,
        lemma: 'Ordnung',
        url: 'https://example.com/3',
        wortklasse: 'Substantiv',
        artikeldatum: '2024-01-03',
        artikeltyp: 'Artikel',
        frequenzklasse: '4',
      };

      const todaysEntry = {
        fk_wort1: 2, // Test in reverse order
        fk_wort2: 3,
        fk_wort3: 1,
        fk_wort4: 0,
        fk_wort5: 0,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      // Database might return in any order due to IN clause
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort3, mockWort2]);

      const result = await getTodaysWords();

      // Must preserve the order: [2, 3, 1] not database order [1, 3, 2]
      expect(result).toEqual([mockWort2, mockWort3, mockWort]);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(3);
      expect(result[2].id).toBe(1);
    });

    it('should handle database returning words in different order than requested', async () => {
      const mockWort3 = { ...mockWort, id: 3, lemma: 'Drei' };
      const mockWort4 = { ...mockWort, id: 4, lemma: 'Vier' };
      const mockWort5 = { ...mockWort, id: 5, lemma: 'Fünf' };

      const todaysEntry = {
        fk_wort1: 5,
        fk_wort2: 1,
        fk_wort3: 3,
        fk_wort4: 4,
        fk_wort5: 2,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      // Database returns in ascending ID order (typical SQL behavior)
      mockDb.getAllAsync.mockResolvedValueOnce([
        mockWort,
        mockWort2,
        mockWort3,
        mockWort4,
        mockWort5,
      ]);

      const result = await getTodaysWords();

      // Verify order matches foreign key order, not database return order
      expect(result.map((w) => w.id)).toEqual([5, 1, 3, 4, 2]);
      expect(result.map((w) => w.lemma)).toEqual(['Fünf', 'Beispiel', 'Drei', 'Vier', 'Test']);
    });

    it('should filter out words not found in database (defensive programming)', async () => {
      const todaysEntry = {
        fk_wort1: 1,
        fk_wort2: 999, // This word doesn't exist in database
        fk_wort3: 2,
        fk_wort4: 0,
        fk_wort5: 0,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      // Database only returns words that exist
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getTodaysWords();

      // Should return only found words, in correct order
      expect(result).toEqual([mockWort, mockWort2]);
      expect(result.length).toBe(2);
    });

    it('should handle edge case where all foreign keys exist but database returns empty', async () => {
      const todaysEntry = {
        fk_wort1: 1,
        fk_wort2: 2,
        fk_wort3: 3,
        fk_wort4: 0,
        fk_wort5: 0,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await getTodaysWords();

      expect(result).toEqual([]);
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

  describe('Word ordering edge cases', () => {
    it('should handle single word correctly', async () => {
      const todaysEntry = {
        fk_wort1: 1,
        fk_wort2: 0,
        fk_wort3: 0,
        fk_wort4: 0,
        fk_wort5: 0,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort]);

      const result = await getTodaysWords();

      expect(result).toEqual([mockWort]);
      expect(result.length).toBe(1);
    });

    it('should handle five words in non-sequential order', async () => {
      const words = [
        { ...mockWort, id: 10, lemma: 'Zehn' },
        { ...mockWort, id: 20, lemma: 'Zwanzig' },
        { ...mockWort, id: 30, lemma: 'Dreißig' },
        { ...mockWort, id: 40, lemma: 'Vierzig' },
        { ...mockWort, id: 50, lemma: 'Fünfzig' },
      ];

      const todaysEntry = {
        fk_wort1: 50,
        fk_wort2: 10,
        fk_wort3: 30,
        fk_wort4: 20,
        fk_wort5: 40,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      mockDb.getAllAsync.mockResolvedValueOnce([...words].reverse());

      const result = await getTodaysWords();

      expect(result.map((w) => w.id)).toEqual([50, 10, 30, 20, 40]);
      expect(result.map((w) => w.lemma)).toEqual([
        'Fünfzig',
        'Zehn',
        'Dreißig',
        'Zwanzig',
        'Vierzig',
      ]);
    });

    it('should maintain order even with duplicate IDs in database result', async () => {
      // Edge case: database query returns duplicates (shouldn't happen but defensive)
      const todaysEntry = {
        fk_wort1: 1,
        fk_wort2: 2,
        fk_wort3: 0,
        fk_wort4: 0,
        fk_wort5: 0,
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(todaysEntry);
      // Database returns duplicate (Map will keep last one)
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2, mockWort]);

      const result = await getTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(result.length).toBe(2);
    });
  });
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
