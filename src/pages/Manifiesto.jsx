import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import iconRosa from '../assets/ICONROSA.png'
import iconRojo from '../assets/ICONROJO.png'
import usePageTitle from '../hooks/usePageTitle'

export default function Manifiesto() {
  usePageTitle('NADIE NOS LEE | MANIFIESTO')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <main>

      <section style={{
        background: '#f5ede0',
        padding: '100px 40px 80px',
        borderBottom: '1px solid rgba(155,45,142,0.15)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(155,45,142,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#9B2D8E', marginBottom: 24,
            }}>Identidad</p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(72px, 12vw, 140px)',
              letterSpacing: 6, color: '#1a1208',
              lineHeight: 0.92, marginBottom: 36,
            }}>MANIFIESTO</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontStyle: 'italic',
              color: 'rgba(26,18,8,0.55)', lineHeight: 1.7,
            }}>
              La palabra compartida como comunidad, resistencia y futuro.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
{[
  {
    num: '01',
    titulo: 'Un proyecto poético colectivo',
    texto: 'Nadie nos lee es un proyecto poético colectivo que nace para reclamar la voz y ejercer la autogestión como una forma de construcción en comunidad y resistencia cultural. Originario de Los Mochis, Ahome, Sinaloa, y organizado por Francisco Bojórquez, Janet Fitch, Issac Cordero y Cecilia Aurora Bojórquez, el colectivo surge como una apuesta por la palabra compartida y el encuentro entre quienes escriben, leen y habitan la poesía como forma de diálogo.',
  },
  {
    num: '02',
    titulo: 'Lectura y escritura como prácticas vivas',
    texto: 'Más que un proyecto de difusión, Nadie nos lee es un espacio destinado a la lectura y la escritura como prácticas vivas. A través de círculos de lectura, talleres, conversatorios, micrófonos abiertos y otras actividades, el colectivo busca generar puentes entre espacios alternativos e institucionales, en los que la poesía circule entre quienes la escuchan, la leen y la comparten como una posibilidad de reconocimiento mutuo.',
  },
  {
    num: '03',
    titulo: 'Mapear las voces del noroeste',
    texto: 'Con una mirada puesta más allá de su lugar de origen, Nadie nos lee trabaja con la intención de mapear las voces poéticas del noroeste de México, visibilizando escrituras que muchas veces quedan fuera del centro y del circuito hegemónico literario. Desde esa conciencia de margen, el proyecto camina hacia el futuro con el deseo de expandir sus actividades a otras ciudades y estados, fortaleciendo redes, amplificando voces y demostrando que, incluso cuando parece que nadie lee, la poesía sigue encontrando dónde decirse.',
  },
].map((bloque, i) => (
            <AnimatedSection key={i} direction="right" delay={i * 0.1}>
              <div style={{
              display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '72px 1fr',
                gap: isMobile ? 16 : 36,
              marginBottom: 72,
              '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                paddingBottom: 72,
                borderBottom: i < 2 ? '1px solid rgba(26,18,8,0.08)' : 'none',
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 56, color: 'rgba(155,45,142,0.2)',
                  lineHeight: 1,
                }}>{bloque.num}</div>
                <div>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 36, fontWeight: 600,
                    color: '#1a1208', marginBottom: 20,
                    lineHeight: 1.2,
                  }}>{bloque.titulo}</h2>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, lineHeight: 1.9,
                    color: 'rgba(26,18,8,0.65)',
                  }}>{bloque.texto}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}

          <AnimatedSection direction="up">
            <div style={{
              textAlign: 'center', padding: '60px 40px',
              background: 'rgba(155,45,142,0.05)',
              border: '1px solid rgba(155,45,142,0.2)',
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30, fontStyle: 'italic',
                color: '#1a1208', marginBottom: 28, lineHeight: 1.5,
              }}>
                "Nadie nos lee,
y aun así la poesía persiste."
              </p>
<div style={{ display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center' }}>
  <img src={iconRosa} alt="" style={{ width: 36, height: 'auto', objectFit: 'contain', flexShrink: 0 }} />
  <p style={{
    fontFamily: "'Courier Prime', monospace",
    fontSize: 12, letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(26,18,8,0.4)',
  }}>Nadie Nos Lee — Colectivo de Escritura</p>
  <img src={iconRojo} alt="" style={{ width: 36, height: 'auto', objectFit: 'contain', flexShrink: 0 }} />
</div>  
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}