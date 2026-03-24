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
      {/* HERO */}
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

      {/* MIEMBROS */}
      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : miembros.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay miembros publicados aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {miembros.map((m, i) => {
                const color   = m.color || '#3AABDC'
                const inicial = m.nombre?.charAt(0).toUpperCase() || '?'
                const esImpar = i % 2 !== 0 // alterna imagen izq/der

                return (
                  <AnimatedSection key={m.id} direction={esImpar ? 'left' : 'right'} delay={0.1}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(280px, 380px) 1fr',
                      gridTemplateAreas: esImpar ? '"texto foto"' : '"foto texto"',
                      minHeight: 360,
                      background: '#fff',
                      borderTop: i === 0 ? `4px solid ${color}` : 'none',
                      borderBottom: '1px solid rgba(26,18,8,0.07)',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.3s',
                    }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = `0 8px 40px rgba(26,18,8,0.08), inset 0 0 0 2px ${color}22`}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >

                      {/* FOTO */}
                      <div style={{
                        gridArea: 'foto',
                        position: 'relative',
                        background: m.foto_url ? '#efe7dc' : `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`,
                        overflow: 'hidden',
                        minHeight: 360,
                      }}>
                        {m.foto_url ? (
                          <img
                            src={m.foto_url}
                            alt={m.nombre}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top center',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 180, color, opacity: 0.1, lineHeight: 1, userSelect: 'none' }}>{inicial}</span>
                            <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: color + '18', border: `3px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color }}>{inicial}</span>
                            </div>
                          </div>
                        )}
                        {/* Barra de color lateral */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          [esImpar ? 'left' : 'right']: 0,
                          width: 4,
                          height: '100%',
                          background: color,
                        }} />
                      </div>

                      {/* TEXTO */}
                      <div style={{
                        gridArea: 'texto',
                        padding: '48px 52px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                        {/* Número decorativo */}
                        <span style={{
                          position: 'absolute',
                          top: 24,
                          right: 28,
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: 72,
                          color,
                          opacity: 0.06,
                          lineHeight: 1,
                          userSelect: 'none',
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        {/* Rol */}
                        {m.rol && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 28, height: 2, background: color }} />
                            <p style={{
                              fontFamily: "'Courier Prime', monospace",
                              fontSize: 11,
                              letterSpacing: 3,
                              textTransform: 'uppercase',
                              color,
                              fontWeight: '700',
                            }}>{m.rol}</p>
                          </div>
                        )}

                        {/* Nombre */}
                        <h2 style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: 'clamp(32px, 4vw, 52px)',
                          fontWeight: 400,
                          color: '#1a1208',
                          lineHeight: 1.05,
                          marginBottom: 24,
                        }}>{m.nombre}</h2>

                        {/* Separador */}
                        <div style={{ width: 48, height: 1, background: `linear-gradient(to right, ${color}, transparent)`, marginBottom: 24 }} />

                        {/* Bio */}
                        {m.bio && (
                          <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 20,
                            lineHeight: 1.85,
                            color: 'rgba(26,18,8,0.62)',
                            fontStyle: 'italic',
                          }}>{m.bio}</p>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .miembro-card { grid-template-columns: 1fr !important; grid-template-areas: "foto" "texto" !important; }
        }
      `}</style>
    </main>
  )
}