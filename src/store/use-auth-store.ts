import { create } from "zustand";
import { persist } from "zustand/middleware";
// zustand is used to create and store the user billboard so that the app knows which user is logged in and zustand's create is used for this purpose also 'persist' is used to keep the user data in the local Storage of the browsers so that the user doesnt gets logged out when the page is refreshed
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
  isHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      login: (token: string, user: User) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Best-effort server-side session invalidation (clears httpOnly cookie).
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({ user: data.user, token, isAuthenticated: true });
          } else {
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
    /*name: This is the exact key name used in the browser's Local Storage to save your data.

partialize: You don't always want to save everything to Local Storage. This tells Zustand: "Only save the user, token, and isAuthenticated status." (Notice it leaves out isHydrated).

onRehydrateStorage: "Rehydration" is the process of taking the saved string data from Local Storage and putting it back into the live Zustand store when the app loads.*/
  )
);