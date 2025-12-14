import { StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/Button';
import { Text, View } from '@/components/Themed';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#dc3545" />
      </View>
      <Text style={styles.title}>Ein Fehler ist aufgetreten</Text>
      <Text style={styles.message}>{message}</Text>
      <Button
        variant="primary"
        onPress={onRetry}
        icon="refresh"
        accessibilityLabel="Erneut versuchen"
      >
        Erneut versuchen
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
});
