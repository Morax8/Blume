/**
 * Tampilkan hasil scan: upload foto ke endpoint deteksi AI,
 * lalu tampilkan diagnosa beserta rekomendasi penanganan.
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { detectionService } from '../../services/detectionService';
import { Colors, FontSize, Spacing } from '../../utils/constants';
import { formatConfidence } from '../../utils/formatters';
import type { DetectionResult } from '../../types/detection';
import type { MainTabParamList, ScanStackParamList } from '../../types/navigation';

/**
 * CompositeScreenProps: stack Scan + tab utama, agar bisa navigate
 * lintas-tab secara type-safe (mis. kembali ke HomeTab).
 */
type Props = CompositeScreenProps<
  NativeStackScreenProps<ScanStackParamList, 'ScanResult'>,
  BottomTabScreenProps<MainTabParamList>
>;

export const ScanResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri } = route.params;

  const [result, setResult] = useState<DetectionResult | null>(null);
  const [uploading, setUploading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (): Promise<void> => {
    setUploading(true);
    setError(null);
    try {
      const data = await detectionService.uploadPhoto(imageUri);
      setResult(data);
    } catch {
      setError('Gagal menganalisis foto. Periksa koneksi lalu coba lagi.');
    } finally {
      setUploading(false);
    }
  }, [imageUri]);

  useEffect(() => {
    analyze();
  }, [analyze]);

  // Sedang menganalisis.
  if (uploading) {
    return (
      <View style={styles.flex}>
        <Header title="Hasil Scan" />
        <View style={styles.analyzingWrap}>
          <LoadingSpinner />
          <Text style={styles.analyzingText}>Menganalisis daun tanamanmu…</Text>
        </View>
      </View>
    );
  }

  // Gagal menganalisis.
  if (error || !result) {
    return (
      <View style={styles.flex}>
        <Header title="Hasil Scan" />
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error ?? 'Hasil tidak tersedia.'}</Text>
          <View style={styles.errorActions}>
            <Button
              title="Coba Lagi"
              onPress={analyze}
              style={styles.actionButton}
            />
            <Button
              title="Ambil Ulang Foto"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    );
  }

  // Sukses: tampilkan diagnosa.
  return (
    <View style={styles.flex}>
      <Header title="Hasil Scan" />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        <Card style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.diseaseName}>{result.diseaseName}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: result.isHealthy ? Colors.successLight : Colors.warningLight },
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  { color: result.isHealthy ? Colors.success : Colors.warning },
                ]}>
                {result.isHealthy ? 'Sehat' : formatConfidence(result.confidence)}
              </Text>
            </View>
          </View>

          {result.description ? (
            <Text style={styles.bodyText}>{result.description}</Text>
          ) : null}

          {result.recommendations && result.recommendations.length > 0 ? (
            <View style={styles.recommendations}>
              <Text style={styles.sectionTitle}>Rekomendasi</Text>
              {result.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationRow}>
                  <Text style={styles.bullet}>{'•'}</Text>
                  <Text style={styles.bodyText}>{rec}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <View style={styles.actions}>
          <Button
            title="Scan Lagi"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
          <Button
            title="Kembali ke Home"
            onPress={() => navigation.navigate('HomeTab')}
            style={styles.actionButton}
          />
        </View>
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
    marginBottom: Spacing.md,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  diseaseName: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginRight: Spacing.sm,
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
  bodyText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.text,
  },
  recommendations: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
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
  actions: {
    marginTop: Spacing.sm,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  analyzingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  analyzingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorActions: {
    width: '100%',
  },
});
