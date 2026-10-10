/**
 * Kartu item riwayat deteksi untuk list di Home.
 *
 * @format
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../common/Card';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';
import { formatChatTime, formatConfidence } from '../../utils/formatters';
import type { DetectionHistoryItem } from '../../types/detection';

interface DetectionHistoryCardProps {
  item: DetectionHistoryItem;
  onPress?: (item: DetectionHistoryItem) => void;
}

export const DetectionHistoryCard: React.FC<DetectionHistoryCardProps> = ({
  item,
  onPress,
}) => (
  <Card onPress={onPress ? () => onPress(item) : undefined} style={styles.card}>
    <View style={styles.row}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="leaf" size={22} color={Colors.white} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.disease} numberOfLines={1}>
          {item.diseaseName}
        </Text>
        <Text style={styles.time}>{formatChatTime(item.scannedAt)}</Text>
      </View>

      <View
        style={[
          styles.badge,
          { backgroundColor: item.isHealthy ? Colors.successLight : Colors.warningLight },
        ]}>
        <Text
          style={[
            styles.badgeText,
            { color: item.isHealthy ? Colors.success : Colors.warning },
          ]}>
          {item.isHealthy ? 'Sehat' : `${formatConfidence(item.confidence)}`}
        </Text>
      </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  thumbPlaceholder: {
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  disease: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
