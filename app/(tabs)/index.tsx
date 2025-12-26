import { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

import * as Sentry from '@sentry/react-native';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Text, View } from '@/components/Themed';
import { WordCard } from '@/components/WordCard';
import { enrichWords } from '@/services/aiService';
import { initDatabase, Wort } from '@/services/database';
import { QuizCompletionResult } from '@/services/gamificationService';
import { refreshNotificationContent } from '@/services/notificationService';
import { checkPremiumStatus } from '@/services/premiumService';
import { loadSettings } from '@/services/settingsService';
import { getOrGenerateTodaysWords } from '@/services/wordService';
import { EnrichedWord } from '@/types/ai';

export default function HomeScreen() {
  const [words, setWords] = useState<Wort[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [enrichedMap, setEnrichedMap] = useState<Record<number, EnrichedWord>>({});
  const [loadingMessage, setLoadingMessage] = useState('Lade Wörter des Tages...');
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const loadWords = useCallback(async () => {
    try {
      setError(null);
      setLoadingMessage('Datenbank wird eingerichtet...');
      await initDatabase();
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
        setAiLoading(true);
        setAiError(false);
        void enrichWords(todaysWords)
          .then((result) => {
            const next: Record<number, EnrichedWord> = {};
            result.forEach((item) => {
              next[item.wordId] = item;
            });
            setEnrichedMap(next);
          })
          .catch((err) => {
            if (!__DEV__) {
              Sentry.captureException(err, {
                tags: { feature: 'ai_enrichment' },
                level: 'error',
              });
            }
            setAiError(true);
            setEnrichedMap({});
            Toast.show({
              type: 'error',
              text1: 'AI-Anreicherung fehlgeschlagen',
              text2: 'Basisinformationen werden weiterhin angezeigt',
              visibilityTime: 4000,
            });
          })
          .finally(() => setAiLoading(false));
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

  // Reload words when screen gains focus (handles settings/premium changes)
  useFocusEffect(
    useCallback(() => {
      loadWords();
    }, [loadWords])
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

  const handleQuizComplete = useCallback((result: QuizCompletionResult) => {
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
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Wort; index: number }) => (
      <WordCard
        word={item}
        enriched={enrichedMap[item.id]}
        aiLoading={isPremium && aiLoading}
        aiError={isPremium && aiError}
        index={index}
        onQuizComplete={handleQuizComplete}
      />
    ),
    [enrichedMap, isPremium, aiLoading, aiError, handleQuizComplete]
  );

  const keyExtractor = useCallback((item: Wort) => item.id.toString(), []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Wörter des Tages</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
    ),
    []
  );

  const ListEmpty = useMemo(() => <EmptyState />, []);

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
    <FlatList
      data={words}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
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
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
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
});
