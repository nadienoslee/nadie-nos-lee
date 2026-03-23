import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const camposConfig = {
  nombre:      { label: 'Nombre completo',                     type: 'text',     placeholder: 'Tu nombre' },
  email:       { label: 'Correo electrónico',                  type: 'email',    placeholder: 'tu@correo.com' },
  edad:        { label: 'Edad',                                type: 'number',   placeholder: 'Tu edad' },
  experiencia: { label: '¿Tienes experiencia escribiendo?',    type: 'select',   opciones: ['Primera vez que escribo', 'Escribo de manera casual', 'Tengo práctica continua', 'He tomado talleres antes'] },
  motivacion:  { label: '¿Por qué quieres tomar este taller?', type: 'textarea', placeholder: 'Cuéntanos brevemente...' },
  ciudad:      { label: 'Ciudad / Estado',                     type: 'text',     placeholder: '¿Desde dónde escribes?' },
}

export default function Talleres() {
  usePageTitle('NADIE NOS LEE | TALLERES')
  const [talleres, setTalleres]                 = useState([])
  const [cargando, setCargando]                 = useState(true)
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null)
  const [formulario, setFormulario]             = useState({})
  const [enviado, setEnviado]                   = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('talleres').select('*').eq('activo', true).order('fecha', { ascending: true })
      if (data) setTalleres(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('talleres-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'talleres' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const abrirFormulario = (taller) => {
    setTallerSeleccionado(taller)
    setFormulario({})
    setEnviado(false)
    setTimeout(() => { document.getElementById('formulario-taller')?.scrollIntoView({ behavior: 'smooth' }) }, 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('inscripciones').insert({
      taller_id: tallerSeleccionado.id,
      nombre: formulario.nombre,
      email: formulario.email,
      datos: formulario,
      estado: 'Pendiente',
    })
    if (!error) {
      // Reducir cupo
      await supabase.from('talleres').update({ cupo_disponible: Math.max(0, (tallerSeleccionado.cupo_disponible || 1) - 1) }).eq('id', tallerSeleccionado.id)
      setEnviado(true)
    }
  }

  const inputStyle = (color) => ({ width: '100%', padding: '16px 18px', background: '#fff', border: '1px solid rgba(26,18,8,0.12)', color: '#1a1208', outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, transition: 'border-color 0.2s' })
  const labelStyle = { fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 8 }

  // Campos del taller: usar los de la BD o un default
  const getCampos = (t) => {
    if (Array.isArray(t.campos)) return t.campos.filter(c => camposConfig[c])
    return ['nombre', 'email', 'edad', 'experiencia']
  }

  return (
    <main style={{ paddingTop: 84 }}>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 12vw, 140px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>TALLERES</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>Espacios de escritura colectiva. Aprende, comparte, escribe.</p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : talleres.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay talleres disponibles por ahora.</p>
          ) : talleres.map((t, i) => (
            <AnimatedSection key={t.id} direction="right" delay={i * 0.1}>
             <div style={{ border: `2px solid ${t.color || '#3AABDC'}33`, background: '#fff', transition: 'border-color 0.3s, box-shadow 0.3s', overflow: 'hidden' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = (t.color || '#3AABDC') + '66'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,18,8,0.06)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = (t.color || '#3AABDC') + '33'; e.currentTarget.style.boxShadow = 'none' }}
>
  {/* Imagen del taller */}
  {t.imagen_url && (
    <div style={{ width: '100%', height: 220, overflow: 'hidden' }}>
      <img src={t.imagen_url} alt={t.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )}
  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, padding: '44px' }}>
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                    {t.nivel && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: t.color || '#3AABDC', padding: '5px 12px' }}>{t.nivel}</span>}
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.35)', letterSpacing: 1 }}>
                      {t.fecha ? new Date(t.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}{t.horario ? ` · ${t.horario}` : ''}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: '#1a1208', marginBottom: 8 }}>{t.titulo}</h2>
                  {(t.instructor || t.lugar) && (
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, color: t.color || '#3AABDC', marginBottom: 18, textTransform: 'uppercase' }}>
                      {t.instructor ? `Con ${t.instructor}` : ''}{t.lugar ? ` · ${t.lugar}` : ''}
                    </p>
                  )}
                  {t.descripcion && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, lineHeight: 1.8, color: 'rgba(26,18,8,0.6)', maxWidth: 620, marginBottom: 28 }}>{t.descripcion}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 120, height: 5, background: 'rgba(26,18,8,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(((t.cupo_total || 20) - (t.cupo_disponible || 0)) / (t.cupo_total || 20)) * 100}%`, height: '100%', background: t.color || '#3AABDC', transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.4)' }}>{t.cupo_disponible ?? t.cupo_total} lugares disponibles de {t.cupo_total || 20}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 8 }}>
                  {(t.cupo_disponible === undefined || t.cupo_disponible > 0) ? (
                    <button onClick={() => abrirFormulario(t)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: t.color || '#3AABDC', color: '#fff', border: 'none', padding: '16px 28px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s, transform 0.2s' }}
                      onMouseOver={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}
                      onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
                    >Inscribirme</button>
                  ) : (
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)', border: '1px solid rgba(26,18,8,0.12)', padding: '16px 28px' }}>Cupo lleno</span>
                  )}
                </div>
</div>
            </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {tallerSeleccionado && (
        <section id="formulario-taller" style={{ background: '#f5ede0', padding: '80px 40px 120px', borderTop: '1px solid rgba(58,171,220,0.12)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <AnimatedSection direction="up">
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: tallerSeleccionado.color || '#3AABDC', marginBottom: 12 }}>Inscripción</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: '#1a1208', marginBottom: 8 }}>{tallerSeleccionado.titulo}</h2>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.35)', letterSpacing: 1, marginBottom: 48 }}>
                {tallerSeleccionado.fecha ? new Date(tallerSeleccionado.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} {tallerSeleccionado.horario ? `· ${tallerSeleccionado.horario}` : ''}
              </p>
            </AnimatedSection>

            {enviado ? (
              <AnimatedSection direction="up">
                <div style={{ padding: '56px', textAlign: 'center', border: `2px solid ${(tallerSeleccionado.color || '#3AABDC')}44`, background: '#fff' }}>
                  <div style={{ fontSize: 48, color: tallerSeleccionado.color || '#3AABDC', marginBottom: 20 }}>✓</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#1a1208', marginBottom: 16 }}>¡Inscripción recibida!</h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.55)', fontStyle: 'italic' }}>Te contactaremos por correo con los detalles del taller.</p>
                </div>
              </AnimatedSection>
            ) : (
              <AnimatedSection direction="up" delay={0.1}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {getCampos(tallerSeleccionado).map(campo => {
                    const config = camposConfig[campo]
                    if (!config) return null
                    const color = tallerSeleccionado.color || '#3AABDC'
                    return (
                      <div key={campo}>
                        <label style={labelStyle}>{config.label}</label>
                        {config.type === 'select' ? (
                          <select required value={formulario[campo] || ''} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })} style={{ ...inputStyle(color), cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}>
                            <option value="">Selecciona una opción</option>
                            {config.opciones.map(op => <option key={op} value={op}>{op}</option>)}
                          </select>
                        ) : config.type === 'textarea' ? (
                          <textarea required rows={5} placeholder={config.placeholder} value={formulario[campo] || ''} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })} style={{ ...inputStyle(color), resize: 'vertical', lineHeight: 1.7 }} onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'} />
                        ) : (
                          <input required type={config.type} placeholder={config.placeholder} value={formulario[campo] || ''} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })} style={inputStyle(color)} onFocus={e => e.target.style.borderColor = color} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'} />
                        )}
                      </div>
                    )
                  })}
                  <button type="submit" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', background: tallerSeleccionado.color || '#3AABDC', color: '#fff', border: 'none', padding: '18px 36px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'opacity 0.2s, transform 0.2s' }}
                    onMouseOver={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}
                    onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
                  >Confirmar inscripción</button>
                </form>
              </AnimatedSection>
            )}
          </div>
        </section>
      )}
    </main>
  )
}