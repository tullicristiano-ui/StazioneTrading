import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import Journal from './pages/Journal'
import Timeline from './pages/Timeline'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workspace/:id" element={<Workspace />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/workspace/:id/timeline" element={<Timeline />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
