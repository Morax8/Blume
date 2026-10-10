/**
 * Detail satu hasil deteksi: foto, penyakit, tingkat keyakinan,
 * deskripsi, dan rekomendasi penanganan.
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { detectionService } from '../../services/detectionService';
import { Colors, FontSize, Spacing } from '../../utils/constants';
import { formatDate, formatConfidence } from '../../utils/formatters';
import type { DetectionResult } from '../../types/detection';
import type { HomeStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'HistoryDetail'>;

export const HistoryDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { detectionId } = route.params;

  const [detail, setDetail] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        if (!cancelled) {
          setError('Gagal memuat detail deteksi.');
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

  if (loading) {
    return (
      <View style={styles.flex}>
        <Header title="Detail Deteksi" showBack onBack={() => navigation.goBack()} />
        <LoadingSpinner fullScreen={false} />
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.flex}>
        <Header title="Detail Deteksi" showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error ?? 'Data tidak ditemukan.'}</Text>
          <Button title="Kembali" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="Detail Deteksi" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: detail.imageUrl }} style={styles.image} />

        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.diseaseName}>{detail.diseaseName}</Text>
            <Text style={styles.date}>{formatDate(detail.createdAt)}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: detail.isHealthy ? Colors.successLight : Colors.warningLight },
            ]}>
            <Text
              style={[
                styles.badgeText,
                { color: detail.isHealthy ? Colors.success : Colors.warning },
              ]}>
              {detail.isHealthy ? 'Sehat' : formatConfidence(detail.confidence)}
            </Text>
          </View>
        </View>

        {detail.description ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <Text style={styles.bodyText}>{detail.description}</Text>
          </Card>
        ) : null}

        {detail.recommendations && detail.recommendations.length > 0 ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Rekomendasi Penanganan</Text>
            {detail.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationRow}>
                <Text style={styles.bullet}>{'•'}</Text>
                <Text style={styles.bodyText}>{rec}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {/* TODO: tombol "Konsultasi ke Dokter" -> navigate ke ConsultationTab */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: Spacing.md,
    backgroundColor: Colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  titleWrap: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  diseaseName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Spacing.md,
  },
  badgeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: FontSize.sm,
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
    color: Colors.primary,
    marginRight: Spacing.sm,
    lineHeight: 22,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
