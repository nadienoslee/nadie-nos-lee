import { useEffect, useState } from 'react'

export default function Notificacion({
  tipo = 'info',      // 'info' | 'exito' | 'error' | 'advertencia' | 'contrasena'
  titulo,
  mensaje,
  botonTexto,
  botonAccion,
  onCerrar,
  autoclose = false,  // ms para cerrar automáticamente, false = no cierra solo
}) {
  const [visible, setVisible] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
    if (autoclose) {
      const t = setTimeout(() => cerrar(), autoclose)
      return () => clearTimeout(t)
    }
  }, [])

  const cerrar = () => {
    setSaliendo(true)
    setTimeout(() => { setVisible(false); onCerrar && onCerrar() }, 350)
  }

  const config = {
    info:        { color: '#3AABDC', bg: '#f0f9ff', icono: 'ℹ' },
    exito:       { color: '#22a16a', bg: '#f0fdf4', icono: '✓' },
    error:       { color: '#8B1A1A', bg: '#fff5f5', icono: '✕' },
    advertencia: { color: '#b8943a', bg: '#fffbeb', icono: '⚠' },
    contrasena:  { color: '#9B2D8E', bg: '#fdf4ff', icono: '🔔' },
  }

  const c = config[tipo] || config.info

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,18,8,0.45)',
        zIndex: 1000,
        opacity: visible && !saliendo ? 1 : 0,
        transition: 'opacity 0.35s ease',
        backdropFilter: 'blur(4px)',
      }} onClick={cerrar} />

      {/* Card */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: visible && !saliendo
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -48%) scale(0.92)',
        zIndex: 1001,
        width: '90%', maxWidth: 440,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(26,18,8,0.18), 0 4px 16px rgba(26,18,8,0.08)',
        padding: '48px 40px 40px',
        textAlign: 'center',
        opacity: visible && !saliendo ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>

        {/* Botón cerrar */}
        <button onClick={cerrar} style={{
          position: 'absolute', top: 16, right: 16,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(26,18,8,0.06)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'rgba(26,18,8,0.5)',
          transition: 'background 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(26,18,8,0.12)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(26,18,8,0.06)'}
        >✕</button>

        {/* Ícono */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: c.bg,
          border: `3px solid ${c.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: tipo === 'contrasena' ? 36 : 32,
          position: 'relative',
        }}>
          <span>{c.icono}</span>
          {/* Badge número si es contrasena */}
          {tipo === 'contrasena' && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 22, height: 22, borderRadius: '50%',
              background: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, color: '#fff', fontWeight: 'bold',
              border: '2px solid #fff',
            }}>1</div>
          )}
        </div>

        {/* Título */}
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 26, fontWeight: 700,
          color: '#1a1208', marginBottom: 14, lineHeight: 1.2,
        }}>{titulo}</h3>

        {/* Mensaje */}
        {mensaje && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 18, lineHeight: 1.7,
            color: 'rgba(26,18,8,0.6)',
            marginBottom: 32,
          }}>{mensaje}</p>
        )}

        {/* Botón principal */}
        {botonTexto && (
          <button onClick={() => { botonAccion && botonAccion(); cerrar() }} style={{
            width: '100%', padding: '16px',
            background: c.color, color: '#fff',
            border: 'none', borderRadius: 10,
            fontFamily: "'Courier Prime', monospace",
            fontSize: 13, letterSpacing: 2,
            textTransform: 'uppercase', fontWeight: '700',
            cursor: 'pointer',
            transition: 'opacity 0.2s, transform 0.2s',
            marginBottom: 12,
          }}
            onMouseOver={e => { e.target.style.opacity = '0.88'; e.target.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
          >
            {botonTexto} →
          </button>
        )}

        {/* Botón secundario cerrar */}
        <button onClick={cerrar} style={{
          width: '100%', padding: '12px',
          background: 'transparent', color: 'rgba(26,18,8,0.4)',
          border: 'none', cursor: 'pointer',
          fontFamily: "'Courier Prime', monospace",
          fontSize: 11, letterSpacing: 2,
          textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}
          onMouseOver={e => e.target.style.color = 'rgba(26,18,8,0.7)'}
          onMouseOut={e => e.target.style.color = 'rgba(26,18,8,0.4)'}
        >
          Cerrar
        </button>
      </div>

      <style>{`
        @keyframes notif-in {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.88); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}