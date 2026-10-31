/**
 * Text input reusabel dengan label & pesan error.
 *
 * @format
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Colors, FontSize, Spacing } from '../../utils/constants';

interface InputProps extends TextInputProps {
  /** Label di atas input (opsional). */
  label?: string;
  /** Pesan error di bawah input; menandai border merah bila ada. */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...rest
}) => (
  <View style={[styles.container, containerStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      style={[styles.input, error ? styles.inputError : null, style]}
      placeholderTextColor="rgba(0, 0, 0, 0.4)"
      {...rest}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs + 2,
  },
  input: {
    // Figma: fill off-white, border rose, pill radius 50.
    height: 50,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    borderRadius: 50,
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 15,
    fontSize: 18,
    color: Colors.textOnPrimary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs + 2,
  },
});
