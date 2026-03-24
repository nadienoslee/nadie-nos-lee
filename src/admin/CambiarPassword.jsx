import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function validarPassword(pass) {
  const errores = []
  if (pass.length < 8) errores.push('Mínimo 8 caracteres')
  if ((pass.match(/[A-Z]/g) || []).length !== 1) errores.push('Exactamente 1 mayúscula')
  if (!/[a-z]/.test(pass)) errores.push('Al menos una minúscula')
  if (!/[0-9]/.test(pass)) errores.push('Al menos un número')
  if (!/[!@#$%&*?]/.test(pass)) errores.push('Al menos un símbolo (!@#$%&*?)')
  return errores
}

function EyeIcon({ visible }) {
  if (visible) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.31"/>
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/><path d="M1 1l22 22"/>
    </svg>
  )
}

export default function CambiarPassword() {
  const [paso, setPaso]                   = useState(1) // 1: contraseña, 2: foto
  const [nueva, setNueva]                 = useState('')
  const [confirmar, setConfirmar]         = useState('')
  const [mostrar, setMostrar]             = useState(false)
  const [errores, setErrores]             = useState([])
  const [cargando, setCargando]           = useState(false)
  const [fotoPreview, setFotoPreview]     = useState(null)
  const [fotoFile, setFotoFile]           = useState(null)
  const [subiendoFoto, setSubiendoFoto]   = useState(false)
  const [feedback, setFeedback]           = useState(null)
  const fileRef = useRef(null)
  const navigate = useNavigate()

  const mostrarFeedback = (msg, tipo = 'exito') => {
    setFeedback({ msg, tipo })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleNuevaChange = (e) => {
    setNueva(e.target.value)
    setErrores(validarPassword(e.target.value))
  }

  const handleGuardarPassword = async () => {
    const errs = validarPassword(nueva)
    if (errs.length > 0) { setErrores(errs); return }
    if (nueva !== confirmar) {
      mostrarFeedback('Las contraseñas no coinciden', 'error'); return
    }

    setCargando(true)

    // Cambiar contraseña en Auth
    const { error: authError } = await supabase.auth.updateUser({ password: nueva })
    if (authError) {
      mostrarFeedback(`Error: ${authError.message}`, 'error')
      setCargando(false); return
    }

    // Marcar que ya no necesita cambio
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('perfiles')
      .update({ debe_cambiar_pass: false, pass_temporal: null })
      .eq('user_id', user.id)

    setCargando(false)
    setPaso(2)
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleSubirFoto = async () => {
    if (!fotoFile) { irAlPanel(); return }
    setSubiendoFoto(true)

    const { data: { user } } = await supabase.auth.getUser()
    const ext = fotoFile.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: upError } = await supabase.storage
      .from('avatares')
      .upload(path, fotoFile, { upsert: true })

    if (upError) {
      mostrarFeedback('No se pudo subir la foto, puedes hacerlo desde tu perfil', 'advertencia')
      setSubiendoFoto(false)
      setTimeout(() => irAlPanel(), 2000)
      return
    }

    const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(path)
    const url = urlData.publicUrl + '?t=' + Date.now()

    await supabase.from('perfiles').update({ foto_url: url }).eq('user_id', user.id)

    setSubiendoFoto(false)
    irAlPanel()
  }

  const irAlPanel = () => navigate('/admin/dashboard')

  const inp = {
    width: '100%', padding: '14px 46px 14px 16px',
    background: 'rgba(245,240,232,0.04)',
    border: '1px solid rgba(245,240,232,0.1)',
    color: '#f5f0e8', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 18,
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  }
  const lbl = {
    fontFamily: "'Courier Prime', monospace", fontSize: 10,
    letterSpacing: 2, textTransform: 'uppercase',
    color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 8,
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#0a0804',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(155,45,142,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {feedback && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: feedback.tipo === 'error' ? '#8B1A1A' : feedback.tipo === 'advertencia' ? '#b8943a' : '#22a16a',
          color: '#fff', padding: '14px 28px',
          fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 1,
          zIndex: 300, boxShadow: '0 8px 32px rgba(26,18,8,0.2)',
          borderRadius: 6, maxWidth: '80vw', textAlign: 'center', fontWeight: '600',
        }}>
          {feedback.msg}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 6, color: '#f5f0e8', marginBottom: 8 }}>
            <span style={{ color: '#9B2D8E' }}>✕</span>{' '}NADIE NOS LEE{' '}<span style={{ color: '#8B1A1A' }}>✕</span>
          </div>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)' }}>
            {paso === 1 ? 'Configura tu acceso' : 'Foto de perfil'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {[1, 2].map(p => (
            <div key={p} style={{
              height: 3, width: 60, borderRadius: 2,
              background: p <= paso ? '#9B2D8E' : 'rgba(245,240,232,0.1)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* PASO 1: Cambiar contraseña */}
        {paso === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              padding: '16px 20px',
              background: 'rgba(155,45,142,0.08)',
              border: '1px solid rgba(155,45,142,0.2)',
              borderRadius: 6, marginBottom: 4,
            }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#f5f0e8', marginBottom: 4 }}>
                Bienvenido al panel
              </p>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(245,240,232,0.4)', fontWeight: '600' }}>
                Es tu primer acceso. Por seguridad, debes establecer tu contraseña personal antes de continuar.
              </p>
            </div>

            <div>
              <label style={lbl}>Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrar ? 'text' : 'password'}
                  value={nueva}
                  onChange={handleNuevaChange}
                  placeholder="••••••••"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#9B2D8E'}
                  onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
                />
                <button type="button" onClick={() => setMostrar(p => !p)}
                  style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, color: 'rgba(245,240,232,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <EyeIcon visible={mostrar} />
                </button>
              </div>
              {errores.length > 0 && nueva && errores.map((e, i) => (
                <p key={i} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#e05555', letterSpacing: 1, marginTop: 4, fontWeight: '600' }}>✕ {e}</p>
              ))}
              {nueva && errores.length === 0 && (
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#22a16a', letterSpacing: 1, marginTop: 4, fontWeight: '700' }}>✓ Contraseña válida</p>
              )}
            </div>

            <div>
              <label style={lbl}>Confirmar contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inp, paddingRight: 16 }}
                  onFocus={e => e.target.style.borderColor = '#9B2D8E'}
                  onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
                />
              </div>
              {confirmar && nueva !== confirmar && (
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#e05555', letterSpacing: 1, marginTop: 4, fontWeight: '600' }}>✕ Las contraseñas no coinciden</p>
              )}
              {confirmar && nueva === confirmar && errores.length === 0 && (
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#22a16a', letterSpacing: 1, marginTop: 4, fontWeight: '700' }}>✓ Coinciden</p>
              )}
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(58,171,220,0.06)', border: '1px solid rgba(58,171,220,0.15)', borderRadius: 6 }}>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(58,171,220,0.7)', letterSpacing: 1, lineHeight: 1.8, fontWeight: '600' }}>
                Requisitos: exactamente 1 mayúscula · minúsculas · 1 número · 1 símbolo (!@#$%&*?) · mínimo 8 caracteres
              </p>
            </div>

            <button
              onClick={handleGuardarPassword}
              disabled={cargando || errores.length > 0 || nueva !== confirmar || !nueva}
              style={{
                fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3,
                textTransform: 'uppercase',
                background: (cargando || errores.length > 0 || nueva !== confirmar || !nueva)
                  ? 'rgba(155,45,142,0.3)' : '#9B2D8E',
                color: '#f5f0e8', border: 'none', padding: '16px',
                cursor: (cargando || errores.length > 0 || nueva !== confirmar || !nueva) ? 'not-allowed' : 'pointer',
                marginTop: 8, transition: 'background 0.3s',
              }}
              onMouseOver={e => { if (!cargando) e.currentTarget.style.background = '#b535a8' }}
              onMouseOut={e => { if (!cargando) e.currentTarget.style.background = '#9B2D8E' }}
            >
              {cargando ? 'Guardando...' : 'Establecer contraseña →'}
            </button>
          </div>
        )}

        {/* PASO 2: Foto de perfil */}
        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#f5f0e8', marginBottom: 8 }}>
                ¿Quieres agregar una foto?
              </p>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(245,240,232,0.35)', fontWeight: '600' }}>
                Opcional — puedes hacerlo después desde tu perfil
              </p>
            </div>

            {/* Preview foto */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                border: `2px dashed ${fotoPreview ? '#9B2D8E' : 'rgba(245,240,232,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                transition: 'border-color 0.2s',
                background: fotoPreview ? 'transparent' : 'rgba(245,240,232,0.03)',
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#9B2D8E'}
              onMouseOut={e => { if (!fotoPreview) e.currentTarget.style.borderColor = 'rgba(245,240,232,0.2)' }}
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 6 }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase', fontWeight: '700' }}>Subir foto</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />

            {fotoPreview && (
              <button
                onClick={() => { setFotoPreview(null); setFotoFile(null) }}
                style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', background: 'none', border: '1px solid rgba(245,240,232,0.15)', color: 'rgba(245,240,232,0.4)', padding: '6px 14px', cursor: 'pointer', borderRadius: 4, fontWeight: '700' }}
              >
                Quitar foto
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button
                onClick={handleSubirFoto}
                disabled={subiendoFoto}
                style={{
                  fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3,
                  textTransform: 'uppercase',
                  background: subiendoFoto ? 'rgba(155,45,142,0.5)' : '#9B2D8E',
                  color: '#f5f0e8', border: 'none', padding: '16px',
                  cursor: subiendoFoto ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s',
                }}
                onMouseOver={e => { if (!subiendoFoto) e.currentTarget.style.background = '#b535a8' }}
                onMouseOut={e => { if (!subiendoFoto) e.currentTarget.style.background = '#9B2D8E' }}
              >
                {subiendoFoto ? 'Subiendo...' : fotoFile ? 'Guardar foto e ingresar →' : 'Ingresar sin foto →'}
              </button>

              <button
                onClick={irAlPanel}
                style={{
                  fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2,
                  textTransform: 'uppercase', background: 'none',
                  border: '1px solid rgba(245,240,232,0.08)',
                  color: 'rgba(245,240,232,0.3)', padding: '12px',
                  cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.5)'; e.currentTarget.style.borderColor = 'rgba(245,240,232,0.15)' }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.3)'; e.currentTarget.style.borderColor = 'rgba(245,240,232,0.08)' }}
              >
                Omitir por ahora
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}