import { useCallback, useRef, useState } from 'react';

import { Pressable, StyleSheet } from 'react-native';

import * as Haptics from 'expo-haptics';

import { Button } from '@/components/Button';
import { Text, View, useThemeColor } from '@/components/Themed';
import { recordQuizCompletion, QuizCompletionResult } from '@/services/gamificationService';
import { Quiz, QuizOption } from '@/types/ai';

interface QuizCardProps {
  quiz: Quiz;
  wordId: number;
  onQuizComplete?: (result: QuizCompletionResult) => void;
}

export function QuizCard({ quiz, wordId, onQuizComplete }: QuizCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const hasTrackedRef = useRef(false);

  const borderColor = useThemeColor({ light: '#e9ecef', dark: '#333' }, 'background');
  const correctColor = useThemeColor({ light: '#28a745', dark: '#5cb85c' }, 'background');
  const incorrectColor = useThemeColor({ light: '#dc3545', dark: '#d9534f' }, 'background');
  const defaultOptionBg = useThemeColor({ light: '#f8f9fa', dark: '#2a2a2a' }, 'background');
  const selectedOptionBg = useThemeColor({ light: '#e7f1ff', dark: '#1a3a5c' }, 'background');

  const handleOptionPress = useCallback(
    (optionId: string) => {
      if (showResult) return;
      // Toggle selection: deselect if already selected, otherwise select
      setSelectedOptionId((prev) => (prev === optionId ? null : optionId));
    },
    [showResult]
  );

  const handleSubmit = useCallback(() => {
    if (selectedOptionId) {
      setShowResult(true);
      const isCorrect = selectedOptionId === quiz.correctOptionId;

      // Trigger haptic feedback based on correctness
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Track quiz completion (only once per quiz instance)
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        recordQuizCompletion(wordId, isCorrect)
          .then((result) => {
            onQuizComplete?.(result);
          })
          .catch(() => {
            // Silent fail - gamification tracking is non-critical
          });
      }
    }
  }, [selectedOptionId, quiz.correctOptionId, wordId, onQuizComplete]);

  const handleReset = useCallback(() => {
    setSelectedOptionId(null);
    setShowResult(false);
  }, []);

  const isCorrect = selectedOptionId === quiz.correctOptionId;

  const getOptionStyle = (option: QuizOption) => {
    const isSelected = selectedOptionId === option.id;
    const isCorrectOption = option.id === quiz.correctOptionId;

    if (!showResult) {
      return {
        backgroundColor: isSelected ? selectedOptionBg : defaultOptionBg,
        borderColor: isSelected ? '#2f95dc' : borderColor,
      };
    }

    if (isCorrectOption) {
      return {
        backgroundColor: correctColor,
        borderColor: correctColor,
      };
    }

    if (isSelected && !isCorrectOption) {
      return {
        backgroundColor: incorrectColor,
        borderColor: incorrectColor,
      };
    }

    return {
      backgroundColor: defaultOptionBg,
      borderColor: borderColor,
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.question}>{quiz.question}</Text>

      <View style={styles.optionsContainer}>
        {quiz.options.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.option, getOptionStyle(option)]}
            onPress={() => handleOptionPress(option.id)}
            disabled={showResult}
          >
            <Text
              style={[
                styles.optionText,
                showResult &&
                  (option.id === quiz.correctOptionId ||
                    (selectedOptionId === option.id && option.id !== quiz.correctOptionId)) &&
                  styles.resultOptionText,
              ]}
            >
              {option.id.toUpperCase()}. {option.text}
            </Text>
          </Pressable>
        ))}
      </View>

      {!showResult ? (
        <View style={styles.submitButtonContainer}>
          <Button
            variant="primary"
            onPress={handleSubmit}
            title="Antwort prüfen"
            disabled={!selectedOptionId}
            accessibilityLabel="Antwort prüfen"
            accessibilityHint="Prüft deine ausgewählte Antwort"
          />
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, isCorrect ? styles.correctText : styles.incorrectText]}>
            {isCorrect ? '✓ Richtig!' : '✗ Leider falsch'}
          </Text>
          <Button
            variant="secondary"
            onPress={handleReset}
            title="Nochmal versuchen"
            icon="refresh-outline"
            accessibilityLabel="Quiz zurücksetzen"
            accessibilityHint="Startet das Quiz neu"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 10,
    backgroundColor: 'transparent',
  },
  submitButtonContainer: {
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  option: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  correctText: {
    color: '#28a745',
  },
  incorrectText: {
    color: '#dc3545',
  },
});
