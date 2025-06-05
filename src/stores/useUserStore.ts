import { create } from "zustand"

interface UserInfo {
  uid: string
  email: string
  displayName: string
  photoURL?: string
}

interface UserStore {
  user: UserInfo | null
  setUser: (user: UserInfo) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
