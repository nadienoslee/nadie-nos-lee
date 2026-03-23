import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setCargando(false)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0804',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(155,45,142,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Texto de fondo */}
      <div style={{
        position: 'absolute', bottom: -20, left: 0, right: 0,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(60px, 15vw, 180px)',
        color: 'rgba(245,240,232,0.02)',
        textAlign: 'center', letterSpacing: 8,
        pointerEvents: 'none', userSelect: 'none',
      }}>ACCESO</div>

      <div style={{
        width: '100%', maxWidth: 420,
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, letterSpacing: 6,
            color: '#f5f0e8', marginBottom: 8,
          }}>
            <span style={{ color: '#9B2D8E' }}>✕</span>
            {' '}NADIE NOS LEE{' '}
            <span style={{ color: '#8B1A1A' }}>✕</span>
          </div>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10, letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.3)',
          }}>Panel de miembros</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.45)',
              display: 'block', marginBottom: 8,
            }}>Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(245,240,232,0.04)',
                border: '1px solid rgba(245,240,232,0.1)',
                color: '#f5f0e8', outline: 'none',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
            />
          </div>

          <div>
            <label style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.45)',
              display: 'block', marginBottom: 8,
            }}>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(245,240,232,0.04)',
                border: '1px solid rgba(245,240,232,0.1)',
                color: '#f5f0e8', outline: 'none',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(139,26,26,0.15)',
              border: '1px solid rgba(139,26,26,0.3)',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, color: '#e05555',
              letterSpacing: 0.5,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, letterSpacing: 3,
              textTransform: 'uppercase',
              background: cargando ? 'rgba(155,45,142,0.5)' : '#9B2D8E',
              color: '#f5f0e8', border: 'none',
              padding: '16px', cursor: cargando ? 'not-allowed' : 'pointer',
              marginTop: 8, transition: 'background 0.3s, transform 0.2s',
            }}
            onMouseOver={e => { if (!cargando) e.target.style.background = '#b535a8' }}
            onMouseOut={e => { if (!cargando) e.target.style.background = '#9B2D8E' }}
          >
            {cargando ? 'Verificando...' : 'Entrar al panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/" style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10, letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.2)',
            transition: 'color 0.2s',
          }}
            onMouseOver={e => e.target.style.color = 'rgba(245,240,232,0.5)'}
            onMouseOut={e => e.target.style.color = 'rgba(245,240,232,0.2)'}
          >← Volver al sitio</a>
        </div>
      </div>
    </main>
  )
}