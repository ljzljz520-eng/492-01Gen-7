import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Worker } from '@/types';
import { api } from '@/api/client';

export type AuthenticatedUser = Omit<Worker, 'password'>;

interface AuthState {
  currentUser: AuthenticatedUser | null;
  isAuthenticated: boolean;
  login: (user: AuthenticatedUser) => void;
  logout: () => void;
  updateCurrentUser: (user: AuthenticatedUser) => void;
  loginWithApi: (payload: { workerNo: string; password: string }) => Promise<AuthenticatedUser>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (user) =>
        set({
          currentUser: user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
        }),
      updateCurrentUser: (user) =>
        set({
          currentUser: user,
        }),
      loginWithApi: async (payload) => {
        const response = await api.auth.login(payload);
        localStorage.setItem('garment_token', response.token);
        set({
          currentUser: response.worker,
          isAuthenticated: true,
        });
        return response.worker;
      },
    }),
    {
      name: 'garment_auth',
    }
  )
);
