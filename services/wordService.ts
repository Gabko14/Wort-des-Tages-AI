import { getDatabase, Wort } from './database';
import {
  AppSettings,
  getFrequencyClasses,
  getSelectedWordTypes,
  loadSettings,
} from './settingsService';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function getTodaysWords(): Promise<Wort[]> {
  const db = await getDatabase();
  const today = getTodayDateString();

  const todaysEntry = await db.getFirstAsync<{
    fk_wort1: number;
    fk_wort2: number;
    fk_wort3: number;
    fk_wort4: number;
    fk_wort5: number;
  }>('SELECT * FROM wort_des_tages WHERE date = ?', [today]);

  if (!todaysEntry) {
    return [];
  }

  const wordIds = [
    todaysEntry.fk_wort1,
    todaysEntry.fk_wort2,
    todaysEntry.fk_wort3,
    todaysEntry.fk_wort4,
    todaysEntry.fk_wort5,
  ].filter((id) => id > 0);

  if (wordIds.length === 0) {
    return [];
  }

  const placeholders = wordIds.map(() => '?').join(',');
  const words = await db.getAllAsync<Wort>(
    `SELECT * FROM wort WHERE id IN (${placeholders})`,
    wordIds
  );

  return words;
}

export interface WordSelectionOptions {
  count: number;
  wordTypes: string[];
  frequencyClasses: string[];
}

export async function selectRandomWords(
  options: WordSelectionOptions
): Promise<Wort[]> {
  const db = await getDatabase();
  const { count, wordTypes, frequencyClasses } = options;

  if (wordTypes.length === 0 || frequencyClasses.length === 0) {
    return [];
  }

  const wordTypePlaceholders = wordTypes.map(() => '?').join(',');
  const frequencyPlaceholders = frequencyClasses.map(() => '?').join(',');

  const query = `
    SELECT * FROM wort 
    WHERE wortklasse IN (${wordTypePlaceholders})
    AND frequenzklasse IN (${frequencyPlaceholders})
    ORDER BY RANDOM() 
    LIMIT ?
  `;

  const params = [...wordTypes, ...frequencyClasses, count];

  const words = await db.getAllAsync<Wort>(query, params);
  return words;
}

export async function saveTodaysWords(words: Wort[]): Promise<void> {
  const db = await getDatabase();
  const today = getTodayDateString();

  const wordIds = words.map((w) => w.id);
  while (wordIds.length < 5) {
    wordIds.push(0);
  }

  await db.runAsync(
    `INSERT INTO wort_des_tages (fk_wort1, fk_wort2, fk_wort3, fk_wort4, fk_wort5, date) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [...wordIds.slice(0, 5), today]
  );
}

function buildSelectionOptions(settings: AppSettings): WordSelectionOptions {
  return {
    count: settings.wordCount,
    wordTypes: getSelectedWordTypes(settings.wordTypes),
    frequencyClasses: getFrequencyClasses(settings.frequencyRange),
  };
}

export async function deleteTodaysWords(): Promise<void> {
  const db = await getDatabase();
  const today = getTodayDateString();
  await db.runAsync('DELETE FROM wort_des_tages WHERE date = ?', [today]);
}

export async function regenerateWords(): Promise<Wort[]> {
  await deleteTodaysWords();

  const settings = await loadSettings();
  const options = buildSelectionOptions(settings);

  const words = await selectRandomWords(options);

  if (words.length > 0) {
    await saveTodaysWords(words);
  }

  return words;
}

export async function getOrGenerateTodaysWords(): Promise<Wort[]> {
  let words = await getTodaysWords();

  if (words.length > 0) {
    return words;
  }

  const settings = await loadSettings();
  const options = buildSelectionOptions(settings);

  words = await selectRandomWords(options);

  if (words.length > 0) {
    await saveTodaysWords(words);
  }

  return words;
}
