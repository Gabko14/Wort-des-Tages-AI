import { useState } from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { FrequencyRange } from '@/services/settingsService';

interface FrequencySelectorProps {
  value: FrequencyRange[];
  onToggle: (range: FrequencyRange) => void;
}

export function FrequencySelector({ value, onToggle }: FrequencySelectorProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Schwierigkeitsgrad</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowInfo(!showInfo)}
          accessibilityRole="button"
          accessibilityLabel="Informationen zum Schwierigkeitsgrad"
          accessibilityHint={
            showInfo ? 'Tippen um Details zu verbergen' : 'Tippen um Details anzuzeigen'
          }
        >
          <Ionicons
            name={showInfo ? 'information-circle' : 'information-circle-outline'}
            size={20}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {showInfo && (
        <Text style={styles.hint}>
          Die Frequenzklasse gibt an, wie oft ein Wort in der deutschen Sprache verwendet wird:
          {'\n\n'}• Selten (0-1): Sehr seltene, anspruchsvolle Wörter{'\n'}• Mittel (2-3):
          Bildungssprache und Literatur{'\n'}• Häufig (4-6): Alltägliche, häufig verwendete Wörter
        </Text>
      )}

      <View style={styles.buttons}>
        <FrequencyButton
          label="Selten (0-1)"
          selected={value.includes('selten')}
          onPress={() => onToggle('selten')}
        />
        <FrequencyButton
          label="Mittel (2-3)"
          selected={value.includes('mittel')}
          onPress={() => onToggle('mittel')}
        />
        <FrequencyButton
          label="Häufig (4-6)"
          selected={value.includes('haeufig')}
          onPress={() => onToggle('haeufig')}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  hint: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonTextSelected: {
    color: '#fff',
  },
});
