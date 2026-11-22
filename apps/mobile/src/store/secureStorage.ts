/**
 * Secure storage untuk data sensitif (token JWT) — bungkus react-native-keychain
 * dengan signature yang sama persis seperti StateStorage dari zustand/middleware,
 * sehingga bisa langsung dipakai createJSONStorage().
 *
 * Jika Keychain tidak tersedia (error native), fallback ke AsyncStorage agar
 * app tetap jalan di device yang tidak mendukung; peringatan dicetak sekali.
 *
 * @format
 */

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Service namespace Keychain — memisahkan entri Blume dari app lain. */
const KEYCHAIN_SERVICE = 'blume.auth';
/** Username generik; yang sensitif adalah password-nya (isi JSON state). */
const KEYCHAIN_USER = 'blume_auth';

/** Flag agar console.warn fallback hanya dicetak sekali. */
let fallbackWarned = false;

/** Tandai mode fallback AsyncStorage + warn sekali. */
function warnFallback(reason: unknown): void {
  if (!fallbackWarned) {
    fallbackWarned = true;
    console.warn(
      '[secureStorage] Keychain tidak tersedia, fallback ke AsyncStorage:',
      reason,
    );
  }
}

/** Storage terenkripsi untuk persist Zustand (StateStorage-compatible). */
export const secureStorage = {
  /** Simpan value terenkripsi di Keychain; fallback ke AsyncStorage bila gagal. */
  async setItem(name: string, value: string): Promise<void> {
    try {
      const result = await Keychain.setGenericPassword(
        KEYCHAIN_USER,
        value,
        { service: KEYCHAIN_SERVICE },
      );
      if (result === false) {
        warnFallback('setGenericPassword mengembalikan false');
        await AsyncStorage.setItem(name, value);
      } else {
        // Hapus salinan lama agar token tidak tertinggal dalam AsyncStorage.
        await AsyncStorage.removeItem(name);
      }
    } catch (err) {
      warnFallback(err);
      await AsyncStorage.setItem(name, value);
    }
  },

  /** Ambil value dari Keychain; fallback ke AsyncStorage bila gagal. */
  async getItem(name: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
      });
      if (credentials === false) {
        // Migrasi sesi lama: pindahkan ke Keychain lalu hapus salinan plain-text.
        const legacyValue = await AsyncStorage.getItem(name);
        if (legacyValue !== null) {
          await secureStorage.setItem(name, legacyValue);
        }
        return legacyValue;
      }
      return credentials.password;
    } catch (err) {
      warnFallback(err);
      return await AsyncStorage.getItem(name);
    }
  },

  /** Hapus value dari Keychain DAN AsyncStorage (bekas sesi lama). */
  async removeItem(name: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    } catch (err) {
      warnFallback(err);
    }
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Abaikan — entri AsyncStorage memang bisa tidak ada.
    }
  },
};

export default secureStorage;
