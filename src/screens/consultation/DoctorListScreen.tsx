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
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DoctorCard } from '../../components/cards/DoctorCard';
import { doctorService } from '../../services/doctorService';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';
import type { Doctor } from '../../types/user';
import type { ConsultationStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ConsultationStackParamList, 'DoctorList'>;

export const DoctorListScreen: React.FC<Props> = ({ navigation }) => {
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
    <View style={styles.container}>
      {/* Judul di atas latar hijau */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Konsultasi Dokter</Text>
      </View>

      {/* Sheet putih: search + daftar dokter */}
      <View style={styles.sheet}>
        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau spesialisasi…"
            placeholderTextColor={Colors.textPlaceholder}
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
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.offWhite,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  listContent: {
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
