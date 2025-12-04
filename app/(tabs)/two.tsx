import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
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
  AppSettings,
  DEFAULT_SETTINGS,
  FrequencyRange,
  loadSettings,
  saveSettings,
} from '@/services/settingsService';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
            {(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const manifest = Updates.manifest as any;
              return (
                manifest?.extra?.expoClient?.extra?.updateMessage ??
                manifest?.extra?.updateMessage ??
                manifest?.message ??
                'Keine'
              );
            })()}
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
