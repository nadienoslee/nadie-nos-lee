import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function Escritura() {
  usePageTitle('NADIE NOS LEE | ESCRITURA')
  const [textos, setTextos]           = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando]       = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('escrituras')
        .select('*')
        .eq('publicado', true)
        .order('semana', { ascending: false })
      if (data?.length) { setTextos(data); setSeleccionado(data[0]) }
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('escrituras-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escrituras' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  if (cargando) return (
    <main style={{ paddingTop: 84, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, color: 'rgba(26,18,8,0.35)' }}>Cargando...</p>
    </main>
  )

  return (
    <main style={{ paddingTop: 84 }}>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(139,26,26,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 80%, rgba(139,26,26,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24 }}>Editorial</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 9vw, 120px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>ESCRITURA<br />DE LA SEMANA</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>
              Un texto nuevo cada semana. Todos los géneros. Todas las voces.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '60px 40px 120px' }}>
        {textos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: 'italic', color: 'rgba(26,18,8,0.35)' }}>No hay escrituras publicadas aún.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>
            <AnimatedSection direction="right">
              <div style={{ position: 'sticky', top: 104 }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)', marginBottom: 20 }}>Ediciones recientes</p>
                {textos.map(t => (
                  <div key={t.id} onClick={() => setSeleccionado(t)} style={{ padding: '20px 16px', marginBottom: 4, cursor: 'pointer', borderLeft: seleccionado?.id === t.id ? '3px solid #9B2D8E' : '3px solid transparent', background: seleccionado?.id === t.id ? 'rgba(155,45,142,0.05)' : 'transparent', transition: 'all 0.2s' }}
                    onMouseOver={e => { if (seleccionado?.id !== t.id) e.currentTarget.style.background = 'rgba(26,18,8,0.03)' }}
                    onMouseOut={e => { if (seleccionado?.id !== t.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#9B2D8E' }}>
                        {t.semana ? `Nº ${t.semana}` : '—'}
                      </span>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.3)' }}>
                        {t.fecha_publicacion ? new Date(t.fecha_publicacion).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: seleccionado?.id === t.id ? '#1a1208' : 'rgba(26,18,8,0.5)', marginBottom: 4, lineHeight: 1.3, transition: 'color 0.2s' }}>{t.titulo}</p>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(26,18,8,0.3)', textTransform: 'uppercase' }}>{t.autor} · {t.genero}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {seleccionado && (
              <AnimatedSection direction="left">
                <div style={{ borderLeft: '1px solid rgba(26,18,8,0.08)', paddingLeft: 48 }}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#9B2D8E', background: 'rgba(155,45,142,0.08)', padding: '4px 12px', marginRight: 10 }}>{seleccionado.genero}</span>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(26,18,8,0.3)' }}>
                      {seleccionado.semana ? `Semana ${seleccionado.semana}` : ''} {seleccionado.fecha_publicacion ? `· ${new Date(seleccionado.fecha_publicacion).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}` : ''}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 300, lineHeight: 1.05, color: '#1a1208', marginBottom: 10 }}>{seleccionado.titulo}</h2>
<p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, fontWeight: 600, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, marginBottom: 32, textTransform: 'uppercase' }}>{seleccionado.autor}</p>

{/* Imagen del libro / autor */}
{seleccionado.imagen_url && (
<img
  src={seleccionado.imagen_url}
  alt={seleccionado.titulo}
  style={{ display: 'block', maxWidth: '100%', height: 'auto', marginBottom: 48 }}
/>
)}

<div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, lineHeight: 2, color: 'rgba(26,18,8,0.75)', whiteSpace: 'pre-line', marginTop: seleccionado.imagen_url ? 0 : 48 }}>
  {seleccionado.contenido}
</div>
                </div>
              </AnimatedSection>
            )}
          </div>
        )}
      </section>
    </main>
  )
}