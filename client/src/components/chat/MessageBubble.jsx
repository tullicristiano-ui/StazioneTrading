export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`mb-4 rounded-xl p-4 shadow-sm ${isUser ? 'bg-slate-800 text-white self-end' : 'bg-slate-700 text-slate-100 self-start'}`}>
      <div className="text-sm font-semibold mb-2">{isUser ? 'Tu' : 'Agente Aware'}</div>
      <div className="whitespace-pre-wrap text-sm leading-6">{message.content}</div>
      {message.screenshots && message.screenshots.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {message.screenshots.map((src) => (
            <img key={src} src={src} alt="Screenshot" className="h-28 w-full rounded-lg object-cover border border-slate-600" />
          ))}
        </div>
      )}
    </div>
  )
}
