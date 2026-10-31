/**
 * Tombol reusabel dengan varian warna, ukuran, & state loading.
 * Varian mengikuti design system (Figma Blume): primary = pink (CTA utama),
 * secondary = teal (aksi sekunder/disabled), outline = putih border teal gelap,
 * danger = merah lembut (severity moderate).
 *
 * @format
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'default' | 'large' | 'pill';

interface ButtonProps extends PressableProps {
  /** Teks di dalam tombol. */
  title: string;
  /** Varian visual tombol. Default: 'primary'. */
  variant?: ButtonVariant;
  /** Ukuran tombol. Default: 'default'. */
  size?: ButtonSize;
  /** Saat true, tampilkan spinner & tolak interaksi. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BG_COLOR: Record<ButtonVariant, string> = {
  primary: Colors.primary,
  secondary: Colors.secondary,
  outline: Colors.white,
  danger: Colors.severityModerateBg,
};

const BG_PRESSED_COLOR: Record<ButtonVariant, string> = {
  primary: Colors.primaryPressed,
  secondary: Colors.secondaryPressed,
  outline: Colors.surfaceSoft,
  danger: Colors.severityModerateBg,
};

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: Colors.textOnPrimary,
  secondary: Colors.textOnAccent,
  outline: Colors.textLink,
  danger: Colors.severityModerateText,
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        size === 'large' && styles.large,
        size === 'pill' && styles.pill,
        { backgroundColor: BG_COLOR[variant] },
        variant === 'outline' && styles.outlineBorder,
        pressed && !isDisabled && { backgroundColor: BG_PRESSED_COLOR[variant] },
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.textSecondary} />
      ) : (
        <Text
          style={[
            styles.text,
            size === 'large' && styles.textLarge,
            size === 'pill' && styles.textPill,
            {
              color: TEXT_COLOR[variant],
              opacity: isDisabled ? 0.5 : 1,
            } as TextStyle,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  large: {
    minHeight: 70,
    height: 70,
    paddingHorizontal: Spacing.xl,
  },
  pill: {
    minHeight: 42,
    height: 42,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: Colors.textLink,
  },
  disabled: {
    backgroundColor: Colors.primaryDisabled,
    borderWidth: 0.5,
    borderColor: Colors.teal,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  textPill: {
    fontSize: 13,
    fontWeight: '600',
  },
});
