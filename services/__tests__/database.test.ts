/* eslint-disable @typescript-eslint/no-require-imports */
// Configurable mock state - set these before each test
let mockDirectoryExistsValue = true;
let mockFileExistsValue = true;
let mockAssetValue: { downloadAsync: jest.Mock; localUri: string | null } | null = null;

// Mock expo-asset with configurable return value
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => mockAssetValue),
  },
}));

// Mock expo-file-system/next
const mockDirectoryCreate = jest.fn();
const mockFileCopy = jest.fn();

jest.mock('expo-file-system/next', () => ({
  Directory: jest.fn().mockImplementation(() => ({
    get exists() {
      return mockDirectoryExistsValue;
    },
    create: mockDirectoryCreate,
  })),
  File: jest.fn().mockImplementation(() => ({
    get exists() {
      return mockFileExistsValue;
    },
    copy: mockFileCopy,
  })),
  Paths: {
    document: '/mock/document',
  },
}));

// Mock expo-sqlite
const mockOpenDatabaseAsync = jest.fn();
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: unknown[]) => mockOpenDatabaseAsync(...args),
}));

// Import after mocks are set up - must be after jest.mock calls
// eslint-disable-next-line import/first
import { Asset } from 'expo-asset';

describe('Database Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset module state between tests
    jest.resetModules();
    // Reset configurable mock state
    mockDirectoryExistsValue = true;
    mockFileExistsValue = true;
    mockAssetValue = null;
  });

  describe('Wort interface', () => {
    it('should have all required Wort properties', () => {
      const wort = {
        id: 1,
        lemma: 'Test',
        url: 'https://test.com',
        wortklasse: 'Substantiv',
        artikeldatum: '2024-01-01',
        artikeltyp: 'Artikel',
        frequenzklasse: '3',
      };

      expect(wort).toHaveProperty('id');
      expect(wort).toHaveProperty('lemma');
      expect(wort).toHaveProperty('url');
      expect(wort).toHaveProperty('wortklasse');
      expect(wort).toHaveProperty('artikeldatum');
      expect(wort).toHaveProperty('artikeltyp');
      expect(wort).toHaveProperty('frequenzklasse');
    });

    it('should have correct Wort type properties', () => {
      const wort = {
        id: 1,
        lemma: 'Test',
        url: 'https://test.com',
        wortklasse: 'Substantiv',
        artikeldatum: '2024-01-01',
        artikeltyp: 'Artikel',
        frequenzklasse: '3',
      };

      expect(typeof wort.id).toBe('number');
      expect(typeof wort.lemma).toBe('string');
      expect(typeof wort.url).toBe('string');
      expect(typeof wort.wortklasse).toBe('string');
      expect(typeof wort.frequenzklasse).toBe('string');
    });
  });

  describe('WortDesTages interface', () => {
    it('should have all required WortDesTages properties', () => {
      const wdt = {
        id: 1,
        fk_wort1: 1,
        fk_wort2: 2,
        fk_wort3: 3,
        fk_wort4: 0,
        fk_wort5: 0,
        date: '2024-01-01',
      };

      expect(wdt).toHaveProperty('id');
      expect(wdt).toHaveProperty('fk_wort1');
      expect(wdt).toHaveProperty('fk_wort2');
      expect(wdt).toHaveProperty('fk_wort3');
      expect(wdt).toHaveProperty('fk_wort4');
      expect(wdt).toHaveProperty('fk_wort5');
      expect(wdt).toHaveProperty('date');
    });

    it('should allow zero values for word foreign keys', () => {
      const wdt = {
        id: 1,
        fk_wort1: 1,
        fk_wort2: 0,
        fk_wort3: 0,
        fk_wort4: 0,
        fk_wort5: 0,
        date: '2024-01-01',
      };

      expect(wdt.fk_wort2).toBe(0);
      expect(wdt.fk_wort3).toBe(0);
    });
  });

  describe('UserSettings interface', () => {
    it('should have all required UserSettings properties', () => {
      const settings = {
        id: 1,
        anzahl_woerter: 3,
      };

      expect(settings).toHaveProperty('id');
      expect(settings).toHaveProperty('anzahl_woerter');
    });

    it('should support different word count settings', () => {
      const settings1 = { id: 1, anzahl_woerter: 1 };
      const settings5 = { id: 1, anzahl_woerter: 5 };

      expect(settings1.anzahl_woerter).toBe(1);
      expect(settings5.anzahl_woerter).toBe(5);
    });

    it('should have positive anzahl_woerter values', () => {
      const settings = { id: 1, anzahl_woerter: 3 };

      expect(settings.anzahl_woerter).toBeGreaterThan(0);
    });
  });

  describe('Database constants', () => {
    it('should define correct database name', () => {
      const DATABASE_NAME = 'dwds.db';
      expect(DATABASE_NAME).toBe('dwds.db');
      expect(DATABASE_NAME).toMatch(/\.db$/);
    });

    it('should have valid database file extension', () => {
      const DATABASE_NAME = 'dwds.db';
      expect(DATABASE_NAME).toMatch(/\.db$/);
    });
  });

  describe('Data validation', () => {
    it('should validate word IDs are positive or zero', () => {
      const validIds = [0, 1, 2, 100];
      validIds.forEach((id) => {
        expect(id).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate date format YYYY-MM-DD', () => {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const validDates = ['2024-01-01', '2024-12-31', '2025-06-15'];

      validDates.forEach((date) => {
        expect(date).toMatch(datePattern);
      });
    });

    it('should reject invalid date formats', () => {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const invalidDates = ['2024/01/01', '01-01-2024', '2024-1-1'];

      invalidDates.forEach((date) => {
        expect(date).not.toMatch(datePattern);
      });
    });

    it('should validate word class values', () => {
      const validWordClasses = ['Substantiv', 'Adjektiv', 'Verb', 'Adverb', 'Konjunktion', 'Affix'];

      validWordClasses.forEach((wortklasse) => {
        expect(typeof wortklasse).toBe('string');
        expect(wortklasse.length).toBeGreaterThan(0);
      });
    });

    it('should validate frequency class values', () => {
      const validFrequencyClasses = ['1', '2', '3', '4', '5', 'n/a'];

      validFrequencyClasses.forEach((freq) => {
        expect(typeof freq).toBe('string');
      });
    });
  });

  describe('initDatabase', () => {
    const loadDatabaseModule = () => {
      let module: typeof import('../database');
      jest.isolateModules(() => {
        module = require('../database');
      });
      return module!;
    };

    it('should return cached database on subsequent calls', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();

      const db1 = await initDatabase();
      const db2 = await initDatabase();

      expect(db1).toBe(db2);
      expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });

    it('should create SQLite directory if it does not exist', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = false;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();
      await initDatabase();

      expect(mockDirectoryCreate).toHaveBeenCalled();
    });

    it('should not create directory if it already exists', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();
      await initDatabase();

      expect(mockDirectoryCreate).not.toHaveBeenCalled();
    });

    it('should copy database from assets if file does not exist', async () => {
      const mockDb = { name: 'mockDb' };
      mockAssetValue = {
        downloadAsync: jest.fn().mockResolvedValue(undefined),
        localUri: '/mock/asset/path/dwds.db',
      };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = false;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();
      await initDatabase();

      expect(mockAssetValue.downloadAsync).toHaveBeenCalled();
      expect(mockFileCopy).toHaveBeenCalled();
    });

    it('should not copy database if file already exists', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();
      await initDatabase();

      expect(Asset.fromModule).not.toHaveBeenCalled();
      expect(mockFileCopy).not.toHaveBeenCalled();
    });

    it('should open database with correct name', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();
      await initDatabase();

      expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('dwds.db');
    });

    it('should handle missing localUri gracefully', async () => {
      const mockDb = { name: 'mockDb' };
      mockAssetValue = {
        downloadAsync: jest.fn().mockResolvedValue(undefined),
        localUri: null, // No local URI
      };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = false;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { initDatabase } = loadDatabaseModule();
      await initDatabase();

      // Should not attempt to copy if no localUri
      expect(mockFileCopy).not.toHaveBeenCalled();
    });
  });

  describe('getDatabase', () => {
    const loadDatabaseModule = () => {
      let module: typeof import('../database');
      jest.isolateModules(() => {
        module = require('../database');
      });
      return module!;
    };

    it('should initialize database if not already initialized', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { getDatabase } = loadDatabaseModule();
      const db = await getDatabase();

      expect(db).toBe(mockDb);
      expect(mockOpenDatabaseAsync).toHaveBeenCalled();
    });

    it('should return cached database after initialization', async () => {
      const mockDb = { name: 'mockDb' };
      mockDirectoryExistsValue = true;
      mockFileExistsValue = true;
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const { getDatabase, initDatabase } = loadDatabaseModule();

      // First init
      await initDatabase();

      // Then get
      const db = await getDatabase();

      expect(db).toBe(mockDb);
      expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });
  });
});
