import { StyleSheet } from 'react-native';

import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { Text, View } from '@/components/Themed';
import { getUpdateMessage } from '@/services/updateService';

export function AboutSection() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Version</Text>
        <Text style={styles.value}>{Constants.expoConfig?.version ?? '?'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Update-ID</Text>
        <Text style={styles.value}>{Updates.updateId?.slice(0, 7) ?? 'dev'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Channel</Text>
        <Text style={styles.value}>{Updates.channel ?? 'development'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Erstellt</Text>
        <Text style={styles.value}>
          {Updates.createdAt
            ? Updates.createdAt.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'N/A'}
        </Text>
      </View>
      <View style={[styles.row, { borderBottomWidth: 0 }]}>
        <Text style={styles.label}>Nachricht</Text>
        <Text style={[styles.value, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
          {getUpdateMessage()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    opacity: 0.6,
  },
});
