import { StyleSheet, Switch } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AppSettings } from '@/services/settingsService';

interface WordTypeTogglesProps {
  types: AppSettings['wordTypes'];
  onToggle: (type: keyof AppSettings['wordTypes']) => void;
}

export function WordTypeToggles({ types, onToggle }: WordTypeTogglesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Substantive</Text>
        <Switch value={types.substantiv} onValueChange={() => onToggle('substantiv')} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Verben</Text>
        <Switch value={types.verb} onValueChange={() => onToggle('verb')} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Adjektive</Text>
        <Switch value={types.adjektiv} onValueChange={() => onToggle('adjektiv')} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Mehrwortausdrücke</Text>
        <Switch value={types.mehrwortausdruck} onValueChange={() => onToggle('mehrwortausdruck')} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Adverbien</Text>
        <Switch value={types.adverb} onValueChange={() => onToggle('adverb')} />
      </View>
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
});
