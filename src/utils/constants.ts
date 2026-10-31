/**
 * Konstanta global aplikasi: URL API, tema warna, spacing, dll.
 *
 * @format
 */

/**
 * Base URL backend API.
 * - Emulator Android: 10.0.2.2 = localhost mesin host
 * - Simulator iOS: bisa langsung pakai http://localhost:3000
 * - Device fisik: pakai IP LAN komputer (mis. http://192.168.1.5:3000)
 *
 * TODO: pindahkan ke env / config build variant saat backend siap.
 */
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

/** URL server Socket.io (tanpa suffix /api). */
export const SOCKET_URL = 'http://10.0.2.2:3000';

/** Timeout request HTTP (ms). */
export const API_TIMEOUT = 15000;

/** Palet warna tema Blume (nuansa biru medis). */
export const Colors = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
  primaryLight: '#E3F2FD',
  accent: '#42A5F5',
  background: '#FFFFFF',
  surface: '#F6F8F6',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',
  border: '#E5E7EB',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#F9A825',
  warningLight: '#FFF8E1',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

/** Skala spacing (px). */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Skala ukuran font (px). */
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/** Radius sudut (px). */
export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
