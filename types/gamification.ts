/**
 * Gamification types for the Wort des Tages app.
 *
 * This module is designed to be extensible for future gamification features
 * such as badges, achievements, leaderboards, and more.
 */

/**
 * Core streak data tracking daily quiz completions.
 */
export interface StreakData {
  /** Current consecutive days with completed quizzes */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** ISO date string (YYYY-MM-DD) of the last quiz completion */
  lastCompletionDate: string | null;
}

/**
 * Record of a single quiz completion.
 */
export interface QuizCompletion {
  /** ID of the word the quiz was for */
  wordId: number;
  /** ISO date string (YYYY-MM-DD) when the quiz was completed */
  date: string;
  /** Whether the user answered correctly */
  wasCorrect: boolean;
  /** Unix timestamp of completion */
  timestamp: number;
}

/**
 * Daily completion status - tracks whether the user has completed
 * their daily requirement (one quiz is enough).
 */
export interface DailyStatus {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Whether the daily requirement was met */
  completed: boolean;
  /** Number of quizzes completed this day */
  quizCount: number;
  /** Number of correct answers */
  correctCount: number;
}

/**
 * Aggregated gamification statistics.
 * Designed to be extended with more stats as features are added.
 */
export interface GamificationStats {
  /** Streak information */
  streak: StreakData;
  /** Total number of quizzes ever completed */
  totalQuizzesCompleted: number;
  /** Total number of correct answers */
  totalCorrectAnswers: number;
  /** Today's completion status */
  todayStatus: DailyStatus;
}

/**
 * Event types for gamification actions.
 * Can be extended for future features like achievements.
 */
export type GamificationEventType =
  | 'quiz_completed'
  | 'streak_increased'
  | 'streak_lost'
  | 'milestone_reached';

/**
 * Gamification event - used for tracking and potentially triggering
 * achievements or notifications.
 */
export interface GamificationEvent {
  type: GamificationEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * Milestone thresholds for streak achievements.
 * These can trigger special notifications or badges.
 */
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/**
 * Check if a streak count has reached a milestone.
 */
export function isStreakMilestone(streak: number): streak is StreakMilestone {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone === streak) {
      return true;
    }
  }
  return false;
}

/**
 * Get the next milestone to achieve from current streak.
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone;
    }
  }
  return null;
}
