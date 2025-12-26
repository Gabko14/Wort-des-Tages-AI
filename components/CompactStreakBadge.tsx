import { StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text, View, useThemeColor } from '@/components/Themed';
import type { StreakData } from '@/types/gamification';

interface CompactStreakBadgeProps {
  streak: StreakData;
  completedToday: boolean;
  onPress?: () => void;
}

export function CompactStreakBadge({ streak, completedToday, onPress }: CompactStreakBadgeProps) {
  const textColor = useThemeColor({ light: '#e65100', dark: '#ffb74d' }, 'text');
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');

  const { currentStreak } = streak;

  // Don't show anything if no streak history
  if (currentStreak === 0) {
    return null;
  }

  const content = (
    <View style={styles.container}>
      <Ionicons
        name={completedToday ? 'flame' : 'flame-outline'}
        size={20}
        color={completedToday ? '#ff6b35' : mutedColor}
      />
      <Text style={[styles.streakCount, { color: textColor }]}>{currentStreak}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
