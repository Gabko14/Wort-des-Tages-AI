import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { CompactStreakBadge } from '@/components/CompactStreakBadge';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { StatsModal } from '@/components/StatsModal';
import { Text, View } from '@/components/Themed';
import { WordCard } from '@/components/WordCard';
import { enrichWord } from '@/services/aiService';
import {
  getCurrentStreak,
  hasCompletedToday,
  QuizCompletionResult,
} from '@/services/gamificationService';
import { refreshNotificationContent } from '@/services/notificationService';
import { checkPremiumStatus } from '@/services/premiumService';
import { loadSettings } from '@/services/settingsService';
import { clearTodaysWords, getOrGenerateTodaysWords } from '@/services/wordService';
import { EnrichedWord } from '@/types/ai';
import type { StreakData } from '@/types/gamification';
import { Wort } from '@/types/word';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState<Wort[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoadingIds, setAiLoadingIds] = useState<Set<number>>(new Set());
  const [aiErrorIds, setAiErrorIds] = useState<Set<number>>(new Set());
  const [isPremium, setIsPremium] = useState(false);
  const [enrichedMap, setEnrichedMap] = useState<Record<number, EnrichedWord>>({});
  const [loadingMessage, setLoadingMessage] = useState('Lade Wörter des Tages...');
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  // Streak state
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);

  // Track which words have started enrichment (prevents duplicates across re-renders)
  const enrichmentStartedRef = useRef<Set<number>>(new Set());

  const loadStreak = useCallback(async () => {
    try {
      const [streakData, completed] = await Promise.all([getCurrentStreak(), hasCompletedToday()]);
      setStreak(streakData);
      setCompletedToday(completed);
    } catch (err) {
      if (!__DEV__) {
        Sentry.captureException(err, { tags: { feature: 'streak_loading' }, level: 'info' });
      }
    }
  }, []);

  const loadWords = useCallback(async () => {
    try {
      setError(null);
      setLoadingMessage('Lade Wörter des Tages...');
      const todaysWords = await getOrGenerateTodaysWords();
      setWords(todaysWords);

      // Refresh notification content with latest streak data (non-blocking)
      loadSettings()
        .then((settings) => {
          if (settings.notificationsEnabled) {
            return refreshNotificationContent(settings.notificationTime);
          }
        })
        .catch((err) => {
          // Non-critical - log to Sentry for visibility
          if (!__DEV__) {
            Sentry.captureException(err, {
              tags: { feature: 'notification_refresh' },
              level: 'info',
            });
          }
        });

      let premiumEnabled = false;
      try {
        const premiumStatus = await checkPremiumStatus();
        premiumEnabled = premiumStatus.isPremium;
      } catch (err) {
        if (!__DEV__) {
          Sentry.captureException(err, {
            tags: { feature: 'premium_check' },
            level: 'warning',
          });
        }
        Toast.show({
          type: 'info',
          text1: 'Premium-Prüfung fehlgeschlagen',
          text2: 'AI-Funktionen werden nicht geladen',
          visibilityTime: 3000,
        });
      }

      setIsPremium(premiumEnabled);

      if (premiumEnabled) {
        // Filter to words not yet started (ref persists across re-renders)
        const wordsToEnrich = todaysWords.filter(
          (word) => !enrichmentStartedRef.current.has(word.id)
        );

        if (wordsToEnrich.length > 0) {
          // Mark as started before async work (prevents race conditions)
          wordsToEnrich.forEach((w) => enrichmentStartedRef.current.add(w.id));

          // Set loading state for new words only
          setAiLoadingIds((prev) => {
            const next = new Set(prev);
            wordsToEnrich.forEach((w) => next.add(w.id));
            return next;
          });

          // Enrich each word individually for faster perceived loading
          wordsToEnrich.forEach((word) => {
            enrichWord(word)
              .then((enriched) => {
                setEnrichedMap((prev) => ({ ...prev, [word.id]: enriched }));
              })
              .catch((err) => {
                if (!__DEV__) {
                  Sentry.captureException(err, {
                    tags: { feature: 'ai_enrichment', wordId: word.id },
                    level: 'error',
                  });
                }
                setAiErrorIds((prev) => new Set(prev).add(word.id));
              })
              .finally(() => {
                setAiLoadingIds((prev) => {
                  const next = new Set(prev);
                  next.delete(word.id);
                  return next;
                });
              });
          });
        }
      }
    } catch (err) {
      if (!__DEV__) {
        Sentry.captureException(err, {
          tags: { feature: 'word_loading' },
          level: 'error',
        });
      }
      setError('Fehler beim Laden der Wörter');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload words and streak when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadWords();
      loadStreak();
    }, [loadWords, loadStreak])
  );

  // Timer for loading seconds
  useEffect(() => {
    if (!loading) {
      setLoadingSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadWords();
  };

  const handleQuizComplete = useCallback(
    (result: QuizCompletionResult) => {
      // Reload streak to update badge
      loadStreak();

      // Show milestone celebration
      if (result.milestoneReached) {
        Toast.show({
          type: 'success',
          text1: `${result.milestoneReached} Tage!`,
          text2: 'Meilenstein erreicht - weiter so!',
          visibilityTime: 4000,
        });
      } else if (result.isFirstCompletionToday && result.streak.currentStreak > 1) {
        // Show streak continuation message
        Toast.show({
          type: 'success',
          text1: `${result.streak.currentStreak} Tage in Folge!`,
          text2: 'Deine Serie geht weiter',
          visibilityTime: 3000,
        });
      }
    },
    [loadStreak]
  );

  const handleRegenerateWords = useCallback(async () => {
    setRegenerating(true);
    try {
      await clearTodaysWords();
      // Reset enrichment tracking for new words
      enrichmentStartedRef.current.clear();
      setEnrichedMap({});
      setAiErrorIds(new Set());
      await loadWords(); // Immediately reload
      Toast.show({
        type: 'success',
        text1: 'Neue Wörter generiert',
        text2: 'Die Wörter wurden aktualisiert',
      });
    } catch (err) {
      if (!__DEV__) {
        Sentry.captureException(err, {
          tags: { feature: 'word_regenerate' },
          level: 'error',
        });
      }
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: 'Wörter konnten nicht aktualisiert werden',
      });
    } finally {
      setRegenerating(false);
    }
  }, [loadWords]);

  const renderItem = useCallback(
    ({ item, index }: { item: Wort; index: number }) => (
      <WordCard
        word={item}
        enriched={enrichedMap[item.id]}
        aiLoading={isPremium && aiLoadingIds.has(item.id)}
        aiError={isPremium && aiErrorIds.has(item.id)}
        index={index}
        onQuizComplete={handleQuizComplete}
      />
    ),
    [enrichedMap, isPremium, aiLoadingIds, aiErrorIds, handleQuizComplete]
  );

  const keyExtractor = useCallback((item: Wort) => item.id.toString(), []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Wörter des Tages</Text>
        {streak && (
          <CompactStreakBadge
            streak={streak}
            completedToday={completedToday}
            onPress={() => setStatsModalVisible(true)}
          />
        )}
      </View>
    ),
    [streak, completedToday]
  );

  const ListEmpty = useMemo(() => <EmptyState />, []);

  const ListFooter = useMemo(
    () => (
      <Pressable
        onPress={handleRegenerateWords}
        disabled={regenerating}
        style={styles.regenerateButton}
        accessibilityRole="button"
        accessibilityLabel="Neue Wörter generieren"
        accessibilityHint="Setzt die aktuellen Wörter zurück und generiert neue"
      >
        <View style={styles.regenerateContent}>
          {regenerating ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.regenerateIcon} />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={16}
              color="#007AFF"
              style={styles.regenerateIcon}
            />
          )}
          <Text style={styles.regenerateText}>
            {regenerating ? 'Generiere neue Wörter...' : 'Neue Wörter generieren'}
          </Text>
        </View>
      </Pressable>
    ),
    [regenerating, handleRegenerateWords]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
        {loadingSeconds >= 3 && (
          <Text style={styles.loadingHint}>
            Erste Einrichtung kann bis zu 60 Sekunden dauern... ({loadingSeconds}s)
          </Text>
        )}
      </View>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadWords} />;
  }

  return (
    <>
      <FlatList
        data={words}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      {streak && (
        <StatsModal
          visible={statsModalVisible}
          onClose={() => setStatsModalVisible(false)}
          streak={streak}
          completedToday={completedToday}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loadingHint: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
  },
  regenerateButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  regenerateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  regenerateIcon: {
    marginRight: 6,
  },
  regenerateText: {
    fontSize: 14,
    color: '#007AFF',
    opacity: 0.7,
  },
});
