/**
 * Type definitions untuk hasil deteksi/diagnosa AI dan riwayatnya.
 *
 * @format
 */

/** Status pemrosesan deteksi. */
export type DetectionStatus = 'pending' | 'completed' | 'failed';

/** Mode model ML yang menghasilkan prediksi. */
export type ModelMode = 'demo' | 'real';

/** Satu kandidat prediksi (penyakit + keyakinan). */
export interface Prediction {
  diseaseName: string;
  confidence: number;
}

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
  /** Mode model: 'demo' = hasil bukan prediksi asli, 'real' = model ML sungguhan. */
  modelMode?: ModelMode;
  /** Tingkat keparahan dari backend (mis. 'ringan' | 'sedang' | 'berat'). */
  severity?: string;
  /** Kandidat prediksi teratas (opsional; bisa kosong). */
  topPredictions?: Prediction[];
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
