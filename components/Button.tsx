import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconPosition = 'left' | 'right';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: IconPosition;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link';
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.button,
    styles[`${variant}Button`],
    isDisabled && styles.disabledButton,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const iconColor = getIconColor(variant, isDisabled);
  const iconSize = 20;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [...containerStyle, pressed && !isDisabled && styles.pressedButton]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#fff' : '#007AFF'}
            style={styles.loader}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
            )}
            <Text style={textStyle}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}

function getIconColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) {
    return '#6c757d';
  }

  switch (variant) {
    case 'primary':
      return '#fff';
    case 'danger':
      return '#fff';
    case 'secondary':
      return '#007AFF';
    case 'ghost':
      return '#007AFF';
    default:
      return '#007AFF';
  }
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Primary variant
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryText: {
    color: '#fff',
  },

  // Secondary variant (outline)
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryText: {
    color: '#007AFF',
  },

  // Ghost variant (text only)
  ghostButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ghostText: {
    color: '#007AFF',
  },

  // Danger variant
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerText: {
    color: '#fff',
  },

  // States
  pressedButton: {
    opacity: 0.7,
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
    borderColor: '#adb5bd',
  },
  disabledText: {
    color: '#fff',
    opacity: 0.8,
  },
});
