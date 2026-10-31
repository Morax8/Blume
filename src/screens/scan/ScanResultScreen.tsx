/**
 * Tampilkan hasil scan: upload foto ke endpoint deteksi AI,
 * lalu tampilkan diagnosa beserta rekomendasi penanganan.
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
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
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';
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

  // Shell design system: layar hijau + judul/back di atasnya + sheet putih.
  const renderShell = (content: React.ReactNode): React.JSX.Element => (
    <View style={styles.flex}>
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={8}
        style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Hasil Scan</Text>
      </View>
      <View style={styles.sheet}>{content}</View>
    </View>
  );

  // Sedang menganalisis.
  if (uploading) {
    return renderShell(
      <View style={styles.analyzingWrap}>
        <LoadingSpinner />
        <Text style={styles.analyzingText}>Menganalisis kulit…</Text>
      </View>,
    );
  }

  // Gagal menganalisis.
  if (error || !result) {
    return renderShell(
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
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
        </View>
      </View>,
    );
  }

  // Sukses: tampilkan diagnosa.
  return renderShell(
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />

      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.diseaseName}>{result.diseaseName}</Text>
          <View style={styles.confidenceRing}>
            <Text style={styles.confidenceRingText}>
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
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        />
        <Button
          title="Kembali ke Home"
          onPress={() => navigation.navigate('HomeTab')}
          style={styles.actionButton}
        />
      </View>
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
    paddingTop: 50,
    gap: 24,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 286,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
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
  confidenceRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: Colors.textLink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceRingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
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
    color: Colors.textLink,
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
