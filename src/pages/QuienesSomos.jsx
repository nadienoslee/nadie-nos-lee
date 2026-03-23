import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function QuienesSomos() {
  usePageTitle('NADIE NOS LEE | QUIÉNES SOMOS')
  const [miembros, setMiembros] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('miembros')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
      if (data) setMiembros(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('miembros-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'miembros' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  return (
    <main>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.12)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(58,171,220,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24 }}>Identidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 10vw, 120px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>QUIÉNES<br />SOMOS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
              Un grupo de personas que escribe, que lee, y que cree que ambas cosas importan.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : miembros.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay miembros publicados aún.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
              {miembros.map((m, i) => {
                const color   = m.color || '#9B2D8E'
                const inicial = m.nombre?.charAt(0).toUpperCase() || '?'
                return (
                  <AnimatedSection key={m.id} direction="up" delay={i * 0.12}>
                    <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.08)', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s' }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.09)'; e.currentTarget.style.borderColor = color + '44' }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(26,18,8,0.08)' }}
                    >
                      {/* Foto o placeholder */}
                      <div style={{ width: '100%', height: 220, background: m.foto_url ? 'transparent' : `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {m.foto_url ? (
                          <img src={m.foto_url} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <>
                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color, opacity: 0.15, lineHeight: 1, userSelect: 'none' }}>{inicial}</span>
                            <div style={{ position: 'absolute', bottom: 16, right: 16, width: 56, height: 56, borderRadius: '50%', background: color + '20', border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color }}>{inicial}</span>
                            </div>
                          </>
                        )}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
                      </div>

                      {/* Info */}
                      <div style={{ padding: '28px 28px 24px' }}>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#1a1208', marginBottom: 6 }}>{m.nombre}</h2>
                        {m.rol && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color, marginBottom: 16 }}>{m.rol}</p>}
                        {m.bio && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, lineHeight: 1.8, color: 'rgba(26,18,8,0.65)' }}>{m.bio}</p>}
                      </div>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}