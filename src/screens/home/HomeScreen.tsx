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
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DetectionHistoryCard } from '../../components/cards/DetectionHistoryCard';
import { detectionService } from '../../services/detectionService';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, FontSize, Spacing, BorderRadius } from '../../utils/constants';
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
    <View style={styles.container}>
      {/* Sapaan user di atas latar hijau, di atas sheet */}
      <View style={styles.greetingRow}>
        <Text style={styles.greeting} numberOfLines={1}>
          Halo, {user?.name ?? 'Sahabat Sehat'} 💙
        </Text>
        <View style={styles.logoBadge}>
          <Ionicons name="medkit-outline" size={24} color={Colors.primary} />
        </View>
      </View>

      {/* Sheet putih: CTA scan + daftar riwayat */}
      <View style={styles.sheet}>
        <Button
          title="Scan Sekarang"
          onPress={() => navigation.navigate('ScanTab')}
        />
        <Text style={styles.sectionTitle}>Riwayat Deteksi</Text>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {!error && history.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="camera-outline" size={40} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>
                  Belum ada riwayat. Scan kulitmu pertama kali!
                </Text>
              </View>
            ) : null}
            {history.map((item) => renderItem({ item }))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  greetingRow: {
    position: 'absolute',
    top: 85,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  greeting: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginRight: Spacing.sm,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.sheet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: 136,
    backgroundColor: Colors.sheet,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingHorizontal: 24,
    paddingVertical: 50,
    gap: 25,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
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
