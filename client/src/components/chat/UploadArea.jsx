import { useCallback, useState } from 'react'

export default function UploadArea({ files, onFilesChange }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (selectedFiles) => {
      const fileArray = Array.from(selectedFiles || [])
      onFilesChange(fileArray)
    },
    [onFilesChange]
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
      <div
        className={`relative mt-2 rounded-2xl border border-dashed px-4 py-8 text-center transition ${isDragging ? 'border-cyan-500 bg-slate-900' : 'border-slate-700 bg-slate-950'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-slate-400">Trascina qui le immagini, oppure fai clic per selezionle.</p>
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
          {files.map((file) => (
            <span key={file.name} className="rounded-full bg-slate-800 px-3 py-1">
              {file.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
