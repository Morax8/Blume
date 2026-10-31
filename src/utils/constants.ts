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

/**
 * Palet warna tema Blume — nilai resmi dari Figma design system (file: Blume).
 * - Screen background = HIJAU (base), sheet konten = putih di atasnya
 * - pink (primary): CTA utama
 * - teal (secondary): aksi sekunder / disabled
 * - teks utama #1B1C1A; shadow tidak pernah hitam (lihat Shadows)
 *
 * @format
 */
export const Colors = {
  // ── Figma base tokens ──
  base: '#A8DB95',
  baseLight: '#C2F9AD',
  baseDark: '#679656',
  offWhite: '#EAE5E5',
  teal: '#6FA39C',
  tealDark: '#3F6E68',
  peach: '#FFCFAD',
  pink: '#F1A4B0',
  pinkLight: '#FDAFBB',
  rose: '#A65F6A',

  // ── Semantic roles ──
  background: '#A8DB95', // screen background is GREEN, not white
  backgroundTint: '#EAE5E5',
  heroBackground: '#A8DB95',
  sheet: '#FFFFFF', // white content sheet on top of the green
  surface: '#FFFFFF',
  surfaceMuted: '#F5F3F0',
  surfaceSoft: '#EFEEEB',

  // Actions — primary is PINK, secondary is TEAL
  primary: '#F1A4B0',
  primaryPressed: '#E0909C',
  primaryDisabled: 'rgba(111, 163, 156, 0.5)',
  primaryLight: '#C2F9AD',
  secondary: '#6FA39C',
  secondaryPressed: '#5E8C86',
  tertiary: '#FDAFBB',
  actionDark: '#406749',

  // Backwards-compatible aliases (old names, new meanings)
  accent: '#6FA39C', // was pink, now teal = secondary action
  accentPressed: '#5E8C86',
  accentLight: '#C1E8D6',

  // Text
  text: '#1B1C1A',
  textBody: '#424942',
  textSecondary: '#426657',
  textMeta: '#426657',
  textOnPrimary: 'rgba(0, 0, 0, 0.8)',
  textOnAccent: 'rgba(0, 0, 0, 0.8)',
  textOnHero: '#1B1C1A',
  textOnDark: '#FFFFFF',
  textLink: '#3F6E68',
  textPlaceholder: 'rgba(114, 121, 113, 0.7)',

  // Borders
  border: '#EAE5E5',
  borderInput: '#A65F6A',
  borderDivider: '#E4E2DF',
  borderOnHero: 'transparent',

  // Status / severity
  statusCard: '#FFCFAD',
  success: '#A8DB95',
  successLight: '#C4EBD9',
  successText: '#002116',
  severityMildBg: '#C4EBD9',
  severityMildText: '#002116',
  severityModerateBg: '#FFDAD9',
  severityModerateText: '#3B080D',
  severitySevereBg: '#FFDAD6',
  severitySevereText: '#93000A',
  availableChipBg: '#C1E8D6',
  availableChipText: '#466A5B',
  activePillBg: '#8FB996',
  activePillText: '#244A2F',
  dotOnline: '#406749',
  dotOffline: '#424942',

  // Errors
  error: '#93000A',
  errorLight: '#FFDAD6',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.45)',
} as const;

/** Shadow design system — tidak pernah hitam. */
export const Shadows = {
  card: {
    shadowColor: '#6B9080',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  soft: {
    shadowColor: '#6B9080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
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
  /** Radius sheet putih yang menumpuk latar hijau. */
  sheet: 32,
  pill: 999,
} as const;
