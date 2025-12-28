import { useState } from 'react';

import { Platform, StyleSheet, Switch, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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

function timeStringToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function dateToTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function NotificationSettings({
  enabled,
  time,
  onToggle,
  onTimeChange,
  onTest,
  testingNotification,
}: NotificationSettingsProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Benachrichtigung aktivieren</Text>
        <Switch value={enabled} onValueChange={onToggle} />
      </View>

      {enabled && (
        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Uhrzeit</Text>

          <TouchableOpacity
            style={styles.timeDisplay}
            onPress={() => setShowTimePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`Benachrichtigungszeit ${time} Uhr`}
            accessibilityHint="Tippen um Zeit zu ändern"
          >
            <Ionicons name="time-outline" size={20} color="#007AFF" style={styles.timeIcon} />
            <Text style={styles.timeText}>{time} Uhr</Text>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={timeStringToDate(time)}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (event.type === 'set' && selectedDate) {
                  onTimeChange(dateToTimeString(selectedDate));
                }
              }}
            />
          )}

          {showTimePicker && Platform.OS === 'ios' && (
            <Button
              variant="primary"
              onPress={() => setShowTimePicker(false)}
              title="Fertig"
              accessibilityLabel="Zeitauswahl abschließen"
            />
          )}
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
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 8,
    marginBottom: 16,
  },
  timeIcon: {
    marginRight: 12,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});
