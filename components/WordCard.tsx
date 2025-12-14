import { useState } from 'react';

import { Linking, Pressable, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Wort } from '@/services/database';
import { EnrichedWord } from '@/types/ai';

import { Button } from './Button';
import { QuizCard } from './QuizCard';
import { Text, View, useThemeColor } from './Themed';

interface WordCardProps {
  word: Wort;
  enriched?: EnrichedWord;
  aiLoading?: boolean;
  aiError?: boolean;
  index?: number;
}

export function WordCard({ word, enriched, aiLoading, aiError, index = 0 }: WordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardBackground = useThemeColor({ light: '#f8f9fa', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e9ecef', dark: '#333' }, 'background');
  const accentColor = useThemeColor({ light: '#2f95dc', dark: '#4da6ff' }, 'tint');
  const mutedColor = useThemeColor({ light: '#6c757d', dark: '#adb5bd' }, 'text');
  const iconColor = useThemeColor({ light: '#6c757d', dark: '#adb5bd' }, 'text');

  const handleToggleExpand = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded((prev) => !prev);
  };

  const handleOpenUrl = () => {
    if (word.url) {
      // Silent fail - OS handles most error cases, no good recovery action for user
      void Linking.openURL(word.url).catch(() => {});
    }
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withSpring(isExpanded ? '180deg' : '0deg') }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.card, { backgroundColor: cardBackground, borderColor: borderColor }]}
    >
      <Pressable
        onPress={handleToggleExpand}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? 'Details ausblenden' : 'Details anzeigen'}
      >
        <View style={styles.headerContent}>
          <Text style={styles.lemma}>{word.lemma}</Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={24} color={iconColor} />
          </Animated.View>
        </View>
      </Pressable>
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
      {isExpanded && (
        <>
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
          <Button
            variant="ghost"
            onPress={handleOpenUrl}
            title="Im DWDS nachschlagen"
            icon="open-outline"
            iconPosition="right"
            accessibilityLabel="Im DWDS Wörterbuch nachschlagen"
            accessibilityHint="Öffnet die DWDS Webseite in einem Browser"
            accessibilityRole="link"
          />
        </>
      )}
    </Animated.View>
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
  header: {
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  lemma: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  expandHint: {
    fontSize: 14,
    opacity: 0.5,
    fontStyle: 'italic',
    marginTop: 4,
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
