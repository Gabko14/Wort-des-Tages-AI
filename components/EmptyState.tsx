import { StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Text, View } from '@/components/Themed';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = 'Keine Wörter für heute gefunden. Überprüfe deine Einstellungen, um Wörter zu aktivieren.',
}: EmptyStateProps) {
  const handleGoToSettings = () => {
    router.push('/(tabs)/two');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="search-outline" size={80} color="#6c757d" />
      </View>
      <Text style={styles.title}>Keine Wörter verfügbar</Text>
      <Text style={styles.message}>{message}</Text>
      <Button
        variant="primary"
        onPress={handleGoToSettings}
        icon="settings-outline"
        accessibilityLabel="Zu den Einstellungen"
      >
        Einstellungen öffnen
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
