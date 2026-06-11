import MessageBubble from './MessageBubble.jsx'
import UploadArea from './UploadArea.jsx'

export default function ChatPanel({
  messages,
  content,
  onContentChange,
  files,
  onFilesChange,
  onSubmit,
  onGenerateJournal,
  loading,
  error,
  visionSupported = true
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Chat</h2>
          <p className="text-sm text-slate-500">Invia testo e screenshot per avviare l’analisi.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-400">Chat</span>
      </div>

      <div className="mb-5 max-h-[52vh] space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
            Invia un messaggio per iniziare l’analisi.
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-300">
            Agente Aware: sto elaborando la tua richiesta...
          </div>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-500/20 p-4 text-sm text-red-100">{error}</div>}

      <form className="rounded-3xl border border-slate-800 bg-slate-950 p-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-300">Testo</label>
        <textarea
          rows="4"
          className="mt-2 w-full resize-none rounded-2xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder="Scrivi qui la tua domanda o l'analisi richiesta..."
        />

        <div className="mt-4">
          <UploadArea files={files} onFilesChange={onFilesChange} visionSupported={visionSupported} />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? 'Invio...' : 'Invia all’agente'}
          </button>
          <button
            type="button"
            onClick={onGenerateJournal}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:bg-slate-900 disabled:opacity-50"
          >
            Genera riga journal
          </button>
        </div>
      </form>
    </div>
  )
}
