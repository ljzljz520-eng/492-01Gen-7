import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Worker } from '@/types';

interface AuthState {
  currentUser: Worker | null;
  isAuthenticated: boolean;
  login: (user: Worker) => void;
  logout: () => void;
  updateCurrentUser: (user: Worker) => void;
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
    }),
    {
      name: 'garment_auth',
    }
  )
);
