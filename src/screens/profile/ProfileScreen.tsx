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
import { Colors, FontSize, Spacing } from '../../utils/constants';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
      }}>
      {/* Kartu profil */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(user?.name ?? 'B').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Sahabat Tanaman'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? '-'}</Text>
          </View>
        </View>
      </Card>

      {/* Menu pengaturan */}
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
        style={styles.logoutButton}
      />

      <Text style={styles.versionText}>Blume v0.0.1</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuCard: {
    marginHorizontal: Spacing.md,
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
    backgroundColor: Colors.border,
  },
  logoutButton: {
    marginHorizontal: Spacing.md,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
