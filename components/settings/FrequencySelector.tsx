import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { FrequencyRange } from '@/services/settingsService';

interface FrequencySelectorProps {
  value: FrequencyRange;
  onChange: (range: FrequencyRange) => void;
}

export function FrequencySelector({ value, onChange }: FrequencySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Seltene Wörter sind schwieriger, häufige Wörter einfacher</Text>
      <View style={styles.buttons}>
        <FrequencyButton
          label="Selten"
          selected={value === 'selten'}
          onPress={() => onChange('selten')}
        />
        <FrequencyButton
          label="Mittel"
          selected={value === 'mittel'}
          onPress={() => onChange('mittel')}
        />
        <FrequencyButton
          label="Häufig"
          selected={value === 'haeufig'}
          onPress={() => onChange('haeufig')}
        />
      </View>
    </View>
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
    <TouchableOpacity style={[styles.button, selected && styles.buttonSelected]} onPress={onPress}>
      <Text style={[styles.buttonText, selected && styles.buttonTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  hint: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextSelected: {
    color: '#fff',
  },
});
