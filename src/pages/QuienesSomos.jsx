import AnimatedSection from '../components/AnimatedSection'

const miembros = [
  {
    nombre: 'Valeria Rincón',
    rol: 'Narrativa · Fundadora',
    bio: 'Escribe desde que tiene memoria y publica desde que se atrevió. Sus textos habitan el territorio entre la crónica y el cuento. Coordina los talleres del colectivo.',
    foto: null, // URL de imagen — se gestiona desde el admin panel
    inicial: 'V', color: '#9B2D8E',
    creado_por: 'admin@nadienoslee.com',
    creado_en: '15 Dic 2025 · 10:30',
  },
  {
    nombre: 'Marco Tello',
    rol: 'Poesía · Fundador',
    bio: 'Poeta de formación autodidacta. Cree que el verso libre no es ausencia de forma sino exceso de ella. Edita la sección de escritura de la semana.',
    foto: null,
    inicial: 'M', color: '#8B1A1A',
    creado_por: 'admin@nadienoslee.com',
    creado_en: '15 Dic 2025 · 10:32',
  },
  {
    nombre: 'Daniela Ortiz',
    rol: 'Ensayo · Miembro',
    bio: 'Ensayista y lectora voraz. Sus textos piensan en voz alta sobre literatura, cuerpo y política. Gestiona las convocatorias y el archivo.',
    foto: null,
    inicial: 'D', color: '#3AABDC',
    creado_por: 'admin@nadienoslee.com',
    creado_en: '20 Dic 2025 · 09:15',
  },
  {
    nombre: 'Rafael Cuevas',
    rol: 'Crónica · Miembro',
    bio: 'Cronista de lo cotidiano. Encuentra literatura en los lugares donde nadie está mirando. Cubre los eventos y redacta las noticias del colectivo.',
    foto: null,
    inicial: 'R', color: '#9B2D8E',
    creado_por: 'marco@nadienoslee.com',
    creado_en: '3 Ene 2026 · 14:45',
  },
]

export default function QuienesSomos() {
  return (
    <main>

      <section style={{
        background: '#f5ede0',
        padding: '100px 40px 80px',
        borderBottom: '1px solid rgba(58,171,220,0.12)',
        position: 'relative', overflow: 'hidden',
      }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {miembros.map((m, i) => (
              <AnimatedSection key={i} direction="up" delay={i * 0.12}>
                <div style={{
                  background: '#fff',
                  border: '1px solid rgba(26,18,8,0.08)',
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.09)'; e.currentTarget.style.borderColor = m.color + '44' }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(26,18,8,0.08)' }}
                >
                  {/* Foto o placeholder */}
                  <div style={{
                    width: '100%', height: 220,
                    background: m.foto ? 'transparent' : `linear-gradient(135deg, ${m.color}20 0%, ${m.color}08 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {m.foto ? (
                      <img src={m.foto} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color: m.color, opacity: 0.15, lineHeight: 1, userSelect: 'none' }}>{m.inicial}</span>
                        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 56, height: 56, borderRadius: '50%', background: m.color + '20', border: `2px solid ${m.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: m.color }}>{m.inicial}</span>
                        </div>
                      </>
                    )}
                    {/* Color bar top */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: m.color }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: '28px 28px 24px' }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#1a1208', marginBottom: 6 }}>{m.nombre}</h2>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: m.color, marginBottom: 16 }}>{m.rol}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, lineHeight: 1.8, color: 'rgba(26,18,8,0.65)', marginBottom: 20 }}>{m.bio}</p>

                    {/* Audit trail */}
                    <div style={{ borderTop: '1px solid rgba(26,18,8,0.06)', paddingTop: 12, marginTop: 8 }}>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.35)', letterSpacing: 1, lineHeight: 1.6 }}>
                        Publicado por {m.creado_por}<br />{m.creado_en}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}