/**
 * Type definitions untuk data User, Doctor, auth, dan chat.
 *
 * @format
 */

/** Data user umum (pasien/pengguna aplikasi). */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt?: string;
}

/** Data dokter (dipakai di DoctorList & ChatRoom). */
export interface Doctor {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  specialization: string;
  hospital?: string;
  /** Rating 0..5 */
  rating?: number;
  isOnline?: boolean;
  /** Biaya konsultasi (opsional, format bebas sesuai backend). */
  price?: number;
}

/** Payload login. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload register. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** Respons standar dari endpoint auth. Sesuaikan dengan backend. */
export interface AuthResponse {
  token: string;
  user: User;
}

/** Status pesan chat. */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/** Satu pesan dalam room chat konsultasi. */
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  /** ISO timestamp. */
  createdAt: string;
  status?: MessageStatus;
  /** True jika pesan dikirim oleh user yang sedang login. */
  isMine?: boolean;
}
