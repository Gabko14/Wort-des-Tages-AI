import { StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text, View, useThemeColor } from '@/components/Themed';
import type { StreakData } from '@/types/gamification';

interface StreakBadgeProps {
  streak: StreakData;
  completedToday: boolean;
}

export function StreakBadge({ streak, completedToday }: StreakBadgeProps) {
  const bgColor = useThemeColor({ light: '#fff3e0', dark: '#3d2c1a' }, 'background');
  const textColor = useThemeColor({ light: '#e65100', dark: '#ffb74d' }, 'text');
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');

  const { currentStreak, longestStreak } = streak;

  // Don't show anything if no streak history
  if (currentStreak === 0 && longestStreak === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.streakRow}>
        <Ionicons
          name={completedToday ? 'flame' : 'flame-outline'}
          size={24}
          color={completedToday ? '#ff6b35' : mutedColor}
        />
        <Text style={[styles.streakCount, { color: textColor }]}>{currentStreak}</Text>
        <Text style={[styles.streakLabel, { color: textColor }]}>
          {currentStreak === 1 ? 'Tag' : 'Tage'}
        </Text>
      </View>
      {!completedToday && currentStreak > 0 && (
        <Text style={[styles.reminder, { color: mutedColor }]}>Heute noch kein Quiz!</Text>
      )}
      {completedToday && currentStreak === longestStreak && currentStreak > 1 && (
        <Text style={[styles.record, { color: textColor }]}>Neuer Rekord!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  reminder: {
    fontSize: 12,
    marginTop: 4,
  },
  record: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
