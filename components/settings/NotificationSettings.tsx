import { StyleSheet, Switch, TouchableOpacity } from 'react-native';

import { Button } from '@/components/Button';
import { Text, View } from '@/components/Themed';

interface NotificationSettingsProps {
  enabled: boolean;
  time: string;
  onToggle: (enabled: boolean) => Promise<void>;
  onTimeChange: (time: string) => void;
  onTest: () => Promise<void>;
  testingNotification: boolean;
}

const TIME_OPTIONS = ['07:00', '08:00', '09:00', '10:00', '12:00', '18:00', '20:00'];

export function NotificationSettings({
  enabled,
  time,
  onToggle,
  onTimeChange,
  onTest,
  testingNotification,
}: NotificationSettingsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Benachrichtigung aktivieren</Text>
        <Switch value={enabled} onValueChange={onToggle} />
      </View>

      {enabled && (
        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Uhrzeit</Text>
          <View style={styles.timeButtons}>
            {TIME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.timeButton, time === option && styles.timeButtonSelected]}
                onPress={() => onTimeChange(option)}
              >
                <Text
                  style={[styles.timeButtonText, time === option && styles.timeButtonTextSelected]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Button
        variant="secondary"
        onPress={onTest}
        title={testingNotification ? 'Sende...' : 'Testbenachrichtigung senden'}
        loading={testingNotification}
        disabled={testingNotification}
        icon="notifications-outline"
        accessibilityLabel="Testbenachrichtigung senden"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'transparent',
  },
  toggleLabel: {
    fontSize: 16,
  },
  timeSection: {
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  timeSectionLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  timeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'transparent',
  },
  timeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeButtonText: {
    fontSize: 14,
  },
  timeButtonTextSelected: {
    color: '#fff',
  },
});
