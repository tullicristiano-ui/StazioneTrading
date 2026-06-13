import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'

const ROLE_LABEL = {
  user: 'Tu',
  assistant: 'Agente Aware'
}

export default function Timeline() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getSession(id)
      setSession(result.session)
      setMessages(Array.isArray(result.messages) ? result.messages : [])
    } catch (err) {
      setError(err.message || 'Errore caricamento timeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'timeline-print'
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        body { background: white !important; color: black !important; }
        .print-area { border: none !important; background: white !important; }
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById('timeline-print')?.remove()
  }, [])

  // Ordinamento cronologico esplicito (dal più vecchio al più recente)
  const orderedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const ta = new Date(a.created_at).getTime() || 0
      const tb = new Date(b.created_at).getTime() || 0
      return ta - tb
    })
  }, [messages])

  const formatDate = (value) => {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: '#050f0a' }}>
      <AnimatedBackground />
      <div className="relative z-10 p-5">
      <div className="mb-5 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/workspace/${id}`)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            aria-label="Torna indietro"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
            <div>
              <h1 className="text-2xl font-semibold">Timeline sessione</h1>
              <p className="mt-1 text-slate-400">Messaggi e screenshot in ordine cronologico.</p>
              {session && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {session.title && (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">{session.title}</span>
                  )}
                  {session.asset && (
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">{session.asset}</span>
                  )}
                  {session.status && (
                    <span className={`rounded-full px-3 py-1 ${session.status === 'closed' ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                      {session.status === 'closed' ? 'Chiusa' : 'Attiva'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/workspace/${id}`)} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Apri Workspace</button>
          <button onClick={() => navigate(-1)} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Indietro</button>
          <button onClick={load} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Aggiorna</button>
          <button onClick={() => window.print()} className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700">⬇ Salva PDF</button>
        </div>
      </div>

      {session && session.summary && (
        <section className="mb-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">Riassunto sessione</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">{session.summary}</p>
        </section>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl print-area">
        {loading ? (
          <div className="text-slate-400">Caricamento timeline...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : orderedMessages.length === 0 ? (
          <div className="text-slate-500">Nessun messaggio trovato per questa sessione.</div>
        ) : (
          <ol className="space-y-4">
            {orderedMessages.map((m) => (
              <li key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-300">{ROLE_LABEL[m.role] || m.role}</div>
                  <div className="text-xs text-slate-500">{formatDate(m.created_at)}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-100">{m.content}</div>
                {Array.isArray(m.screenshots) && m.screenshots.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {m.screenshots.map((s, idx) => (
                      <a
                        key={idx}
                        href={s}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-md border border-slate-800 transition hover:border-cyan-500"
                        title="Apri screenshot in una nuova scheda"
                      >
                        <img src={s} alt={`screenshot-${idx}`} className="max-h-48 w-full object-contain" />
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
      </div>
    </div>
  )
}
