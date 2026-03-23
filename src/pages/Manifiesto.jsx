import AnimatedSection from '../components/AnimatedSection'

export default function Manifiesto() {
  return (
    <main style={{ paddingTop: 84 }}>

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
              Lo que somos, lo que defendemos, lo que escribimos.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {[
            {
              num: '01',
              titulo: 'Escribimos porque sí',
              texto: 'No necesitamos justificar la escritura. No escribimos para ser publicados, ni para ser aplaudidos, ni para dejar huella. Escribimos porque el lenguaje es la única forma que tenemos de habitar el mundo con algo parecido a la precisión. Escribimos porque el silencio también tiene gramática, y preferimos la nuestra.',
            },
            {
              num: '02',
              titulo: 'Nadie nos lee — y eso nos libera',
              texto: 'El nombre no es una queja. Es una declaración. Cuando escribes sin la presión de la audiencia, cuando el texto no tiene que complacer a nadie, ocurre algo extraño y maravilloso: aparece la verdad. Nadie nos lee es el espacio donde la escritura puede ser exactamente lo que necesita ser.',
            },
            {
              num: '03',
              titulo: 'Todos los géneros, todas las voces',
              texto: 'No jerarquizamos. Un poema de tres líneas tiene el mismo valor que una novela de trescientas páginas si ambos son honestos. La crónica, el ensayo, la microficción, el fragmento sin forma: todo cabe aquí. Lo único que no tiene lugar es la escritura que miente sobre lo que quiere ser.',
            },
            {
              num: '04',
              titulo: 'Somos un colectivo, no una institución',
              texto: 'No tenemos consejo editorial, ni criterio de selección cerrado, ni jerarquías fijas. Somos personas que escriben y que leen lo que otros escriben, con cuidado y sin condescendencia. La comunidad es el proyecto. El texto es la excusa.',
            },
            {
              num: '05',
              titulo: 'Escribimos desde los márgenes',
              texto: 'Desde las ciudades que no aparecen en los suplementos literarios. Desde los géneros que el mercado editorial ignora. Desde las voces que no tienen agente ni editorial ni plataforma. Los márgenes son el lugar donde la literatura todavía tiene algo que decir.',
            },
          ].map((bloque, i) => (
            <AnimatedSection key={i} direction="right" delay={i * 0.1}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr',
                gap: 36,
                marginBottom: 72,
                paddingBottom: 72,
                borderBottom: i < 4 ? '1px solid rgba(26,18,8,0.08)' : 'none',
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
                <span style={{ color: '#9B2D8E', fontSize: 22 }}>✕</span>
                <p style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 12, letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: 'rgba(26,18,8,0.4)',
                }}>Nadie Nos Lee — Colectivo de Escritura</p>
                <span style={{ color: '#8B1A1A', fontSize: 22 }}>✕</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}