/**
 * Endpoint daftar dokter untuk fitur konsultasi.
 *
 * @format
 */

import api from './api';
import type { Doctor } from '../types/user';

export const doctorService = {
  /** GET /doctors -> daftar dokter */
  async getDoctors(): Promise<Doctor[]> {
    const { data } = await api.get<Doctor[]>('/doctors');
    return data;
  },

  /** GET /doctors/:id -> detail satu dokter */
  async getDoctorById(doctorId: string): Promise<Doctor> {
    const { data } = await api.get<Doctor>(`/doctors/${doctorId}`);
    return data;
  },
};
