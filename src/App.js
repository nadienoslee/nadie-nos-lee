import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import BackToTop from './components/BackToTop'
import { usePageTracker } from './hooks/usePageTracker'

import Home from './pages/Home'
import Manifiesto from './pages/Manifiesto'
import QuienesSomos from './pages/QuienesSomos'
import Escritura from './pages/Escritura'
import Lecturas from './pages/Lecturas'
import Convocatorias from './pages/Convocatorias'
import ConvocatoriaDetalle from './pages/ConvocatoriaDetalle'
import Eventos from './pages/Eventos'
import EventoDetalle from './pages/EventoDetalle'
import Calendario from './pages/Calendario'
import Talleres from './pages/Talleres'
import TallerDetalle from './pages/TallerDetalle'
import Noticias from './pages/Noticias'
import NotFound from './pages/NotFound'
import Login from './admin/Login'
import CambiarPassword from './admin/CambiarPassword'
import Dashboard from './admin/Dashboard'
import ProtectedRoute from './admin/ProtectedRoute'

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
)

function AppInner() {
  usePageTracker()
  return (
    <Routes>
      <Route path="/"               element={<Layout><Home /></Layout>} />
      <Route path="/manifiesto"     element={<Layout><Manifiesto /></Layout>} />
      <Route path="/quienes-somos"  element={<Layout><QuienesSomos /></Layout>} />
      <Route path="/escritura"      element={<Layout><Escritura /></Layout>} />
      <Route path="/lecturas"       element={<Layout><Lecturas /></Layout>} />
      <Route path="/convocatorias"  element={<Layout><Convocatorias /></Layout>} />
      <Route path="/convocatorias/:id" element={<Layout><ConvocatoriaDetalle /></Layout>} />
      <Route path="/eventos"        element={<Layout><Eventos /></Layout>} />
      <Route path="/eventos/:id"    element={<Layout><EventoDetalle /></Layout>} />
      <Route path="/calendario"     element={<Layout><Calendario /></Layout>} />
      <Route path="/talleres"       element={<Layout><Talleres /></Layout>} />
      <Route path="/talleres/:id"   element={<Layout><TallerDetalle /></Layout>} />
      <Route path="/noticias"       element={<Layout><Noticias /></Layout>} />
      <Route path="/admin/login"         element={<Login />} />
      <Route path="/admin/cambiar-password" element={<CambiarPassword />} />
      <Route path="/admin/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*"               element={<Layout><NotFound /></Layout>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BackToTop />
      <AppInner />
    </BrowserRouter>
  )
}

export default App