import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { Text, View, useThemeColor } from '@/components/Themed';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  FrequencyRange,
  loadSettings,
  saveSettings,
  ThemeMode,
} from '@/services/settingsService';
import { useTheme } from '@/context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import {
  cancelAllNotifications,
  scheduleDailyNotification,
} from '@/services/notificationService';
import { regenerateWords } from '@/services/wordService';

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
  const { setThemeMode, themeMode } = useTheme();

  // Load settings on mount, but override themeMode with context value to keep in sync
  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setLoading(false);
    });
  }, []);

  // Sync settings state with context themeMode
  useEffect(() => {
    setSettings((prev) => ({ ...prev, themeMode }));
  }, [themeMode]);

  const updateSettings = useCallback(
    async (newSettings: AppSettings, shouldRegenerateWords = false) => {
      setSettings(newSettings);
      setSaving(true);
      await saveSettings(newSettings);

      if (shouldRegenerateWords) {
        await regenerateWords();
      }

      setSaving(false);
    },
    []
  );

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    // We don't call updateSettings here because setThemeMode handles persistence
    // and the effect above will sync the local state
  };

  const handleWordCountChange = (value: number) => {
    updateSettings({ ...settings, wordCount: Math.round(value) }, true);
  };

  const handleWordTypeToggle = (type: keyof AppSettings['wordTypes']) => {
    const newWordTypes = {
      ...settings.wordTypes,
      [type]: !settings.wordTypes[type],
    };
    const activeCount = Object.values(newWordTypes).filter(Boolean).length;
    if (activeCount === 0) return;
    updateSettings({ ...settings, wordTypes: newWordTypes }, true);
  };

  const handleFrequencyChange = (range: FrequencyRange) => {
    updateSettings({ ...settings, frequencyRange: range }, true);
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
          'Nicht verfügbar',
          'Benachrichtigungen sind in Expo Go nicht verfügbar. Bitte verwende einen Development Build für diese Funktion.'
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

      {/* Design */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Design</Text>
        <ThemeContainer>
          <ThemeButton
            label="Hell"
            icon="sun-o"
            selected={settings.themeMode === 'light'}
            onPress={() => handleThemeChange('light')}
          />
          <ThemeButton
            label="Auto"
            icon="mobile"
            selected={settings.themeMode === 'system'}
            onPress={() => handleThemeChange('system')}
          />
          <ThemeButton
            label="Dunkel"
            icon="moon-o"
            selected={settings.themeMode === 'dark'}
            onPress={() => handleThemeChange('dark')}
          />
        </ThemeContainer>
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

function ThemeContainer({ children }: { children: React.ReactNode }) {
  const backgroundColor = useThemeColor(
    { light: '#f0f0f0', dark: '#1c1c1e' },
    'background'
  );
  return (
    <View style={[styles.themeContainer, { backgroundColor }]}>{children}</View>
  );
}

function ThemeButton({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  const iconColor = useThemeColor(
    { light: selected ? '#fff' : '#666', dark: selected ? '#fff' : '#aaa' },
    'text'
  );
  const textColor = useThemeColor(
    { light: selected ? '#fff' : '#666', dark: selected ? '#fff' : '#aaa' },
    'text'
  );

  return (
    <TouchableOpacity
      style={[styles.themeButton, selected && styles.themeButtonSelected]}
      onPress={onPress}
    >
      <FontAwesome
        name={icon}
        size={24}
        color={iconColor}
        style={{ marginBottom: 4 }}
      />
      <Text
        style={[
          styles.themeButtonText,
          { color: textColor },
          selected && styles.themeButtonTextSelected,
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
  themeContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  themeButtonSelected: {
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  themeButtonTextSelected: {
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
});
