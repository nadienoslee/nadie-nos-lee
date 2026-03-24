import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'
import FileUploader from '../components/FileUploader'
const ESTADO_CONFIG = {
  'Abierta':      { bg: '#22a16a' },
  'Cerrada':      { bg: 'rgba(26,18,8,0.35)' },
  'Próximamente': { bg: '#b8943a' },
  'En revisión':  { bg: '#3AABDC' },
}

function parseFecha(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function diasRestantes(fecha_cierre) {
  if (!fecha_cierre) return null
  const f = parseFecha(fecha_cierre)
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.ceil((f - hoy) / (1000 * 60 * 60 * 24))
}

function useCountdown(fecha_cierre) {
  const [restante, setRestante] = useState(null)
  useEffect(() => {
    if (!fecha_cierre) return
    const calcular = () => {
      const f = parseFecha(fecha_cierre)
      if (!f) return
      f.setHours(23, 59, 59, 0)
      const diff = f - new Date()
      if (diff <= 0) { setRestante({ expirado: true }); return }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setRestante({ d, h, m, s, expirado: false })
    }
    calcular()
    const t = setInterval(calcular, 1000)
    return () => clearInterval(t)
  }, [fecha_cierre])
  return restante
}

function getTextColor(bgColor) {
  if (!bgColor) return '#1a1208'
  let color = bgColor.replace('#', '')
  if (color.length === 3) color = color.split('').map(c => c + c).join('')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#1a1208' : '#ffffff'
}

function CountdownBlock({ fecha_cierre, color }) {
  const cd = useCountdown(fecha_cierre)
  const f = parseFecha(fecha_cierre)
  if (!f) return null
  const urgente = diasRestantes(fecha_cierre) !== null && diasRestantes(fecha_cierre) <= 7
  const colorFondo = urgente ? '#8B1A1A' : color
  return (
    <div style={{ padding: '28px 24px', background: '#faf6ee', border: `1px solid ${color}22`, textAlign: 'center' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 12, fontWeight: '700' }}>Fecha límite</p>
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color, lineHeight: 1, marginBottom: 4 }}>
        {f.getDate()} de {f.toLocaleDateString('es-MX', { month: 'long' }).toUpperCase()}
      </p>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.45)', letterSpacing: 1, marginBottom: 20 }}>{f.getFullYear()}</p>
      {cd && !cd.expirado ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
            {[{ v: cd.d, u: 'días' }, { v: cd.h, u: 'hrs' }, { v: cd.m, u: 'min' }, { v: cd.s, u: 'seg' }].map(({ v, u }) => (
              <div key={u} style={{ background: colorFondo, padding: '10px 4px' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontWeight: '700' }}>{u}</div>
              </div>
            ))}
          </div>
          {urgente && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8B1A1A', fontWeight: '700' }}>¡Últimos días!</p>}
        </>
      ) : cd?.expirado ? (
        <div style={{ padding: '10px 20px', background: 'rgba(26,18,8,0.1)', display: 'inline-block' }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: 'rgba(26,18,8,0.45)', fontWeight: '700' }}>Convocatoria cerrada</span>
        </div>
      ) : null}
    </div>
  )
}

export default function ConvocatoriaDetalle() {
  const { id } = useParams()
  const [c, setC]         = useState(null)
  const [cargando, setCargando] = useState(true)
const [formulario, setFormulario] = useState({ nombre: '', email: '', pseudonimo: '', texto: '', convocatoria_id: id })
  const [archivos, setArchivos]     = useState([])
  const [enviado, setEnviado]       = useState(false)
  const [enviando, setEnviando]     = useState(false)
  const [errores, setErrores]       = useState({})

  usePageTitle(`NADIE NOS LEE | ${c?.titulo || 'CONVOCATORIA'}`)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('convocatorias').select('*').eq('id', id).single()
      setC(data || null)
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, color: 'rgba(26,18,8,0.35)' }}>Cargando...</p>
    </main>
  )

  if (!c) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: 'rgba(26,18,8,0.4)', fontStyle: 'italic' }}>Convocatoria no encontrada.</p>
        <Link to="/convocatorias" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#8B1A1A', display: 'inline-block', marginTop: 20 }}>← Volver a convocatorias</Link>
      </div>
    </main>
  )

  const color = c.color || '#8B1A1A'
  const est   = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG['Cerrada']

  const validar = () => {
    const e = {}
    if (!formulario.nombre.trim()) e.nombre = 'Requerido'
    if (!formulario.email.trim() || !formulario.email.includes('@')) e.email = 'Email válido requerido'
    if (!formulario.texto.trim()) e.texto = 'El texto es obligatorio'
    setErrores(e)
    return Object.keys(e).length === 0
  }

const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setEnviando(true)

    // Subir archivos si hay
    const archivosSubidos = []
    for (const a of archivos) {
      const path = `convocatorias/${c.id}/${Date.now()}_${a.nombre}`
      const { error } = await supabase.storage.from('envios').upload(path, a.file, { upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage.from('envios').getPublicUrl(path)
        archivosSubidos.push({ nombre: a.nombre, url: urlData.publicUrl, path })
      }
    }

    // Guardar envío en tabla
    await supabase.from('envios').insert({
      convocatoria_id: c.id,
      nombre: formulario.nombre,
      email: formulario.email,
      pseudonimo: formulario.pseudonimo || null,
      texto: formulario.texto,
      archivos: archivosSubidos,
      estado: 'Pendiente',
    })

    await supabase.from('actividad_log').insert({
      accion: 'nuevo', seccion: 'convocatorias',
      descripcion: `Envío "${c.titulo}" por ${formulario.nombre} (${formulario.email})${archivosSubidos.length > 0 ? ` — ${archivosSubidos.length} archivo(s)` : ''}`,
    })

    setEnviando(false)
    setEnviado(true)
  }

const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: '#fff', border: '1px solid rgba(26,18,8,0.2)',
    color: '#1a1208', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 20,
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box', borderRadius: 4,
    lineHeight: 1.5, boxShadow: 'inset 0 1px 3px rgba(26,18,8,0.04)',
  }
  const labelStyle = {
    fontFamily: "'Courier Prime', monospace", fontSize: 11,
    letterSpacing: 2, textTransform: 'uppercase',
    color: 'rgba(26,18,8,0.55)', display: 'block', marginBottom: 8, fontWeight: '700',
  }

  return (
    <main>
      {/* HERO */}
      <section style={{
        background: c.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${color} 0%, ${color}cc 50%, #1a1208 100%)`,
        padding: '80px 40px 60px', position: 'relative', overflow: 'hidden', minHeight: 360,
        display: 'flex', alignItems: 'flex-end',
      }}>
        {c.imagen_url && (
          <>
            <img src={c.imagen_url} alt={c.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.92) 0%, rgba(26,18,8,0.55) 50%, rgba(26,18,8,0.1) 100%)' }} />
          </>
        )}
        {!c.imagen_url && (
          <span style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(100px, 18vw, 260px)', color: 'rgba(255,255,255,0.05)', lineHeight: 1, userSelect: 'none', letterSpacing: 4, whiteSpace: 'nowrap' }}>CONVOCATORIA</span>
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <Link to="/convocatorias" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, transition: 'color 0.2s', textDecoration: 'none' }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >← Volver a convocatorias</Link>

          <AnimatedSection direction="up">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: est.bg, padding: '5px 16px', fontWeight: '700' }}>{c.estado}</span>
              {c.generos?.map(g => (
                <span key={g} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '4px 12px', textTransform: 'uppercase' }}>{g}</span>
              ))}
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 7vw, 90px)', letterSpacing: 3, color: '#f5ede0', lineHeight: 0.95, marginBottom: 20 }}>{c.titulo}</h1>
            {c.descripcion && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', color: 'rgba(245,237,224,0.7)', maxWidth: 640, lineHeight: 1.65 }}>{c.descripcion}</p>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* CONTENIDO */}
      <section style={{ background: '#faf6ee', padding: '60px 40px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48 }}>

          {/* COLUMNA IZQUIERDA */}
          <AnimatedSection direction="right">
            <div>
              {/* Link externo */}
              {c.link_url && (
                <a href={c.link_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', marginBottom: 28, position: 'relative' }}
                  onMouseOver={e => e.currentTarget.querySelector('img')?.style && (e.currentTarget.querySelector('img').style.opacity = '0.85')}
                  onMouseOut={e => e.currentTarget.querySelector('img')?.style && (e.currentTarget.querySelector('img').style.opacity = '1')}
                >
                  {c.imagen_url && (
                    <>
                      <img src={c.imagen_url} alt={c.titulo} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', border: `2px solid ${color}22`, display: 'block', transition: 'opacity 0.2s' }} />
                      <span style={{ position: 'absolute', bottom: 10, right: 10, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: 'rgba(26,18,8,0.7)', padding: '4px 10px', backdropFilter: 'blur(4px)', fontWeight: '700' }}>Ver publicación →</span>
                    </>
                  )}
                </a>
              )}

              {/* Descripción larga */}
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 18, fontWeight: '700' }}>Sobre esta convocatoria</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.9, color: 'rgba(26,18,8,0.72)', marginBottom: 36, whiteSpace: 'pre-line' }}>
                {c.descripcion_larga || c.descripcion}
              </p>

              {/* Géneros */}
              {c.generos?.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 12, fontWeight: '700' }}>Géneros aceptados</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.generos.map(g => (
                      <span key={g} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color, background: color + '12', border: `1px solid ${color}33`, padding: '6px 14px', textTransform: 'uppercase', fontWeight: '700' }}>{g}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reglas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {c.extension && (
                  <div style={{ padding: '16px', background: color + '07', borderLeft: `3px solid ${color}` }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 6, fontWeight: '700' }}>Extensión</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#1a1208', fontWeight: 600 }}>{c.extension}</p>
                  </div>
                )}
                {c.formato && (
                  <div style={{ padding: '16px', background: color + '07', borderLeft: `3px solid ${color}` }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 6, fontWeight: '700' }}>Formato</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#1a1208', fontWeight: 600 }}>{c.formato}</p>
                  </div>
                )}
                {c.limite_por_usuario && (
                  <div style={{ padding: '16px', background: color + '07', borderLeft: `3px solid ${color}` }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 6, fontWeight: '700' }}>Envíos por persona</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#1a1208', fontWeight: 600 }}>{c.limite_por_usuario}</p>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* COLUMNA DERECHA */}
          <AnimatedSection direction="left" delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Countdown */}
              {c.fecha_cierre && <CountdownBlock fecha_cierre={c.fecha_cierre} color={color} />}

              {/* Flags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  c.permite_pseudonimo && { icon: '◎', text: 'Se acepta pseudónimo' },
                  c.permite_archivo    && { icon: '↳', text: 'Puedes adjuntar archivo' },
                  { icon: '✉', text: 'Envío por formulario' },
                ].filter(Boolean).map((flag, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid rgba(26,18,8,0.07)' }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color, fontWeight: '700' }}>{flag.icon}</span>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(26,18,8,0.55)', fontWeight: '700' }}>{flag.text}</span>
                  </div>
                ))}
              </div>

              {/* Link externo */}
              {c.link_url && (
                <a href={c.link_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', background: color, color: '#fff', textDecoration: 'none', transition: 'opacity 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' }}>Ver publicación →</span>
                </a>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FORMULARIO — solo si está abierta */}
      {c.estado === 'Abierta' && (
        <section style={{ background: '#f5ede0', padding: '80px 40px 120px', borderTop: '1px solid rgba(26,18,8,0.08)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <AnimatedSection direction="up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ width: 36, height: 2, background: color }} />
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color, fontWeight: '700' }}>Participa</p>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, color: '#1a1208', marginBottom: 48, lineHeight: 1.1 }}>
                Envía tu texto a<br /><em>{c.titulo}</em>
              </h2>
            </AnimatedSection>

            {enviado ? (
              <AnimatedSection direction="up">
                <div style={{ padding: '64px', textAlign: 'center', background: '#fff', border: '2px solid rgba(34,161,106,0.25)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,161,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28, color: '#22a16a' }}>✓</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#1a1208', marginBottom: 16, fontWeight: 400 }}>Texto recibido</h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.55)', fontStyle: 'italic', lineHeight: 1.7 }}>
                    Lo leeremos con cuidado y te responderemos pronto.<br />Gracias por confiar en Nadie Nos Lee.
                  </p>
                </div>
              </AnimatedSection>
            ) : (
              <AnimatedSection direction="up" delay={0.1}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid rgba(26,18,8,0.08)' }}>

                  <div style={{ padding: '36px 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 24, fontWeight: '700' }}>01 — Identificación</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                      <div>
                        <label style={labelStyle}>Nombre completo <span style={{ color }}>*</span></label>
                        <input type="text" placeholder="Tu nombre completo" value={formulario.nombre}
                          onChange={e => setFormulario(p => ({ ...p, nombre: e.target.value }))}
                          style={{ ...inputStyle, borderColor: errores.nombre ? color : 'rgba(26,18,8,0.15)' }}
                          onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = errores.nombre ? color : 'rgba(26,18,8,0.15)'} />
                        {errores.nombre && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color, marginTop: 4 }}>{errores.nombre}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Correo electrónico <span style={{ color }}>*</span></label>
                        <input type="email" placeholder="tu@correo.com" value={formulario.email}
                          onChange={e => setFormulario(p => ({ ...p, email: e.target.value }))}
                          style={{ ...inputStyle, borderColor: errores.email ? color : 'rgba(26,18,8,0.15)' }}
                          onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = errores.email ? color : 'rgba(26,18,8,0.15)'} />
                        {errores.email && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color, marginTop: 4 }}>{errores.email}</p>}
                      </div>
                      {c.permite_pseudonimo && (
                        <div>
                          <label style={labelStyle}>Pseudónimo (opcional)</label>
                          <input type="text" placeholder="Nombre con el que deseas publicar" value={formulario.pseudonimo}
                            onChange={e => setFormulario(p => ({ ...p, pseudonimo: e.target.value }))}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info conv */}
                  <div style={{ padding: '20px 40px', background: color + '08', borderBottom: '1px solid rgba(26,18,8,0.06)', borderLeft: `4px solid ${color}` }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color, fontWeight: '700', marginBottom: 4 }}>{c.titulo}</p>
                    {c.generos?.length > 0 && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(26,18,8,0.55)' }}>Géneros: {c.generos.join(', ')}</p>}
                    {c.extension && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'rgba(26,18,8,0.55)' }}>Extensión: {c.extension}</p>}
                  </div>

<div style={{ padding: '36px 40px', borderBottom: c.permite_archivo ? '1px solid rgba(26,18,8,0.06)' : 'none' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 24, fontWeight: '700' }}>02 — Tu texto</p>
                    <label style={labelStyle}>Texto <span style={{ color }}>*</span></label>
<textarea required rows={10} placeholder="Pega o escribe tu texto aquí..." value={formulario.texto}
                      onChange={e => setFormulario(p => ({ ...p, texto: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8, borderColor: errores.texto ? color : 'rgba(26,18,8,0.2)', minHeight: 200 }}
                      onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = errores.texto ? color : 'rgba(26,18,8,0.15)'} />
                    {formulario.texto && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, background: 'rgba(26,18,8,0.04)', padding: '4px 12px', borderRadius: 999 }}>
                          {formulario.texto.trim().split(/\s+/).filter(Boolean).length} palabras
                        </span>
                      </div>
                    )}
                    {errores.texto && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color, marginTop: 4 }}>{errores.texto}</p>}
                  </div>

                  {/* Archivos — solo si la convocatoria lo permite */}
                  {c.permite_archivo && (
                    <div style={{ padding: '36px 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 8, fontWeight: '700' }}>03 — Archivos adjuntos</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'rgba(26,18,8,0.5)', fontStyle: 'italic', marginBottom: 20 }}>
                        Puedes adjuntar hasta {c.limite_archivos || 3} archivo{(c.limite_archivos || 3) !== 1 ? 's' : ''} de respaldo (PDF, Word, TXT).
                      </p>
                      <FileUploader
                        archivos={archivos}
                        setArchivos={setArchivos}
                        maxArchivos={c.limite_archivos || 3}
                        color={color}
                        formatosPermitidos={['.pdf', '.doc', '.docx', '.txt', '.rtf']}
                      />
                    </div>
                  )}

                  <div style={{ padding: '24px 40px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(26,18,8,0.06)' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: 'rgba(26,18,8,0.35)', maxWidth: 320, lineHeight: 1.6 }}>
                      Tu información es confidencial y solo se usará para el proceso de selección.
                    </p>
                    <button type="submit" disabled={enviando}
                      style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', background: color, color: '#fff', border: 'none', padding: '18px 40px', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'opacity 0.3s, transform 0.2s', opacity: enviando ? 0.7 : 1 }}
                      onMouseOver={e => { if (!enviando) { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}}
                      onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}>
                      {enviando ? 'Enviando...' : 'Enviar texto →'}
                    </button>
                  </div>
                </form>
              </AnimatedSection>
            )}
          </div>
        </section>
      )}
    </main>
  )
}