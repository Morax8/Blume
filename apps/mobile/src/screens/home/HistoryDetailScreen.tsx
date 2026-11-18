/**
 * Detail satu hasil deteksi: foto, penyakit, tingkat keyakinan,
 * deskripsi, dan rekomendasi penanganan.
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
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
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { detectionService } from '../../services/detectionService';
import { doctorService } from '../../services/doctorService';
import { pesanError } from '../../utils/apiError';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../utils/constants';
import { formatDate, formatConfidence } from '../../utils/formatters';
import type { DetectionResult } from '../../types/detection';
import type { HomeStackParamList, MainTabParamList } from '../../types/navigation';

/**
 * CompositeScreenProps: stack Home + tab utama, agar bisa navigate lintas-tab
 * secara type-safe ke ConsultationTab (ChatRoom / DoctorList).
 */
type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HistoryDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;

export const HistoryDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { detectionId } = route.params;

  const [detail, setDetail] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data = await detectionService.getDetectionById(detectionId);
        if (!cancelled) {
          setDetail(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(pesanError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [detectionId]);

  // Ambil dokter pertama lalu buka ChatRoom; kalau daftar kosong, buka
  // DoctorList agar user bisa memilih sendiri.
  const handleConsult = async (): Promise<void> => {
    setConsultLoading(true);
    try {
      const doctors = await doctorService.getDoctors();
      const first = doctors[0];
      if (first) {
        navigation.navigate('ConsultationTab', {
          screen: 'ChatRoom',
          params: { doctorId: first.id, doctorName: first.name },
        });
      } else {
        navigation.navigate('ConsultationTab', { screen: 'DoctorList' });
      }
    } catch (err) {
      Alert.alert('Konsultasi', pesanError(err));
    } finally {
      setConsultLoading(false);
    }
  };

  // Shell design system: layar hijau + judul/back + sheet putih.
  const renderShell = (content: React.ReactNode): React.JSX.Element => (
    <View style={styles.flex}>
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={8}
        style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Detail Deteksi</Text>
      </View>
      <View style={styles.sheet}>{content}</View>
    </View>
  );

  if (loading) {
    return renderShell(<LoadingSpinner fullScreen={false} />);
  }

  if (error || !detail) {
    return renderShell(
      <View style={styles.errorWrap}>
        <Text style={styles.errorText}>{error ?? 'Data tidak ditemukan.'}</Text>
        <Button title="Kembali" onPress={() => navigation.goBack()} />
      </View>,
    );
  }

  return renderShell(
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: detail.imageUrl }} style={styles.image} />

      <View style={styles.headerRow}>
        <View style={styles.titleWrapInner}>
          <Text style={styles.diseaseName}>{detail.diseaseName}</Text>
          <Text style={styles.date}>{formatDate(detail.createdAt)}</Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: detail.isHealthy
                ? Colors.severityMildBg
                : Colors.severityModerateBg,
            },
          ]}>
          <Text
            style={[
              styles.badgeText,
              {
                color: detail.isHealthy
                  ? Colors.severityMildText
                  : Colors.severityModerateText,
              },
            ]}>
            {detail.isHealthy ? 'Sehat' : formatConfidence(detail.confidence)}
          </Text>
        </View>
      </View>

      {detail.description ? (
        <Card radius={32} style={styles.section}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.bodyText}>{detail.description}</Text>
        </Card>
      ) : null}

      {detail.recommendations && detail.recommendations.length > 0 ? (
        <Card radius={32} style={styles.section}>
          <Text style={styles.sectionTitle}>Rekomendasi Penanganan</Text>
          {detail.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationRow}>
              <Text style={styles.bullet}>{'•'}</Text>
              <Text style={styles.bodyText}>{rec}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      {/* Aksi lanjutan: konsultasikan hasil deteksi ini ke dokter. */}
      <Button
        title="Konsultasi ke Dokter"
        onPress={handleConsult}
        loading={consultLoading}
        style={styles.consultButton}
      />
    </ScrollView>,
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 40,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleWrap: {
    position: 'absolute',
    top: 45,
    left: 64,
    right: 31,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.semiBold,
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
  container: {
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceMuted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  titleWrapInner: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  diseaseName: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.extraBold,
    color: Colors.text,
  },
  date: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: Colors.textMeta,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
    color: Colors.text,
    flex: 1,
  },
  recommendationRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textLink,
    marginRight: Spacing.sm,
    lineHeight: 22,
  },
  consultButton: {
    marginTop: Spacing.sm,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
