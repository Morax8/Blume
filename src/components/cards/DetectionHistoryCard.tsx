/**
 * Kartu item riwayat deteksi untuk list di Home.
 *
 * @format
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../common/Card';
import { BorderRadius, Colors, Shadows, Spacing } from '../../utils/constants';
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
  <Card
    onPress={onPress ? () => onPress(item) : undefined}
    radius={32}
    style={styles.card}>
    <View style={styles.row}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="body-outline" size={22} color={Colors.textMeta} />
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
          {
            backgroundColor: item.isHealthy
              ? Colors.severityMildBg
              : Colors.severityModerateBg,
          },
        ]}>
        <Text
          style={[
            styles.badgeText,
            {
              color: item.isHealthy
                ? Colors.severityMildText
                : Colors.severityModerateText,
            },
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
    ...Shadows.soft,
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
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  disease: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
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
    fontWeight: '500',
  },
});
