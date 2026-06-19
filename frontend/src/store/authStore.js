import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const data = await authApi.login(credentials)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data
      },

      register: async (formData) => {
        const data = await authApi.register(formData)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'bookish-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
