import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

function SessionBadge({ status }) {
  if (status === 'closed') return <span className="text-xs text-slate-500">⚫ Chiusa</span>
  return <span className="text-xs text-emerald-400">🟢 Attiva</span>
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [sessions, setSessions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getSessions().then(setSessions).catch(() => {})
  }, [])

  const q = query.trim().toLowerCase()
  const results = q
    ? sessions.filter(s =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.asset || '').toLowerCase().includes(q)
      )
    : sessions

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: '#050f0a' }}>
      <AnimatedBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative z-10 p-5">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Apri menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Torna indietro"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="text-3xl font-semibold">🔍 Cerca sessioni</h1>
        </header>

        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cerca per titolo o asset..."
          className="w-full rounded-2xl border border-emerald-900/50 bg-emerald-950/20 px-5 py-4 text-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 mb-6"
        />

        <div className="space-y-3">
          {results.length === 0 && q && (
            <div className="text-slate-500 text-center py-8">Nessun risultato per "{query}"</div>
          )}
          {results.map(s => (
            <div
              key={s.id}
              onClick={() => navigate(`/workspace/${s.id}`)}
              className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-950 p-4 hover:border-cyan-500 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{s.title || 'Sessione senza titolo'}</div>
                  {s.asset && <div className="text-sm text-slate-400 mt-0.5">Asset: {s.asset}</div>}
                </div>
                <div className="text-right">
                  <SessionBadge status={s.status} />
                  <div className="text-xs text-slate-500 mt-1">{new Date(s.updated_at).toLocaleDateString('it-IT')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
