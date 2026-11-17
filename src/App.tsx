import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import { AppLayout } from './components/layout/AppLayout'
import { Toaster } from './components/ui/Toaster'
import { Dashboard } from './pages/Dashboard'
import { Campaigns } from './pages/Campaigns'
import { Contacts } from './pages/Contacts'
import { Templates } from './pages/Templates'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Help } from './pages/Help'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
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
      </BrowserRouter>
      <Toaster />
    </StoreProvider>
  )
}
