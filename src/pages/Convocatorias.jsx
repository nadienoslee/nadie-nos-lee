import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function Convocatorias() {
  usePageTitle('NADIE NOS LEE | CONVOCATORIAS')
  const [convocatorias, setConvocatorias] = useState([])
  const [cargando, setCargando]           = useState(true)
  const [formulario, setFormulario]       = useState({ nombre: '', email: '', texto: '', convocatoria: '' })
  const [enviado, setEnviado]             = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    await supabase.from('actividad_log').insert({ accion: 'nuevo', seccion: 'convocatorias', descripcion: `Envío de texto por ${formulario.nombre} — ${formulario.email}` })
    setEnviado(true)
  }

  const inputStyle = { width: '100%', padding: '16px 18px', background: '#fff', border: '1px solid rgba(26,18,8,0.15)', color: '#1a1208', outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, transition: 'border-color 0.2s' }

  const abiertas = convocatorias.filter(c => c.estado === 'Abierta')

  return (
    <main style={{ paddingTop: 84 }}>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(155,45,142,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 60%, rgba(155,45,142,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 24 }}>Editorial</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px, 8vw, 112px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>CONVOCATORIAS<br />ABIERTAS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>La puerta de entrada para nuevas voces. Lee las bases y envía tu texto.</p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : convocatorias.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay convocatorias por ahora.</p>
          ) : convocatorias.map((c, i) => (
            <AnimatedSection key={c.id} direction="right" delay={i * 0.1}>
              <div style={{ padding: '44px', border: `2px solid ${c.estado === 'Abierta' ? (c.color || '#9B2D8E') + '44' : 'rgba(26,18,8,0.08)'}`, background: c.estado === 'Abierta' ? '#fff' : 'rgba(26,18,8,0.02)', opacity: c.estado === 'Cerrada' ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.estado === 'Abierta' ? '#fff' : 'rgba(26,18,8,0.4)', background: c.estado === 'Abierta' ? (c.color || '#9B2D8E') : 'rgba(26,18,8,0.1)', padding: '5px 14px' }}>{c.estado}</span>
                    {c.generos?.map(g => (
                      <span key={g} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: c.color || '#9B2D8E', border: `1px solid ${(c.color || '#9B2D8E')}44`, padding: '4px 10px', textTransform: 'uppercase' }}>{g}</span>
                    ))}
                  </div>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.4)', letterSpacing: 1 }}>
                    {c.fecha_cierre ? `Cierre: ${new Date(c.fecha_cierre).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                  </span>
                </div>
                {c.imagen_url && (
  <div style={{ marginBottom: 20 }}>
    <img src={c.imagen_url} alt={c.titulo} style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' }} />
  </div>
)}
<h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: '#1a1208', marginBottom: 16 }}>{c.titulo}</h2>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, lineHeight: 1.8, color: 'rgba(26,18,8,0.6)', marginBottom: 16, maxWidth: 720 }}>{c.descripcion}</p>
                {c.extension && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, color: 'rgba(26,18,8,0.35)', textTransform: 'uppercase' }}>Extensión: {c.extension}</p>}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {abiertas.length > 0 && (
        <section style={{ background: '#f5ede0', padding: '80px 40px 120px', borderTop: '1px solid rgba(155,45,142,0.12)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <AnimatedSection direction="up">
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 12 }}>Envía tu texto</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300, color: '#1a1208', marginBottom: 48 }}>Formulario de participación</h2>
            </AnimatedSection>
            {enviado ? (
              <AnimatedSection direction="up">
                <div style={{ padding: '56px', textAlign: 'center', border: '2px solid rgba(155,45,142,0.2)', background: '#fff' }}>
                  <div style={{ fontSize: 48, color: '#9B2D8E', marginBottom: 20 }}>✓</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#1a1208', marginBottom: 16 }}>Texto recibido</h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.55)', fontStyle: 'italic' }}>Lo leeremos con cuidado y te responderemos pronto.</p>
                </div>
              </AnimatedSection>
            ) : (
              <AnimatedSection direction="up" delay={0.1}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[{ label: 'Nombre completo', key: 'nombre', type: 'text', placeholder: 'Tu nombre' }, { label: 'Correo electrónico', key: 'email', type: 'email', placeholder: 'tu@correo.com' }].map(campo => (
                    <div key={campo.key}>
                      <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 8 }}>{campo.label}</label>
                      <input type={campo.type} placeholder={campo.placeholder} required value={formulario[campo.key]} onChange={e => setFormulario({ ...formulario, [campo.key]: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 8 }}>Convocatoria</label>
                    <select required value={formulario.convocatoria} onChange={e => setFormulario({ ...formulario, convocatoria: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'}>
                      <option value="">Selecciona una convocatoria</option>
                      {abiertas.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 8 }}>Tu texto</label>
                    <textarea required rows={12} placeholder="Pega o escribe tu texto aquí..." value={formulario.texto} onChange={e => setFormulario({ ...formulario, texto: e.target.value })} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'} />
                  </div>
                  <button type="submit" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', background: '#9B2D8E', color: '#fff', border: 'none', padding: '18px 36px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'background 0.3s, transform 0.2s' }}
                    onMouseOver={e => { e.target.style.background = '#b535a8'; e.target.style.transform = 'translateY(-2px)' }}
                    onMouseOut={e => { e.target.style.background = '#9B2D8E'; e.target.style.transform = 'translateY(0)' }}
                  >Enviar texto</button>
                </form>
              </AnimatedSection>
            )}
          </div>
        </section>
      )}
    </main>
  )
}