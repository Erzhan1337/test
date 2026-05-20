import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setAuth: (token, user) => set({ accessToken: token, user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "auth-storage",
    }
  )
);
