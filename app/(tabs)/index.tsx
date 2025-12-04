import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { WordCard } from '@/components/WordCard';
import { useDailyRefresh } from '@/hooks/useDailyRefresh';
import { initDatabase, Wort } from '@/services/database';
import { getOrGenerateTodaysWords } from '@/services/wordService';

export default function HomeScreen() {
  const [words, setWords] = useState<Wort[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWords = useCallback(async () => {
    try {
      setError(null);
      await initDatabase();
      const todaysWords = await getOrGenerateTodaysWords();
      setWords(todaysWords);
    } catch (err) {
      console.error('Error loading words:', err);
      setError('Fehler beim Laden der Wörter');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  useDailyRefresh(loadWords);

  const onRefresh = () => {
    setRefreshing(true);
    loadWords();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Wörter des Tages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

      {words.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Keine Wörter für heute gefunden.</Text>
        </View>
      ) : (
        <View style={styles.wordsList}>
          {words.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </View>
      )}
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  wordsList: {
    backgroundColor: 'transparent',
  },
});
