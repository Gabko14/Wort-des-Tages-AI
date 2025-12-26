import { Ionicons } from '@expo/vector-icons';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { StreakData } from '@/types/gamification';

import { CompactStreakBadge } from '../CompactStreakBadge';

describe('CompactStreakBadge', () => {
  const defaultStreak: StreakData = {
    currentStreak: 5,
    longestStreak: 10,
    lastCompletionDate: '2024-03-15',
  };

  describe('rendering', () => {
    it('should render streak count', () => {
      render(<CompactStreakBadge streak={defaultStreak} completedToday={false} />);

      expect(screen.getByText('5')).toBeTruthy();
    });

    it('should render flame icon', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { UNSAFE_getAllByType } = render(
        <CompactStreakBadge streak={defaultStreak} completedToday={false} />
      );

      const icons = UNSAFE_getAllByType(Ionicons);
      expect(icons.length).toBeGreaterThanOrEqual(1);
      expect(icons.some((icon) => icon.props.name === 'flame-outline')).toBe(true);
    });

    it('should render filled flame when completed today', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { UNSAFE_getAllByType } = render(
        <CompactStreakBadge streak={defaultStreak} completedToday={true} />
      );

      const icons = UNSAFE_getAllByType(Ionicons);
      expect(icons.some((icon) => icon.props.name === 'flame')).toBe(true);
    });
  });

  describe('visibility', () => {
    it('should not render when current streak is 0', () => {
      const noStreak: StreakData = {
        currentStreak: 0,
        longestStreak: 10,
        lastCompletionDate: null,
      };

      const { queryByText } = render(
        <CompactStreakBadge streak={noStreak} completedToday={false} />
      );

      // Component returns null when streak is 0
      expect(queryByText('0')).toBeNull();
    });

    it('should render when current streak exists', () => {
      render(<CompactStreakBadge streak={defaultStreak} completedToday={false} />);

      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onPress when tapped', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <CompactStreakBadge streak={defaultStreak} completedToday={false} onPress={onPress} />
      );

      fireEvent.press(getByText('5'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not be tappable when onPress is not provided', () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { UNSAFE_queryByType } = render(
        <CompactStreakBadge streak={defaultStreak} completedToday={false} />
      );

      // Should not have TouchableOpacity when onPress is not provided
      const touchable = UNSAFE_queryByType(require('react-native').TouchableOpacity);
      expect(touchable).toBeNull();
    });
  });
});
