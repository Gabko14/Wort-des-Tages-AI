import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearGamificationData,
  getCurrentStreak,
  getGamificationStats,
  getNotificationContent,
  getStreakMessage,
  getTodayDateString,
  getTodayStatus,
  hasCompletedToday,
  isStreakAtRisk,
  loadCompletions,
  loadStreakData,
  recordQuizCompletion,
} from '../gamificationService';

// Mock date for consistent testing
const MOCK_TODAY = new Date('2024-03-15T12:00:00');
const MOCK_YESTERDAY = '2024-03-14';
const MOCK_TODAY_STRING = '2024-03-15';
const MOCK_TWO_DAYS_AGO = '2024-03-13';

describe('gamificationService', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_TODAY);
    // Clear cache and storage before each test
    await clearGamificationData();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTodayDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const result = getTodayDateString();
      expect(result).toBe(MOCK_TODAY_STRING);
    });

    it('should pad single-digit months and days', () => {
      jest.setSystemTime(new Date('2024-01-05T12:00:00'));
      const result = getTodayDateString();
      expect(result).toBe('2024-01-05');
    });
  });

  describe('loadStreakData', () => {
    it('should return default streak when nothing stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const streak = await loadStreakData();

      expect(streak).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      });
    });

    it('should return stored streak data', async () => {
      const storedStreak = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(storedStreak));

      const streak = await loadStreakData();

      expect(streak).toEqual(storedStreak);
    });

    it('should return default streak on parse error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-json');

      const streak = await loadStreakData();

      expect(streak).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      });
    });
  });

  describe('loadCompletions', () => {
    it('should return empty array when nothing stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const completions = await loadCompletions();

      expect(completions).toEqual([]);
    });

    it('should return stored completions', async () => {
      const storedCompletions = [
        { wordId: 1, date: MOCK_TODAY_STRING, wasCorrect: true, timestamp: Date.now() },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(storedCompletions));

      const completions = await loadCompletions();

      expect(completions).toEqual(storedCompletions);
    });
  });

  describe('recordQuizCompletion', () => {
    it('should start a new streak on first completion', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await recordQuizCompletion(123, true);

      expect(result.isFirstCompletionToday).toBe(true);
      expect(result.streak.currentStreak).toBe(1);
      expect(result.streak.longestStreak).toBe(1);
      expect(result.streak.lastCompletionDate).toBe(MOCK_TODAY_STRING);
      expect(result.streakWasLost).toBe(false);
    });

    it('should continue streak when completed yesterday', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(existingStreak)) // streak
        .mockResolvedValueOnce(JSON.stringify([])); // completions

      const result = await recordQuizCompletion(123, true);

      expect(result.isFirstCompletionToday).toBe(true);
      expect(result.streak.currentStreak).toBe(6);
      expect(result.streak.longestStreak).toBe(6);
      expect(result.streakWasLost).toBe(false);
    });

    it('should reset streak when missed a day', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: MOCK_TWO_DAYS_AGO,
      };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(existingStreak)) // streak
        .mockResolvedValueOnce(JSON.stringify([])); // completions

      const result = await recordQuizCompletion(123, true);

      expect(result.isFirstCompletionToday).toBe(true);
      expect(result.streak.currentStreak).toBe(1);
      expect(result.streak.longestStreak).toBe(10); // keeps longest
      expect(result.streakWasLost).toBe(true);
    });

    it('should not increase streak on second completion same day', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_TODAY_STRING,
      };
      const existingCompletions = [
        { wordId: 100, date: MOCK_TODAY_STRING, wasCorrect: true, timestamp: Date.now() - 1000 },
      ];
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(existingStreak))
        .mockResolvedValueOnce(JSON.stringify(existingCompletions));

      const result = await recordQuizCompletion(123, false);

      expect(result.isFirstCompletionToday).toBe(false);
      expect(result.streak.currentStreak).toBe(5); // unchanged
    });

    it('should detect milestone reached', async () => {
      const existingStreak = {
        currentStreak: 6,
        longestStreak: 6,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(existingStreak))
        .mockResolvedValueOnce(JSON.stringify([]));

      const result = await recordQuizCompletion(123, true);

      expect(result.streak.currentStreak).toBe(7);
      expect(result.milestoneReached).toBe(7); // 7 is a milestone
    });

    it('should not report milestone for non-milestone streaks', async () => {
      const existingStreak = {
        currentStreak: 4,
        longestStreak: 4,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(existingStreak))
        .mockResolvedValueOnce(JSON.stringify([]));

      const result = await recordQuizCompletion(123, true);

      expect(result.streak.currentStreak).toBe(5);
      expect(result.milestoneReached).toBeNull(); // 5 is not a milestone
    });
  });

  describe('isStreakAtRisk', () => {
    it('should return true when streak exists but not completed today', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingStreak));

      const atRisk = await isStreakAtRisk();

      expect(atRisk).toBe(true);
    });

    it('should return false when completed today', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_TODAY_STRING,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingStreak));

      const atRisk = await isStreakAtRisk();

      expect(atRisk).toBe(false);
    });

    it('should return false when no streak', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const atRisk = await isStreakAtRisk();

      expect(atRisk).toBe(false);
    });
  });

  describe('getCurrentStreak', () => {
    it('should return streak as-is when completed today', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_TODAY_STRING,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingStreak));

      const streak = await getCurrentStreak();

      expect(streak.currentStreak).toBe(5);
    });

    it('should return streak as-is when completed yesterday', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingStreak));

      const streak = await getCurrentStreak();

      expect(streak.currentStreak).toBe(5);
    });

    it('should reset streak when missed more than a day', async () => {
      const existingStreak = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: MOCK_TWO_DAYS_AGO,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existingStreak));

      const streak = await getCurrentStreak();

      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(10); // keeps longest
    });
  });

  describe('hasCompletedToday', () => {
    it('should return true when completed today', async () => {
      const completions = [
        { wordId: 1, date: MOCK_TODAY_STRING, wasCorrect: true, timestamp: Date.now() },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(completions));

      const completed = await hasCompletedToday();

      expect(completed).toBe(true);
    });

    it('should return false when not completed today', async () => {
      const completions = [
        { wordId: 1, date: MOCK_YESTERDAY, wasCorrect: true, timestamp: Date.now() - 86400000 },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(completions));

      const completed = await hasCompletedToday();

      expect(completed).toBe(false);
    });

    it('should return false when no completions', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const completed = await hasCompletedToday();

      expect(completed).toBe(false);
    });
  });

  describe('getTodayStatus', () => {
    it('should return correct status for multiple completions', async () => {
      const completions = [
        { wordId: 1, date: MOCK_TODAY_STRING, wasCorrect: true, timestamp: Date.now() },
        { wordId: 2, date: MOCK_TODAY_STRING, wasCorrect: false, timestamp: Date.now() },
        { wordId: 3, date: MOCK_TODAY_STRING, wasCorrect: true, timestamp: Date.now() },
        { wordId: 4, date: MOCK_YESTERDAY, wasCorrect: true, timestamp: Date.now() - 86400000 },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(completions));

      const status = await getTodayStatus();

      expect(status.date).toBe(MOCK_TODAY_STRING);
      expect(status.completed).toBe(true);
      expect(status.quizCount).toBe(3);
      expect(status.correctCount).toBe(2);
    });

    it('should return incomplete status when no completions today', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const status = await getTodayStatus();

      expect(status.completed).toBe(false);
      expect(status.quizCount).toBe(0);
      expect(status.correctCount).toBe(0);
    });
  });

  describe('getGamificationStats', () => {
    it('should aggregate all stats correctly', async () => {
      const streak = {
        currentStreak: 5,
        longestStreak: 5,
        lastCompletionDate: MOCK_TODAY_STRING,
      };
      const completions = [
        { wordId: 1, date: MOCK_TODAY_STRING, wasCorrect: true, timestamp: Date.now() },
        { wordId: 2, date: MOCK_YESTERDAY, wasCorrect: false, timestamp: Date.now() - 86400000 },
      ];
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(streak))
        .mockResolvedValueOnce(JSON.stringify(completions))
        .mockResolvedValueOnce(JSON.stringify(completions));

      const stats = await getGamificationStats();

      expect(stats.streak.currentStreak).toBe(5);
      expect(stats.totalQuizzesCompleted).toBe(2);
      expect(stats.totalCorrectAnswers).toBe(1);
      expect(stats.todayStatus.quizCount).toBe(1);
    });
  });

  describe('getStreakMessage', () => {
    it('should return first-time message for new users', () => {
      const streak = { currentStreak: 0, longestStreak: 0, lastCompletionDate: null };
      const message = getStreakMessage(streak, false);
      expect(message).toBe('Starte heute deine erste Lernserie!');
    });

    it('should return restart message when streak lost', () => {
      const streak = { currentStreak: 0, longestStreak: 10, lastCompletionDate: null };
      const message = getStreakMessage(streak, false);
      expect(message).toContain('Dein Rekord: 10 Tage');
    });

    it('should return at-risk message for long streaks', () => {
      const streak = { currentStreak: 30, longestStreak: 30, lastCompletionDate: MOCK_YESTERDAY };
      const message = getStreakMessage(streak, true);
      expect(message).toContain('30-Tage-Serie');
      expect(message).toContain('Nicht aufgeben');
    });

    it('should return at-risk message for medium streaks', () => {
      const streak = { currentStreak: 7, longestStreak: 7, lastCompletionDate: MOCK_YESTERDAY };
      const message = getStreakMessage(streak, true);
      expect(message).toContain('7-Tage-Serie');
    });

    it('should return milestone countdown when close', () => {
      const streak = { currentStreak: 5, longestStreak: 5, lastCompletionDate: MOCK_TODAY_STRING };
      const message = getStreakMessage(streak, false);
      expect(message).toContain('7-Tage-Meilenstein');
    });

    it('should return record message when at personal best', () => {
      const streak = { currentStreak: 8, longestStreak: 8, lastCompletionDate: MOCK_TODAY_STRING };
      const message = getStreakMessage(streak, false);
      expect(message).toContain('Neuer Rekord');
    });
  });

  describe('getNotificationContent', () => {
    it('should return at-risk notification for long streaks', async () => {
      const streak = {
        currentStreak: 10,
        longestStreak: 10,
        lastCompletionDate: MOCK_YESTERDAY,
      };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(streak)) // getCurrentStreak
        .mockResolvedValueOnce(JSON.stringify(streak)); // isStreakAtRisk

      const content = await getNotificationContent();

      expect(content.title).toContain('10-Tage-Serie in Gefahr');
    });

    it('should return default notification for new users', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const content = await getNotificationContent();

      expect(content.title).toBe('Wort des Tages');
      expect(content.body).toContain('täglichen Wörter');
    });

    it('should return restart message after streak lost', async () => {
      const streak = {
        currentStreak: 0,
        longestStreak: 15,
        lastCompletionDate: MOCK_TWO_DAYS_AGO,
      };
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(streak))
        .mockResolvedValueOnce(JSON.stringify(streak));

      const content = await getNotificationContent();

      expect(content.title).toContain('Neustart');
      expect(content.body).toContain('15 Tage');
    });
  });

  describe('clearGamificationData', () => {
    it('should remove all gamification data from storage', async () => {
      await clearGamificationData();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gamification_streak');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gamification_completions');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gamification_stats');
    });
  });
});
