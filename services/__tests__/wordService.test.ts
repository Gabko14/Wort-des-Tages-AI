import * as database from '../database';
import {
  getOrGenerateTodaysWords,
  getTodaysWords,
  getUserSettings,
  saveTodaysWords,
  selectRandomWords,
} from '../wordService';

jest.mock('../database');

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

describe('wordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (database.getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getUserSettings', () => {
    it('should return user settings from database', async () => {
      const mockSettings = { id: 1, anzahl_woerter: 5 };
      mockDb.getFirstAsync.mockResolvedValueOnce(mockSettings);

      const result = await getUserSettings();

      expect(result).toEqual(mockSettings);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM user_settings WHERE id = 1'
      );
    });

    it('should return default settings when no settings exist', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await getUserSettings();

      expect(result).toEqual({ id: 1, anzahl_woerter: 3 });
    });
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

      const result = await selectRandomWords(2);

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY RANDOM()'),
        [2]
      );
    });

    it('should filter out Affix and Konjunktion word classes', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      await selectRandomWords(5);

      const callArgs = mockDb.getAllAsync.mock.calls[0];
      expect(callArgs[0]).toContain(
        "wortklasse NOT IN ('Affix', 'Konjunktion')"
      );
      expect(callArgs[0]).toContain("frequenzklasse != 'n/a'");
    });

    it('should return empty array when no words available', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await selectRandomWords(3);

      expect(result).toEqual([]);
    });
  });

  describe('saveTodaysWords', () => {
    it('should save words to database with padding zeros', async () => {
      await saveTodaysWords([mockWort, mockWort2]);

      expect(mockDb.runAsync).toHaveBeenCalled();
      const callArgs = mockDb.runAsync.mock.calls[0];
      expect(callArgs[0]).toContain('INSERT INTO wort_des_tages');
      expect(callArgs[1].length).toBe(6); // 5 word IDs + 1 date
      expect(callArgs[1][2]).toBe(0); // Third word ID should be 0 (padding)
      expect(callArgs[1][3]).toBe(0); // Fourth word ID should be 0 (padding)
      expect(callArgs[1][4]).toBe(0); // Fifth word ID should be 0 (padding)
    });

    it('should handle more than 5 words by truncating', async () => {
      const manyWords = [
        mockWort,
        mockWort2,
        mockWort,
        mockWort2,
        mockWort,
        mockWort2,
      ];

      await saveTodaysWords(manyWords);

      const callArgs = mockDb.runAsync.mock.calls[0];
      expect(callArgs[1].length).toBe(6); // Should be exactly 6 (5 IDs + 1 date)
      expect(callArgs[1].slice(0, 5)).toEqual([1, 2, 1, 2, 1]); // First 5 word IDs
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
      expect(mockDb.runAsync).not.toHaveBeenCalled(); // Should not save new words
    });

    it('should generate new words if none exist', async () => {
      const mockSettings = { id: 1, anzahl_woerter: 2 };

      // First call returns no words for today
      mockDb.getFirstAsync.mockResolvedValueOnce(null);
      // Second call for user settings
      mockDb.getFirstAsync.mockResolvedValueOnce(mockSettings);
      // Call for random words
      mockDb.getAllAsync.mockResolvedValueOnce([mockWort, mockWort2]);

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([mockWort, mockWort2]);
      expect(mockDb.runAsync).toHaveBeenCalled(); // Should save new words
    });

    it('should use user settings for word count when generating', async () => {
      const mockSettings = { id: 1, anzahl_woerter: 5 };

      mockDb.getFirstAsync.mockResolvedValueOnce(null); // No words today
      mockDb.getFirstAsync.mockResolvedValueOnce(mockSettings); // User settings
      mockDb.getAllAsync.mockResolvedValueOnce([
        mockWort,
        mockWort2,
        mockWort,
        mockWort2,
        mockWort,
      ]);

      await getOrGenerateTodaysWords();

      const randomWordsCall = mockDb.getAllAsync.mock.calls[0];
      expect(randomWordsCall[1]).toEqual([5]); // Should request 5 words
    });

    it('should return empty array if no words can be generated', async () => {
      const mockSettings = { id: 1, anzahl_woerter: 3 };

      mockDb.getFirstAsync.mockResolvedValueOnce(null); // No words today
      mockDb.getFirstAsync.mockResolvedValueOnce(mockSettings); // User settings
      mockDb.getAllAsync.mockResolvedValueOnce([]); // No random words available

      const result = await getOrGenerateTodaysWords();

      expect(result).toEqual([]);
      expect(mockDb.runAsync).not.toHaveBeenCalled(); // Should not save empty words
    });
  });
});
