import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Markets from './pages/Markets'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import Journal from './pages/Journal'
import Timeline from './pages/Timeline'
import Notes from './pages/Notes'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Markets />} />
          <Route path="/analisi" element={<Dashboard />} />
          <Route path="/workspace/:id" element={<Workspace />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/workspace/:id/timeline" element={<Timeline />} />
          <Route path="/note" element={<Notes />} />
          <Route path="/cerca" element={<SearchPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
