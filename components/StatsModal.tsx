import { Modal, Pressable, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text, View, useThemeColor } from '@/components/Themed';
import type { StreakData } from '@/types/gamification';

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  streak: StreakData;
  completedToday: boolean;
}

export function StatsModal({ visible, onClose, streak, completedToday }: StatsModalProps) {
  const bgColor = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
  const mutedColor = useThemeColor({ light: '#666666', dark: '#999999' }, 'text');
  const accentColor = useThemeColor({ light: '#e65100', dark: '#ffb74d' }, 'text');
  const overlayColor = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.5)', dark: 'rgba(0, 0, 0, 0.7)' },
    'background'
  );

  const { currentStreak, longestStreak } = streak;
  const isNewRecord = currentStreak === longestStreak && currentStreak > 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: overlayColor }]} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: bgColor }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Statistiken</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={mutedColor} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={[styles.mainCard, { backgroundColor: cardBg }]}>
              <Ionicons
                name={completedToday ? 'flame' : 'flame-outline'}
                size={48}
                color={completedToday ? '#ff6b35' : mutedColor}
              />
              <Text style={[styles.mainNumber, { color: accentColor }]}>{currentStreak}</Text>
              <Text style={[styles.mainLabel, { color: mutedColor }]}>
                {currentStreak === 1 ? 'Tag in Folge' : 'Tage in Folge'}
              </Text>
              {isNewRecord && (
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <Text style={styles.badgeText}>Neuer Rekord!</Text>
                </View>
              )}
            </View>

            <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: mutedColor }]}>Längste Serie</Text>
                <Text style={[styles.statValue, { color: textColor }]}>
                  {longestStreak} {longestStreak === 1 ? 'Tag' : 'Tage'}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: mutedColor }]} />

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: mutedColor }]}>Heute abgeschlossen</Text>
                <View style={styles.statusContainer}>
                  <Ionicons
                    name={completedToday ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={completedToday ? '#4caf50' : mutedColor}
                  />
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {completedToday ? 'Ja' : 'Nein'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {!completedToday && currentStreak > 0 && (
            <View style={[styles.reminderCard, { backgroundColor: cardBg }]}>
              <Ionicons name="information-circle-outline" size={20} color={accentColor} />
              <Text style={[styles.reminderText, { color: mutedColor }]}>
                Absolviere heute ein Quiz, um deine Serie fortzusetzen!
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  content: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  mainCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    gap: 8,
  },
  mainNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  mainLabel: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    opacity: 0.2,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
