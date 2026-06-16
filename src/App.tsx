import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { RegisterScreen } from '@/screens/Register/RegisterScreen'
import { ROUTES } from '@/config/routes'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path={ROUTES.SPLASH} element={<Navigate to={ROUTES.REGISTER} replace />} />
        <Route path={ROUTES.REGISTER} element={<RegisterScreen />} />

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.HOME} element={
            <div className="flex items-center justify-center h-screen font-display text-2xl text-brand-violet">
              Accueil — bientôt disponible
            </div>
          } />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.REGISTER} replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
