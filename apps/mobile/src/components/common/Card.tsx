/**
 * Card reusabel sebagai wadah konten dengan elevation.
 * Bisa dibuat clickable dengan prop `onPress`.
 *
 * @format
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors, Shadows, Spacing } from '../../utils/constants';

interface CardProps {
  children: React.ReactNode;
  /** Jika diisi, card menjadi Pressable. */
  onPress?: () => void;
  /** Radius sudut kustom (mis. 32 untuk section/history card). Default: 16. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  radius = 16,
  style,
}) => {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { borderRadius: radius },
          pressed && styles.pressed,
          style,
        ]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, { borderRadius: radius }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
});
