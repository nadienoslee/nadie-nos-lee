import { useState } from 'react'
import AnimatedSection from '../components/AnimatedSection'

const notas = [
  { id: 1, categoria: 'Ensayo', titulo: 'Por qué la literatura latinoamericana sigue mirando hacia afuera', autor: 'Daniela Ortiz', fecha: '15 Mar 2026', extracto: 'Hay una tendencia persistente en nuestras letras de buscar validación fuera antes de encontrarla adentro. Este ensayo explora los mecanismos de ese desplazamiento.', color: '#9B2D8E', minutos: 8 },
  { id: 2, categoria: 'Reflexión', titulo: 'El taller de escritura como espacio político', autor: 'Marco Tello', fecha: '8 Mar 2026', extracto: 'Reunirse a leer en voz alta lo que uno escribió en privado es un acto más subversivo de lo que parece. Sobre los talleres como formas de resistencia.', color: '#8B1A1A', minutos: 6 },
  { id: 3, categoria: 'Crítica', titulo: 'Tres libros de poesía que nadie está leyendo (y debería)', autor: 'Valeria Rincón', fecha: '1 Mar 2026', extracto: 'No son los libros que aparecen en los suplementos. Son los que circulan de mano en mano, los que se fotocopian, los que alguien te presta y nunca te devuelve.', color: '#3AABDC', minutos: 5 },
  { id: 4, categoria: 'Ensayo', titulo: 'Sobre la autoficción y sus límites', autor: 'Rafael Cuevas', fecha: '22 Feb 2026', extracto: 'La autoficción se ha convertido en el género del momento. Pero hay algo que se pierde cuando todo texto necesita un yo reconocible para ser leído.', color: '#9B2D8E', minutos: 10 },
  { id: 5, categoria: 'Reflexión', titulo: 'Escribir sin red: sobre la escritura sin taller ni comunidad', autor: 'Daniela Ortiz', fecha: '14 Feb 2026', extracto: 'No todos los que escriben tienen acceso a una comunidad literaria. Este texto es para ellos — y sobre lo que se pierde y lo que se gana en la escritura solitaria.', color: '#8B1A1A', minutos: 7 },
]

const categorias = ['Todas', 'Ensayo', 'Reflexión', 'Crítica']

export default function Notas() {
  const [filtro, setFiltro] = useState('Todas')
  const filtradas = filtro === 'Todas' ? notas : notas.filter(n => n.categoria === filtro)

  return (
    <main style={{ paddingTop: 84 }}>

      <section style={{
        background: '#f5ede0',
        padding: '100px 40px 80px',
        borderBottom: '1px solid rgba(139,26,26,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 60% 60%, rgba(139,26,26,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24,
            }}>Editorial</p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(72px, 12vw, 140px)',
              letterSpacing: 6, color: '#1a1208',
              lineHeight: 0.92, marginBottom: 36,
            }}>NOTAS</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontStyle: 'italic',
              color: 'rgba(26,18,8,0.55)', lineHeight: 1.7,
            }}>
              Ensayos, reflexiones y crítica literaria del colectivo.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setFiltro(cat)} style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase',
              background: 'none', border: 'none',
              color: filtro === cat ? '#1a1208' : 'rgba(26,18,8,0.35)',
              borderBottom: filtro === cat ? '3px solid #8B1A1A' : '3px solid transparent',
              padding: '18px 20px',
              cursor: 'pointer', transition: 'color 0.2s',
            }}>{cat}</button>
          ))}
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '40px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {filtradas.map((nota, i) => (
            <AnimatedSection key={nota.id} direction="right" delay={i * 0.08}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 32, alignItems: 'start',
                padding: '44px 0',
                borderBottom: '1px solid rgba(26,18,8,0.07)',
                cursor: 'pointer',
                transition: 'padding-left 0.3s',
              }}
                onMouseOver={e => e.currentTarget.style.paddingLeft = '16px'}
                onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}
              >
                <div>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, letterSpacing: 2,
                      textTransform: 'uppercase', color: nota.color,
                      background: nota.color + '15', padding: '5px 12px',
                    }}>{nota.categoria}</span>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 11, color: 'rgba(26,18,8,0.3)', letterSpacing: 1,
                    }}>{nota.fecha}</span>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 11, color: 'rgba(26,18,8,0.25)',
                    }}>{nota.minutos} min de lectura</span>
                  </div>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(24px, 3vw, 34px)',
                    fontWeight: 400, color: '#1a1208',
                    lineHeight: 1.2, marginBottom: 16,
                  }}>{nota.titulo}</h2>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20, lineHeight: 1.75,
                    color: 'rgba(26,18,8,0.55)', maxWidth: 680,
                  }}>{nota.extracto}</p>
                  <p style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 11, letterSpacing: 1,
                    color: 'rgba(26,18,8,0.35)',
                    textTransform: 'uppercase', marginTop: 16,
                  }}>{nota.autor}</p>
                </div>
                <span style={{ color: 'rgba(26,18,8,0.2)', fontSize: 24, marginTop: 8 }}>→</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </main>
  )
}