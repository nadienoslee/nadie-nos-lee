import { useState } from 'react'
import AnimatedSection from '../components/AnimatedSection'

const textos = [
  {
    id: 1, titulo: 'El peso del martes',
    autor: 'Valeria Rincón', genero: 'Narrativa',
    fecha: 'Mar 2026', semana: 12,
    fragmento: 'Los martes tienen un peso específico que los otros días no conocen...',
    contenido: `Los martes tienen un peso específico que los otros días no conocen. No es tristeza exactamente — es más como el eco de algo que estuvo a punto de suceder y decidió no hacerlo.

Me di cuenta un martes de febrero, mientras esperaba el camión en la esquina de siempre. El semáforo cambió tres veces. Yo no me moví. No era indecisión — era otra cosa. Era la certeza de que ese día, ese martes en particular, tenía algo que decirme si yo me quedaba quieta el tiempo suficiente.

El camión pasó. Luego otro. Al tercero me subí, pero ya no era la misma persona que había salido de casa. Los martes hacen eso: te cambian sin pedirte permiso.`,
  },
  {
    id: 2, titulo: 'Cartografía del olvido',
    autor: 'Marco Tello', genero: 'Poesía',
    fecha: 'Mar 2026', semana: 11,
    fragmento: 'Olvidar también es un acto de cartografía...',
    contenido: `Olvidar también es un acto de cartografía:
trazas los bordes de lo que ya no puedes nombrar,
marcas con una X los territorios perdidos,
dibujas ríos donde antes hubo certezas.

El mapa del olvido no tiene leyenda.
Sus colores no significan nada
que puedas explicarle a alguien más.

Solo tú sabes que el azul
es el tono exacto de aquella tarde,
y que el blanco
no es ausencia —
es todo lo que decidiste no recordar.`,
  },
  {
    id: 3, titulo: 'Sobre la imposibilidad de describir el hambre',
    autor: 'Daniela Ortiz', genero: 'Ensayo',
    fecha: 'Feb 2026', semana: 10,
    fragmento: 'El hambre no tiene sinónimos precisos...',
    contenido: `El hambre no tiene sinónimos precisos. Todos los intentos de nombrarla la convierten en otra cosa: en necesidad, en deseo, en carencia. Pero el hambre en su estado puro — el hambre que no ha sido aún mediada por el lenguaje — es anterior a cualquier palabra que pudiéramos asignarle.

He pensado mucho en esto mientras intentaba escribir sobre mi abuela. Ella nunca dijo que tenía hambre. Decía que le faltaba algo. Y esa formulación, que faltaba algo, me parece la más honesta de todas: el hambre como ausencia de algo que no siempre es comida.

La literatura ha intentado muchas veces nombrar el hambre. Knut Hamsun escribió una novela entera habitándola. Kafka convirtió el ayuno en performance. Pero ninguno de los dos logró del todo lo que buscaban: hacer que el lector sintiera el hambre en lugar de comprenderla.`,
  },
]

export default function Escritura() {
  const [seleccionado, setSeleccionado] = useState(textos[0])

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
          background: 'radial-gradient(ellipse at 30% 80%, rgba(139,26,26,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#8B1A1A', marginBottom: 24,
            }}>Editorial</p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(52px, 9vw, 120px)',
              letterSpacing: 6, color: '#1a1208',
              lineHeight: 0.92, marginBottom: 36,
            }}>ESCRITURA<br />DE LA SEMANA</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontStyle: 'italic',
              color: 'rgba(26,18,8,0.55)', lineHeight: 1.7,
            }}>
              Un texto nuevo cada semana. Todos los géneros. Todas las voces.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '60px 40px 120px' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 48,
        }}>

          {/* LISTA */}
          <AnimatedSection direction="right">
            <div style={{ position: 'sticky', top: 104 }}>
              <p style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10, letterSpacing: 4,
                textTransform: 'uppercase',
                color: 'rgba(26,18,8,0.3)', marginBottom: 20,
              }}>Ediciones recientes</p>
              {textos.map(t => (
                <div key={t.id}
                  onClick={() => setSeleccionado(t)}
                  style={{
                    padding: '20px 16px', marginBottom: 4,
                    cursor: 'pointer',
                    borderLeft: seleccionado.id === t.id
                      ? '3px solid #9B2D8E' : '3px solid transparent',
                    background: seleccionado.id === t.id
                      ? 'rgba(155,45,142,0.05)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => {
                    if (seleccionado.id !== t.id)
                      e.currentTarget.style.background = 'rgba(26,18,8,0.03)'
                  }}
                  onMouseOut={e => {
                    if (seleccionado.id !== t.id)
                      e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, letterSpacing: 2,
                      textTransform: 'uppercase', color: '#9B2D8E',
                    }}>Nº {t.semana}</span>
                    <span style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, color: 'rgba(26,18,8,0.3)',
                    }}>{t.fecha}</span>
                  </div>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20, fontWeight: 600,
                    color: seleccionado.id === t.id ? '#1a1208' : 'rgba(26,18,8,0.5)',
                    marginBottom: 4, lineHeight: 1.3,
                    transition: 'color 0.2s',
                  }}>{t.titulo}</p>
                  <p style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, letterSpacing: 1,
                    color: 'rgba(26,18,8,0.3)',
                    textTransform: 'uppercase',
                  }}>{t.autor} · {t.genero}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* TEXTO */}
          <AnimatedSection direction="left">
            <div style={{
              borderLeft: '1px solid rgba(26,18,8,0.08)',
              paddingLeft: 48,
            }}>
              <div style={{ marginBottom: 14 }}>
                <span style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10, letterSpacing: 3,
                  textTransform: 'uppercase', color: '#9B2D8E',
                  background: 'rgba(155,45,142,0.08)',
                  padding: '4px 12px', marginRight: 10,
                }}>{seleccionado.genero}</span>
                <span style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: 'rgba(26,18,8,0.3)',
                }}>Semana {seleccionado.semana} · {seleccionado.fecha}</span>
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(36px, 4.5vw, 60px)',
                fontWeight: 300, lineHeight: 1.05,
                color: '#1a1208', marginBottom: 10,
              }}>{seleccionado.titulo}</h2>
              <p style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 13, fontWeight: 600,
                color: 'rgba(26,18,8,0.4)',
                letterSpacing: 1, marginBottom: 48,
                textTransform: 'uppercase',
              }}>{seleccionado.autor}</p>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 23, lineHeight: 2,
                color: 'rgba(26,18,8,0.75)',
                whiteSpace: 'pre-line',
              }}>
                {seleccionado.contenido}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}