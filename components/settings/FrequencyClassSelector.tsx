import { StyleSheet, Switch } from 'react-native';

import { Text, View } from '@/components/Themed';
import { FrequencyClass } from '@/services/settingsService';

interface FrequencyClassSelectorProps {
  value: FrequencyClass[];
  onToggle: (cls: FrequencyClass) => void;
}

interface ClassInfo {
  label: string;
  description: string;
  examples: string;
  quality: string;
}

const CLASS_INFO: Record<FrequencyClass, ClassInfo> = {
  '0': {
    label: 'Klasse 0',
    description: '~100.000 Wörter, fast nur Fachbegriffe',
    examples: '"Brinellhärte", "Superpelliceum", "Tosbecken"',
    quality: 'Weniger als 5% brauchbar',
  },
  '1': {
    label: 'Klasse 1',
    description: '~70.000 Wörter, viele Komposita',
    examples: '"Marmeladenbrot", "Kapitänsmütze", "Besserverdiener"',
    quality: 'Etwa 10-15% Perlen, Rest Nischenwörter',
  },
  '2': {
    label: 'Klasse 2',
    description: '~36.000 Wörter, gehobene Sprache',
    examples: '"erlesen", "allmächtig", "landläufig", "Kollaps"',
    quality: 'Etwa 50-60% starke Wörter',
  },
  '3': {
    label: 'Klasse 3',
    description: '~9.500 Wörter, solide Vokabeln',
    examples: '"diskret", "Unmut", "predigen", "verwechseln"',
    quality: 'Etwa 60-70% nützlich, teils bekannt',
  },
  '4': {
    label: 'Klasse 4',
    description: '~2.000 Wörter, geläufig',
    examples: '"täglich", "schwarz", "ruhig", "schwierig"',
    quality: 'Meist schon bekannt',
  },
  '5': {
    label: 'Klasse 5',
    description: '~200 Wörter, sehr häufig',
    examples: '"gehen", "Stadt", "Tag", "Euro"',
    quality: 'Bereits beherrscht',
  },
  '6': {
    label: 'Klasse 6',
    description: '~45 Wörter, Funktionswörter',
    examples: '"an", "bei", "für", "ich"',
    quality: 'Präpositionen, Pronomen',
  },
};

export function FrequencyClassSelector({ value, onToggle }: FrequencyClassSelectorProps) {
  const classes: FrequencyClass[] = ['0', '1', '2', '3', '4', '5', '6'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequenzklassen</Text>
      <Text style={styles.subtitle}>Je höher die Klasse, desto häufiger das Wort</Text>

      {classes.map((cls) => {
        const info = CLASS_INFO[cls];
        const isSelected = value.includes(cls);
        const isRecommended = cls === '2' || cls === '3';

        return (
          <View key={cls} style={styles.classRow}>
            <View style={styles.classInfo}>
              <View style={styles.labelRow}>
                <Text style={[styles.classLabel, !isRecommended && styles.notRecommended]}>
                  {info.label}
                </Text>
                {isRecommended && <Text style={styles.recommendedBadge}>empfohlen</Text>}
              </View>
              <Text style={styles.classDescription}>{info.description}</Text>
              <Text style={styles.classQuality}>{info.quality}</Text>
              <Text style={styles.classExamples}>{info.examples}</Text>
            </View>
            <Switch value={isSelected} onValueChange={() => onToggle(cls)} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.5,
    marginBottom: 16,
  },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
    backgroundColor: 'transparent',
  },
  classInfo: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  classLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  recommendedBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  notRecommended: {
    opacity: 0.5,
  },
  classDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  classQuality: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
    fontWeight: '500',
  },
  classExamples: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
