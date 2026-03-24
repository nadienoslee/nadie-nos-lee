import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Rating from '@mui/material/Rating'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

// ── Estrellas MUI (display) ──────────────────────────────────
function EstrellasDisplay({ promedio, total, size = 24, visible = true, centered = false }) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => {
      setAnimatedValue(total > 0 ? Number(promedio || 0) : 0)
    }, 120)
    return () => clearTimeout(t)
  }, [visible, promedio, total])

  const texto = total > 0
    ? `${Number(promedio || 0).toFixed(1)} · ${total} ${total === 1 ? 'valoración' : 'valoraciones'}`
    : 'Sin valoraciones aún'

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: centered ? 'center' : 'flex-start',
        justifyContent: 'center',
        gap: 10,
        textAlign: centered ? 'center' : 'left',
      }}
    >
      <Rating
        name="lectura-rating-display"
        value={animatedValue}
        precision={0.1}
        readOnly
        style={{
          fontSize: size,
          color: '#b8943a',
          display: 'flex',
          justifyContent: centered ? 'center' : 'flex-start',
        }}
      />

      <span
        style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: Math.max(12, Math.round(size * 0.48)),
          color: total > 0 ? 'rgba(26,18,8,0.55)' : 'rgba(26,18,8,0.42)',
          letterSpacing: 0.8,
          fontWeight: '700',
          width: '100%',
          textAlign: centered ? 'center' : 'left',
        }}
      >
        {texto}
      </span>
    </div>
  )
}
// ── Estrellas MUI (input) ─────────────────────────────────────
function EstrellasInput({ valor, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Rating
        name="lectura-rating-input"
        value={valor}
        precision={1}
        onChange={(_, newValue) => onChange(newValue || 0)}
        style={{
          fontSize: 42,
          color: '#b8943a',
        }}
      />
    </div>
  )
}
// ── Modal de detalle ──────────────────────────────────────────
function LecturaModal({ lectura: l, onCerrar }) {
  const color = l.color || '#b8943a'
  const [valoraciones, setValoraciones]         = useState([])
  const [comentarios, setComentarios]           = useState([])
  const [mostrarFormVoto, setMostrarFormVoto]   = useState(false)
  const [miVoto, setMiVoto]                     = useState(0)
  const [emailVoto, setEmailVoto]               = useState('')
  const [votoEnviado, setVotoEnviado]           = useState(false)
  const [formCom, setFormCom]                   = useState({ nombre: '', email: '', comentario: '' })
  const [enviandoCom, setEnviandoCom]           = useState(false)
  const [comEnviado, setComEnviado]             = useState(false)
  const [editando, setEditando]                 = useState(null) // id del comentario editándose
  const [formEdit, setFormEdit]                 = useState('')
  const [misComentarios, setMisComentarios]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('mis_comentarios_lecturas') || '[]') } catch { return [] }
  })

  const promedio = valoraciones.length > 0
    ? valoraciones.reduce((a, b) => a + b.estrellas, 0) / valoraciones.length : 0

  const cargarDatos = useCallback(async () => {
    const [{ data: val }, { data: com }] = await Promise.all([
      supabase
        .from('lecturas_valoraciones')
        .select('estrellas')
        .eq('lectura_id', l.id),

      supabase
        .from('lecturas_comentarios')
        .select('*')
        .eq('lectura_id', l.id)
        .eq('aprobado', true)
        .order('created_at', { ascending: false }),
    ])

    setValoraciones(val || [])
    setComentarios(com || [])
  }, [l.id])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflowX = 'hidden'
    cargarDatos()

    const canalValoraciones = supabase
      .channel(`lectura-valoraciones-${l.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lecturas_valoraciones',
          filter: `lectura_id=eq.${l.id}`,
        },
        () => {
          cargarDatos()
        }
      )
      .subscribe()

    const canalComentarios = supabase
      .channel(`lectura-comentarios-${l.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lecturas_comentarios',
          filter: `lectura_id=eq.${l.id}`,
        },
        () => {
          cargarDatos()
        }
      )
      .subscribe()

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflowX = ''
      supabase.removeChannel(canalValoraciones)
      supabase.removeChannel(canalComentarios)
    }
  }, [l.id, cargarDatos])

  const enviarVoto = async () => {
    if (!miVoto || !emailVoto) return
    await supabase.from('lecturas_valoraciones').upsert(
      { lectura_id: l.id, email: emailVoto, estrellas: miVoto },
      { onConflict: 'lectura_id,email' }
    )
    setVotoEnviado(true)
    setMostrarFormVoto(false)
    cargarDatos()
  }

  const enviarComentario = async (e) => {
    e.preventDefault()
    setEnviandoCom(true)
    const { data, error } = await supabase.from('lecturas_comentarios').insert({
      lectura_id: l.id,
      nombre: formCom.nombre,
      email: formCom.email,
      comentario: formCom.comentario,
      aprobado: true,
    }).select().single()
    setEnviandoCom(false)
    if (!error && data) {
      const nuevos = [...misComentarios, data.id]
      setMisComentarios(nuevos)
      localStorage.setItem('mis_comentarios_lecturas', JSON.stringify(nuevos))
      setComEnviado(true)
      setFormCom({ nombre: '', email: '', comentario: '' })
      cargarDatos()
      setTimeout(() => setComEnviado(false), 3000)
    }
  }

  const editarComentario = async (id) => {
    await supabase.from('lecturas_comentarios').update({ comentario: formEdit }).eq('id', id)
    setEditando(null)
    cargarDatos()
  }

  const eliminarComentario = async (id) => {
    await supabase.from('lecturas_comentarios').delete().eq('id', id)
    const nuevos = misComentarios.filter(c => c !== id)
    setMisComentarios(nuevos)
    localStorage.setItem('mis_comentarios_lecturas', JSON.stringify(nuevos))
    cargarDatos()
  }

  const fechaRec = l.recomendador_fecha ? new Date(l.recomendador_fecha) : null
  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#faf6ee',
    border: '1px solid rgba(26,18,8,0.12)', color: '#1a1208', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 18, borderRadius: 4,
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: 20,
      boxSizing: 'border-box',
    }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.82)', backdropFilter: 'blur(8px)' }} onClick={onCerrar} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        background: '#faf6ee',
        boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>

        {/* HERO — imagen portada */}
        <div style={{ position: 'relative', minHeight: 420, background: '#1a1208', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {l.imagen_url && (
            <>
              <img src={l.imagen_url} alt={l.titulo}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.98) 0%, rgba(26,18,8,0.4) 60%, rgba(26,18,8,0.1) 100%)' }} />
            </>
          )}
          {!l.imagen_url && (
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}44 0%, #1a1208 100%)` }} />
          )}
          <button onClick={onCerrar} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: 42, height: 42, borderRadius: '50%',
            cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >✕</button>

          {/* Recomendado por — centrado arriba del título */}
          <div style={{ position: 'relative', zIndex: 1, padding: '60px 52px 48px', textAlign: 'center' }}>
            {/* Avatar + nombre + fecha */}
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)', fontWeight: '700' }}>Recomendado por</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {l.recomendador_foto
                  ? <img src={l.recomendador_foto} alt={l.recomendado_por}
                      style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}` }} />
                  : <div style={{ width: 54, height: 54, borderRadius: '50%', background: color + '30',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${color}66` }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color }}>{(l.recomendado_por || 'N')?.[0]}</span>
                    </div>
                }
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: '#fff', fontWeight: '700', marginBottom: 4 }}>
                    {l.recomendado_por || 'Colectivo'}
                  </p>
                  {fechaRec && (
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(255,255,255,0.48)', letterSpacing: 0.7 }}>
                      {fechaRec.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{fechaRec.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Título del libro */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              {l.etiqueta && (
                <span style={{ display: 'inline-block', fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3,
                  textTransform: 'uppercase', color: '#fff', background: color, padding: '6px 18px', fontWeight: '700', marginBottom: 18 }}>
                  {l.etiqueta}
                </span>
              )}

              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 5vw, 62px)',
                fontWeight: 700, color: '#f5ede0', lineHeight: 1.05, marginBottom: 12 }}>
                {l.titulo}
              </h2>

              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: color, letterSpacing: 2,
                textTransform: 'uppercase', fontWeight: '700', marginBottom: 20 }}>
                {l.autor_libro}{l.anio ? ` · ${l.anio}` : ''}{l.genero ? ` · ${l.genero}` : ''}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                <EstrellasDisplay promedio={promedio} total={valoraciones.length} size={28} visible={true} centered />
              </div>
            </div>

            {/* Promedio estrellas en hero */}

          </div>
        </div>

        {/* CUERPO */}
        <div style={{ padding: '52px 52px 80px', display: 'flex', flexDirection: 'column', gap: 52 }}>

          {/* Extracto / cita */}
          {l.comentario && (
            <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 24 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 29, color: 'rgba(26,18,8,0.72)',
                lineHeight: 1.8, fontStyle: 'italic' }}>
                "{l.comentario}"
              </p>
            </div>
          )}

          {/* Sinopsis */}
          {l.sinopsis && (
            <div>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
                color, marginBottom: 18, fontWeight: '700' }}>Sinopsis</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, lineHeight: 2,
                color: 'rgba(26,18,8,0.76)', whiteSpace: 'pre-line' }}>{l.sinopsis}</p>
            </div>
          )}

          {/* Por qué lo recomendamos */}
          {l.recomendacion_texto && (
            <div>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
                color, marginBottom: 18, fontWeight: '700' }}>Por qué lo recomendamos</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, lineHeight: 2,
                color: 'rgba(26,18,8,0.76)', whiteSpace: 'pre-line' }}>{l.recomendacion_texto}</p>
            </div>
          )}

          {/* ── VALORACIÓN ── */}
          <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase',
              color, marginBottom: 28, fontWeight: '700', width: '100%', textAlign: 'left' }}>Valoración</p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                marginBottom: 28,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {valoraciones.length > 0 && (
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 80,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {promedio.toFixed(1)}
                </span>
              )}

              <EstrellasDisplay
                promedio={promedio}
                total={valoraciones.length}
                size={34}
                visible={true}
                centered
              />
            </div>

            {!votoEnviado && !mostrarFormVoto && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <button onClick={() => setMostrarFormVoto(true)}
                  style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                    background: color, color: '#fff', border: 'none', padding: '14px 32px', cursor: 'pointer', fontWeight: '700' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >Calificar este libro</button>
              </div>
            )}

            {mostrarFormVoto && (
              <div style={{ background: '#fff', border: `1px solid ${color}22`, padding: '28px 32px',
                display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460, width: '100%' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1208', fontWeight: 600, textAlign: 'center' }}>
                  ¿Cuántas estrellas le das?
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <EstrellasInput valor={miVoto} onChange={setMiVoto} />
                </div>

                <div>
                  <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                    color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 6, fontWeight: '700', textAlign: 'left' }}>Tu correo</label>
                  <input type="email" placeholder="tu@correo.com" value={emailVoto}
                    onChange={e => setEmailVoto(e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = color}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={enviarVoto} disabled={!miVoto || !emailVoto}
                    style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                      background: miVoto && emailVoto ? color : 'rgba(26,18,8,0.06)',
                      color: miVoto && emailVoto ? '#fff' : 'rgba(26,18,8,0.25)',
                      border: 'none', padding: '12px 24px', cursor: miVoto && emailVoto ? 'pointer' : 'default', fontWeight: '700' }}>
                    Enviar
                  </button>
                  <button onClick={() => setMostrarFormVoto(false)}
                    style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, background: 'none',
                      border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.4)', padding: '12px 20px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {votoEnviado && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 22px',
                background: 'rgba(34,161,106,0.07)', border: '1px solid rgba(34,161,106,0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: 20, color: '#22a16a' }}>✓</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: '#22a16a', fontStyle: 'italic' }}>
                  ¡Gracias por tu valoración!
                </span>
              </div>
            )}
          </div>

          {/* ── COMENTARIOS ── */}
          <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 44 }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase',
              color, marginBottom: 36, fontWeight: '700' }}>
              Comentarios {comentarios.length > 0 && `· ${comentarios.length}`}
            </p>

            {/* Lista de comentarios */}
            {comentarios.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 44 }}>
                {comentarios.map(c => {
                  const fecha = new Date(c.created_at)
                  const diff = Math.floor((new Date() - fecha) / 60000)
                  const tiempo = diff < 1 ? 'Justo ahora'
                    : diff < 60 ? `hace ${diff} min`
                    : diff < 1440 ? `hace ${Math.floor(diff/60)} h`
                    : fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
                  const esMio = misComentarios.includes(c.id)

                  return (
                    <div key={c.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: color + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${color}30`, flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color }}>
                          {c.nombre?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div style={{ flex: 1, background: '#fff', padding: '16px 20px', border: '1px solid rgba(26,18,8,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
                          <div>
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: '#1a1208', fontWeight: '700' }}>
                              {c.nombre}
                            </span>
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.35)', marginLeft: 10 }}>
                              {tiempo}
                            </span>
                          </div>
                          {esMio && (
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              {editando !== c.id && (
                                <button onClick={() => { setEditando(c.id); setFormEdit(c.comentario) }}
                                  style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, background: 'none',
                                    border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.45)', padding: '3px 10px',
                                    cursor: 'pointer', borderRadius: 2 }}>
                                  Editar
                                </button>
                              )}
                              <button onClick={() => eliminarComentario(c.id)}
                                style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, background: 'none',
                                  border: '1px solid rgba(139,26,26,0.2)', color: '#8B1A1A', padding: '3px 10px',
                                  cursor: 'pointer', borderRadius: 2 }}>
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>

                        {editando === c.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <textarea rows={3} value={formEdit} onChange={e => setFormEdit(e.target.value)}
                              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontSize: 17 }}
                              onFocus={e => e.target.style.borderColor = color}
                              onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => editarComentario(c.id)}
                                style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, background: color,
                                  color: '#fff', border: 'none', padding: '6px 16px', cursor: 'pointer', fontWeight: '700' }}>
                                Guardar
                              </button>
                              <button onClick={() => setEditando(null)}
                                style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, background: 'none',
                                  border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.4)', padding: '6px 12px', cursor: 'pointer' }}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: 'rgba(26,18,8,0.75)', lineHeight: 1.7 }}>
                            {c.comentario}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {comentarios.length === 0 && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'rgba(26,18,8,0.28)',
                fontStyle: 'italic', marginBottom: 36 }}>
                Sé la primera persona en comentar.
              </p>
            )}

            {/* Formulario nuevo comentario */}
            {!comEnviado ? (
              <form onSubmit={enviarComentario} style={{ background: '#fff', border: `1px solid ${color}18`, padding: '32px 36px' }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase',
                  color, marginBottom: 22, fontWeight: '700' }}>Dejar un comentario</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  {[
                    { key: 'nombre', label: 'Nombre *', type: 'text', placeholder: 'Tu nombre' },
                    { key: 'email',  label: 'Correo *',  type: 'email', placeholder: 'tu@correo.com' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                        color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 6, fontWeight: '700' }}>{f.label}</label>
                      <input required type={f.type} placeholder={f.placeholder}
                        value={formCom[f.key]} onChange={e => setFormCom({...formCom, [f.key]: e.target.value})}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = color}
                        onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                    color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 6, fontWeight: '700' }}>Comentario *</label>
                  <textarea required rows={4} placeholder="¿Qué piensas de este libro?"
                    value={formCom.comentario} onChange={e => setFormCom({...formCom, comentario: e.target.value})}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                    onFocus={e => e.target.style.borderColor = color}
                    onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.35)', lineHeight: 1.7 }}>
                    Tu correo no será publicado.
                  </p>
                  <button type="submit" disabled={enviandoCom}
                    style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                      background: color, color: '#fff', border: 'none', padding: '14px 28px',
                      cursor: enviandoCom ? 'not-allowed' : 'pointer', opacity: enviandoCom ? 0.7 : 1, fontWeight: '700' }}>
                    {enviandoCom ? 'Enviando...' : 'Publicar comentario →'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '28px', background: 'rgba(34,161,106,0.06)', border: '1px solid rgba(34,161,106,0.2)', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#22a16a', fontStyle: 'italic' }}>
                  ¡Comentario publicado!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card principal ────────────────────────────────────────────
function LecturaCard({ l, i, onClick }) {
  const color = l.color || '#b8943a'
  const [valData, setValData] = useState({ promedio: 0, total: 0 })
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('lecturas_valoraciones')
        .select('estrellas')
        .eq('lectura_id', l.id)

      if (data?.length) {
        const sum = data.reduce((a, b) => a + b.estrellas, 0)
        setValData({ promedio: sum / data.length, total: data.length })
      } else {
        setValData({ promedio: 0, total: 0 })
      }
    }

    cargar()

    const canalValoraciones = supabase
      .channel(`lectura-card-valoraciones-${l.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lecturas_valoraciones',
          filter: `lectura_id=eq.${l.id}`,
        },
        () => {
          cargar()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalValoraciones)
    }
  }, [l.id])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const fechaRec = l.recomendador_fecha ? new Date(l.recomendador_fecha) : null
  const diff = fechaRec ? Math.floor((new Date() - fechaRec) / 60000) : null
  const tiempoRec = diff === null ? '' : diff < 60 ? `hace ${diff} min`
    : diff < 1440 ? `hace ${Math.floor(diff/60)} h`
    : fechaRec.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <AnimatedSection direction="up" delay={i * 0.06}>
      <div ref={ref}
        style={{ background: '#fff', border: `1px solid ${color}22`, overflow: 'hidden', cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s' }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${color}20` }}
        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        onClick={onClick}
      >
        {/* PORTADA */}
        <div style={{ height: 300, background: l.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
          position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {l.imagen_url
            ? <img src={l.imagen_url} alt={l.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 110, color, opacity: 0.08, lineHeight: 1, userSelect: 'none' }}>
                {l.titulo?.[0] || 'L'}
              </span>
          }
          {l.etiqueta && (
            <span style={{ position: 'absolute', top: 14, left: 14, fontFamily: "'Courier Prime', monospace", fontSize: 11,
              letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: color, padding: '6px 14px', fontWeight: '700' }}>
              {l.etiqueta}
            </span>
          )}
          {l.genero && (
            <span style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'Courier Prime', monospace", fontSize: 10,
              letterSpacing: 1.2, color: color, background: 'rgba(255,255,255,0.95)', border: `1px solid ${color}44`,
              padding: '5px 10px', textTransform: 'uppercase', fontWeight: '700' }}>
              {l.genero}
            </span>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 78,
            background: 'linear-gradient(to top, rgba(255,255,255,0.96) 0%, transparent 100%)' }} />

          {/* Botón LEER */}
          <div style={{ position: 'absolute', bottom: 14, right: 14, background: color, color: '#fff',
            fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            padding: '8px 18px', fontWeight: '700', boxShadow: `0 4px 12px ${color}44` }}>
            Leer →
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ padding: '24px 24px 22px' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: '#1a1208',
            lineHeight: 1.08, marginBottom: 8 }}>{l.titulo}</h3>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color, letterSpacing: 1.2,
            textTransform: 'uppercase', marginBottom: 18, fontWeight: '700' }}>
            {l.autor_libro}{l.anio ? ` · ${l.anio}` : ''}
          </p>

          {l.comentario && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: 'rgba(26,18,8,0.68)',
              lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic', borderLeft: `2px solid ${color}44`, paddingLeft: 14 }}>
              "{l.comentario.length > 110 ? l.comentario.slice(0, 110) + '...' : l.comentario}"
            </p>
          )}
          {/* Estrellas */}
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <EstrellasDisplay promedio={valData.promedio} total={valData.total} size={24} visible={visible} centered />
          </div>

          {/* Recomendado por */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: `1px solid ${color}18` }}>
            {l.recomendador_foto
              ? <img src={l.recomendador_foto} alt={l.recomendado_por}
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}44`, flexShrink: 0 }} />
              : <div style={{ width: 42, height: 42, borderRadius: '50%', background: color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30`, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color }}>
                    {(l.recomendado_por || 'N')?.[0]}
                  </span>
                </div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: '#1a1208', fontWeight: '700',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                {l.recomendado_por || 'Colectivo'}
              </p>
              {tiempoRec && (
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.4)', fontWeight: '700' }}>
                  {tiempoRec}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function Lecturas() {
  usePageTitle('NADIE NOS LEE | LECTURAS')
  const [lecturas, setLecturas]         = useState([])
  const [cargando, setCargando]         = useState(true)
  const [seleccionada, setSeleccionada] = useState(null)
  const [busqueda, setBusqueda]         = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')
  const [filtroUsuario, setFiltroUsuario] = useState('todos')
  const [usuarios, setUsuarios]         = useState([])

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('lecturas').select('*').eq('publicado', true).order('recomendador_fecha', { ascending: false })
      if (data) {
        setLecturas(data)
        // Extraer usuarios únicos (excluyendo admin_principal y vacíos)
        const unicos = [...new Set(
          data.map(l => l.recomendado_por).filter(u => u && u.toLowerCase() !== 'admin_principal' && u.toLowerCase() !== 'admin')
        )]
        setUsuarios(unicos)
      }
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('lecturas-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lecturas' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  // Filtrar
  const filtradas = lecturas.filter(l => {
    // Búsqueda
    if (busqueda) {
      const q = busqueda.toLowerCase()
      const match = l.titulo?.toLowerCase().includes(q)
        || l.autor_libro?.toLowerCase().includes(q)
        || l.recomendado_por?.toLowerCase().includes(q)
        || l.comentario?.toLowerCase().includes(q)
      if (!match) return false
    }
    // Usuario
    if (filtroUsuario !== 'todos' && l.recomendado_por !== filtroUsuario) return false
    // Periodo
    if (filtroPeriodo !== 'todos') {
      const fecha = l.recomendador_fecha ? new Date(l.recomendador_fecha) : null
      if (!fecha) return false
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      if (filtroPeriodo === 'hoy') {
        const f = new Date(fecha); f.setHours(0,0,0,0)
        if (f.getTime() !== hoy.getTime()) return false
      }
      if (filtroPeriodo === 'semana') {
        const fin = new Date(hoy); fin.setDate(hoy.getDate() + 6)
        if (fecha < hoy || fecha > fin) return false
      }
      if (filtroPeriodo === 'mes') {
        if (fecha.getMonth() !== hoy.getMonth() || fecha.getFullYear() !== hoy.getFullYear()) return false
      }
    }
    return true
  })

  const periodos = [
    { id: 'todos', label: 'Todas' },
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Esta semana' },
    { id: 'mes', label: 'Este mes' },
  ]

  return (
    <main>
      {/* HERO */}
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px',
        borderBottom: '1px solid rgba(184,148,58,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(184,148,58,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', color: '#b8943a', marginBottom: 24, fontWeight: '700' }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(82px, 12vw, 150px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>LECTURAS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontStyle: 'italic', color: 'rgba(26,18,8,0.6)', lineHeight: 1.7 }}>
              Libros que nos han marcado. Recomendaciones del colectivo.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FILTROS */}
      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Periodos */}
          <div style={{ display: 'flex' }}>
            {periodos.map(p => (
              <button key={p.id} onClick={() => setFiltroPeriodo(p.id)} style={{
                fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                background: 'none', border: 'none', color: filtroPeriodo === p.id ? '#1a1208' : 'rgba(26,18,8,0.4)',
                borderBottom: filtroPeriodo === p.id ? '3px solid #b8943a' : '3px solid transparent',
                padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s', fontWeight: '700',
              }}>{p.label}</button>
            ))}
          </div>
          {/* Usuario + buscador */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0' }}>
            {usuarios.length > 0 && (
              <select value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}
                style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 1, background: '#fff',
                  border: '1px solid rgba(26,18,8,0.12)', color: '#1a1208', padding: '10px 14px', borderRadius: 4,
                  cursor: 'pointer', outline: 'none', textTransform: 'uppercase', fontWeight: '700' }}>
                <option value="todos">Todos los usuarios</option>
                {usuarios.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            )}
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Buscar..." value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: 1,
                  background: '#fff', border: '1px solid rgba(26,18,8,0.12)', color: '#1a1208',
                  padding: '10px 40px 10px 14px', borderRadius: 4, outline: 'none', width: 220,
                  transition: 'border-color 0.2s', fontWeight: '700' }}
                onFocus={e => e.target.style.borderColor = '#b8943a'}
                onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
              />
              {busqueda
                ? <button onClick={() => setBusqueda('')}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,18,8,0.35)', fontSize: 14 }}>✕</button>
                : <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(26,18,8,0.25)', fontSize: 12, pointerEvents: 'none' }}>⌕</span>
              }
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section style={{ background: '#faf6ee', padding: '60px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)',
              fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.3)' }}>
                {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay lecturas en esta categoría.'}
              </p>
              {busqueda && (
                <button onClick={() => setBusqueda('')}
                  style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                    background: 'none', border: '1px solid rgba(26,18,8,0.15)', color: 'rgba(26,18,8,0.45)',
                    padding: '10px 20px', cursor: 'pointer', marginTop: 20 }}>
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
                color: 'rgba(26,18,8,0.42)', marginBottom: 32, fontWeight: '700' }}>
                {filtradas.length} {filtradas.length === 1 ? 'lectura' : 'lecturas'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
                {filtradas.map((l, i) => (
                  <LecturaCard key={l.id} l={l} i={i} onClick={() => setSeleccionada(l)} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {seleccionada && createPortal(
        <LecturaModal lectura={seleccionada} onCerrar={() => setSeleccionada(null)} />,
        document.body
      )}
    </main>
  )
}