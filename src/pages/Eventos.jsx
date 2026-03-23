import { useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'

const eventos = [
  { id: 1, tipo: 'Lectura', estado: 'Próximo', titulo: 'Lectura en voz alta: Voces del margen', fecha: '28', mes: 'Mar', anioFecha: '2026', hora: '19:00 hrs', lugar: 'Casa de la Cultura Central', descripcion: 'Una noche de lecturas en voz alta donde cinco miembros del colectivo presentarán textos inéditos.', color: '#9B2D8E' },
  { id: 2, tipo: 'Taller', estado: 'Próximo', titulo: 'Taller de microficción — Nivel básico', fecha: '5', mes: 'Abr', anioFecha: '2026', hora: '10:00 - 14:00 hrs', lugar: 'Biblioteca Pública Central', descripcion: 'Un taller de cuatro horas para explorar la microficción como género literario.', color: '#3AABDC' },
  { id: 3, tipo: 'Presentación', estado: 'Próximo', titulo: 'Presentación: Antología "Escrituras del Norte"', fecha: '18', mes: 'Abr', anioFecha: '2026', hora: '18:00 hrs', lugar: 'Librería El Péndulo Norte', descripcion: 'Primera antología impresa del colectivo con textos de 14 autores del norte de México.', color: '#8B1A1A' },
  { id: 4, tipo: 'Taller', estado: 'Pasado', titulo: 'Taller de crónica urbana', fecha: '1', mes: 'Mar', anioFecha: '2026', hora: '10:00 - 14:00 hrs', lugar: 'Café El Ágora', descripcion: 'Taller de escritura de crónica con Rafael Cuevas. 18 participantes asistieron.', color: '#3AABDC' },
  { id: 5, tipo: 'Lectura', estado: 'Pasado', titulo: 'Noche de poesía: Cuerpos y territorios', fecha: '14', mes: 'Feb', anioFecha: '2026', hora: '20:00 hrs', lugar: 'Bar La Modernidad', descripcion: 'Lectura de poesía con música en vivo. Asistieron 45 personas.', color: '#9B2D8E' },
]

const filtros = ['Todos', 'Próximos', 'Pasados', 'Lectura', 'Taller', 'Presentación']

export default function Eventos() {
  const [filtro, setFiltro] = useState('Todos')

  const filtrados = eventos.filter(ev => {
    if (filtro === 'Todos') return true
    if (filtro === 'Próximos') return ev.estado === 'Próximo'
    if (filtro === 'Pasados') return ev.estado === 'Pasado'
    return ev.tipo === filtro
  })

  const proximos = filtrados.filter(e => e.estado === 'Próximo')
  const pasados = filtrados.filter(e => e.estado === 'Pasado')

  return (
    <main>

      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(58,171,220,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 12vw, 140px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>EVENTOS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>
              Lecturas, talleres y encuentros. Donde la escritura sale de la página.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FILTROS */}
      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              background: 'none', border: 'none',
              color: filtro === f ? '#1a1208' : 'rgba(26,18,8,0.35)',
              borderBottom: filtro === f ? '3px solid #3AABDC' : '3px solid transparent',
              padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s',
            }}>{f}</button>
          ))}
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '60px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* PRÓXIMOS */}
          {proximos.length > 0 && (
            <>
              {(filtro === 'Todos' || filtro === 'Próximos') && (
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 28 }}>Próximos eventos</p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 64 }}>
                {proximos.map((ev, i) => (
                  <AnimatedSection key={ev.id} direction="up" delay={i * 0.08}>
                    <Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{
                        background: '#fff', border: `2px solid ${ev.color}22`,
                        overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                      }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.1)'; e.currentTarget.style.borderColor = ev.color + '66' }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = ev.color + '22' }}
                      >
                        {/* Imagen placeholder */}
                        <div style={{
                          height: 200,
                          background: `linear-gradient(135deg, ${ev.color}25 0%, ${ev.color}08 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                        }}>
                          {/* Fecha badge */}
                          <div style={{ position: 'absolute', top: 16, left: 16, background: ev.color, padding: '8px 16px', textAlign: 'center', minWidth: 72 }}>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#fff', lineHeight: 1 }}>{ev.fecha}</div>
                            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{ev.mes}</div>
                          </div>
                          {/* Tipo badge */}
                          <span style={{ position: 'absolute', top: 16, right: 16, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: ev.color, background: '#fff', padding: '4px 10px' }}>{ev.tipo}</span>
                          {/* Ícono decorativo */}
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 140, color: ev.color, opacity: 0.07, lineHeight: 1, userSelect: 'none' }}>
                            {ev.tipo === 'Lectura' ? 'L' : ev.tipo === 'Taller' ? 'T' : 'P'}
                          </span>
                        </div>

                        <div style={{ padding: '28px 28px 32px' }}>
                          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: '#1a1208', lineHeight: 1.25, marginBottom: 10 }}>{ev.titulo}</h3>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.6, color: 'rgba(26,18,8,0.55)', marginBottom: 16 }}>{ev.descripcion}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: 'rgba(26,18,8,0.55)', letterSpacing: 1 }}>{ev.lugar}</p>
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: ev.color, borderBottom: `1px solid ${ev.color}` }}>Ver evento →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </>
          )}

          {/* PASADOS */}
          {pasados.length > 0 && (
            <>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)', marginBottom: 28, borderTop: proximos.length > 0 ? '1px solid rgba(26,18,8,0.07)' : 'none', paddingTop: proximos.length > 0 ? 48 : 0 }}>Eventos pasados</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {pasados.map((ev, i) => (
                  <AnimatedSection key={ev.id} direction="up" delay={i * 0.08}>
                    <Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', overflow: 'hidden', opacity: 0.7, transition: 'opacity 0.3s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.95'}
                        onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
                      >
                        <div style={{ height: 160, background: `linear-gradient(135deg, ${ev.color}15 0%, ${ev.color}05 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(26,18,8,0.15)', padding: '6px 14px', textAlign: 'center', minWidth: 64 }}>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: '#1a1208', lineHeight: 1 }}>{ev.fecha}</div>
                            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, color: 'rgba(26,18,8,0.6)', textTransform: 'uppercase' }}>{ev.mes}</div>
                          </div>
                          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)', position: 'absolute', top: 16, right: 16, border: '1px solid rgba(26,18,8,0.15)', padding: '3px 8px' }}>Pasado</span>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 100, color: ev.color, opacity: 0.06, lineHeight: 1 }}>{ev.tipo[0]}</span>
                        </div>
                        <div style={{ padding: '22px 24px 26px' }}>
                          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: 'rgba(26,18,8,0.7)', lineHeight: 1.25, marginBottom: 8 }}>{ev.titulo}</h3>
                          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.4)', letterSpacing: 1 }}>{ev.lugar}</p>
                        </div>
                      </div>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </>
          )}

          {filtrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: 'italic', color: 'rgba(26,18,8,0.3)' }}>No hay eventos en esta categoría.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}