/**
 * Modal disclaimer AI — tampil SEKALI saat pertama kali app dibuka.
 * Setelah user menekan "Saya Mengerti", flag disimpan di AsyncStorage
 * (key: 'blume_disclaimer_v1') sehingga modal tidak muncul lagi.
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from './Button';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
} from '../../utils/constants';

/** Key flag "sudah pernah melihat disclaimer" di AsyncStorage. */
const DISCLAIMER_KEY = 'blume_disclaimer_v1';

export const DisclaimerModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  /** Flag siap: jangan render apa pun sebelum status AsyncStorage terbaca. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(DISCLAIMER_KEY)
      .then((flag) => {
        if (mounted && !flag) {
          setVisible(true);
        }
      })
      .catch(() => {
        // Gagal baca storage -> tetap tampilkan modal sekali (aman).
        if (mounted) {
          setVisible(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setReady(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAccept = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(DISCLAIMER_KEY, '1');
    } catch {
      // Jika gagal menyimpan flag, modal hanya muncul lagi di start berikutnya.
    }
    setVisible(false);
  };

  if (!ready) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleAccept}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={28}
              color={Colors.textLink}
            />
          </View>
          <Text style={styles.title}>Sebelum Menggunakan Blume</Text>
          <Text style={styles.body}>
            Blume adalah alat skrining berbasis AI, bukan pengganti dokter.
            Hasil deteksi bisa salah, jadi gunakan hanya sebagai langkah awal
            dan selalu konsultasikan kondisi kulitmu ke tenaga medis
            profesional.
          </Text>
          <Text style={styles.body}>
            Saat kamu melakukan scan, foto yang kamu ambil akan dikirim ke
            server Blume untuk dianalisis oleh model AI.
          </Text>
          <Button
            title="Saya Mengerti"
            onPress={handleAccept}
            style={styles.acceptButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.sheet,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.extraBold,
    color: Colors.text,
    marginBottom: Spacing.sm + 2,
  },
  body: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm + 2,
  },
  acceptButton: {
    marginTop: Spacing.md,
  },
});
