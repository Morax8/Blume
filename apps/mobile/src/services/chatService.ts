/**
 * Endpoint chat konsultasi: buat/ambil room dan riwayat pesan lewat HTTP.
 * Pesan realtime berjalan lewat socketService (lihat ChatRoomScreen).
 *
 * Pola mengikuti detectionService: pakai instance `api` terpusat sehingga
 * JWT otomatis tersisip lewat interceptor.
 *
 * @format
 */

import api from './api';
import type { ChatMessage, ChatRoom } from '../types/user';

export const chatService = {
  /**
   * POST /chat/rooms {doctorId} -> room chat dengan dokter.
   * Backend mengembalikan room lama bila sudah ada (idempoten), jadi aman
   * dipanggil setiap kali masuk ChatRoom. `id` yang dikembalikan adalah UUID
   * room — dipakai untuk joinRoom & getMessages, BUKAN doctorId.
   */
  async getOrCreateRoom(doctorId: string): Promise<ChatRoom> {
    const { data } = await api.post<ChatRoom>('/chat/rooms', { doctorId });
    return data;
  },

  /** GET /chat/:roomId/messages -> riwayat pesan room (urut waktu naik). */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chat/${roomId}/messages`);
    return data;
  },
};
