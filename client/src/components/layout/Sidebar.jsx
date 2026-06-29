import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext.jsx'

const NAV_ITEMS = [
  { label: 'Home',           icon: '🏠', path: '/' },
  { label: 'Nuova Analisi',  icon: '➕', path: '/analisi?new=1' },
  { label: 'Le mie Analisi', icon: '📂', path: '/analisi' },
  { label: 'Journal',        icon: '📓', path: '/journal' },
  { label: 'Note',           icon: '📝', path: '/note' },
  { label: 'Cerca',          icon: '🔍', path: '/cerca' },
]

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const handleNav = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Overlay — chiude la sidebar cliccando fuori, su qualsiasi schermo */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Pannello sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-56 bg-slate-900 border-r border-slate-800
          flex flex-col gap-2 p-4 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-cyan-400 font-bold text-lg tracking-tight">FREEDOM TRADING SYSTEM</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Chiudi menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const basePath = path.split('?')[0]
            const isActive = location.pathname === basePath
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition text-left
                  ${isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-200 hover:bg-slate-800'
                  }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 transition"
          >
            {theme === 'green' ? '🌙 Tema scuro' : '🌿 Tema verde'}
          </button>
        </div>
      </aside>
    </>
  )
}
