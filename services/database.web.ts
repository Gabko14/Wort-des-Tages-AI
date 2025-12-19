import * as SQLite from 'expo-sqlite';
// @ts-ignore
import { importDatabaseFromAssetAsync } from 'expo-sqlite';

import { Wort, WortDesTages, UserSettings } from '@/types/db';

export { Wort, WortDesTages, UserSettings };

const DATABASE_NAME = 'dwds.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    await importDatabaseFromAssetAsync(DATABASE_NAME, {
      assetId: require('../assets/database/dwds.db'),
      forceOverwrite: false,
    });
    console.log('Database imported from asset.');
  } catch (e) {
    console.warn('Failed to import database from asset on web:', e);
  }

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Ensure tables exist (fallback if import failed or first run)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wort (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      lemma TEXT,
      url TEXT,
      wortklasse TEXT,
      artikeldatum TEXT,
      artikeltyp TEXT,
      frequenzklasse TEXT
    );
    CREATE TABLE IF NOT EXISTS "wort_des_tages" (
      "id"	INTEGER NOT NULL UNIQUE,
      "fk_wort1"	INTEGER NOT NULL,
      "fk_wort2"	INTEGER NOT NULL,
      "fk_wort3"	INTEGER NOT NULL,
      "fk_wort4"	INTEGER NOT NULL,
      "fk_wort5"	INTEGER NOT NULL,
      "date"	TEXT NOT NULL UNIQUE,
      PRIMARY KEY("id" AUTOINCREMENT)
    );
    CREATE TABLE IF NOT EXISTS user_settings (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, anzahl_woerter INT);
  `);

  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return initDatabase();
  }
  return db;
}
