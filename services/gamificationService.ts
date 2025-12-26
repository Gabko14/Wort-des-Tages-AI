/**
 * Gamification service for tracking streaks, quiz completions, and stats.
 *
 * This service is designed to be the central hub for all gamification features.
 * It's extensible for future additions like badges, achievements, and leaderboards.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  DailyStatus,
  GamificationStats,
  QuizCompletion,
  StreakData,
} from '@/types/gamification';
import { getNextMilestone, isStreakMilestone } from '@/types/gamification';
import { AppError } from '@/utils/appError';

// Storage keys
const STREAK_KEY = 'gamification_streak';
const COMPLETIONS_KEY = 'gamification_completions';
const STATS_KEY = 'gamification_stats';

// In-memory cache for performance
let cachedStreak: StreakData | null = null;
let cachedCompletions: QuizCompletion[] | null = null;

/**
 * Get today's date as YYYY-MM-DD string in local timezone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date as YYYY-MM-DD string in local timezone.
 */
function getYesterdayDateString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Default streak data for new users.
 */
const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
};

/**
 * Load streak data from storage.
 */
export async function loadStreakData(): Promise<StreakData> {
  if (cachedStreak) {
    return cachedStreak;
  }

  try {
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StreakData;
      cachedStreak = parsed;
      return parsed;
    }
    return DEFAULT_STREAK;
  } catch {
    return DEFAULT_STREAK;
  }
}

/**
 * Save streak data to storage.
 */
async function saveStreakData(streak: StreakData): Promise<void> {
  try {
    cachedStreak = streak;
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch (err) {
    throw new AppError('settings_save_failed', 'Streak konnte nicht gespeichert werden.', err);
  }
}

/**
 * Load quiz completions from storage.
 * Only keeps last 30 days of completions for storage efficiency.
 */
export async function loadCompletions(): Promise<QuizCompletion[]> {
  if (cachedCompletions) {
    return cachedCompletions;
  }

  try {
    const stored = await AsyncStorage.getItem(COMPLETIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as QuizCompletion[];
      cachedCompletions = parsed;
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save quiz completions to storage.
 * Prunes entries older than 30 days.
 */
async function saveCompletions(completions: QuizCompletion[]): Promise<void> {
  // Prune old completions (keep last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const pruned = completions.filter((c) => c.timestamp > thirtyDaysAgo);

  try {
    cachedCompletions = pruned;
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(pruned));
  } catch (err) {
    throw new AppError(
      'settings_save_failed',
      'Quiz-Fortschritt konnte nicht gespeichert werden.',
      err
    );
  }
}

/**
 * Result of recording a quiz completion.
 */
export interface QuizCompletionResult {
  /** Whether this was the first completion of the day */
  isFirstCompletionToday: boolean;
  /** Updated streak data */
  streak: StreakData;
  /** Whether a milestone was just reached */
  milestoneReached: number | null;
  /** Whether the streak was just lost and reset */
  streakWasLost: boolean;
}

/**
 * Record a quiz completion and update streak.
 *
 * Only the first quiz completion per day counts towards the streak.
 * Subsequent completions on the same day are tracked but don't increase the streak.
 *
 * @param wordId - The ID of the word the quiz was for
 * @param wasCorrect - Whether the user answered correctly
 * @returns Result containing streak info and whether a milestone was reached
 */
export async function recordQuizCompletion(
  wordId: number,
  wasCorrect: boolean
): Promise<QuizCompletionResult> {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const timestamp = Date.now();

  // Load current data
  const [streak, completions] = await Promise.all([loadStreakData(), loadCompletions()]);

  // Check if already completed today
  const alreadyCompletedToday = completions.some((c) => c.date === today);

  // Record the completion
  const newCompletion: QuizCompletion = {
    wordId,
    date: today,
    wasCorrect,
    timestamp,
  };
  completions.push(newCompletion);

  let newStreak = { ...streak };
  let milestoneReached: number | null = null;
  let streakWasLost = false;

  // Only update streak if this is the first completion today
  if (!alreadyCompletedToday) {
    if (streak.lastCompletionDate === yesterday) {
      // Continuing the streak
      newStreak.currentStreak = streak.currentStreak + 1;
    } else if (streak.lastCompletionDate === today) {
      // Already completed today (shouldn't happen due to check above, but safety)
      // No change
    } else {
      // Streak was broken (or first ever completion)
      if (streak.currentStreak > 0) {
        streakWasLost = true;
      }
      newStreak.currentStreak = 1;
    }

    // Update longest streak if needed
    if (newStreak.currentStreak > newStreak.longestStreak) {
      newStreak.longestStreak = newStreak.currentStreak;
    }

    // Update last completion date
    newStreak.lastCompletionDate = today;

    // Check for milestone
    if (isStreakMilestone(newStreak.currentStreak)) {
      milestoneReached = newStreak.currentStreak;
    }
  }

  // Save both
  await Promise.all([saveStreakData(newStreak), saveCompletions(completions)]);

  return {
    isFirstCompletionToday: !alreadyCompletedToday,
    streak: newStreak,
    milestoneReached,
    streakWasLost,
  };
}

/**
 * Check if the streak is at risk (user hasn't completed today and streak > 0).
 */
export async function isStreakAtRisk(): Promise<boolean> {
  const streak = await loadStreakData();
  const today = getTodayDateString();

  return streak.currentStreak > 0 && streak.lastCompletionDate !== today;
}

/**
 * Get the current streak, checking if it's still valid.
 * If the user missed yesterday and today, the streak is reset.
 */
export async function getCurrentStreak(): Promise<StreakData> {
  const streak = await loadStreakData();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Check if streak is still valid
  if (
    streak.lastCompletionDate !== today &&
    streak.lastCompletionDate !== yesterday &&
    streak.currentStreak > 0
  ) {
    // Streak was lost - reset current streak but keep longest
    const resetStreak: StreakData = {
      ...streak,
      currentStreak: 0,
    };
    await saveStreakData(resetStreak);
    return resetStreak;
  }

  return streak;
}

/**
 * Check if user has completed a quiz today.
 */
export async function hasCompletedToday(): Promise<boolean> {
  const completions = await loadCompletions();
  const today = getTodayDateString();
  return completions.some((c) => c.date === today);
}

/**
 * Get today's completion status.
 */
export async function getTodayStatus(): Promise<DailyStatus> {
  const completions = await loadCompletions();
  const today = getTodayDateString();
  const todayCompletions = completions.filter((c) => c.date === today);

  return {
    date: today,
    completed: todayCompletions.length > 0,
    quizCount: todayCompletions.length,
    correctCount: todayCompletions.filter((c) => c.wasCorrect).length,
  };
}

/**
 * Get full gamification stats.
 */
export async function getGamificationStats(): Promise<GamificationStats> {
  const [streak, completions, todayStatus] = await Promise.all([
    getCurrentStreak(),
    loadCompletions(),
    getTodayStatus(),
  ]);

  return {
    streak,
    totalQuizzesCompleted: completions.length,
    totalCorrectAnswers: completions.filter((c) => c.wasCorrect).length,
    todayStatus,
  };
}

/**
 * Get a motivational message based on streak status.
 * Used for notifications and UI.
 */
export function getStreakMessage(streak: StreakData, isAtRisk: boolean): string {
  const { currentStreak, longestStreak } = streak;

  if (currentStreak === 0) {
    if (longestStreak > 0) {
      return `Starte eine neue Serie! Dein Rekord: ${longestStreak} Tage.`;
    }
    return 'Starte heute deine erste Lernserie!';
  }

  if (isAtRisk) {
    if (currentStreak >= 30) {
      return `Nicht aufgeben! Deine ${currentStreak}-Tage-Serie wartet auf dich.`;
    }
    if (currentStreak >= 7) {
      return `Halte deine ${currentStreak}-Tage-Serie am Leben!`;
    }
    return `Mach weiter! ${currentStreak} Tage in Folge.`;
  }

  const nextMilestone = getNextMilestone(currentStreak);
  if (nextMilestone) {
    const remaining = nextMilestone - currentStreak;
    if (remaining <= 3) {
      return `Noch ${remaining} Tag${remaining > 1 ? 'e' : ''} bis zum ${nextMilestone}-Tage-Meilenstein!`;
    }
  }

  if (currentStreak === longestStreak && currentStreak > 1) {
    return `Neuer Rekord! ${currentStreak} Tage in Folge!`;
  }

  return `${currentStreak} Tage in Folge - weiter so!`;
}

/**
 * Get notification content based on current streak status.
 */
export async function getNotificationContent(): Promise<{ title: string; body: string }> {
  const streak = await getCurrentStreak();
  const atRisk = await isStreakAtRisk();
  const { currentStreak } = streak;

  // Different notification variants based on streak status
  if (atRisk && currentStreak >= 7) {
    return {
      title: `${currentStreak}-Tage-Serie in Gefahr!`,
      body: `Verliere nicht deine ${currentStreak} Tage Fortschritt. Nur ein Quiz heute!`,
    };
  }

  if (atRisk && currentStreak > 0) {
    return {
      title: 'Deine Serie wartet!',
      body: `${currentStreak} Tage in Folge - mach heute weiter!`,
    };
  }

  if (currentStreak === 0 && streak.longestStreak > 0) {
    return {
      title: 'Zeit für einen Neustart!',
      body: `Dein Rekord: ${streak.longestStreak} Tage. Starte heute neu!`,
    };
  }

  // Default message for new users or after completion
  return {
    title: 'Wort des Tages',
    body: 'Zeit für deine täglichen Wörter! Lerne heute neue Vokabeln.',
  };
}

/**
 * Clear all gamification data (for testing/reset).
 */
export async function clearGamificationData(): Promise<void> {
  cachedStreak = null;
  cachedCompletions = null;
  await Promise.all([
    AsyncStorage.removeItem(STREAK_KEY),
    AsyncStorage.removeItem(COMPLETIONS_KEY),
    AsyncStorage.removeItem(STATS_KEY),
  ]);
}
