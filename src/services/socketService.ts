/**
 * Client Socket.io untuk fitur chat konsultasi.
 * Singleton: satu koneksi per aplikasi, dipakai ulang antar screen.
 *
 * Nama event mengikuti konvensi umum backend (joinRoom, sendMessage,
 * receiveMessage). TODO: samakan dengan event yang dipakai backend.
 *
 * @format
 */

import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useAuthStore } from '../store/useAuthStore';
import type { ChatMessage } from '../types/user';

let socket: Socket | null = null;

export const socketService = {
  /**
   * Buka koneksi (atau kembalikan koneksi yang sudah aktif).
   * Token JWT dikirim via auth agar backend bisa memverifikasi user.
   */
  connect(roomId?: string): Socket {
    if (socket?.connected) {
      return socket;
    }
    const token = useAuthStore.getState().token;
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token },
      ...(roomId ? { query: { roomId } } : {}),
    });
    return socket;
  },

  disconnect(): void {
    socket?.disconnect();
    socket = null;
  },

  getSocket(): Socket | null {
    return socket;
  },

  /** Masuk ke room chat tertentu. */
  joinRoom(roomId: string): void {
    socket?.emit('joinRoom', { roomId });
  },

  /** Keluar dari room chat. */
  leaveRoom(roomId: string): void {
    socket?.emit('leaveRoom', { roomId });
  },

  /** Kirim pesan teks ke room. */
  sendMessage(payload: { roomId: string; content: string }): void {
    socket?.emit('sendMessage', payload);
  },

  /** Pasang listener pesan masuk. Panggil offMessage() saat unmount. */
  onMessage(handler: (message: ChatMessage) => void): void {
    socket?.on('receiveMessage', handler);
  },

  /** Lepas listener pesan masuk (hindari double-listener). */
  offMessage(): void {
    socket?.off('receiveMessage');
  },
};
