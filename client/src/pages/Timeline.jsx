import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

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
      setMessages(result.messages || [])
    } catch (err) {
      setError(err.message || 'Errore caricamento timeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Timeline sessione</h1>
          <p className="mt-1 text-slate-400">Visualizza messaggi e screenshot in ordine cronologico.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">Indietro</button>
          <button onClick={load} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Aggiorna</button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        {loading ? (
          <div className="text-slate-400">Caricamento timeline...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-slate-500">Nessun messaggio trovato per questa sessione.</div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">{m.role}</div>
                  <div className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm text-slate-100 whitespace-pre-wrap">{m.content}</div>
                {m.screenshots && m.screenshots.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {m.screenshots.map((s, idx) => (
                      <img key={idx} src={s} alt={`screenshot-${idx}`} className="max-h-48 w-full object-contain rounded-md border border-slate-800" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
