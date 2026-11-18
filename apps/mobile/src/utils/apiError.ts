/**
 * Mengubah error (axios / jaringan) jadi pesan ramah pengguna dalam Bahasa
 * Indonesia. Dipakai di semua screen agar tidak lagi menampilkan pesan
 * generik yang sama untuk setiap kegagalan.
 *
 * Urutan prioritas:
 *  1. `response.data.detail` dari backend (mis. "Email sudah terdaftar")
 *  2. status 401 tanpa detail -> sesi berakhir
 *  3. kode timeout / jaringan
 *  4. fallback generik
 *
 * @format
 */

import axios from 'axios';

/** Pesan saat backend tidak dapat dihubungi sama sekali. */
const NETWORK_UNREACHABLE =
  'Tidak bisa menghubungi server. Pastikan backend jalan di port 3000';

/**
 * Kembalikan pesan error yang siap ditampilkan ke pengguna.
 * Menerima `unknown` agar aman dipanggil dari blok `catch (err)`.
 */
export function pesanError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    // Backend FastAPI mengirim { detail: "..." } untuk setiap HTTPException.
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }

    // 401 tanpa detail: token kedaluwarsa / sesi tidak valid.
    if (err.response?.status === 401) {
      return 'Sesi berakhir, silakan masuk lagi';
    }

    // Timeout (API_TIMEOUT terlewati).
    if (err.code === 'ECONNABORTED') {
      return 'Server lambat merespons, coba lagi';
    }

    // Backend mati / tidak terjangkau dari perangkat.
    if (err.message === 'Network request failed') {
      return NETWORK_UNREACHABLE;
    }
  }

  // Error non-axios (mis. dari fetch/socket) yang menandakan jaringan putus.
  if (err instanceof Error && err.message === 'Network request failed') {
    return NETWORK_UNREACHABLE;
  }

  return 'Terjadi kesalahan, coba lagi';
}
