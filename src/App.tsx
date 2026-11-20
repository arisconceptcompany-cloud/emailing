import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { useStore } from './store/store-context'
import { AppLayout } from './components/layout/AppLayout'
import { Toaster } from './components/ui/Toaster'
import { Dashboard } from './pages/Dashboard'
import { Campaigns } from './pages/Campaigns'
import { Contacts } from './pages/Contacts'
import { Templates } from './pages/Templates'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Help } from './pages/Help'
import { Login } from './pages/Login'
import { Legal } from './pages/Legal'
import { NotFound } from './pages/NotFound'

function RequireAuth() {
  const { user } = useStore()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <AppLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Login initialMode="register" />} />
          <Route path="/conditions" element={<Legal kind="terms" />} />
          <Route path="/confidentialite" element={<Legal kind="privacy" />} />
          <Route element={<RequireAuth />}>
            <Route index element={<Dashboard />} />
            <Route path="campagnes" element={<Campaigns />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="modeles" element={<Templates />} />
            <Route path="analyses" element={<Analytics />} />
            <Route path="parametres" element={<Settings />} />
            <Route path="aide" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </StoreProvider>
    </BrowserRouter>
  )
}
