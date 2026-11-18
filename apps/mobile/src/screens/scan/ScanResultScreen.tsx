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
import { pesanError } from '../../utils/apiError';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '../../utils/constants';
import { formatConfidence } from '../../utils/formatters';
import type { DetectionResult } from '../../types/detection';
import type { MainTabParamList, ScanStackParamList } from '../../types/navigation';

/**
 * Pemetaan severity -> warna badge (pakai token design system).
 * Nilai backend: 'ringan' | 'sedang' | 'berat'. Default: sedang.
 */
const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  ringan: { bg: Colors.severityMildBg, text: Colors.severityMildText },
  sedang: { bg: Colors.severityModerateBg, text: Colors.severityModerateText },
  berat: { bg: Colors.severitySevereBg, text: Colors.severitySevereText },
};

function severityColors(severity: string): { bg: string; text: string } {
  return SEVERITY_COLORS[severity.toLowerCase()] ?? SEVERITY_COLORS.sedang;
}

function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
    } catch (err) {
      setError(pesanError(err));
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

      {/* Chip kecil peringatan bila hasil berasal dari model demo. */}
      {result.modelMode === 'demo' ? (
        <View style={styles.demoChip}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={Colors.text}
          />
          <Text style={styles.demoChipText}>
            Mode demo — hasil bukan prediksi asli
          </Text>
        </View>
      ) : null}

      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultTitleCol}>
            <Text style={styles.diseaseName}>{result.diseaseName}</Text>
            {/* Badge tingkat keparahan (hanya bila backend mengirim severity). */}
            {result.severity ? (
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: severityColors(result.severity).bg },
                ]}>
                <Text
                  style={[
                    styles.severityBadgeText,
                    { color: severityColors(result.severity).text },
                  ]}>
                  {titleCase(result.severity)}
                </Text>
              </View>
            ) : null}
          </View>
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

        {/* Prediksi teratas — hanya tampil bila ada isinya. */}
        {result.topPredictions && result.topPredictions.length > 0 ? (
          <View style={styles.predictions}>
            <Text style={styles.sectionTitle}>Prediksi Teratas</Text>
            {result.topPredictions.map((pred, index) => (
              <View key={index} style={styles.predictionRow}>
                <Text style={styles.bodyText}>{pred.diseaseName}</Text>
                <Text style={styles.predictionConf}>
                  {formatConfidence(pred.confidence)}
                </Text>
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
  resultTitleCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  diseaseName: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.extraBold,
    color: Colors.text,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: 6,
  },
  severityBadgeText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
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
    fontFamily: FontFamily.semiBold,
    color: Colors.text,
  },
  bodyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
    color: Colors.text,
  },
  recommendations: {
    marginTop: Spacing.md,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.statusCard,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.sm,
  },
  demoChipText: {
    fontSize: 11,
    fontFamily: FontFamily.medium,
    color: Colors.text,
  },
  predictions: {
    marginTop: Spacing.md,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  predictionConf: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    color: Colors.textLink,
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
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
    fontFamily: FontFamily.regular,
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
    fontFamily: FontFamily.regular,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorActions: {
    width: '100%',
  },
});
