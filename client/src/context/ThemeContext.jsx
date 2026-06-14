import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext({ theme: 'green', toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('stazione_trading_theme') || 'green')
  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'green' ? 'dark' : 'green'
      localStorage.setItem('stazione_trading_theme', next)
      return next
    })
  }
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
