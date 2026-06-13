import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

const STORAGE_KEY = 'stazione_trading_notes'

export default function Notes() {
  const [text, setText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const saveTimer = useRef(null)

  useEffect(() => {
    setText(localStorage.getItem(STORAGE_KEY) || '')
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, val)
    }, 500)
  }

  const handleClear = () => {
    if (window.confirm('Cancellare tutte le note? L\'operazione non è reversibile.')) {
      setText('')
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: '#050f0a' }}>
      <AnimatedBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative z-10 p-5">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-900/40 hover:text-slate-200 transition"
            aria-label="Apri menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Torna indietro"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-semibold">📝 Note rapide</h1>
            <p className="mt-1 text-slate-400 text-sm">Salvate automaticamente sul tuo computer.</p>
          </div>
          <button
            onClick={handleClear}
            className="ml-auto rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
          >
            Cancella tutto
          </button>
        </header>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Scrivi qui le tue note veloci..."
          className="w-full h-[calc(100vh-160px)] rounded-2xl border border-emerald-900/50 bg-emerald-950/20 backdrop-blur-sm p-5 text-slate-100 text-sm leading-relaxed resize-none focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
        />
      </div>
    </div>
  )
}
