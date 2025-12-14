import { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { AboutSection } from '@/components/settings/AboutSection';
import { FrequencySelector } from '@/components/settings/FrequencySelector';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { WordCountSelector } from '@/components/settings/WordCountSelector';
import { WordTypeToggles } from '@/components/settings/WordTypeToggles';
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
import { clearTodaysWords } from '@/services/wordService';

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
        if (!__DEV__) {
          Sentry.captureException(err, {
            tags: { feature: 'settings_load' },
            level: 'error',
          });
        }
        Toast.show({
          type: 'error',
          text1: 'Fehler beim Laden',
          text2: 'Einstellungen konnten nicht geladen werden',
        });
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
      if (!__DEV__) {
        Sentry.captureException(err, {
          tags: { feature: 'settings_save' },
          level: 'error',
        });
      }
      Toast.show({
        type: 'error',
        text1: 'Fehler beim Speichern',
        text2: 'Einstellungen konnten nicht gespeichert werden',
      });
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
          Toast.show({
            type: 'success',
            text1: 'Benachrichtigungen aktiviert',
            text2: 'Du erhältst täglich eine Erinnerung',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Berechtigung erforderlich',
            text2: 'Bitte erlaube Benachrichtigungen in den Einstellungen',
          });
        }
      } catch (err) {
        if (!__DEV__) {
          Sentry.captureException(err, {
            tags: { feature: 'notification_enable' },
            level: 'error',
          });
        }
        Toast.show({
          type: 'error',
          text1: 'Fehler',
          text2: 'Benachrichtigungen konnten nicht aktiviert werden',
        });
      }
    } else {
      try {
        await cancelAllNotifications();
        void updateSettings({ ...settings, notificationsEnabled: false });
        Toast.show({
          type: 'success',
          text1: 'Benachrichtigungen deaktiviert',
        });
      } catch (err) {
        if (!__DEV__) {
          Sentry.captureException(err, {
            tags: { feature: 'notification_disable' },
            level: 'error',
          });
        }
        Toast.show({
          type: 'error',
          text1: 'Fehler',
          text2: 'Benachrichtigungen konnten nicht deaktiviert werden',
        });
      }
    }
  };

  const handleTimeChange = async (time: string) => {
    const newSettings = { ...settings, notificationTime: time };
    await updateSettings(newSettings);

    if (settings.notificationsEnabled) {
      try {
        await scheduleDailyNotification(time);
        Toast.show({
          type: 'success',
          text1: 'Zeit geändert',
          text2: `Benachrichtigung um ${time} Uhr`,
        });
      } catch (err) {
        if (!__DEV__) {
          Sentry.captureException(err, {
            tags: { feature: 'notification_time_change' },
            level: 'error',
          });
        }
        Toast.show({
          type: 'error',
          text1: 'Fehler',
          text2: 'Zeit konnte nicht geändert werden',
        });
      }
    }
  };

  const handleDevPremium = async () => {
    setDevGranting(true);
    try {
      await grantPremium('dev');
      Toast.show({
        type: 'success',
        text1: 'Premium aktiviert',
        text2: 'Dev-Premium wurde erfolgreich aktiviert',
      });
    } catch (err) {
      if (!__DEV__) {
        Sentry.captureException(err, {
          tags: { feature: 'dev_premium_grant' },
          level: 'error',
        });
      }
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: 'Premium konnte nicht aktiviert werden',
      });
    }
    setDevGranting(false);
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Test gesendet',
          text2: 'Benachrichtigung wurde erfolgreich gesendet',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Berechtigung erforderlich',
          text2: 'Bitte erlaube Benachrichtigungen in den Einstellungen',
        });
      }
    } catch (err) {
      if (!__DEV__) {
        Sentry.captureException(err, {
          tags: { feature: 'test_notification' },
          level: 'error',
        });
      }
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: 'Test-Benachrichtigung fehlgeschlagen',
      });
    }
    setTestingNotification(false);
  };

  const handleRefreshWords = async () => {
    setRefreshingWords(true);
    try {
      await clearTodaysWords();
      Toast.show({
        type: 'success',
        text1: 'Neue Wörter',
        text2: 'Gehe zur Startseite, um die neuen Wörter zu sehen',
      });
    } catch (err) {
      if (!__DEV__) {
        Sentry.captureException(err, {
          tags: { feature: 'word_refresh' },
          level: 'error',
        });
      }
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: 'Wörter konnten nicht zurückgesetzt werden',
      });
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
        <WordCountSelector value={settings.wordCount} onChange={handleWordCountChange} />

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
        <WordTypeToggles types={settings.wordTypes} onToggle={handleWordTypeToggle} />

        {/* Frequenzklasse */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Schwierigkeitsgrad</Text>
        <FrequencySelector value={settings.frequencyRange} onChange={handleFrequencyChange} />
      </CollapsibleSection>

      {/* Benachrichtigungen - nur außerhalb von Expo Go anzeigen */}
      {!isExpoGo() && (
        <CollapsibleSection title="Benachrichtigungen">
          <NotificationSettings
            enabled={settings.notificationsEnabled}
            time={settings.notificationTime}
            onToggle={handleNotificationToggle}
            onTimeChange={handleTimeChange}
            onTest={handleTestNotification}
            testingNotification={testingNotification}
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
        <AboutSection />
      </CollapsibleSection>
    </ScrollView>
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
});
