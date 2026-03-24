import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.31" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
      <path d="M1 1l22 22" />
    </svg>
  )
}

function Switch({ activo, onChange }) {
  return (
    <div
      onClick={() => onChange(!activo)}
      style={{
        width: 52, height: 28,
        borderRadius: 14,
        background: activo ? '#22a16a' : 'rgba(245,240,232,0.12)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.3s ease',
        flexShrink: 0,
        border: `1px solid ${activo ? '#22a16a' : 'rgba(245,240,232,0.2)'}`,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: activo ? 27 : 3,
        width: 20, height: 20,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }} />
    </div>
  )
}

export default function Login() {
  usePageTitle('NADIE NOS LEE | LOGIN')
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError]         = useState('')
  const [cargando, setCargando]   = useState(false)
  const [recordar, setRecordar]   = useState(() => localStorage.getItem('nnl_recordar') !== 'false')
  const navigate = useNavigate()
  // Si ya hay sesión activa, ir directo al dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard')
    })
  }, [navigate])

  // Guardar preferencia del switch
  useEffect(() => {
    localStorage.setItem('nnl_recordar', recordar ? 'true' : 'false')

    // Si NO recordar: cerrar sesión al cerrar la pestaña
    const handleUnload = () => {
      if (!recordar) supabase.auth.signOut()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [recordar])

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const accesoRaw = username.trim().toLowerCase()
    const esCorreo = accesoRaw.includes('@') && accesoRaw.includes('.')
    const accesoLimpio = esCorreo ? accesoRaw : accesoRaw.replace(/^@+/, '')

    let emailFinal = ''
    let perfil = null

    if (esCorreo) {
      emailFinal = accesoLimpio

      const { data: perfilPorCorreo } = await supabase
        .from('perfiles')
        .select('email, username, activo')
        .ilike('email', accesoLimpio)
        .maybeSingle()

      perfil = perfilPorCorreo || null
    } else {
      const { data: perfilPorUsuario, error: perfilError } = await supabase
        .from('perfiles')
        .select('email, username, activo')
        .ilike('username', accesoLimpio)
        .single()

      if (perfilError || !perfilPorUsuario?.email) {
        setError('No existe un perfil con ese usuario. Escríbelo sin @ o usa el correo.')
        setCargando(false)
        return
      }

      perfil = perfilPorUsuario
      emailFinal = perfilPorUsuario.email.trim().toLowerCase()
    }

    if (perfil && perfil.activo === false) {
      setError('Tu usuario está desactivado.')
      setCargando(false)
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailFinal,
      password,
    })

    if (authError) {
      if (
        authError.message?.toLowerCase().includes('email not confirmed') ||
        authError.message?.toLowerCase().includes('email_not_confirmed')
      ) {
        setError('Ese usuario existe, pero su correo no está confirmado en Auth.')
      } else if (
        authError.message?.toLowerCase().includes('invalid login credentials')
      ) {
        setError('El perfil existe, pero ese usuario todavía no está creado correctamente en Auth o la contraseña no coincide.')
      } else {
        setError(authError.message || 'No se pudo iniciar sesión.')
      }

      setCargando(false)
      return
    }

    const { data: perfilActual, error: perfilActualError } = await supabase
      .from('perfiles')
      .select('debe_cambiar_pass, activo')
      .eq('user_id', authData.user.id)
      .single()

    if (!perfilActualError && perfilActual?.debe_cambiar_pass) {
      navigate('/admin/cambiar-password')
      return
    }

    navigate('/admin/dashboard')
  }
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0804',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(155,45,142,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', bottom: -20, left: 0, right: 0,
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(60px, 15vw, 180px)',
        color: 'rgba(245,240,232,0.02)',
        textAlign: 'center', letterSpacing: 8,
        pointerEvents: 'none', userSelect: 'none',
      }}>ACCESO</div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 6, color: '#f5f0e8', marginBottom: 8 }}>
            <span style={{ color: '#9B2D8E' }}>✕</span>
            {' '}NADIE NOS LEE{' '}
            <span style={{ color: '#8B1A1A' }}>✕</span>
          </div>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)' }}>Panel de miembros</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 8 }}>Usuario o correo</label>
            <input type="text" required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="usuario_sin_arroba o correo@dominio.com"
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.1)', color: '#f5f0e8', outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
            />
          </div>

          <div>
            <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 8 }}>Contraseña</label>

            <div style={{ position: 'relative' }}>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 46px 14px 16px', background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.1)', color: '#f5f0e8', outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#9B2D8E'}
                onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
              />

              <button
                type="button"
                onClick={() => setMostrarPassword(prev => !prev)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 12,
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  color: 'rgba(245,240,232,0.55)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#f5f0e8' }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.55)' }}
              >
                <EyeIcon visible={mostrarPassword} />
              </button>
            </div>
          </div>

          {/* Switch recordar sesión */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <div>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, color: 'rgba(245,240,232,0.55)', textTransform: 'uppercase', marginBottom: 2 }}>
                Mantener sesión iniciada
              </p>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: 'rgba(245,240,232,0.2)', textTransform: 'uppercase' }}>
                {recordar ? 'Sesión persistente' : 'Solo esta pestaña'}
              </p>
            </div>
            <Switch activo={recordar} onChange={setRecordar} />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(139,26,26,0.15)', border: '1px solid rgba(139,26,26,0.3)', fontFamily: "'Courier Prime', monospace", fontSize: 11, color: '#e05555', letterSpacing: 0.5 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando}
            style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', background: cargando ? 'rgba(155,45,142,0.5)' : '#9B2D8E', color: '#f5f0e8', border: 'none', padding: '16px', cursor: cargando ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'background 0.3s, transform 0.2s' }}
            onMouseOver={e => { if (!cargando) e.target.style.background = '#b535a8' }}
            onMouseOut={e => { if (!cargando) e.target.style.background = '#9B2D8E' }}
          >
            {cargando ? 'Verificando...' : 'Entrar al panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,240,232,0.2)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = 'rgba(245,240,232,0.5)'}
            onMouseOut={e => e.target.style.color = 'rgba(245,240,232,0.2)'}
          >← Volver al sitio</a>
        </div>
      </div>
    </main>
  )
}