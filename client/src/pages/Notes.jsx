import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/layout/AnimatedBackground.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const DRAFT_KEY = 'stazione_trading_notes_draft'
const NOTES_KEY = 'stazione_trading_notes_v2'
const MODE_KEY  = 'stazione_trading_notes_mode'

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px']
const FONT_COLORS = [
  { label: 'Bianco',  value: '#f1f5f9' },
  { label: 'Verde',   value: '#34d399' },
  { label: 'Ciano',   value: '#22d3ee' },
  { label: 'Giallo',  value: '#fbbf24' },
  { label: 'Rosso',   value: '#f87171' },
  { label: 'Grigio',  value: '#94a3b8' },
]
const FONT_FAMILIES = [
  { label: 'Sans',  value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Mono',  value: 'ui-monospace, monospace' },
  { label: 'Serif', value: 'ui-serif, Georgia, serif' },
]

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') } catch { return [] }
}
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export default function Notes() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'text')
  const [notes, setNotes] = useState(loadNotes)
  const [saving, setSaving] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fontSize, setFontSize] = useState('14px')
  const [fontColor, setFontColor] = useState('#f1f5f9')
  const [fontFamily, setFontFamily] = useState('ui-sans-serif, system-ui, sans-serif')
  const [bold, setBold] = useState(false)
  const navigate = useNavigate()
  const saveTimer = useRef(null)
  const { theme } = useTheme()
  const bgColor = theme === 'green' ? '#050f0a' : '#0d1117'

  useEffect(() => {
    setText(localStorage.getItem(DRAFT_KEY) || '')
  }, [])

  const handleChange = (val) => {
    setText(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => localStorage.setItem(DRAFT_KEY, val), 500)
  }

  const toggleMode = () => {
    const next = mode === 'text' ? 'checklist' : 'text'
    setMode(next)
    localStorage.setItem(MODE_KEY, next)
  }

  const lines = text.split('\n')

  const toggleLine = (i) => {
    const newLines = [...lines]
    const line = newLines[i]
    if (line.startsWith('[x] ')) newLines[i] = '[ ] ' + line.slice(4)
    else if (line.startsWith('[ ] ')) newLines[i] = '[x] ' + line.slice(4)
    else newLines[i] = '[x] ' + line
    handleChange(newLines.join('\n'))
  }

  const addLine = () => {
    handleChange(text + (text.endsWith('\n') || text === '' ? '[ ] ' : '\n[ ] '))
  }

  const handleSaveNote = () => {
    const title = saveTitle.trim() || `Nota del ${new Date().toLocaleDateString('it-IT')}`
    const newNote = {
      id: Date.now().toString(),
      title,
      content: text,
      createdAt: new Date().toISOString(),
      style: { fontSize, fontColor, fontFamily, bold },
    }
    const updated = [newNote, ...notes]
    setNotes(updated)
    saveNotes(updated)
    setSaving(false)
    setSaveTitle('')
  }

  const handleRenameNote = (id, currentTitle) => {
    setEditingNoteId(id)
    setEditingTitle(currentTitle)
  }

  const handleRenameConfirm = (id) => {
    const newTitle = editingTitle.trim()
    if (!newTitle) { setEditingNoteId(null); return }
    const updated = notes.map(n => n.id === id ? { ...n, title: newTitle } : n)
    setNotes(updated)
    saveNotes(updated)
    setEditingNoteId(null)
  }

  const handleDeleteNote = (id) => {
    if (!window.confirm('Eliminare questa nota salvata?')) return
    const updated = notes.filter(n => n.id !== id)
    setNotes(updated)
    saveNotes(updated)
  }

  const handleLoadNote = (note) => {
    handleChange(note.content)
    if (note.style) {
      if (note.style.fontSize)            setFontSize(note.style.fontSize)
      if (note.style.fontColor)           setFontColor(note.style.fontColor)
      if (note.style.fontFamily)          setFontFamily(note.style.fontFamily)
      if (note.style.bold !== undefined)  setBold(note.style.bold)
    }
  }

  const handleClearDraft = () => {
    if (window.confirm('Cancellare il draft corrente?')) {
      setText('')
      localStorage.removeItem(DRAFT_KEY)
    }
  }

  const textStyle = {
    fontSize,
    color: fontColor,
    fontFamily,
    fontWeight: bold ? 'bold' : 'normal',
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100" style={{ background: bgColor }}>
      <AnimatedBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative z-10 p-5">

        {/* Header */}
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-900/40 hover:text-slate-200 transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold">📝 Note rapide</h1>
            <p className="text-slate-400 text-xs mt-0.5">Draft autosalvato · {notes.length} note salvate</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              onClick={toggleMode}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 transition"
            >
              {mode === 'text' ? '☑ Checklist' : '📝 Testo libero'}
            </button>
            <button
              onClick={() => setSaving(true)}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              💾 Salva nota
            </button>
            <button
              onClick={handleClearDraft}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
            >
              Cancella draft
            </button>
          </div>
        </header>

        {/* Toolbar formattazione */}
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2">
          <button
            onClick={() => setBold(b => !b)}
            className={`rounded-lg px-3 py-1 text-sm font-bold transition ${bold ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            B
          </button>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Dim:</span>
            <select
              value={fontSize}
              onChange={e => setFontSize(e.target.value)}
              className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-200 border border-slate-700 focus:outline-none"
            >
              {FONT_SIZES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Font:</span>
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
              className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-200 border border-slate-700 focus:outline-none"
            >
              {FONT_FAMILIES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Colore:</span>
            <div className="flex gap-1">
              {FONT_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setFontColor(c.value)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full border-2 transition ${fontColor === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
          </div>

          <span className="ml-auto text-xs opacity-60" style={textStyle}>
            Anteprima testo
          </span>
        </div>

        {/* Input salvataggio */}
        {saving && (
          <div className="mb-3 flex items-center gap-2">
            <input
              autoFocus
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveNote(); if (e.key === 'Escape') setSaving(false) }}
              placeholder="Titolo nota (facoltativo, Invio per confermare)..."
              className="flex-1 rounded-xl border border-emerald-700 bg-emerald-950/30 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button onClick={handleSaveNote} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition">
              Salva
            </button>
            <button onClick={() => setSaving(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 transition">
              Annulla
            </button>
          </div>
        )}

        {/* Area scrittura */}
        {mode === 'text' ? (
          <textarea
            value={text}
            onChange={e => handleChange(e.target.value)}
            placeholder="Scrivi qui le tue note..."
            style={{ ...textStyle, height: 'calc(100vh - 280px)' }}
            className="w-full rounded-2xl border border-emerald-900/50 bg-emerald-950/20 backdrop-blur-sm p-5 leading-relaxed resize-none focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
          />
        ) : (
          <div
            className="w-full rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5 space-y-2"
            style={{ minHeight: 'calc(100vh - 280px)' }}
          >
            {lines.map((line, i) => {
              const checked = line.startsWith('[x] ')
              const isItem = checked || line.startsWith('[ ] ')
              const label = isItem ? line.slice(4) : line
              return (
                <div key={i} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLine(i)}
                    className="mt-1 accent-emerald-500 cursor-pointer shrink-0"
                  />
                  <span
                    onClick={() => toggleLine(i)}
                    style={textStyle}
                    className={`flex-1 cursor-pointer leading-relaxed ${checked ? 'line-through opacity-50' : ''}`}
                  >
                    {label || <span className="opacity-30">voce vuota</span>}
                  </span>
                </div>
              )
            })}
            <button onClick={addLine} className="text-xs text-slate-500 hover:text-emerald-400 transition mt-3 block">
              + Aggiungi voce
            </button>
          </div>
        )}

        {/* Lista note salvate */}
        {notes.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-widest">
              Note salvate ({notes.length})
            </h2>
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    {editingNoteId === note.id ? (
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(note.id); if (e.key === 'Escape') setEditingNoteId(null) }}
                        onBlur={() => handleRenameConfirm(note.id)}
                        className="w-full rounded-lg bg-slate-800 px-2 py-1 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <div className="text-sm font-semibold text-slate-200 truncate">{note.title}</div>
                        <button
                          onClick={() => handleRenameNote(note.id, note.title)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition text-xs"
                          title="Rinomina"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(note.createdAt).toLocaleString('it-IT')}
                      {note.style && (
                        <span className="ml-2 opacity-60">
                          · {note.style.fontSize}{note.style.bold ? ' · grassetto' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleLoadNote(note)} className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 transition">
                      Riapri
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)} className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800 transition">
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
