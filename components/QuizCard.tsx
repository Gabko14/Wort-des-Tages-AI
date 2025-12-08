import { useState } from 'react';

import { Pressable, StyleSheet } from 'react-native';

import { Quiz } from '@/types/ai';

import { Text, View } from './Themed';

type QuizCardProps = {
  quiz: Quiz;
  accentColor?: string;
};

export function QuizCard({ quiz, accentColor = '#007AFF' }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const isCorrect = selected ? selected === quiz.correctOptionId : null;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{quiz.question}</Text>
      <View style={styles.options}>
        {quiz.options.map((opt) => {
          const active = selected === opt.id;
          const correct = opt.id === quiz.correctOptionId;
          const backgroundColor =
            selected && correct
              ? 'rgba(0,200,0,0.15)'
              : active
                ? 'rgba(0,122,255,0.15)'
                : 'transparent';
          return (
            <Pressable
              key={opt.id}
              style={[
                styles.option,
                { borderColor: accentColor, backgroundColor },
              ]}
              onPress={() => handleSelect(opt.id)}
            >
              <Text style={styles.optionText}>{opt.text}</Text>
            </Pressable>
          );
        })}
      </View>
      {isCorrect !== null && (
        <Text
          style={[
            styles.feedback,
            { color: isCorrect ? '#1f8b24' : '#c1121f' },
          ]}
        >
          {isCorrect ? 'Richtig!' : 'Leider falsch'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 10,
    backgroundColor: 'transparent',
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
  },
  options: {
    gap: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  feedback: {
    fontSize: 14,
    fontWeight: '700',
  },
});
