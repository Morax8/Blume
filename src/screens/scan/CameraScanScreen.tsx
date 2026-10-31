/**
 * Layar kamera untuk scan kulit (react-native-vision-camera).
 * Setelah foto diambil, navigate ke ScanResult membawa imageUri.
 *
 * Catatan native: vision-camera butuh konfigurasi izin kamera
 * (Android: android.permission.CAMERA di AndroidManifest,
 *  iOS: NSCameraUsageDescription di Info.plist).
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, Spacing } from '../../utils/constants';
import type { ScanStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ScanStackParamList, 'CameraScan'>;

export const CameraScanScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCapture = async (): Promise<void> => {
    if (!cameraRef.current || capturing) {
      return;
    }
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      navigation.navigate('ScanResult', { imageUri: `file://${photo.path}` });
    } catch {
      Alert.alert('Gagal', 'Tidak dapat mengambil foto. Coba lagi.');
    } finally {
      setCapturing(false);
    }
  };

  // Belum ada izin kamera.
  if (!hasPermission) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.centeredTitle}>Izin Kamera Diperlukan</Text>
        <Text style={styles.centeredText}>
          Blume memerlukan kamera untuk memindai kulit.
        </Text>
        <Button
          title="Izinkan Kamera"
          onPress={requestPermission}
          style={styles.centeredButton}
        />
        <Button
          title="Kembali"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  // Perangkat kamera tidak tersedia.
  if (!device) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="videocam-off-outline" size={48} color={Colors.textSecondary} />
        <Text style={styles.centeredTitle}>Kamera Tidak Tersedia</Text>
        <Text style={styles.centeredText}>
          Perangkat ini tidak memiliki kamera belakang yang dapat digunakan.
        </Text>
        <Button
          title="Kembali"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.centeredButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Tombol back overlay */}
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        style={[styles.backButton, { top: insets.top + Spacing.sm }]}>
        <Ionicons name="chevron-back" size={26} color={Colors.white} />
      </Pressable>

      {/* Panduan area scan */}
      <View style={styles.guideBox} pointerEvents="none">
        <Text style={styles.guideText}>Posisikan area kulit di dalam area</Text>
      </View>

      {/* Kontrol bawah */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          onPress={handleCapture}
          disabled={capturing}
          style={[styles.shutter, capturing && styles.shutterDisabled]}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  centeredTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  centeredText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  centeredButton: {
    marginBottom: Spacing.md,
    minWidth: 200,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  guideBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Spacing.sm,
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  shutterDisabled: {
    opacity: 0.5,
  },
});
