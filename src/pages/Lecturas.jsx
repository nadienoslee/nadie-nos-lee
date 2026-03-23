import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function Lecturas() {
  usePageTitle('NADIE NOS LEE | LECTURAS')
  const [lecturas, setLecturas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('lecturas').select('*').eq('publicado', true).order('created_at', { ascending: false })
      if (data) setLecturas(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('lecturas-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lecturas' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  return (
    <main style={{ paddingTop: 84 }}>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.12)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 40%, rgba(58,171,220,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24 }}>Editorial</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 9vw, 116px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>LECTURAS<br />RECOMENDADAS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>Lo que estamos leyendo. Lo que nos cambió. Lo que no podemos dejar de recomendar.</p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : lecturas.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay lecturas recomendadas aún.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
              {lecturas.map((libro, i) => (
                <AnimatedSection key={libro.id} direction="up" delay={i * 0.1}>
                  <div style={{ padding: '40px 32px', border: '1px solid rgba(26,18,8,0.08)', background: '#fff', transition: 'transform 0.3s, border-color 0.3s, box-shadow 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = (libro.color || '#3AABDC') + '44'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(26,18,8,0.08)' }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(26,18,8,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: libro.color || '#3AABDC', display: 'block', marginBottom: 20 }}>{libro.genero || '—'} {libro.anio ? `· ${libro.anio}` : ''}</span>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#1a1208', lineHeight: 1.2, marginBottom: 8 }}>{libro.titulo}</h2>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontStyle: 'italic', color: 'rgba(26,18,8,0.45)', marginBottom: 24 }}>{libro.autor_libro}</p>
                    {libro.comentario && (
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, lineHeight: 1.8, color: 'rgba(26,18,8,0.6)', borderLeft: `3px solid ${(libro.color || '#3AABDC')}55`, paddingLeft: 18, marginBottom: 24, fontStyle: 'italic' }}>{libro.comentario}</p>
                    )}
                    {libro.recomendado_por && (
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(26,18,8,0.25)', textTransform: 'uppercase' }}>Rec. por {libro.recomendado_por}</p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}