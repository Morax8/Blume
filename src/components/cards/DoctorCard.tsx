/**
 * Kartu profil dokter untuk list konsultasi.
 *
 * @format
 */

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';
import type { Doctor } from '../../types/user';

interface DoctorCardProps {
  doctor: Doctor;
  onPress?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => (
  <Card onPress={onPress ? () => onPress(doctor) : undefined} style={styles.card}>
    <View style={styles.row}>
      {doctor.avatarUrl ? (
        <Image source={{ uri: doctor.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={24} color={Colors.textMeta} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {doctor.name}
        </Text>
        <Text style={styles.specialization} numberOfLines={1}>
          {doctor.specialization}
        </Text>
        {doctor.hospital ? (
          <Text style={styles.hospital} numberOfLines={1}>
            {doctor.hospital}
          </Text>
        ) : null}
      </View>

      <View style={styles.meta}>
        {typeof doctor.rating === 'number' ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={Colors.textMeta} />
            <Text style={styles.rating}>{doctor.rating.toFixed(1)}</Text>
          </View>
        ) : null}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: doctor.isOnline
                  ? Colors.dotOnline
                  : Colors.dotOffline,
              },
            ]}
          />
          <Text style={styles.statusText}>{doctor.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>
    </View>

    {onPress ? (
      <Button
        title="Book Consultation"
        size="pill"
        onPress={() => onPress(doctor)}
        style={styles.bookButton}
      />
    ) : null}
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  specialization: {
    fontSize: FontSize.xs,
    color: Colors.textBody,
    marginTop: 2,
  },
  hospital: {
    fontSize: FontSize.xs,
    color: Colors.textMeta,
    marginTop: 2,
  },
  meta: {
    alignItems: 'flex-end',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs + 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.pill,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: Colors.textMeta,
  },
  bookButton: {
    height: 40,
    minHeight: 40,
    marginTop: Spacing.md,
  },
});
