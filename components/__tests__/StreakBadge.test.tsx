import { Ionicons } from '@expo/vector-icons';
import { render, screen } from '@testing-library/react-native';

import type { StreakData } from '@/types/gamification';

import { StreakBadge } from '../StreakBadge';

describe('StreakBadge', () => {
  const defaultStreak: StreakData = {
    currentStreak: 5,
    longestStreak: 10,
    lastCompletionDate: '2024-03-15',
  };

  describe('rendering', () => {
    it('should render streak count', () => {
      render(<StreakBadge streak={defaultStreak} completedToday={false} />);

      expect(screen.getByText('5')).toBeTruthy();
    });

    it('should render "Tag" for single day streak', () => {
      const singleDayStreak = { ...defaultStreak, currentStreak: 1 };
      render(<StreakBadge streak={singleDayStreak} completedToday={false} />);

      expect(screen.getByText('Tag')).toBeTruthy();
    });

    it('should render "Tage" for multi-day streak', () => {
      render(<StreakBadge streak={defaultStreak} completedToday={false} />);

      expect(screen.getByText('Tage')).toBeTruthy();
    });

    it('should render flame icon', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { UNSAFE_getAllByType } = render(
        <StreakBadge streak={defaultStreak} completedToday={false} />
      );

      const icons = UNSAFE_getAllByType(Ionicons);
      expect(icons.length).toBeGreaterThanOrEqual(1);
      expect(icons.some((icon) => icon.props.name === 'flame-outline')).toBe(true);
    });

    it('should render filled flame when completed today', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { UNSAFE_getAllByType } = render(
        <StreakBadge streak={defaultStreak} completedToday={true} />
      );

      const icons = UNSAFE_getAllByType(Ionicons);
      expect(icons.some((icon) => icon.props.name === 'flame')).toBe(true);
    });
  });

  describe('visibility', () => {
    it('should not render when no streak history', () => {
      const noHistoryStreak: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      };

      const { queryByText } = render(
        <StreakBadge streak={noHistoryStreak} completedToday={false} />
      );

      expect(queryByText('0')).toBeNull();
      expect(queryByText('Tage')).toBeNull();
    });

    it('should render when current streak is 0 but longest streak exists', () => {
      const lostStreak: StreakData = {
        currentStreak: 0,
        longestStreak: 10,
        lastCompletionDate: '2024-03-10',
      };

      render(<StreakBadge streak={lostStreak} completedToday={false} />);

      expect(screen.getByText('0')).toBeTruthy();
    });
  });

  describe('reminder message', () => {
    it('should show reminder when not completed today and has streak', () => {
      render(<StreakBadge streak={defaultStreak} completedToday={false} />);

      expect(screen.getByText('Heute noch kein Quiz!')).toBeTruthy();
    });

    it('should not show reminder when completed today', () => {
      const { queryByText } = render(<StreakBadge streak={defaultStreak} completedToday={true} />);

      expect(queryByText('Heute noch kein Quiz!')).toBeNull();
    });

    it('should not show reminder when streak is 0', () => {
      const zeroStreak: StreakData = {
        currentStreak: 0,
        longestStreak: 5,
        lastCompletionDate: null,
      };

      const { queryByText } = render(<StreakBadge streak={zeroStreak} completedToday={false} />);

      expect(queryByText('Heute noch kein Quiz!')).toBeNull();
    });
  });

  describe('record message', () => {
    it('should show record message when at personal best', () => {
      const recordStreak: StreakData = {
        currentStreak: 10,
        longestStreak: 10,
        lastCompletionDate: '2024-03-15',
      };

      render(<StreakBadge streak={recordStreak} completedToday={true} />);

      expect(screen.getByText('Neuer Rekord!')).toBeTruthy();
    });

    it('should not show record message when not at personal best', () => {
      const belowRecordStreak: StreakData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: '2024-03-15',
      };

      const { queryByText } = render(
        <StreakBadge streak={belowRecordStreak} completedToday={true} />
      );

      expect(queryByText('Neuer Rekord!')).toBeNull();
    });

    it('should not show record message when streak is 1', () => {
      const singleDayRecord: StreakData = {
        currentStreak: 1,
        longestStreak: 1,
        lastCompletionDate: '2024-03-15',
      };

      const { queryByText } = render(
        <StreakBadge streak={singleDayRecord} completedToday={true} />
      );

      expect(queryByText('Neuer Rekord!')).toBeNull();
    });

    it('should not show record message when not completed today', () => {
      const recordStreak: StreakData = {
        currentStreak: 10,
        longestStreak: 10,
        lastCompletionDate: '2024-03-14',
      };

      const { queryByText } = render(<StreakBadge streak={recordStreak} completedToday={false} />);

      expect(queryByText('Neuer Rekord!')).toBeNull();
    });
  });
});
