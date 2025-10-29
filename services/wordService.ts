import { getDatabase, UserSettings, Wort } from './database';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<UserSettings>(
    'SELECT * FROM user_settings WHERE id = 1'
  );

  if (!result) {
    return { id: 1, anzahl_woerter: 3 };
  }

  return result;
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

export async function selectRandomWords(count: number): Promise<Wort[]> {
  const db = await getDatabase();

  const words = await db.getAllAsync<Wort>(
    `SELECT * FROM wort 
     WHERE wortklasse NOT IN ('Affix', 'Konjunktion') 
     AND frequenzklasse != 'n/a'
     ORDER BY RANDOM() 
     LIMIT ?`,
    [count]
  );

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

export async function getOrGenerateTodaysWords(): Promise<Wort[]> {
  let words = await getTodaysWords();

  if (words.length > 0) {
    return words;
  }

  const settings = await getUserSettings();
  const count = settings.anzahl_woerter || 3;

  words = await selectRandomWords(count);

  if (words.length > 0) {
    await saveTodaysWords(words);
  }

  return words;
}
