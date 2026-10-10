/**
 * Endpoint autentikasi: login, register, profile.
 *
 * @format
 */

import api from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/user';

export const authService = {
  /** POST /auth/login -> { token, user } */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  /** POST /auth/register -> { token, user } */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  /** GET /auth/profile -> data user yang sedang login */
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/profile');
    return data;
  },

  /** PATCH /auth/profile -> update data user */
  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile', payload);
    return data;
  },
};
