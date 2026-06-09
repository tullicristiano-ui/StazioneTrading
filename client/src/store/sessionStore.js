import { create } from 'zustand'

export const useSessionStore = create((set) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  sessionMemory: null,

  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setMessages: (messages) => set({ messages }),
  setSessionMemory: (memory) => set({ sessionMemory: memory }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  clearSession: () => set({
    currentSession: null,
    messages: [],
    sessionMemory: null
  })
}))
