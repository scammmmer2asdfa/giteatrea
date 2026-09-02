import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  /** GitHub Personal Access Token, kept only in the browser (localStorage). */
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token: token?.trim() || null }),
    }),
    { name: 'repolens-auth' },
  ),
);
