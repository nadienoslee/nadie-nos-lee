import { useState } from 'react'
import AnimatedSection from '../components/AnimatedSection'

const publicaciones = [
  { id: 1, titulo: 'El peso del martes', autor: 'Valeria Rincón', genero: 'Narrativa', fecha: 'Mar 2026', semana: 12 },
  { id: 2, titulo: 'Cartografía del olvido', autor: 'Marco Tello', genero: 'Poesía', fecha: 'Mar 2026', semana: 11 },
  { id: 3, titulo: 'Sobre la imposibilidad de describir el hambre', autor: 'Daniela Ortiz', genero: 'Ensayo', fecha: 'Feb 2026', semana: 10 },
  { id: 4, titulo: 'La casa que fuimos', autor: 'Rafael Cuevas', genero: 'Crónica', fecha: 'Feb 2026', semana: 9 },
  { id: 5, titulo: 'Instrucciones para olvidar un idioma', autor: 'Valeria Rincón', genero: 'Narrativa', fecha: 'Feb 2026', semana: 8 },
  { id: 6, titulo: 'Tres poemas del insomnio', autor: 'Marco Tello', genero: 'Poesía', fecha: 'Ene 2026', semana: 7 },
  { id: 7, titulo: 'El cuerpo como archivo', autor: 'Daniela Ortiz', genero: 'Ensayo', fecha: 'Ene 2026', semana: 6 },
  { id: 8, titulo: 'Retrato de mi ciudad a las 3am', autor: 'Rafael Cuevas', genero: 'Crónica', fecha: 'Ene 2026', semana: 5 },
  { id: 9, titulo: 'Lo que no dijimos en el velorio', autor: 'Valeria Rincón', genero: 'Narrativa', fecha: 'Dic 2025', semana: 4 },
  { id: 10, titulo: 'Elegía del semáforo roto', autor: 'Marco Tello', genero: 'Poesía', fecha: 'Dic 2025', semana: 3 },
  { id: 11, titulo: 'Sobre el aburrimiento como práctica literaria', autor: 'Daniela Ortiz', genero: 'Ensayo', fecha: 'Dic 2025', semana: 2 },
  { id: 12, titulo: 'Primera crónica', autor: 'Rafael Cuevas', genero: 'Crónica', fecha: 'Dic 2025', semana: 1 },
]

const generos = ['Todos', 'Narrativa', 'Poesía', 'Ensayo', 'Crónica']
const colores = { Narrativa: '#9B2D8E', Poesía: '#8B1A1A', Ensayo: '#3AABDC', Crónica: '#9B2D8E' }

export default function Archivo() {
  const [filtroGenero, setFiltroGenero] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const filtradas = publicaciones.filter(p => {
    const matchGenero = filtroGenero === 'Todos' || p.genero === filtroGenero
    const matchBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.autor.toLowerCase().includes(busqueda.toLowerCase())
    return matchGenero && matchBusqueda
  })

  return (
    <main style={{ paddingTop: 84 }}>

      <section style={{
        background: '#f5ede0',
        padding: '100px 40px 80px',
        borderBottom: '1px solid rgba(155,45,142,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 24,
            }}>Editorial</p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(72px, 12vw, 140px)',
              letterSpacing: 6, color: '#1a1208',
              lineHeight: 0.92, marginBottom: 36,
            }}>ARCHIVO</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontStyle: 'italic',
              color: 'rgba(26,18,8,0.55)', lineHeight: 1.7,
            }}>
              La memoria completa del colectivo. Todo lo que hemos publicado.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {generos.map(g => (
              <button key={g} onClick={() => setFiltroGenero(g)} style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 11, letterSpacing: 2,
                textTransform: 'uppercase',
                background: 'none', border: 'none',
                color: filtroGenero === g ? '#1a1208' : 'rgba(26,18,8,0.35)',
                borderBottom: filtroGenero === g ? '3px solid #9B2D8E' : '3px solid transparent',
                padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s',
              }}>{g}</button>
            ))}
          </div>
          <input type="text" placeholder="Buscar por título o autor..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              padding: '12px 18px',
              background: '#fff',
              border: '1px solid rgba(26,18,8,0.12)',
              color: '#1a1208', outline: 'none',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 13, width: 280,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#9B2D8E'}
            onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
          />
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '40px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11, letterSpacing: 2,
            color: 'rgba(26,18,8,0.3)',
            marginBottom: 32, textTransform: 'uppercase',
          }}>{filtradas.length} publicaciones</p>

          {filtradas.map((pub, i) => (
            <AnimatedSection key={pub.id} direction="right" delay={i * 0.04}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                gap: 28, alignItems: 'center',
                padding: '22px 0',
                borderBottom: '1px solid rgba(26,18,8,0.06)',
                cursor: 'pointer',
                transition: 'padding-left 0.3s',
              }}
                onMouseOver={e => e.currentTarget.style.paddingLeft = '14px'}
                onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}
              >
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32, color: 'rgba(155,45,142,0.2)', lineHeight: 1,
                }}>{pub.semana}</span>
                <div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24, fontWeight: 400,
                    color: '#1a1208', marginBottom: 4,
                  }}>{pub.titulo}</h3>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, letterSpacing: 2,
                      color: colores[pub.genero] || '#9B2D8E',
                      textTransform: 'uppercase',
                    }}>{pub.genero}</span>
                    <span style={{ color: 'rgba(26,18,8,0.2)', fontSize: 12 }}>·</span>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, color: 'rgba(26,18,8,0.4)', letterSpacing: 1,
                    }}>{pub.autor}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, color: 'rgba(26,18,8,0.3)',
                    display: 'block', marginBottom: 4,
                  }}>{pub.fecha}</span>
                  <span style={{ color: 'rgba(26,18,8,0.2)', fontSize: 18 }}>→</span>
                </div>
              </div>
            </AnimatedSection>
          ))}

          {filtradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 26, fontStyle: 'italic',
                color: 'rgba(26,18,8,0.3)',
              }}>No se encontraron publicaciones.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}