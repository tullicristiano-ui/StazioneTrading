import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import ChatPanel from '../components/chat/ChatPanel.jsx'
import SessionMemory from '../components/session/SessionMemory.jsx'

export default function Workspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [memory, setMemory] = useState(null)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tradeOpen, setTradeOpen] = useState(false)
  const messagesEndRef = useRef(null)

  const loadSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.getSession(id)
      setSession(result.session)
      setMessages(result.messages || [])
      setMemory(result.session_memory)
    } catch (err) {
      setError(err.message || 'Impossibile caricare la sessione')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!content.trim()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.sendMessage(id, content, files, {
        analysisMode: tradeOpen ? 'trade_open' : 'standard'
      })
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage])
      setContent('')
      setFiles([])
      setMemory(response.session_memory || memory)
    } catch (err) {
      setError(err.message || 'Errore invio messaggio')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateJournal = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.sendMessage(id, '', [], {
        analysisMode: tradeOpen ? 'trade_open' : 'standard',
        journalMode: true
      })
      setMessages((prev) => [...prev, response.userMessage, response.assistantMessage])
      setMemory(response.session_memory || memory)
    } catch (err) {
      setError(err.message || 'Errore generazione journal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Workspace Aware Trading</h1>
          <p className="mt-1 text-slate-400">Sessione: {session?.title || 'Nuova sessione'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/')} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
            Torna alla dashboard
          </button>
          <button onClick={() => navigate('/journal')} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Apri Journal
          </button>
          <button
            onClick={() => setTradeOpen((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tradeOpen ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
          >
            {tradeOpen ? 'Modalità trade aperto: ON' : 'Attiva trade aperto'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChatPanel
          messages={messages}
          content={content}
          onContentChange={setContent}
          files={files}
          onFilesChange={setFiles}
          onSubmit={handleSubmit}
          onGenerateJournal={handleGenerateJournal}
          loading={loading}
          error={error}
        />

        <SessionMemory memory={memory} />
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
