import React, { useCallback, useEffect, useState } from 'react';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Sentry from '@sentry/react-native';
import { Tabs, useFocusEffect } from 'expo-router';

import { CompactStreakBadge } from '@/components/CompactStreakBadge';
import { StatsModal } from '@/components/StatsModal';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getCurrentStreak, hasCompletedToday } from '@/services/gamificationService';
import type { StreakData } from '@/types/gamification';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Load streak data on mount and when screen gains focus
  const loadStreak = useCallback(async () => {
    try {
      const [streakData, completed] = await Promise.all([getCurrentStreak(), hasCompletedToday()]);
      setStreak(streakData);
      setCompletedToday(completed);
    } catch (err) {
      // Non-critical - log to Sentry for visibility
      if (!__DEV__) {
        Sentry.captureException(err, { tags: { feature: 'header_streak_loading' }, level: 'info' });
      }
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  // Reload when returning to tab
  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [loadStreak])
  );

  const showStatsModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          headerShown: useClientOnlyValue(false, true),
          headerRight: () =>
            streak ? (
              <CompactStreakBadge
                streak={streak}
                completedToday={completedToday}
                onPress={showStatsModal}
              />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Wörter',
            tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Einstellungen',
            tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          }}
        />
      </Tabs>
      {streak && (
        <StatsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          streak={streak}
          completedToday={completedToday}
        />
      )}
    </>
  );
}
