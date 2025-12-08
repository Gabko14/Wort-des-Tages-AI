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

import { Text, View } from '@/components/Themed';
import {
  cancelAllNotifications,
  scheduleDailyNotification,
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

const TIME_OPTIONS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '12:00',
  '18:00',
  '20:00',
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [devGranting, setDevGranting] = useState(false);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSaving(true);
    await saveSettings(newSettings);
    setSaving(false);
  }, []);

  const handleWordCountChange = (value: number) => {
    updateSettings({ ...settings, wordCount: Math.round(value) });
  };

  const handleWordTypeToggle = (type: keyof AppSettings['wordTypes']) => {
    const newWordTypes = {
      ...settings.wordTypes,
      [type]: !settings.wordTypes[type],
    };
    const activeCount = Object.values(newWordTypes).filter(Boolean).length;
    if (activeCount === 0) return;
    updateSettings({ ...settings, wordTypes: newWordTypes });
  };

  const handleFrequencyChange = (range: FrequencyRange) => {
    updateSettings({ ...settings, frequencyRange: range });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const identifier = await scheduleDailyNotification(
        settings.notificationTime
      );
      if (identifier) {
        updateSettings({ ...settings, notificationsEnabled: true });
      } else {
        Alert.alert(
          'Berechtigung erforderlich',
          'Bitte erlaube Benachrichtigungen in den Geräteeinstellungen.'
        );
      }
    } else {
      await cancelAllNotifications();
      updateSettings({ ...settings, notificationsEnabled: false });
    }
  };

  const handleTimeChange = async (time: string) => {
    const newSettings = { ...settings, notificationTime: time };
    await updateSettings(newSettings);

    if (settings.notificationsEnabled) {
      await scheduleDailyNotification(time);
    }
  };

  const handleDevPremium = async () => {
    setDevGranting(true);
    const success = await grantPremium('dev');
    setDevGranting(false);
    Alert.alert(
      success ? 'Premium aktiviert' : 'Fehler',
      success
        ? 'Dev-Premium wurde aktiviert.'
        : 'Premium konnte nicht aktiviert werden.'
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Einstellungen</Text>
        {saving && <Text style={styles.savingText}>Speichern...</Text>}
      </View>

      {/* Anzahl der Wörter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anzahl der täglichen Wörter</Text>
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
      </View>

      {/* Wortarten */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wortarten</Text>
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
      </View>

      {/* Frequenzklasse */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schwierigkeitsgrad</Text>
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
      </View>

      {/* Benachrichtigungen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tägliche Erinnerung</Text>
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
                    settings.notificationTime === time &&
                      styles.timeButtonSelected,
                  ]}
                  onPress={() => handleTimeChange(time)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      settings.notificationTime === time &&
                        styles.timeButtonTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium (Dev)</Text>
        <TouchableOpacity
          style={styles.devButton}
          onPress={handleDevPremium}
          disabled={devGranting}
        >
          <Text style={styles.devButtonText}>
            {devGranting ? 'Aktiviere...' : 'Premium aktivieren (Dev)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Über die App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Über die App</Text>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>
            {Constants.expoConfig?.version ?? '?'}
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Update-ID</Text>
          <Text style={styles.aboutValue}>
            {Updates.updateId?.slice(0, 7) ?? 'dev'}
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Channel</Text>
          <Text style={styles.aboutValue}>
            {Updates.channel ?? 'development'}
          </Text>
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
          <Text
            style={[styles.aboutValue, { flex: 1, textAlign: 'right' }]}
            numberOfLines={2}
          >
            {getUpdateMessage()}
          </Text>
        </View>
      </View>
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
      style={[
        styles.frequencyButton,
        selected && styles.frequencyButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.frequencyButtonText,
          selected && styles.frequencyButtonTextSelected,
        ]}
      >
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
  devButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
