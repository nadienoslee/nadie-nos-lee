import AnimatedSection from '../components/AnimatedSection'

const noticias = [
  { id: 1, categoria: 'Aparición', titulo: 'Nadie Nos Lee en el Festival de Literatura del Norte', fecha: '18 Mar 2026', cuerpo: 'El colectivo fue invitado a participar en la segunda edición del Festival de Literatura del Norte, que se realizará en mayo en la ciudad de Chihuahua. Tres miembros del colectivo darán lecturas y coordinarán un taller abierto al público.', color: '#9B2D8E' },
  { id: 2, categoria: 'Convocatoria', titulo: 'Nueva convocatoria: escrituras sobre el territorio', fecha: '5 Mar 2026', cuerpo: 'Abrimos nuestra segunda convocatoria del año con el tema "territorio" como eje: el lugar donde nacimos, el lugar donde vivimos, el lugar que dejamos. Aceptamos narrativa, poesía, ensayo y crónica.', color: '#8B1A1A' },
  { id: 3, categoria: 'Publicación', titulo: 'Tres miembros del colectivo en antología nacional', fecha: '12 Feb 2026', cuerpo: 'Valeria Rincón, Marco Tello y Daniela Ortiz fueron seleccionados para la Antología de Nuevas Voces del Norte, publicada por la editorial independiente Frontera Libros. Los textos estarán disponibles en librerías a partir de abril.', color: '#3AABDC' },
  { id: 4, categoria: 'Taller', titulo: 'El taller de crónica reunió a 18 escritores', fecha: '2 Mar 2026', cuerpo: 'Con una asistencia de 18 participantes de cinco ciudades distintas, el taller de crónica urbana coordinado por Rafael Cuevas fue el más concurrido en la historia del colectivo. Algunos de los textos producidos serán publicados en el archivo del sitio.', color: '#9B2D8E' },
  { id: 5, categoria: 'Logro', titulo: 'El colectivo cumple su primer año', fecha: '15 Dic 2025', cuerpo: 'Nadie Nos Lee cumplió su primer año de existencia con 12 escrituras semanales publicadas, 4 talleres realizados, 3 lecturas en voz alta y más de 60 textos recibidos en convocatorias. Gracias a todos los que escriben y leen con nosotros.', color: '#8B1A1A' },
]

export default function Noticias() {
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
          background: 'radial-gradient(ellipse at 70% 60%, rgba(139,26,26,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24,
            }}>Comunidad</p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(72px, 12vw, 140px)',
              letterSpacing: 6, color: '#1a1208',
              lineHeight: 0.92, marginBottom: 36,
            }}>NOTICIAS</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontStyle: 'italic',
              color: 'rgba(26,18,8,0.55)', lineHeight: 1.7,
            }}>
              El pulso informativo del colectivo.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {noticias.map((n, i) => (
            <AnimatedSection key={n.id} direction="right" delay={i * 0.1}>
              <div style={{
                padding: '52px 0',
                borderBottom: '1px solid rgba(26,18,8,0.07)',
              }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: '#fff', background: n.color,
                    padding: '5px 14px',
                  }}>{n.categoria}</span>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 11, color: 'rgba(26,18,8,0.35)', letterSpacing: 1,
                  }}>{n.fecha}</span>
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  fontWeight: 400, lineHeight: 1.2,
                  color: '#1a1208', marginBottom: 22,
                }}>{n.titulo}</h2>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 21, lineHeight: 1.85,
                  color: 'rgba(26,18,8,0.6)',
                }}>{n.cuerpo}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </main>
  )
}