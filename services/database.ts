import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'dwds.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  const sqliteDir = new Directory(Paths.document, 'SQLite');
  const dbFile = new File(sqliteDir, DATABASE_NAME);

  if (!sqliteDir.exists) {
    sqliteDir.create();
  }

  if (!dbFile.exists) {
    const asset = Asset.fromModule(require('../assets/database/dwds.db'));
    await asset.downloadAsync();

    if (asset.localUri) {
      const sourceFile = new File(asset.localUri);
      sourceFile.copy(dbFile);
    }
  }

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return initDatabase();
  }
  return db;
}

export interface Wort {
  id: number;
  lemma: string;
  url: string;
  wortklasse: string;
  artikeldatum: string;
  artikeltyp: string;
  frequenzklasse: string;
}

export interface WortDesTages {
  id: number;
  fk_wort1: number;
  fk_wort2: number;
  fk_wort3: number;
  fk_wort4: number;
  fk_wort5: number;
  date: string;
}

export interface UserSettings {
  id: number;
  anzahl_woerter: number;
}
