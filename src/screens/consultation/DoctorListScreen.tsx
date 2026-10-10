/**
 * Daftar dokter untuk konsultasi. Tap kartu -> masuk ChatRoom.
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DoctorCard } from '../../components/cards/DoctorCard';
import { doctorService } from '../../services/doctorService';
import { Colors, FontSize, Spacing } from '../../utils/constants';
import type { Doctor } from '../../types/user';
import type { ConsultationStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ConsultationStackParamList, 'DoctorList'>;

export const DoctorListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchDoctors = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
    } catch {
      setError('Gagal memuat daftar dokter.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchDoctors();
  };

  // TODO: pindah ke server-side search bila daftar dokter besar.
  const filtered = search.trim()
    ? doctors.filter((doc) =>
        `${doc.name} ${doc.specialization}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : doctors;

  const renderItem = ({ item }: { item: Doctor }): React.JSX.Element => (
    <DoctorCard
      doctor={item}
      onPress={(doctor) =>
        navigation.navigate('ChatRoom', {
          doctorId: doctor.id,
          doctorName: doctor.name,
        })
      }
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <Text style={styles.title}>Konsultasi Dokter</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau spesialisasi…"
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.emptyText}>
                Tidak ada dokter yang cocok dengan pencarian.
              </Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text,
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
    marginVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
});
