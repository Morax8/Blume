/**
 * Endpoint deteksi AI: upload foto kulit, riwayat, dan detail hasil.
 *
 * @format
 */

import api from './api';
import type { DetectionHistoryItem, DetectionResult } from '../types/detection';

/**
 * Bangun FormData untuk upload foto.
 * React Native menerima objek { uri, name, type } sebagai bagian file.
 */
function buildImageFormData(imageUri: string): FormData {
  const filename = imageUri.split('/').pop() ?? 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  const formData = new FormData();
  formData.append(
    'image',
    { uri: imageUri, name: filename, type } as unknown as Blob,
  );
  return formData;
}

export const detectionService = {
  /** POST /detection (multipart) -> hasil diagnosa AI */
  async uploadPhoto(imageUri: string): Promise<DetectionResult> {
    const formData = buildImageFormData(imageUri);
    const { data } = await api.post<DetectionResult>('/detection', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** GET /detection/history -> daftar riwayat scan milik user */
  async getHistory(): Promise<DetectionHistoryItem[]> {
    const { data } = await api.get<DetectionHistoryItem[]>('/detection/history');
    return data;
  },

  /** GET /detection/:id -> detail satu hasil deteksi */
  async getDetectionById(detectionId: string): Promise<DetectionResult> {
    const { data } = await api.get<DetectionResult>(`/detection/${detectionId}`);
    return data;
  },

  /** DELETE /detection/:id -> hapus item riwayat */
  async deleteDetection(detectionId: string): Promise<void> {
    await api.delete(`/detection/${detectionId}`);
  },
};
