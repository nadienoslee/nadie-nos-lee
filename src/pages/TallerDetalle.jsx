import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

function parseFecha(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function diasRestantes(fecha) {
  if (!fecha) return null
  const f = parseFecha(fecha)
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.ceil((f - hoy) / (1000 * 60 * 60 * 24))
}

function useCountdown(fecha) {
  const [restante, setRestante] = useState(null)
  useEffect(() => {
    if (!fecha) return
    const calcular = () => {
      const f = parseFecha(fecha)
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
  }, [fecha])
  return restante
}

function CountdownBlock({ fecha, color, label = 'Fecha límite de inscripción' }) {
  const cd = useCountdown(fecha)
  const f = parseFecha(fecha)
  if (!f) return null
  const urgente = diasRestantes(fecha) !== null && diasRestantes(fecha) <= 7
  const colorFondo = urgente ? '#8B1A1A' : color
  return (
    <div style={{ padding: '24px 20px', background: '#faf6ee', border: `1px solid ${color}22`, textAlign: 'center' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 10, fontWeight: '700' }}>{label}</p>
      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color, lineHeight: 1, marginBottom: 4 }}>
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
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(26,18,8,0.45)', fontWeight: '700' }}>Inscripción cerrada</span>
        </div>
      ) : null}
    </div>
  )
}

const camposConfig = {
  nombre:      { label: 'Nombre completo',                     type: 'text',     placeholder: 'Tu nombre' },
  email:       { label: 'Correo electrónico',                  type: 'email',    placeholder: 'tu@correo.com' },
  edad:        { label: 'Edad',                                type: 'number',   placeholder: 'Tu edad' },
  experiencia: { label: '¿Tienes experiencia escribiendo?',    type: 'select',   opciones: ['Primera vez que escribo', 'Escribo de manera casual', 'Tengo práctica continua', 'He tomado talleres antes'] },
  motivacion:  { label: '¿Por qué quieres tomar este taller?', type: 'textarea', placeholder: 'Cuéntanos brevemente...' },
  ciudad:      { label: 'Ciudad / Estado',                     type: 'text',     placeholder: '¿Desde dónde escribes?' },
}

export default function TallerDetalle() {
  const { id } = useParams()
  const [t, setT]           = useState(null)
  const [cargando, setCargando] = useState(true)
  const [formulario, setFormulario] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

usePageTitle(`NADIE NOS LEE | ${t?.titulo || 'TALLER'}`)

  // Verificar si inscripción cerrada por fecha — debe llamarse antes de cualquier return
  const fechaCierreExpirada = t?.fecha_cierre ? (() => {
    const f = parseFecha(t.fecha_cierre)
    f.setHours(23, 59, 59, 0)
    return f < new Date()
  })() : false

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('talleres').select('*').eq('id', id).single()
      setT(data || null)
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, color: 'rgba(26,18,8,0.35)' }}>Cargando...</p>
    </main>
  )

  if (!t) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: 'rgba(26,18,8,0.4)', fontStyle: 'italic' }}>Taller no encontrado.</p>
        <Link to="/talleres" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#3AABDC', display: 'inline-block', marginTop: 20 }}>← Volver a talleres</Link>
      </div>
    </main>
  )

const color = t.color || '#3AABDC'
  const fecha = t.fecha ? parseFecha(t.fecha) : null
  const agotado = t.cupo_tipo === 'limitado' && t.cupo_disponible !== null && t.cupo_disponible <= 0
  const cupoUsado = (t.cupo_total || 0) - (t.cupo_disponible || 0)
  const porcentaje = t.cupo_tipo === 'limitado' && t.cupo_total ? (cupoUsado / t.cupo_total) * 100 : 0
  const inscripcionAbierta = !agotado && !fechaCierreExpirada

  // Estado automático basado en fecha actual
  const estadoAuto = (() => {
    if (!fecha) return null
    const ahora = new Date()
    const inicioDia = new Date(fecha); inicioDia.setHours(0, 0, 0, 0)
    const finDia    = new Date(fecha); finDia.setHours(23, 59, 59, 999)
    if (ahora >= inicioDia && ahora <= finDia) return { label: 'En curso', bg: '#22a16a' }
    if (ahora > finDia) return { label: 'Finalizado', bg: 'rgba(26,18,8,0.35)' }
    return { label: 'Próximo', bg: color }
  })()

  const getCampos = () => {
    if (Array.isArray(t.campos)) return t.campos.filter(c => camposConfig[c])
    return ['nombre', 'email', 'edad', 'experiencia']
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    const { error } = await supabase.from('inscripciones').insert({
      taller_id: t.id,
      nombre: formulario.nombre,
      email: formulario.email,
      datos: formulario,
      estado: 'Pendiente',
    })
    if (!error && t.cupo_tipo === 'limitado') {
      await supabase.from('talleres').update({ cupo_disponible: Math.max(0, (t.cupo_disponible || 1) - 1) }).eq('id', t.id)
    }
    setEnviando(false)
    if (!error) setEnviado(true)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: '#fff', border: '1px solid rgba(26,18,8,0.2)',
    color: '#1a1208', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 20,
    transition: 'border-color 0.2s', boxSizing: 'border-box', borderRadius: 4,
    lineHeight: 1.5,
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
        background: t.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${color} 0%, ${color}cc 50%, #1a1208 100%)`,
        padding: '80px 40px 60px', position: 'relative', overflow: 'hidden', minHeight: 360,
        display: 'flex', alignItems: 'flex-end',
      }}>
        {t.imagen_url && (
          <>
            <img src={t.imagen_url} alt={t.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.92) 0%, rgba(26,18,8,0.55) 50%, rgba(26,18,8,0.1) 100%)' }} />
          </>
        )}
        {!t.imagen_url && <span style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(100px, 18vw, 260px)', color: 'rgba(255,255,255,0.05)', lineHeight: 1, userSelect: 'none', letterSpacing: 4, whiteSpace: 'nowrap' }}>TALLER</span>}

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <Link to="/talleres" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, transition: 'color 0.2s', textDecoration: 'none' }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >← Volver a talleres</Link>

          <AnimatedSection direction="up">
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              {/* Estado automático */}
              {estadoAuto && (
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: estadoAuto.bg, padding: '5px 16px', fontWeight: '700' }}>
                  {estadoAuto.label === 'En curso' && '● '}{estadoAuto.label}
                </span>
              )}
              
              {t.modalidad && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '4px 12px', textTransform: 'uppercase' }}>{t.modalidad}</span>}
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: '#fff', background: t.es_gratis !== false ? 'rgba(34,161,106,0.8)' : 'rgba(26,18,8,0.6)', padding: '4px 12px', textTransform: 'uppercase', fontWeight: '700' }}>
                {t.es_gratis !== false ? '✓ Gratuito' : `$${t.costo || 0}`}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 7vw, 90px)', letterSpacing: 3, color: '#f5ede0', lineHeight: 0.95, marginBottom: 16 }}>{t.titulo}</h1>
            {t.instructor && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,237,224,0.65)', marginBottom: 12 }}>Con {t.instructor}</p>}
            {t.descripcion && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', color: 'rgba(245,237,224,0.7)', maxWidth: 640, lineHeight: 1.65 }}>{t.descripcion}</p>}
          </AnimatedSection>
        </div>
      </section>

      {/* CONTENIDO */}
      <section style={{ background: '#faf6ee', padding: '60px 40px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48 }}>

          {/* COLUMNA IZQUIERDA */}
          <AnimatedSection direction="right">
            <div>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 18, fontWeight: '700' }}>Sobre este taller</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.9, color: 'rgba(26,18,8,0.72)', marginBottom: 36, whiteSpace: 'pre-line' }}>
                {t.descripcion_larga || t.descripcion}
              </p>

              {/* Info básica */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Fecha',      valor: fecha?.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Horario',    valor: t.horario },
                  { label: 'Lugar',      valor: t.lugar },
                  { label: 'Modalidad',  valor: t.modalidad },
                  { label: 'Instructor', valor: t.instructor },
                ].filter(i => i.valor).map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 16, paddingBottom: 14, borderBottom: '1px solid rgba(26,18,8,0.07)' }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color, minWidth: 80, paddingTop: 4, fontWeight: '700' }}>{item.label}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#1a1208', lineHeight: 1.4 }}>{item.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* COLUMNA DERECHA */}
          <AnimatedSection direction="left" delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Countdown */}
              {t.fecha_cierre && <CountdownBlock fecha={t.fecha_cierre} color={color} label="Fecha límite de inscripción" />}
              {!t.fecha_cierre && t.fecha && <CountdownBlock fecha={t.fecha} color={color} label="Fecha del taller" />}

              {/* Cupo */}
              {t.cupo_tipo === 'limitado' && t.cupo_total && (
                <div style={{ padding: '20px', background: '#fff', border: `1px solid ${color}22` }}>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 12, fontWeight: '700' }}>Disponibilidad</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: agotado ? '#ef4444' : color, lineHeight: 1 }}>
                      {agotado ? '0' : t.cupo_disponible}
                    </span>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.45)', letterSpacing: 1 }}>de {t.cupo_total} lugares</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(26,18,8,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${porcentaje}%`, background: agotado ? '#ef4444' : color, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                  {agotado && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#ef4444', marginTop: 8, fontWeight: '700' }}>Cupo lleno</p>}
                </div>
              )}
              {t.cupo_tipo === 'libre' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: '1px solid rgba(26,18,8,0.07)' }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color, fontWeight: '700' }}>∞</span>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(26,18,8,0.55)', fontWeight: '700' }}>Cupo abierto — sin límite de lugares</span>
                </div>
              )}

              {/* Costo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: `1px solid ${t.es_gratis !== false ? 'rgba(34,161,106,0.2)' : color + '22'}` }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: t.es_gratis !== false ? '#22a16a' : color, fontWeight: '700' }}>{t.es_gratis !== false ? '✓' : '$'}</span>
                <div>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.es_gratis !== false ? '#22a16a' : color, fontWeight: '700', display: 'block' }}>
                    {t.es_gratis !== false ? 'Taller gratuito' : `Costo: $${t.costo || 0}`}
                  </span>
                  {t.descripcion_costo && <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(26,18,8,0.5)', display: 'block', marginTop: 2 }}>{t.descripcion_costo}</span>}
                </div>
              </div>

              {/* Flags */}
              {[{ icon: '✉', text: 'Confirmación por correo' }].map((flag, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid rgba(26,18,8,0.07)' }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color, fontWeight: '700' }}>{flag.icon}</span>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(26,18,8,0.55)', fontWeight: '700' }}>{flag.text}</span>
                </div>
              ))}

              {/* Link externo */}
              {t.link_url && (
                <a href={t.link_url} target="_blank" rel="noopener noreferrer"
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

      {/* FORMULARIO */}
      {t.activo && inscripcionAbierta && estadoAuto?.label !== 'Finalizado' && estadoAuto?.label !== 'En curso' && (
        <section style={{ background: '#f5ede0', padding: '80px 40px 120px', borderTop: '1px solid rgba(26,18,8,0.08)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <AnimatedSection direction="up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ width: 36, height: 2, background: color }} />
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color, fontWeight: '700' }}>Inscripción</p>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, color: '#1a1208', marginBottom: 12, lineHeight: 1.1 }}>
                Inscríbete a<br /><em>{t.titulo}</em>
              </h2>
              {t.es_gratis !== false ? (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#22a16a', fontStyle: 'italic', marginBottom: 40 }}>✓ Este taller es completamente gratuito</p>
              ) : (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color, fontStyle: 'italic', marginBottom: 40 }}>Costo: ${t.costo || 0} — {t.descripcion_costo || 'Consulta detalles de pago'}</p>
              )}
            </AnimatedSection>

            {enviado ? (
              <AnimatedSection direction="up">
                <div style={{ padding: '64px', textAlign: 'center', background: '#fff', border: `2px solid ${color}33` }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28, color }}>✓</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#1a1208', marginBottom: 16, fontWeight: 400 }}>¡Inscripción recibida!</h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.55)', fontStyle: 'italic', lineHeight: 1.7 }}>
                    Te contactaremos por correo con los detalles del taller.<br />¡Nos vemos pronto!
                  </p>
                </div>
              </AnimatedSection>
            ) : (
              <AnimatedSection direction="up" delay={0.1}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid rgba(26,18,8,0.08)' }}>
                  <div style={{ padding: '36px 40px' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 28, fontWeight: '700' }}>Tus datos</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {getCampos().map(campo => {
                        const cfg = camposConfig[campo]
                        if (!cfg) return null
                        return (
                          <div key={campo}>
                            <label style={labelStyle}>{cfg.label} {['nombre','email'].includes(campo) && <span style={{ color }}>*</span>}</label>
                            {cfg.type === 'select' ? (
                              <select required={['nombre','email'].includes(campo)} value={formulario[campo] || ''} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })}
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.2)'}>
                                <option value="">Selecciona una opción</option>
                                {cfg.opciones.map(op => <option key={op} value={op}>{op}</option>)}
                              </select>
                            ) : cfg.type === 'textarea' ? (
                              <textarea rows={5} placeholder={cfg.placeholder} value={formulario[campo] || ''} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })}
                                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }}
                                onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.2)'} />
                            ) : (
                              <input type={cfg.type} required={['nombre','email'].includes(campo)} placeholder={cfg.placeholder} value={formulario[campo] || ''} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.2)'} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ padding: '24px 40px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(26,18,8,0.06)' }}>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: 'rgba(26,18,8,0.35)', maxWidth: 320, lineHeight: 1.6 }}>
                      Recibirás un correo de confirmación con los detalles.
                    </p>
                    <button type="submit" disabled={enviando}
                      style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', background: color, color: '#fff', border: 'none', padding: '18px 40px', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'opacity 0.3s, transform 0.2s', opacity: enviando ? 0.7 : 1 }}
                      onMouseOver={e => { if (!enviando) { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}}
                      onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}>
                      {enviando ? 'Enviando...' : 'Confirmar inscripción →'}
                    </button>
                  </div>
                </form>
              </AnimatedSection>
            )}
          </div>
        </section>
      )}

{agotado && estadoAuto?.label !== 'En curso' && estadoAuto?.label !== 'Finalizado' && (
        <section style={{ background: '#f5ede0', padding: '60px 40px', borderTop: '1px solid rgba(26,18,8,0.08)', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: '#ef4444', marginBottom: 8 }}>Cupo lleno</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.5)', fontStyle: 'italic' }}>No hay más lugares disponibles para este taller.</p>
        </section>
      )}

      {estadoAuto?.label === 'En curso' && (
        <section style={{ background: '#22a16a', padding: '48px 40px', borderTop: '1px solid rgba(26,18,8,0.08)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.8)', animation: 'pulse 1.5s infinite' }} />
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: '#fff', lineHeight: 1 }}>Taller en curso</p>
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
            Este taller está ocurriendo ahora mismo.
          </p>
        </section>
      )}

      {estadoAuto?.label === 'Finalizado' && (
        <section style={{ background: '#f5ede0', padding: '60px 40px', borderTop: '1px solid rgba(26,18,8,0.08)', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: 'rgba(26,18,8,0.3)', marginBottom: 8 }}>Taller finalizado</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.45)', fontStyle: 'italic' }}>
            Este taller ya concluyó. Mantente pendiente de próximas ediciones.
          </p>
          <Link to="/talleres" style={{ display: 'inline-block', marginTop: 28, fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: color, border: `1px solid ${color}44`, padding: '12px 28px', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color }}
          >Ver otros talleres →</Link>
        </section>
      )}
    </main>
  )
}

// Hook auxiliar para saber si un countdown ya expiró
function useCountdownExpired(fecha) {
  if (!fecha) return false
  const f = parseFecha(fecha)
  f.setHours(23, 59, 59, 0)
  return f < new Date()
}