/**
 * Global auth state (Zustand) dengan persist ke AsyncStorage.
 * Menyimpan token JWT, data user, dan status login.
 *
 * @format
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user';

interface AuthState {
  /** JWT token dari backend. Null jika belum login. */
  token: string | null;
  /** Data user yang sedang login. */
  user: User | null;
  isAuthenticated: boolean;
  /** Flag loading global (mis. saat refresh profile). */
  isLoading: boolean;
  /** Simpan sesi setelah login/register sukses. */
  login: (token: string, user: User) => void;
  /** Hapus sesi (dipakai juga oleh interceptor 401 di services/api.ts). */
  logout: () => void;
  /** Update data user tanpa mengubah token. */
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'blume-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Hanya state yang perlu bertahan antar sesi yang di-persist.
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
