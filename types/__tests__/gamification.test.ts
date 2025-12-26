import { getNextMilestone, isStreakMilestone, STREAK_MILESTONES } from '../gamification';

describe('gamification types', () => {
  describe('STREAK_MILESTONES', () => {
    it('should contain expected milestone values', () => {
      expect(STREAK_MILESTONES).toEqual([3, 7, 14, 30, 50, 100, 365]);
    });

    it('should be in ascending order', () => {
      for (let i = 1; i < STREAK_MILESTONES.length; i++) {
        expect(STREAK_MILESTONES[i]).toBeGreaterThan(STREAK_MILESTONES[i - 1]);
      }
    });
  });

  describe('isStreakMilestone', () => {
    it('should return true for valid milestones', () => {
      expect(isStreakMilestone(3)).toBe(true);
      expect(isStreakMilestone(7)).toBe(true);
      expect(isStreakMilestone(14)).toBe(true);
      expect(isStreakMilestone(30)).toBe(true);
      expect(isStreakMilestone(50)).toBe(true);
      expect(isStreakMilestone(100)).toBe(true);
      expect(isStreakMilestone(365)).toBe(true);
    });

    it('should return false for non-milestones', () => {
      expect(isStreakMilestone(0)).toBe(false);
      expect(isStreakMilestone(1)).toBe(false);
      expect(isStreakMilestone(2)).toBe(false);
      expect(isStreakMilestone(5)).toBe(false);
      expect(isStreakMilestone(10)).toBe(false);
      expect(isStreakMilestone(15)).toBe(false);
      expect(isStreakMilestone(99)).toBe(false);
      expect(isStreakMilestone(366)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isStreakMilestone(-1)).toBe(false);
      expect(isStreakMilestone(-7)).toBe(false);
    });
  });

  describe('getNextMilestone', () => {
    it('should return 3 for streaks 0-2', () => {
      expect(getNextMilestone(0)).toBe(3);
      expect(getNextMilestone(1)).toBe(3);
      expect(getNextMilestone(2)).toBe(3);
    });

    it('should return 7 for streaks 3-6', () => {
      expect(getNextMilestone(3)).toBe(7);
      expect(getNextMilestone(4)).toBe(7);
      expect(getNextMilestone(5)).toBe(7);
      expect(getNextMilestone(6)).toBe(7);
    });

    it('should return 14 for streaks 7-13', () => {
      expect(getNextMilestone(7)).toBe(14);
      expect(getNextMilestone(10)).toBe(14);
      expect(getNextMilestone(13)).toBe(14);
    });

    it('should return 30 for streaks 14-29', () => {
      expect(getNextMilestone(14)).toBe(30);
      expect(getNextMilestone(20)).toBe(30);
      expect(getNextMilestone(29)).toBe(30);
    });

    it('should return 50 for streaks 30-49', () => {
      expect(getNextMilestone(30)).toBe(50);
      expect(getNextMilestone(40)).toBe(50);
      expect(getNextMilestone(49)).toBe(50);
    });

    it('should return 100 for streaks 50-99', () => {
      expect(getNextMilestone(50)).toBe(100);
      expect(getNextMilestone(75)).toBe(100);
      expect(getNextMilestone(99)).toBe(100);
    });

    it('should return 365 for streaks 100-364', () => {
      expect(getNextMilestone(100)).toBe(365);
      expect(getNextMilestone(200)).toBe(365);
      expect(getNextMilestone(364)).toBe(365);
    });

    it('should return null for streaks at or above 365', () => {
      expect(getNextMilestone(365)).toBeNull();
      expect(getNextMilestone(500)).toBeNull();
      expect(getNextMilestone(1000)).toBeNull();
    });
  });
});
