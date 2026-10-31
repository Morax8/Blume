/**
 * Type definitions untuk hasil deteksi/diagnosa AI dan riwayatnya.
 *
 * @format
 */

/** Status pemrosesan deteksi. */
export type DetectionStatus = 'pending' | 'completed' | 'failed';

/** Hasil lengkap satu kali deteksi. */
export interface DetectionResult {
  id: string;
  imageUrl: string;
  diseaseName: string;
  /** Keyakinan model, 0..1 (mis. 0.93 = 93%). */
  confidence: number;
  /** True jika kulit terdeteksi sehat. */
  isHealthy: boolean;
  description?: string;
  recommendations?: string[];
  status?: DetectionStatus;
  /** ISO timestamp. */
  createdAt: string;
}

/** Item ringkas untuk list riwayat (Home / history). */
export interface DetectionHistoryItem {
  id: string;
  imageUrl: string;
  diseaseName: string;
  confidence: number;
  isHealthy: boolean;
  /** ISO timestamp saat scan dilakukan. */
  scannedAt: string;
}

/**
 * Payload upload foto ke endpoint deteksi.
 * Di React Native, `image` biasanya berupa objek { uri, name, type }
 * yang dikirim lewat FormData (lihat detectionService).
 */
export interface UploadDetectionPayload {
  image: {
    uri: string;
    name: string;
    type: string;
  };
}
