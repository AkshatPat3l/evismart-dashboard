import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  role: string;
  labId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      expiresAt: null,
      login: (token, user) => {
        localStorage.setItem("auth_token", token);
        set({
          user,
          isAuthenticated: true,
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes exactly
        });
      },
      logout: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, isAuthenticated: false, expiresAt: null });
      },
    }),
    {
      name: "evismart-auth-storage",
    },
  ),
);
