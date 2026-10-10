/**
 * Tombol reusabel dengan varian warna & state loading.
 *
 * @format
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  /** Teks di dalam tombol. */
  title: string;
  /** Varian visual tombol. Default: 'primary'. */
  variant?: ButtonVariant;
  /** Saat true, tampilkan spinner & tolak interaksi. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BG_COLOR: Record<ButtonVariant, string> = {
  primary: Colors.primary,
  secondary: Colors.primaryLight,
  outline: 'transparent',
  danger: Colors.error,
};

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: Colors.textOnPrimary,
  secondary: Colors.primaryDark,
  outline: Colors.primary,
  danger: Colors.white,
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled === true || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: BG_COLOR[variant] },
        variant === 'outline' && styles.outlineBorder,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={TEXT_COLOR[variant]} />
      ) : (
        <Text style={[styles.text, { color: TEXT_COLOR[variant] } as TextStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
