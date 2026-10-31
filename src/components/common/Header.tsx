/**
 * Header reusabel dengan safe-area aware, tombol back opsional,
 * dan slot `right` untuk aksi kustom.
 * Varian 'hero' = latar hijau design system dengan teks dark teal.
 *
 * @format
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, FontSize, Spacing } from '../../utils/constants';

interface HeaderProps {
  title: string;
  /** Tampilkan tombol back di kiri. */
  showBack?: boolean;
  /** Handler tombol back (wajib jika showBack). */
  onBack?: () => void;
  /** Node kustom di sisi kanan header. */
  right?: React.ReactNode;
  /** 'hero' = latar hijau (heroBackground); default = putih. */
  variant?: 'default' | 'hero';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  right,
  variant = 'default',
}) => {
  const insets = useSafeAreaInsets();
  const isHero = variant === 'hero';

  return (
    <View
      style={[
        styles.container,
        isHero && styles.containerHero,
        { paddingTop: insets.top + Spacing.sm },
      ]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={isHero ? Colors.textOnHero : Colors.text}
            />
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.title, isHero && styles.titleHero]} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  containerHero: {
    backgroundColor: Colors.heroBackground,
    borderBottomWidth: 0,
  },
  side: {
    minWidth: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    justifyContent: 'flex-end',
  },
  backButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: Colors.text,
  },
  titleHero: {
    color: Colors.textOnHero,
  },
});
