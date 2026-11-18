/**
 * Client Socket.io untuk fitur chat konsultasi.
 * Singleton: satu koneksi per aplikasi, dipakai ulang antar screen.
 *
 * Nama event sesuai backend (services/api/app/sockets.py):
 *   joinRoom, leaveRoom, sendMessage -> emit
 *   receiveMessage, connect_error    -> listen
 *
 * Autentikasi: JWT dikirim lewat `auth: { token }` saat handshake. Backend
 * tidak memakai query roomId, jadi tidak dikirim.
 *
 * @format
 */

import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useAuthStore } from '../store/useAuthStore';
import type { ChatMessage } from '../types/user';

let socket: Socket | null = null;
/** Token yang dipakai saat socket terakhir dibuat, untuk deteksi pergantian sesi. */
let lastToken: string | null = null;

export const socketService = {
  /**
   * Buka koneksi (atau pakai ulang yang sudah ada).
   * - Token sama -> kembalikan socket yang ada (connected / sedang connect).
   * - Token beda (setelah logout/login) -> putuskan dulu, lalu buat koneksi baru
   *   agar auth handshake memakai token terbaru.
   */
  connect(): Socket {
    const token = useAuthStore.getState().token;

    if (socket && lastToken === token) {
      return socket;
    }

    // Token berubah atau belum ada koneksi: mulai dari awal.
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    lastToken = token;
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: { token },
    });
    return socket;
  },

  disconnect(): void {
    socket?.disconnect();
    socket = null;
    lastToken = null;
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

  /**
   * Pasang listener kegagalan koneksi (connect_error) supaya UI bisa
   * menampilkan "koneksi gagal" alih-alih diam saja.
   */
  onConnectError(handler: (error: Error) => void): void {
    socket?.on('connect_error', handler);
  },

  /** Lepas listener kegagalan koneksi. */
  offConnectError(): void {
    socket?.off('connect_error');
  },
};
