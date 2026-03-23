import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const [verificando, setVerificando] = useState(true)
  const [autorizado, setAutorizado] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setAutorizado(true)
      } else {
        navigate('/admin/login')
      }
      setVerificando(false)
    }
    verificarSesion()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login')
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  if (verificando) return (
    <div style={{
      minHeight: '100vh', background: '#0a0804',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: "'Courier Prime', monospace",
        fontSize: 11, letterSpacing: 3,
        textTransform: 'uppercase',
        color: 'rgba(245,240,232,0.3)',
      }}>Verificando acceso...</div>
    </div>
  )

  return autorizado ? children : null
}