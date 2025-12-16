import { ColorSchemeName, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BaseToastProps } from 'react-native-toast-message';

/**
 * Custom toast configuration matching app's design system.
 * Uses same styling as WordCard: rounded corners, shadows, themed colors.
 *
 * @param colorScheme - Current color scheme ('light' or 'dark'), passed from the root layout
 * @returns Toast configuration object compatible with react-native-toast-message
 */
export const createToastConfig = (colorScheme: ColorSchemeName) => ({
  success: (props: BaseToastProps) => {
    const isDark = colorScheme === 'dark';

    return (
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
            borderLeftColor: '#28a745',
            shadowColor: isDark ? '#000' : '#000',
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={24} color="#28a745" style={styles.icon} />
        <View style={styles.textContainer}>
          {props.text1 ? (
            <Text
              style={[styles.text1, { color: isDark ? '#fff' : '#000' }]}
              numberOfLines={2}
            >
              {props.text1}
            </Text>
          ) : null}
          {props.text2 ? (
            <Text
              style={[styles.text2, { color: isDark ? '#adb5bd' : '#6c757d' }]}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },

  error: (props: BaseToastProps) => {
    const isDark = colorScheme === 'dark';

    return (
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
            borderLeftColor: '#dc3545',
            shadowColor: isDark ? '#000' : '#000',
          },
        ]}
      >
        <Ionicons name="alert-circle" size={24} color="#dc3545" style={styles.icon} />
        <View style={styles.textContainer}>
          {props.text1 ? (
            <Text
              style={[styles.text1, { color: isDark ? '#fff' : '#000' }]}
              numberOfLines={2}
            >
              {props.text1}
            </Text>
          ) : null}
          {props.text2 ? (
            <Text
              style={[styles.text2, { color: isDark ? '#adb5bd' : '#6c757d' }]}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },

  info: (props: BaseToastProps) => {
    const isDark = colorScheme === 'dark';

    return (
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
            borderLeftColor: isDark ? '#4da6ff' : '#2f95dc',
            shadowColor: isDark ? '#000' : '#000',
          },
        ]}
      >
        <Ionicons
          name="information-circle"
          size={24}
          color={isDark ? '#4da6ff' : '#2f95dc'}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          {props.text1 ? (
            <Text
              style={[styles.text1, { color: isDark ? '#fff' : '#000' }]}
              numberOfLines={2}
            >
              {props.text1}
            </Text>
          ) : null}
          {props.text2 ? (
            <Text
              style={[styles.text2, { color: isDark ? '#adb5bd' : '#6c757d' }]}
              numberOfLines={2}
            >
              {props.text2}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },
});

const styles = StyleSheet.create({
  toastContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 0,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});
