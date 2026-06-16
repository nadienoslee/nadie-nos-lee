import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const ESTADO_CONFIG = {
  'Abierta':      { bg: '#22a16a', label: 'Abierta' },
  'Cerrada':      { bg: 'rgba(26,18,8,0.35)', label: 'Cerrada' },
  'Próximamente': { bg: '#b8943a', label: 'Próximamente' },
  'En revisión':  { bg: '#3AABDC', label: 'En revisión' },
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

function CountdownInline({ fecha_cierre, color }) {
  const cd = useCountdown(fecha_cierre)
  const dias = diasRestantes(fecha_cierre)
  const urgente = dias !== null && dias <= 7 && dias >= 0
  const colorFondo = urgente ? '#8B1A1A' : color
  if (!cd) return null
  if (cd.expirado) return (
    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>Cerrada</span>
  )
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[{ v: cd.d, u: 'd' }, { v: cd.h, u: 'h' }, { v: cd.m, u: 'm' }, { v: cd.s, u: 's' }].map(({ v, u }) => (
        <div key={u} style={{ background: 'rgba(0,0,0,0.25)', padding: '3px 6px', textAlign: 'center', minWidth: 32 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#fff', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 7, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>{u}</div>
        </div>
      ))}
      {urgente && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: '#fff', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700', marginLeft: 4 }}>¡Últimos días!</span>}
    </div>
  )
}

function CountdownBlock({ fecha_cierre, color }) {
  const cd = useCountdown(fecha_cierre)
  const f = parseFecha(fecha_cierre)
  if (!f) return null
  const urgente = diasRestantes(fecha_cierre) !== null && diasRestantes(fecha_cierre) <= 7
  const colorFondo = urgente ? '#8B1A1A' : color
  return (
    <div style={{ padding: '24px 20px', background: '#faf6ee', border: `1px solid ${color}22`, textAlign: 'center' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 10, fontWeight: '700' }}>Fecha límite</p>
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color, lineHeight: 1, marginBottom: 4 }}>
        {f.getDate()} de {f.toLocaleDateString('es-MX', { month: 'long' }).toUpperCase()}
      </p>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.45)', letterSpacing: 1, marginBottom: 16 }}>{f.getFullYear()}</p>
      {cd && !cd.expirado ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 10 }}>
            {[{ v: cd.d, u: 'días' }, { v: cd.h, u: 'hrs' }, { v: cd.m, u: 'min' }, { v: cd.s, u: 'seg' }].map(({ v, u }) => (
              <div key={u} style={{ background: colorFondo, padding: '8px 4px' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#fff', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontWeight: '700' }}>{u}</div>
              </div>
            ))}
          </div>
          {urgente && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8B1A1A', fontWeight: '700' }}>¡Últimos días!</p>}
        </>
      ) : cd?.expirado ? (
        <div style={{ padding: '8px 16px', background: 'rgba(26,18,8,0.1)', display: 'inline-block' }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(26,18,8,0.45)', fontWeight: '700' }}>Convocatoria cerrada</span>
        </div>
      ) : null}
    </div>
  )
}

const FILTROS = ['Todas', 'Abierta', 'Cerrada', 'Próximamente', 'En revisión']

export default function Convocatorias() {
  usePageTitle('NADIE NOS LEE | CONVOCATORIAS')
  const [convocatorias, setConvocatorias] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [filtro, setFiltro]               = useState('Todas')
  const [abiertaId, setAbiertaId]         = useState(null)
  const [formulario, setFormulario]       = useState({ nombre: '', email: '', pseudonimo: '', texto: '', convocatoria_id: '' })
  const [enviado, setEnviado]             = useState(false)
  const [enviando, setEnviando]           = useState(false)
  const [errores, setErrores]             = useState({})

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('convocatorias').select('*').eq('publicado', true).order('created_at', { ascending: false })
      if (data) setConvocatorias(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('conv-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'convocatorias' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const filtradas = filtro === 'Todas' ? convocatorias : convocatorias.filter(c => c.estado === filtro)
  const abiertas = convocatorias.filter(c => c.estado === 'Abierta')

  const validar = () => {
    const e = {}
    if (!formulario.nombre.trim()) e.nombre = 'Requerido'
    if (!formulario.email.trim() || !formulario.email.includes('@')) e.email = 'Email válido requerido'
    if (!formulario.convocatoria_id) e.convocatoria_id = 'Selecciona una convocatoria'
    if (!formulario.texto.trim()) e.texto = 'El texto es obligatorio'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setEnviando(true)
    const conv = convocatorias.find(c => c.id === formulario.convocatoria_id)
    await supabase.from('actividad_log').insert({
      accion: 'nuevo', seccion: 'convocatorias',
      descripcion: `Envío "${conv?.titulo || ''}" por ${formulario.nombre} (${formulario.email})`,
    })
    setEnviando(false)
    setEnviado(true)
  }

const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: '#fff', border: '1px solid rgba(26,18,8,0.15)',
    color: '#1a1208', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 19,
    transition: 'border-color 0.2s', boxSizing: 'border-box', borderRadius: 2,
  }
  const labelStyle = {
    fontFamily: "'Courier Prime', monospace", fontSize: 10,
    letterSpacing: 2, textTransform: 'uppercase',
    color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 7, fontWeight: '700',
  }

  return (
    <main>
    {/* HERO */}
      <section style={{ background: '#f5ede0', padding: isMobile ? '80px 20px 60px' : '100px 40px 80px', borderBottom: '1px solid rgba(139,26,26,0.12)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(139,26,26,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24 }}>Editorial</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 10vw, 120px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>CONVOCATORIAS<br />ABIERTAS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
              La puerta de entrada para nuevas voces. Lee las bases, conoce las reglas y envía tu trabajo.
            </p>
          </AnimatedSection>
        </div>
      </section>

{/* FILTROS */}
      <section style={{ background: '#faf6ee', padding: isMobile ? '0 12px' : '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4, flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', background: 'none', border: 'none',
              color: filtro === f ? '#1a1208' : 'rgba(26,18,8,0.35)',
              borderBottom: filtro === f ? '3px solid #8B1A1A' : '3px solid transparent',
              padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s',
            }}>{f}</button>
          ))}
        </div>
      </section>

{/* CARDS */}
      <section style={{ background: '#faf6ee', padding: isMobile ? '32px 16px 60px' : '60px 40px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: 'italic', color: 'rgba(26,18,8,0.3)' }}>No hay convocatorias en esta categoría.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, alignItems: 'stretch' }}>
              {filtradas.map((c, i) => {
                const color = c.color || '#8B1A1A'
                const est = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG['Cerrada']
                const estaAbierta = abiertaId === c.id
                const dias = diasRestantes(c.fecha_cierre)
                const urgente = dias !== null && dias <= 7 && dias >= 0
return (
                  <AnimatedSection key={c.id} direction="up" delay={i * 0.08}>
<Link to={`/convocatorias/${c.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
  <div style={{ border: `2px solid ${color}22`, overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s', height: '100%', display: 'flex', flexDirection: 'column' }}
    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.1)'; e.currentTarget.style.borderColor = color + '66' }}
    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = color + '22' }}
  >
                        {/* IMAGEN / BANNER */}
                        <div style={{
                          height: 220,
                          background: c.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${color}33 0%, ${color}10 100%)`,
                          position: 'relative', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {c.imagen_url && (
                            <>
                              <img src={c.imagen_url} alt={c.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.75) 0%, rgba(26,18,8,0.2) 50%, rgba(26,18,8,0.05) 100%)' }} />
                            </>
                          )}
                          {!c.imagen_url && (
                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color, opacity: 0.08, lineHeight: 1, userSelect: 'none', letterSpacing: 4 }}>CONV</span>
                          )}
                          <span style={{ position: 'absolute', top: 16, left: 16, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: est.bg, padding: '4px 12px', fontWeight: '700' }}>{c.estado}</span>
                          {c.generos?.length > 0 && (
                            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {c.generos.slice(0, 2).map(g => (
                                <span key={g} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, color: '#fff', border: '1px solid rgba(255,255,255,0.5)', padding: '3px 8px', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>{g}</span>
                              ))}
                            </div>
                          )}
                          {c.fecha_cierre && c.estado === 'Abierta' && (
                            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                              <CountdownInline fecha_cierre={c.fecha_cierre} color={color} />
                            </div>
                          )}
                        </div>

{/* INFO CARD */}
<div style={{ padding: '24px 26px 24px', background: color, flex: 1, display: 'flex', flexDirection: 'column' }}>
  {c.fecha_cierre && (
    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: getTextColor(color) === '#fff' ? 'rgba(255,255,255,0.65)' : 'rgba(26,18,8,0.55)', letterSpacing: 1, marginBottom: 8 }}>
      Cierre: {parseFecha(c.fecha_cierre)?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>
  )}
  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: getTextColor(color), lineHeight: 1.2, marginBottom: 10, minHeight: 88, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.titulo}</h3>
  {c.descripcion && (
    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, lineHeight: 1.6, color: getTextColor(color) === '#fff' ? 'rgba(255,255,255,0.8)' : 'rgba(26,18,8,0.7)', marginBottom: 12, minHeight: 110, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
      {c.descripcion.length > 100 ? c.descripcion.slice(0, 100) + '...' : c.descripcion}
    </p>
  )}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            {c.link_url && (
                              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: getTextColor(color) === '#fff' ? 'rgba(255,255,255,0.7)' : 'rgba(26,18,8,0.5)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' }}>Ver post →</span>
                            )}
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: getTextColor(color), borderBottom: `1px solid ${getTextColor(color) === '#fff' ? 'rgba(255,255,255,0.55)' : 'rgba(26,18,8,0.35)'}`, fontWeight: '700', marginLeft: 'auto' }}>
                              Ver bases →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* FORMULARIO */}
{abiertas.length > 0 && (
        <section id="formulario-conv" style={{ background: '#f5ede0', padding: isMobile ? '48px 16px 80px' : '80px 40px 120px', borderTop: '1px solid rgba(26,18,8,0.08)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <AnimatedSection direction="up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ width: 36, height: 2, background: '#8B1A1A' }} />
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', fontWeight: '700' }}>Envía tu trabajo</p>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, color: '#1a1208', marginBottom: 48, lineHeight: 1.1 }}>
                Formulario de participación
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
                  <button onClick={() => { setEnviado(false); setFormulario({ nombre: '', email: '', pseudonimo: '', texto: '', convocatoria_id: '' }) }}
                    style={{ marginTop: 32, fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: 'none', border: '1px solid rgba(26,18,8,0.2)', color: 'rgba(26,18,8,0.5)', padding: '12px 28px', cursor: 'pointer' }}>
                    Enviar otro texto
                  </button>
                </div>
              </AnimatedSection>
            ) : (
              <AnimatedSection direction="up" delay={0.1}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#fff', border: '1px solid rgba(26,18,8,0.08)' }}>
              <div style={{ padding: isMobile ? '24px 20px' : '36px 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24, fontWeight: '700' }}>01 — Identificación</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                      <div>
                        <label style={labelStyle}>Nombre completo <span style={{ color: '#8B1A1A' }}>*</span></label>
                        <input type="text" placeholder="Tu nombre completo" value={formulario.nombre}
                          onChange={e => setFormulario(p => ({ ...p, nombre: e.target.value }))}
                          style={{ ...inputStyle, borderColor: errores.nombre ? '#8B1A1A' : 'rgba(26,18,8,0.15)' }}
                          onFocus={e => e.target.style.borderColor = '#8B1A1A'} onBlur={e => e.target.style.borderColor = errores.nombre ? '#8B1A1A' : 'rgba(26,18,8,0.15)'} />
                        {errores.nombre && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#8B1A1A', marginTop: 4 }}>{errores.nombre}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Correo electrónico <span style={{ color: '#8B1A1A' }}>*</span></label>
                        <input type="email" placeholder="tu@correo.com" value={formulario.email}
                          onChange={e => setFormulario(p => ({ ...p, email: e.target.value }))}
                          style={{ ...inputStyle, borderColor: errores.email ? '#8B1A1A' : 'rgba(26,18,8,0.15)' }}
                          onFocus={e => e.target.style.borderColor = '#8B1A1A'} onBlur={e => e.target.style.borderColor = errores.email ? '#8B1A1A' : 'rgba(26,18,8,0.15)'} />
                        {errores.email && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#8B1A1A', marginTop: 4 }}>{errores.email}</p>}
                      </div>
                      {convocatorias.find(c => c.id === formulario.convocatoria_id)?.permite_pseudonimo && (
                        <div>
                          <label style={labelStyle}>Pseudónimo (opcional)</label>
                          <input type="text" placeholder="Nombre con el que deseas publicar" value={formulario.pseudonimo}
                            onChange={e => setFormulario(p => ({ ...p, pseudonimo: e.target.value }))}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#8B1A1A'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'} />
                        </div>
                      )}
                    </div>
                  </div>

<div style={{ padding: isMobile ? '24px 20px' : '36px 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24, fontWeight: '700' }}>02 — Convocatoria</p>
                    <label style={labelStyle}>¿A cuál convocatoria envías? <span style={{ color: '#8B1A1A' }}>*</span></label>
                    <select value={formulario.convocatoria_id}
                      onChange={e => setFormulario(p => ({ ...p, convocatoria_id: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer', borderColor: errores.convocatoria_id ? '#8B1A1A' : 'rgba(26,18,8,0.15)' }}
                      onFocus={e => e.target.style.borderColor = '#8B1A1A'} onBlur={e => e.target.style.borderColor = errores.convocatoria_id ? '#8B1A1A' : 'rgba(26,18,8,0.15)'}>
                      <option value="">— Selecciona una convocatoria —</option>
                      {abiertas.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                    </select>
                    {errores.convocatoria_id && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#8B1A1A', marginTop: 4 }}>{errores.convocatoria_id}</p>}
                    {formulario.convocatoria_id && (() => {
                      const c = convocatorias.find(x => x.id === formulario.convocatoria_id)
                      if (!c) return null
                      return (
                        <div style={{ marginTop: 16, padding: '14px 18px', background: (c.color || '#8B1A1A') + '08', borderLeft: `3px solid ${c.color || '#8B1A1A'}` }}>
                          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: c.color || '#8B1A1A', fontWeight: '700', marginBottom: 4 }}>{c.titulo}</p>
                          {c.generos?.length > 0 && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(26,18,8,0.55)' }}>Géneros: {c.generos.join(', ')}</p>}
                          {c.extension && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(26,18,8,0.55)' }}>Extensión: {c.extension}</p>}
                        </div>
                      )
                    })()}
                  </div>

   <div style={{ padding: isMobile ? '24px 20px' : '36px 40px' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24, fontWeight: '700' }}>03 — Tu texto</p>
                    <label style={labelStyle}>Texto <span style={{ color: '#8B1A1A' }}>*</span></label>
                    <textarea required rows={14} placeholder="Pega o escribe tu texto aquí..." value={formulario.texto}
                      onChange={e => setFormulario(p => ({ ...p, texto: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.85, borderColor: errores.texto ? '#8B1A1A' : 'rgba(26,18,8,0.15)' }}
                      onFocus={e => e.target.style.borderColor = '#8B1A1A'} onBlur={e => e.target.style.borderColor = errores.texto ? '#8B1A1A' : 'rgba(26,18,8,0.15)'} />
                    {formulario.texto && (
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, marginTop: 8 }}>
                        {formulario.texto.trim().split(/\s+/).filter(Boolean).length} palabras
                      </p>
                    )}
                    {errores.texto && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#8B1A1A', marginTop: 4 }}>{errores.texto}</p>}
                  </div>

                  <div style={{ padding: isMobile ? '20px 20px 32px' : '24px 40px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(26,18,8,0.06)' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: 'rgba(26,18,8,0.35)', maxWidth: 320, lineHeight: 1.6 }}>
                      Tu información es confidencial y solo se usará para el proceso de selección.
                    </p>
                    <button type="submit" disabled={enviando}
                      style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', background: '#8B1A1A', color: '#fff', border: 'none', padding: '18px 40px', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'background 0.3s, transform 0.2s', opacity: enviando ? 0.7 : 1 }}
                      onMouseOver={e => { if (!enviando) { e.target.style.background = '#a82020'; e.target.style.transform = 'translateY(-2px)' }}}
                      onMouseOut={e => { e.target.style.background = '#8B1A1A'; e.target.style.transform = 'translateY(0)' }}>
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