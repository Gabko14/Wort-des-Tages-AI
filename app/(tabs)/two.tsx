import { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, Linking, ScrollView, StyleSheet } from 'react-native';

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { CollapsibleSection } from '@/components/CollapsibleSection';
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
import { checkPremiumStatus, getCachedPremiumStatus } from '@/services/premiumService';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  FrequencyRange,
} from '@/services/settingsService';
import { clearTodaysWords } from '@/services/wordService';
import { PremiumStatus } from '@/types/premium';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(
    getCachedPremiumStatus()
  );
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    // Load premium status
    checkPremiumStatus()
      .then((status) => setPremiumStatus(status))
      .catch(() => {
        // Ignore errors, use cached status
      });
  }, []);

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

  // For word-affecting settings: clear today's words so they regenerate
  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSaving(true);
    try {
      await clearTodaysWords();
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

  // For notification settings that don't affect word generation
  const updateNotificationSettings = useCallback(async (newSettings: AppSettings) => {
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

  const handleFrequencyToggle = (range: FrequencyRange) => {
    const current = settings.frequencyRanges;
    const isSelected = current.includes(range);

    if (isSelected && current.length === 1) {
      return;
    }

    const newRanges = isSelected ? current.filter((r) => r !== range) : [...current, range];
    void updateSettings({ ...settings, frequencyRanges: newRanges });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        const identifier = await scheduleDailyNotification(settings.notificationTime);
        if (identifier) {
          void updateNotificationSettings({ ...settings, notificationsEnabled: true });
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
        void updateNotificationSettings({ ...settings, notificationsEnabled: false });
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
    await updateNotificationSettings(newSettings);

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

  const handleManageSubscription = () => {
    // Open Google Play subscription management
    Linking.openURL('https://play.google.com/store/account/subscriptions').catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Fehler',
        text2: 'Play Store konnte nicht geöffnet werden',
      });
    });
  };

  const handleUpgradePremium = () => {
    router.push('/subscription');
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

        {/* Wortarten */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Wortarten</Text>
        <WordTypeToggles types={settings.wordTypes} onToggle={handleWordTypeToggle} />

        {/* Frequenzklasse */}
        <View style={{ marginTop: 24, backgroundColor: 'transparent' }}>
          <FrequencySelector value={settings.frequencyRanges} onToggle={handleFrequencyToggle} />
        </View>
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

      <CollapsibleSection title="Premium">
        {premiumStatus?.isPremium ? (
          <>
            <View style={styles.premiumStatus}>
              <Text style={styles.premiumStatusText}>Premium aktiv</Text>
              {premiumStatus.source === 'google_play' && premiumStatus.expiresAt && (
                <Text style={styles.premiumExpiryText}>
                  {premiumStatus.autoRenewing
                    ? `Verlängert sich am ${new Date(premiumStatus.expiresAt).toLocaleDateString('de-DE')}`
                    : `Läuft ab am ${new Date(premiumStatus.expiresAt).toLocaleDateString('de-DE')}`}
                </Text>
              )}
              {premiumStatus.source === 'dev' && (
                <Text style={styles.premiumExpiryText}>Entwickler-Modus</Text>
              )}
            </View>
            {premiumStatus.source === 'google_play' && (
              <Button
                variant="secondary"
                onPress={handleManageSubscription}
                title="Abonnement verwalten"
                icon="open-outline"
                accessibilityLabel="Abonnement im Play Store verwalten"
              />
            )}
          </>
        ) : (
          <>
            <Text style={styles.premiumPromoText}>
              Schalte KI-Definitionen, Beispielsätze und Quizfragen frei.
            </Text>
            <Button
              variant="primary"
              onPress={handleUpgradePremium}
              title="Premium freischalten"
              icon="star-outline"
              accessibilityLabel="Premium-Abonnement abschließen"
            />
          </>
        )}
      </CollapsibleSection>

      <View style={styles.versionFooter}>
        <Text style={styles.versionText}>Version {Constants.expoConfig?.version ?? '?'}</Text>
        <Text style={styles.attributionText}>
          Wortdaten: DWDS – Digitales Wörterbuch der deutschen Sprache
        </Text>
        <Text style={styles.attributionLink} onPress={() => Linking.openURL('https://www.dwds.de')}>
          www.dwds.de
        </Text>
        <Text style={styles.licenseText}>Lizenziert unter CC BY-SA 4.0</Text>
      </View>
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
  premiumStatus: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  premiumStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  premiumExpiryText: {
    fontSize: 14,
    opacity: 0.7,
  },
  premiumPromoText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'transparent',
  },
  versionText: {
    fontSize: 12,
    opacity: 0.4,
  },
  attributionText: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 12,
    textAlign: 'center',
  },
  attributionLink: {
    fontSize: 11,
    opacity: 0.5,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  licenseText: {
    fontSize: 10,
    opacity: 0.4,
    marginTop: 4,
  },
});
