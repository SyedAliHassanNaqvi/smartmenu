import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "customer";
  restaurantId?: string;
}

export interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

// Authentication store with persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        localStorage.setItem('auth-token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('auth-token');
        if (!token) return;

        try {
          // Verify token with API
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({ user: data.user, token, isAuthenticated: true });
          } else {
            // Token invalid, logout
            get().logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
