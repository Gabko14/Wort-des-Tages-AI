import { StyleSheet } from 'react-native';

import Slider from '@react-native-community/slider';

import { Text, View } from '@/components/Themed';

interface WordCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function WordCountSelector({ value, onChange }: WordCountSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={value}
          onSlidingComplete={onChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
        />
        <Text style={styles.sliderValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
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
});
