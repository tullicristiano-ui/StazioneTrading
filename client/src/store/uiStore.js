import { create } from 'zustand'

export const useUIStore = create((set) => ({
  loading: false,
  error: null,
  success: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),

  clearMessages: () => set({
    error: null,
    success: null
  })
}))
