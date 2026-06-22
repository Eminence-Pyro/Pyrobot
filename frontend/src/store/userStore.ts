import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user.types';

interface UserStore {
  _hasHydrated: boolean;
  user: User | null;
  accessToken: string | null;
  setHasHydrated: (state: boolean) => void;
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      user: null,
      accessToken: null,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user, accessToken) => set({ user, accessToken }),
      clearUser: () => set({ user: null, accessToken: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'pyrobot-user',
      onRehydrateStorage: () => (state) => {
        // Called by Zustand the moment localStorage has been read and
        // applied. Setting _hasHydrated here means AuthGuard never
        // needs a useEffect to track mount timing — it reads this
        // boolean directly from the store on every render.
        state?.setHasHydrated(true);
      },
    },
  ),
);