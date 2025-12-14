import { TouchableOpacity, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

type PaywallTeaserProps = {
  onPress: () => void;
};

export function PaywallTeaser({ onPress }: PaywallTeaserProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium-Feature</Text>
      <Text style={styles.text}>Schalte Premium frei, um KI-Aufgaben und Beispiele zu sehen.</Text>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Premium freischalten</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    borderColor: 'rgba(128,128,128,0.3)',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    opacity: 0.8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
