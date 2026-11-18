/**
 * Helper format tanggal, jam, dan teks chat.
 * Semua fungsi menerima tanggal fleksibel (ISO string / number / Date).
 *
 * @format
 */

export type DateInput = string | number | Date;

/** "8 Okt 2026" */
export function formatDate(date: DateInput): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "08/10/2026" */
export function formatDateNumeric(date: DateInput): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** "14:30" */
export function formatTime(date: DateInput): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Waktu chat: hari ini -> "14:30", kemarin -> "Kemarin",
 * lebih lama -> "8 Okt 2026".
 */
export function formatChatTime(date: DateInput): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  if (d >= startOfToday) {
    return formatTime(d);
  }
  if (d >= startOfYesterday) {
    return 'Kemarin';
  }
  return formatDate(d);
}

/** "baru saja", "5 mnt lalu", "3 jam lalu", "2 hr lalu", else formatDate. */
export function formatRelativeTime(date: DateInput): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';

  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hr lalu`;
  return formatDate(d);
}

/** Persen ke 1 desimal: 0.934 -> "93.4%" */
export function formatConfidence(confidence: number): string {
  if (!Number.isFinite(confidence)) return '-';
  return `${(confidence * 100).toFixed(1)}%`;
}
