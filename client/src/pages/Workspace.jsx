import { useParams } from 'react-router-dom'

export default function Workspace() {
  const { id } = useParams()
  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-900">
      <h1 className="text-4xl font-bold text-white">Workspace: {id}</h1>
    </div>
  )
}
