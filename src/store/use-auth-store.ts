import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "customer";
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Mock authentication store
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // Mock login - in real app, call API
    const user: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      role: "admin",
    };
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));
