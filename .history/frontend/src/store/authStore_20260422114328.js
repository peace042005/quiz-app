import { create } from 'zustand'
import api from '../api'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  logout: async () => {
    try { await api.post('/logout') } catch (_) {}
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ loading: false }); return }
    try {
      const { data } = await api.get('/me')
      set({ user: data, loading: false })
    } catch  {
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
    }
  },
}))

export default useAuthStore