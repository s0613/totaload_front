import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  email: string;
  name: string;
  userId: number;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isHydrated: false,
      
      login: (user: User) => {
        set({ user, isLoggedIn: true });
      },
      
      logout: () => {
        // 로컬 스토리지의 인증 데이터도 함께 정리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
          sessionStorage.clear()
        }
        set({ user: null, isLoggedIn: false });
      },
      
      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
