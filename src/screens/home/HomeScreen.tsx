/**
 * Layar utama: sapaan user, tombol scan, dan daftar riwayat deteksi.
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DetectionHistoryCard } from '../../components/cards/DetectionHistoryCard';
import { detectionService } from '../../services/detectionService';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, FontSize, Spacing } from '../../utils/constants';
import type { DetectionHistoryItem } from '../../types/detection';
import type { HomeStackParamList, MainTabParamList } from '../../types/navigation';

/**
 * CompositeScreenProps: stack Home + tab utama, agar bisa navigate
 * lintas-tab secara type-safe (mis. ke ScanTab).
 */
type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<DetectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const data = await detectionService.getHistory();
      setHistory(data);
    } catch {
      setError('Gagal memuat riwayat. Tarik ke bawah untuk coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // TODO: muat ulang otomatis saat layar fokus kembali dari ScanResult
  // (pakai useFocusEffect dari @react-navigation/native).

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }: { item: DetectionHistoryItem }): React.JSX.Element => (
    <DetectionHistoryCard
      item={item}
      onPress={() => navigation.navigate('HistoryDetail', { detectionId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      {/* Sapaan */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greeting}>Halo,</Text>
            <Text style={styles.userName}>{user?.name ?? 'Sahabat Tanaman'} 🌿</Text>
          </View>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={24} color={Colors.white} />
          </View>
        </View>

        <Button
          title="Scan Sekarang"
          onPress={() => navigation.navigate('ScanTab')}
          style={styles.scanButton}
        />
      </View>

      {/* Daftar riwayat */}
      <Text style={styles.sectionTitle}>Riwayat Deteksi</Text>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!error && history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                Belum ada riwayat. Scan daun tanamanmu pertama kali!
              </Text>
            </View>
          ) : null}
          {history.map((item) => renderItem({ item }))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  greetingTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    minHeight: 52,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    maxWidth: 240,
  },
});
