/**
 * Layar utama: sapaan user, tombol scan, dan daftar riwayat deteksi.
 *
 * @format
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DetectionHistoryCard } from '../../components/cards/DetectionHistoryCard';
import { detectionService } from '../../services/detectionService';
import { useAuthStore } from '../../store/useAuthStore';
import { pesanError } from '../../utils/apiError';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../utils/constants';
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

  // Back hardware 2x baru keluar app (hanya Android; HomeScreen = root tab).
  const exitReady = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return;
      }
      let resetTimer: ReturnType<typeof setTimeout> | undefined;
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (exitReady.current) {
            // Tekanan kedua dalam 2 detik -> biarkan sistem menutup app.
            return false;
          }
          exitReady.current = true;
          ToastAndroid.show('Tekan sekali lagi untuk keluar', ToastAndroid.SHORT);
          resetTimer = setTimeout(() => {
            exitReady.current = false;
          }, 2000);
          // Tekanan pertama -> tahan, jangan keluar.
          return true;
        },
      );
      return () => {
        subscription.remove();
        if (resetTimer) {
          clearTimeout(resetTimer);
        }
        exitReady.current = false;
      };
    }, []),
  );

  const fetchHistory = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const data = await detectionService.getHistory();
      setHistory(data);
    } catch (err) {
      setError(pesanError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Muat ulang otomatis setiap layar fokus kembali (mis. balik dari ScanResult
  // atau setelah hapus item di HistoryDetail) — riwayat tidak lagi basi.
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }: { item: DetectionHistoryItem }): React.JSX.Element => (
    <DetectionHistoryCard
      key={item.id}
      item={item}
      onPress={() => navigation.navigate('HistoryDetail', { detectionId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {/* Sapaan user di atas latar hijau, di atas sheet */}
      <View style={styles.greetingRow}>
        <Text style={styles.greeting} numberOfLines={1}>
          Halo, {user?.name ?? 'Sahabat Sehat'}{' '}
          <Ionicons name="heart" size={22} color={Colors.pink} />
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
    fontFamily: FontFamily.bold,
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
    fontFamily: FontFamily.bold,
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
    fontFamily: FontFamily.regular,
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
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    maxWidth: 240,
  },
});
