import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.SPLASH} element={<div className="flex items-center justify-center h-screen font-display text-4xl gradient-text">🎤 Karaok Star Battle</div>} />
      <Route path="*" element={<Navigate to={ROUTES.SPLASH} replace />} />
    </Routes>
  )
}

export default App
