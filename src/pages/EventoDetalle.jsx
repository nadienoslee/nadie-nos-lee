import { useParams, Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'

const todosLosEventos = [
  { id: 1, tipo: 'Lectura', estado: 'Próximo', titulo: 'Lectura en voz alta: Voces del margen', fecha: '28 Mar 2026', hora: '19:00 hrs', lugar: 'Casa de la Cultura Central', direccion: 'Av. Álvaro Obregón 12, Centro', descripcion: 'Una noche de lecturas en voz alta donde cinco miembros del colectivo presentarán textos inéditos. Entrada libre. Cupo limitado a 60 personas.', descripcionLarga: 'Esta velada literaria reúne a cinco voces del colectivo Nadie Nos Lee para compartir textos inéditos que nunca antes han sido leídos en público. Cada autor presentará un fragmento de entre cinco y diez minutos, seguido de una conversación breve con el público.\n\nEl evento es de entrada libre y el aforo es limitado a 60 personas. Se recomienda llegar con 15 minutos de anticipación para asegurar lugar.\n\nDespués de las lecturas habrá un espacio informal de convivencia.', color: '#9B2D8E', gradiente: 'linear-gradient(135deg, rgba(155,45,142,0.15), rgba(155,45,142,0.05))' },
  { id: 2, tipo: 'Taller', estado: 'Próximo', titulo: 'Taller de microficción — Nivel básico', fecha: '5 Abr 2026', hora: '10:00 - 14:00 hrs', lugar: 'Biblioteca Pública Central', direccion: 'Calle Hidalgo 45, Col. Centro', descripcion: 'Un taller de cuatro horas para explorar la microficción como género.', descripcionLarga: 'La microficción es uno de los géneros más exigentes de la literatura: en menos de 300 palabras debe existir una historia completa, con personaje, conflicto y resolución.\n\nEn este taller de cuatro horas exploraremos las reglas del cuento brevísimo, sus posibilidades narrativas, y las romperemos con intención. Trabajaremos sobre ejemplos de autores como Augusto Monterroso, Ana María Shua y Luisa Valenzuela, y produciremos al menos tres textos propios.\n\nEl taller está diseñado para personas que se inician en la escritura o que quieren explorar un género nuevo. No se requiere experiencia previa.', color: '#3AABDC', gradiente: 'linear-gradient(135deg, rgba(58,171,220,0.15), rgba(58,171,220,0.05))' },
  { id: 3, tipo: 'Presentación', estado: 'Próximo', titulo: 'Presentación: Antología "Escrituras del Norte"', fecha: '18 Abr 2026', hora: '18:00 hrs', lugar: 'Librería El Péndulo Norte', direccion: 'Blvd. Francisco Villa 88', descripcion: 'Presentación de la primera antología impresa del colectivo con textos de 14 autores.', descripcionLarga: 'Nadie Nos Lee presenta su primera antología impresa: "Escrituras del Norte", una colección de 14 textos que reúne narrativa, poesía, ensayo y crónica de autores del norte de México.\n\nEn este evento los autores incluidos en la antología leerán fragmentos de sus textos y conversarán sobre el proceso de selección y edición. Habrá firma de ejemplares y los libros estarán disponibles para su venta.\n\nEntrada libre. Ejemplares disponibles a precio de costo para los asistentes.', color: '#8B1A1A', gradiente: 'linear-gradient(135deg, rgba(139,26,26,0.15), rgba(139,26,26,0.05))' },
  { id: 4, tipo: 'Taller', estado: 'Pasado', titulo: 'Taller de crónica urbana', fecha: '1 Mar 2026', hora: '10:00 - 14:00 hrs', lugar: 'Café El Ágora', direccion: 'Calle Lerdo 23, Centro', descripcion: 'Taller de escritura de crónica con Rafael Cuevas. 18 participantes.', descripcionLarga: 'Evento ya realizado. 18 participantes de cinco ciudades asistieron a este taller sobre crónica urbana.', color: '#3AABDC', gradiente: 'linear-gradient(135deg, rgba(58,171,220,0.15), rgba(58,171,220,0.05))' },
  { id: 5, tipo: 'Lectura', estado: 'Pasado', titulo: 'Noche de poesía: Cuerpos y territorios', fecha: '14 Feb 2026', hora: '20:00 hrs', lugar: 'Bar La Modernidad', direccion: 'Av. Reforma 156', descripcion: 'Lectura de poesía con música en vivo. Asistieron 45 personas.', descripcionLarga: 'Evento ya realizado. Una velada de poesía con música en vivo que convocó a 45 personas.', color: '#9B2D8E', gradiente: 'linear-gradient(135deg, rgba(155,45,142,0.15), rgba(155,45,142,0.05))' },
]

export default function EventoDetalle() {
  const { id } = useParams()
  const ev = todosLosEventos.find(e => e.id === parseInt(id))

  if (!ev) return (
    <main style={{ paddingTop: 0, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: 'rgba(26,18,8,0.4)', fontStyle: 'italic' }}>Evento no encontrado.</p>
        <Link to="/eventos" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#9B2D8E', display: 'inline-block', marginTop: 20 }}>← Volver a eventos</Link>
      </div>
    </main>
  )

  return (
    <main>
      {/* HERO DEL EVENTO */}
      <section style={{
        background: ev.gradiente,
        borderBottom: `3px solid ${ev.color}33`,
        padding: '80px 40px 60px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link to="/eventos" style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11, letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'rgba(26,18,8,0.45)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 36,
            transition: 'color 0.2s',
          }}
            onMouseOver={e => e.target.style.color = ev.color}
            onMouseOut={e => e.target.style.color = 'rgba(26,18,8,0.45)'}
          >← Volver a eventos</Link>

          <AnimatedSection direction="up">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: '#fff',
                    background: ev.color, padding: '5px 14px',
                  }}>{ev.tipo}</span>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 11, color: 'rgba(26,18,8,0.55)', letterSpacing: 1,
                    textTransform: 'uppercase',
                    background: ev.estado === 'Pasado' ? 'rgba(26,18,8,0.08)' : 'rgba(26,18,8,0.06)',
                    padding: '4px 12px',
                  }}>{ev.estado}</span>
                </div>

                <h1 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(40px, 6vw, 80px)',
                  letterSpacing: 3, color: '#1a1208',
                  lineHeight: 0.95, marginBottom: 24,
                }}>{ev.titulo}</h1>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* IMAGEN PLACEHOLDER + CONTENIDO */}
      <section style={{ background: '#faf6ee', padding: '60px 40px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60 }}>

          <AnimatedSection direction="right">
            {/* Imagen placeholder */}
            <div style={{
              width: '100%', aspectRatio: '16/9',
              background: ev.gradiente,
              border: `2px solid ${ev.color}33`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: 32,
            }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, color: ev.color, opacity: 0.2 }}>{ev.tipo[0]}</span>
            </div>

            {/* Info básica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { label: 'Fecha', valor: ev.fecha },
                { label: 'Horario', valor: ev.hora },
                { label: 'Lugar', valor: ev.lugar },
                { label: 'Dirección', valor: ev.direccion },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', gap: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(26,18,8,0.07)',
                }}>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: ev.color,
                    minWidth: 80, paddingTop: 3,
                  }}>{item.label}</span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20, color: '#1a1208',
                    lineHeight: 1.4,
                  }}>{item.valor}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection direction="left" delay={0.1}>
            <div>
              <p style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10, letterSpacing: 3,
                textTransform: 'uppercase',
                color: ev.color, marginBottom: 20,
              }}>Sobre el evento</p>

              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22, lineHeight: 1.9,
                color: 'rgba(26,18,8,0.7)',
                whiteSpace: 'pre-line',
                marginBottom: 48,
              }}>
                {ev.descripcionLarga}
              </div>

              {ev.estado === 'Próximo' && (
                <Link to="/talleres" style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 12, letterSpacing: 3,
                  textTransform: 'uppercase',
                  background: ev.color, color: '#fff',
                  border: 'none', padding: '18px 36px',
                  display: 'inline-block',
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                  onMouseOver={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}
                  onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
                >
                  Inscribirme a este evento →
                </Link>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}