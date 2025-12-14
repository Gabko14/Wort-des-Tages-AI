import { Alert, Linking, Pressable, StyleSheet } from 'react-native';

import { Wort } from '@/services/database';
import { EnrichedWord } from '@/types/ai';

import { QuizCard } from './QuizCard';
import { Text, View, useThemeColor } from './Themed';

interface WordCardProps {
  word: Wort;
  enriched?: EnrichedWord;
  aiLoading?: boolean;
  aiError?: boolean;
}

export function WordCard({ word, enriched, aiLoading, aiError }: WordCardProps) {
  const cardBackground = useThemeColor({ light: '#f8f9fa', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e9ecef', dark: '#333' }, 'background');
  const accentColor = useThemeColor({ light: '#2f95dc', dark: '#4da6ff' }, 'tint');
  const mutedColor = useThemeColor({ light: '#6c757d', dark: '#adb5bd' }, 'text');

  const handleOpenUrl = () => {
    if (word.url) {
      void Linking.openURL(word.url).catch((err) => {
        console.error('Failed to open URL:', err);
        Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
      });
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}>
      <Text style={styles.lemma}>{word.lemma}</Text>
      <View style={[styles.tagContainer, { backgroundColor: 'transparent' }]}>
        <View style={[styles.tag, { backgroundColor: accentColor }]}>
          <Text style={styles.tagText}>{word.wortklasse}</Text>
        </View>
        {word.frequenzklasse && word.frequenzklasse !== 'n/a' && (
          <View style={[styles.tag, styles.frequencyTag, { backgroundColor: mutedColor }]}>
            <Text style={styles.tagText}>Frequenz: {word.frequenzklasse}</Text>
          </View>
        )}
      </View>
      {enriched?.definition && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Definition</Text>
          <Text style={styles.sectionText}>{enriched.definition}</Text>
        </View>
      )}
      {enriched?.exampleSentence && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beispielsatz</Text>
          <Text style={styles.sectionText}>{enriched.exampleSentence}</Text>
        </View>
      )}
      {aiLoading && !enriched && <Text style={styles.sectionText}>KI lädt...</Text>}
      {aiError && !enriched && !aiLoading && (
        <Text style={styles.errorText}>KI nicht verfügbar</Text>
      )}
      {enriched?.quiz && <QuizCard quiz={enriched.quiz} />}
      <Pressable onPress={handleOpenUrl} style={styles.linkButton}>
        <Text style={[styles.linkText, { color: accentColor }]}>Im DWDS nachschlagen →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lemma: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    opacity: 0.9,
  },
  errorText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  frequencyTag: {
    opacity: 0.8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
