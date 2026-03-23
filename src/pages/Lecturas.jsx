import AnimatedSection from '../components/AnimatedSection'

const lecturas = [
  { titulo: 'Los detectives salvajes', autor: 'Roberto Bolaño', anio: 1998, genero: 'Novela', recomendadoPor: 'Valeria Rincón', comentario: 'El libro que me hizo entender que la literatura latinoamericana podía ser caótica, eléctrica y verdadera al mismo tiempo. Lo releo cada dos años y siempre encuentro algo nuevo.', color: '#9B2D8E' },
  { titulo: 'Poeta en Nueva York', autor: 'Federico García Lorca', anio: 1940, genero: 'Poesía', recomendadoPor: 'Marco Tello', comentario: 'La prueba de que el verso puede ser simultáneamente hermoso e insoportable. Lorca desarmó el lenguaje aquí y lo volvió a armar de otra manera.', color: '#8B1A1A' },
  { titulo: 'La invención de la soledad', autor: 'Paul Auster', anio: 1982, genero: 'Autobiografía', recomendadoPor: 'Daniela Ortiz', comentario: 'El mejor libro que conozco sobre la relación entre la escritura y el duelo. Auster descubrió que escribir sobre el padre era escribir sobre sí mismo.', color: '#3AABDC' },
  { titulo: 'Crónica de una muerte anunciada', autor: 'Gabriel García Márquez', anio: 1981, genero: 'Novela corta', recomendadoPor: 'Rafael Cuevas', comentario: 'Para entender cómo funciona la crónica como forma literaria. García Márquez convirtió un hecho real en algo que trasciende el género periodístico por completo.', color: '#9B2D8E' },
  { titulo: 'Segundos afuera', autor: 'Martín Kohan', anio: 2005, genero: 'Novela', recomendadoPor: 'Daniela Ortiz', comentario: 'La novela que mejor muestra que la distancia narrativa puede ser una forma de intimidad. Kohan narra desde tan lejos que termina diciéndote todo.', color: '#8B1A1A' },
  { titulo: 'El año del pensamiento mágico', autor: 'Joan Didion', anio: 2005, genero: 'Ensayo / Memoria', recomendadoPor: 'Valeria Rincón', comentario: 'Didion escribió sobre el duelo con una precisión clínica que de alguna manera lo hace más devastador. El modelo de cómo escribir desde el dolor sin complacencia.', color: '#3AABDC' },
]

export default function Lecturas() {
  return (
    <main style={{ paddingTop: 84 }}>

      <section style={{
        background: '#f5ede0',
        padding: '100px 40px 80px',
        borderBottom: '1px solid rgba(58,171,220,0.12)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 80% 40%, rgba(58,171,220,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24,
            }}>Editorial</p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(52px, 9vw, 116px)',
              letterSpacing: 6, color: '#1a1208',
              lineHeight: 0.92, marginBottom: 36,
            }}>LECTURAS<br />RECOMENDADAS</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontStyle: 'italic',
              color: 'rgba(26,18,8,0.55)', lineHeight: 1.7,
            }}>
              Lo que estamos leyendo. Lo que nos cambió.
              Lo que no podemos dejar de recomendar.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
          }}>
            {lecturas.map((libro, i) => (
              <AnimatedSection key={i} direction="up" delay={i * 0.1}>
                <div style={{
                  padding: '40px 32px',
                  border: '1px solid rgba(26,18,8,0.08)',
                  background: '#fff',
                  transition: 'transform 0.3s, border-color 0.3s, box-shadow 0.3s',
                }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.borderColor = libro.color + '44'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(26,18,8,0.08)'
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(26,18,8,0.08)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: libro.color,
                    display: 'block', marginBottom: 20,
                  }}>{libro.genero} · {libro.anio}</span>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 28, fontWeight: 700,
                    color: '#1a1208', lineHeight: 1.2, marginBottom: 8,
                  }}>{libro.titulo}</h2>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 19, fontStyle: 'italic',
                    color: 'rgba(26,18,8,0.45)', marginBottom: 24,
                  }}>{libro.autor}</p>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 19, lineHeight: 1.8,
                    color: 'rgba(26,18,8,0.6)',
                    borderLeft: `3px solid ${libro.color}55`,
                    paddingLeft: 18, marginBottom: 24,
                    fontStyle: 'italic',
                  }}>{libro.comentario}</p>
                  <p style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, letterSpacing: 2,
                    color: 'rgba(26,18,8,0.25)',
                    textTransform: 'uppercase',
                  }}>Rec. por {libro.recomendadoPor}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}