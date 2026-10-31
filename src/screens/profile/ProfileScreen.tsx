/**
 * Profil user: data akun, menu pengaturan, dan logout.
 *
 * @format
 */

import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../../utils/constants';
import type { ProfileStackParamList } from '../../types/navigation';

interface MenuItem {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'person-outline', label: 'Edit Profil' },
  { icon: 'notifications-outline', label: 'Notifikasi' },
  { icon: 'shield-checkmark-outline', label: 'Privasi & Keamanan' },
  { icon: 'help-circle-outline', label: 'Bantuan' },
  { icon: 'information-circle-outline', label: 'Tentang Blume' },
];

export const ProfileScreen: React.FC<
  NativeStackScreenProps<ProfileStackParamList, 'Profile'>
> = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const insets = useSafeAreaInsets();

  const handleLogout = (): void => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Judul di atas latar hijau */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Profil</Text>
      </View>

      {/* Sheet putih: identitas + menu + logout */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={[
          styles.sheetContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}>
        <View style={styles.identity}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(user?.name ?? 'B').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.name ?? 'Sahabat Sehat'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? '-'}</Text>
        </View>

        <Card style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.label}>
              <View style={styles.menuRow}>
                <Ionicons name={item.icon} size={20} color={Colors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </View>
              {index < MENU_ITEMS.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </Card>

        {/* TODO: aktifkan navigasi tiap menu item saat screen-nya tersedia. */}

        <Button
          title="Keluar"
          variant="danger"
          onPress={handleLogout}
        />

        <Text style={styles.versionText}>Blume v0.0.1</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleWrap: {
    position: 'absolute',
    top: 45,
    left: 31,
    right: 31,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: Colors.text,
  },
  sheet: {
    flex: 1,
    marginTop: 136,
    backgroundColor: Colors.sheet,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
  },
  sheetContent: {
    paddingHorizontal: 30,
    paddingVertical: 24,
    flexGrow: 1,
  },
  identity: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textBody,
    marginTop: 2,
  },
  menuCard: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderDivider,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
