import { useCallback, useState } from 'react'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export default function UploadArea({ files, onFilesChange, visionSupported = true, visionStatus = 'disabled' }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (selectedFiles) => {
      const fileArray = Array.from(selectedFiles || [])
      onFilesChange(fileArray)
    },
    [onFilesChange]
  )

  // Incolla (Ctrl+V): aggiunge le immagini incollate ai file già selezionati.
  const handlePaste = useCallback(
    (event) => {
      const items = event.clipboardData?.items
      if (!items) return

      const pastedImages = []
      for (const item of items) {
        if (item.kind === 'file' && ACCEPTED_TYPES.includes(item.type)) {
          const blob = item.getAsFile()
          if (blob) {
            // Le immagini incollate dagli appunti non hanno nome: ne assegniamo uno.
            const ext = item.type.split('/')[1] || 'png'
            const namedFile = new File([blob], `incolla-${Date.now()}.${ext}`, { type: item.type })
            pastedImages.push(namedFile)
          }
        }
      }

      if (pastedImages.length > 0) {
        event.preventDefault()
        onFilesChange([...(files || []), ...pastedImages])
      }
    },
    [files, onFilesChange]
  )

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300">Screenshot</label>

      {visionStatus === 'ready' ? (
        <div className="mt-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Lettura immagini locale attiva. La prima analisi può richiedere qualche decina di secondi mentre il modello si carica.
        </div>
      ) : !visionSupported && (
        <div className="mt-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠️ Il modello attuale non legge le immagini: gli screenshot vengono salvati ma non
          analizzati. L'analisi visiva sarà disponibile con un modello vision.
        </div>
      )}

      <div
        className={`relative mt-2 rounded-2xl border border-dashed px-4 py-8 text-center transition ${isDragging ? 'border-cyan-500 bg-slate-900' : 'border-slate-700 bg-slate-950'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <p className="text-slate-400">Trascina qui le immagini, incolla con Ctrl+V, oppure fai clic per selezionarle.</p>
        <p className="mt-2 text-xs text-slate-500">Solo PNG, JPEG e WebP fino a 10MB.</p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ top: 0, left: 0 }}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
          {files.map((file, index) => (
            <span key={`${file.name}-${index}`} className="rounded-full bg-slate-800 px-3 py-1">
              {file.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
