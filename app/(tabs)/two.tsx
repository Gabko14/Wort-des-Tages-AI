import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';

import Slider from '@react-native-community/slider';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { Button } from '@/components/Button';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { Text, View } from '@/components/Themed';
import {
  cancelAllNotifications,
  isExpoGo,
  scheduleDailyNotification,
  sendTestNotification,
} from '@/services/notificationService';
import { grantPremium } from '@/services/premiumService';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  FrequencyRange,
  loadSettings,
  saveSettings,
} from '@/services/settingsService';
import { getUpdateMessage } from '@/services/updateService';
import { clearTodaysWords } from '@/services/wordService';

const TIME_OPTIONS = ['07:00', '08:00', '09:00', '10:00', '12:00', '18:00', '20:00'];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [devGranting, setDevGranting] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [refreshingWords, setRefreshingWords] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((loaded) => {
        setSettings(loaded);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        Alert.alert('Fehler', 'Einstellungen konnten nicht geladen werden.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSaving(true);
    try {
      await saveSettings(newSettings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      Alert.alert('Fehler', 'Einstellungen konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }, []);

  const handleWordCountChange = (value: number) => {
    void updateSettings({ ...settings, wordCount: Math.round(value) });
  };

  const handleWordTypeToggle = (type: keyof AppSettings['wordTypes']) => {
    const newWordTypes = {
      ...settings.wordTypes,
      [type]: !settings.wordTypes[type],
    };
    const activeCount = Object.values(newWordTypes).filter(Boolean).length;
    if (activeCount === 0) return;
    void updateSettings({ ...settings, wordTypes: newWordTypes });
  };

  const handleFrequencyChange = (range: FrequencyRange) => {
    void updateSettings({ ...settings, frequencyRange: range });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const identifier = await scheduleDailyNotification(settings.notificationTime);
        if (identifier) {
          void updateSettings({ ...settings, notificationsEnabled: true });
        } else {
          Alert.alert(
            'Berechtigung erforderlich',
            'Bitte erlaube Benachrichtigungen in den Geräteeinstellungen.'
          );
        }
      } catch (err) {
        console.error('Failed to enable notifications:', err);
        Alert.alert('Fehler', 'Benachrichtigungen konnten nicht aktiviert werden.');
      }
    } else {
      try {
        await cancelAllNotifications();
        void updateSettings({ ...settings, notificationsEnabled: false });
      } catch (err) {
        console.error('Failed to disable notifications:', err);
        Alert.alert('Fehler', 'Benachrichtigungen konnten nicht deaktiviert werden.');
      }
    }
  };

  const handleTimeChange = async (time: string) => {
    const newSettings = { ...settings, notificationTime: time };
    await updateSettings(newSettings);

    if (settings.notificationsEnabled) {
      try {
        await scheduleDailyNotification(time);
      } catch (err) {
        console.error('Failed to reschedule notification:', err);
        Alert.alert('Fehler', 'Benachrichtigung konnte nicht aktualisiert werden.');
      }
    }
  };

  const handleDevPremium = async () => {
    setDevGranting(true);
    let success = false;
    try {
      success = await grantPremium('dev');
    } catch (err) {
      console.error('Failed to grant premium:', err);
    }
    setDevGranting(false);
    Alert.alert(
      success ? 'Premium aktiviert' : 'Fehler',
      success ? 'Dev-Premium wurde aktiviert.' : 'Premium konnte nicht aktiviert werden.'
    );
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    let success = false;
    try {
      success = await sendTestNotification();
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
    setTestingNotification(false);
    if (!success) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erlaube Benachrichtigungen in den Geräteeinstellungen.'
      );
    }
  };

  const handleRefreshWords = async () => {
    setRefreshingWords(true);
    try {
      await clearTodaysWords();
      Alert.alert(
        'Neue Wörter',
        'Die Wörter des Tages wurden zurückgesetzt. Gehe zur Startseite, um die neuen Wörter zu sehen.'
      );
    } catch (err) {
      console.error('Failed to refresh words:', err);
      Alert.alert('Fehler', 'Wörter konnten nicht aktualisiert werden.');
    }
    setRefreshingWords(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Einstellungen</Text>
        {saving && <Text style={styles.savingText}>Speichern...</Text>}
      </View>

      {/* Anzahl der Wörter */}
      <CollapsibleSection title="Worteinstellungen" defaultExpanded>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={settings.wordCount}
            onSlidingComplete={handleWordCountChange}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#ccc"
          />
          <Text style={styles.sliderValue}>{settings.wordCount}</Text>
        </View>

        <Button
          variant="secondary"
          onPress={handleRefreshWords}
          title={refreshingWords ? 'Aktualisiere...' : 'Neue Wörter generieren'}
          loading={refreshingWords}
          disabled={refreshingWords}
          icon="refresh-outline"
          accessibilityLabel="Neue Wörter generieren"
          accessibilityHint="Setzt die aktuellen Wörter zurück und generiert neue"
        />
        <Text style={styles.sectionHint}>Setzt die aktuellen Wörter zurück und generiert neue</Text>

        {/* Wortarten */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Wortarten</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Substantive</Text>
          <Switch
            value={settings.wordTypes.substantiv}
            onValueChange={() => handleWordTypeToggle('substantiv')}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Verben</Text>
          <Switch
            value={settings.wordTypes.verb}
            onValueChange={() => handleWordTypeToggle('verb')}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Adjektive</Text>
          <Switch
            value={settings.wordTypes.adjektiv}
            onValueChange={() => handleWordTypeToggle('adjektiv')}
          />
        </View>

        {/* Frequenzklasse */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Schwierigkeitsgrad</Text>
        <Text style={styles.sectionHint}>
          Seltene Wörter sind schwieriger, häufige Wörter einfacher
        </Text>
        <View style={styles.frequencyButtons}>
          <FrequencyButton
            label="Selten"
            selected={settings.frequencyRange === 'selten'}
            onPress={() => handleFrequencyChange('selten')}
          />
          <FrequencyButton
            label="Mittel"
            selected={settings.frequencyRange === 'mittel'}
            onPress={() => handleFrequencyChange('mittel')}
          />
          <FrequencyButton
            label="Häufig"
            selected={settings.frequencyRange === 'haeufig'}
            onPress={() => handleFrequencyChange('haeufig')}
          />
        </View>
      </CollapsibleSection>

      {/* Benachrichtigungen - nur außerhalb von Expo Go anzeigen */}
      {!isExpoGo() && (
        <CollapsibleSection title="Benachrichtigungen">
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Benachrichtigung aktivieren</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
            />
          </View>

          {settings.notificationsEnabled && (
            <View style={styles.timeSection}>
              <Text style={styles.timeSectionLabel}>Uhrzeit</Text>
              <View style={styles.timeButtons}>
                {TIME_OPTIONS.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      settings.notificationTime === time && styles.timeButtonSelected,
                    ]}
                    onPress={() => handleTimeChange(time)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        settings.notificationTime === time && styles.timeButtonTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Button
            variant="secondary"
            onPress={handleTestNotification}
            title={testingNotification ? 'Sende...' : 'Testbenachrichtigung senden'}
            loading={testingNotification}
            disabled={testingNotification}
            icon="notifications-outline"
            accessibilityLabel="Testbenachrichtigung senden"
          />
        </CollapsibleSection>
      )}

      {/* TODO (Play Store Release) #60: Hide this section in production builds
          Replace with: {__DEV__ && ( <View>...</View> )}

          Also consider adding a "Revoke Premium" button for testing:
          - Add revokePremium() to premiumService.ts that clears the entitlement
          - Useful for verifying PaywallTeaser works correctly
      */}
      <CollapsibleSection title="Premium (Dev)">
        <Button
          variant="primary"
          onPress={handleDevPremium}
          title={devGranting ? 'Aktiviere...' : 'Premium aktivieren (Dev)'}
          loading={devGranting}
          disabled={devGranting}
          icon="star-outline"
          accessibilityLabel="Premium für Entwicklung aktivieren"
        />
      </CollapsibleSection>

      {/* Über die App */}
      <CollapsibleSection title="Über die App">
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>{Constants.expoConfig?.version ?? '?'}</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Update-ID</Text>
          <Text style={styles.aboutValue}>{Updates.updateId?.slice(0, 7) ?? 'dev'}</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Channel</Text>
          <Text style={styles.aboutValue}>{Updates.channel ?? 'development'}</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Erstellt</Text>
          <Text style={styles.aboutValue}>
            {Updates.createdAt
              ? Updates.createdAt.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'N/A'}
          </Text>
        </View>
        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.aboutLabel}>Nachricht</Text>
          <Text style={[styles.aboutValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
            {getUpdateMessage()}
          </Text>
        </View>
      </CollapsibleSection>
    </ScrollView>
  );
}

function FrequencyButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.frequencyButton, selected && styles.frequencyButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.frequencyButtonText, selected && styles.frequencyButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  savingText: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
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
  frequencyButtons: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  frequencyButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyButtonTextSelected: {
    color: '#fff',
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
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'transparent',
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
    fontSize: 16,
    opacity: 0.6,
  },
});
