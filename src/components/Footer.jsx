import { Link } from 'react-router-dom'
import logoFooter from '../assets/NADIENOSLEEV2BL.png'

export default function Footer() {
  return (
    <footer style={{
      background: '#14110e',
      borderTop: '3px solid #9B2D8E',
      padding: '72px 40px 36px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 56, marginBottom: 64,
        }}>

          {/* LOGO */}
          <div>
            <img src={logoFooter} alt="Nadie Nos Lee"
              style={{ height: 60, width: 'auto', objectFit: 'contain', marginBottom: 20 }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18, color: 'rgba(245,237,224,0.55)',
              lineHeight: 1.8, fontStyle: 'italic',
            }}>
              Colectivo de escritura independiente.<br />
              Escribimos aunque nadie nos lea.
            </p>
          </div>

          {/* IDENTIDAD */}
          <div>
            <h4 style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#9B2D8E', marginBottom: 20,
            }}>Identidad</h4>
            {[
              ['Manifiesto', '/manifiesto'],
              ['Quiénes somos', '/quienes-somos'],
            ].map(([l, to]) => (
              <Link key={to} to={to} style={{
                display: 'block', marginBottom: 14,
                fontFamily: "'Courier Prime', monospace",
                fontSize: 13, color: 'rgba(245,237,224,0.55)',
                letterSpacing: 1, transition: 'color 0.2s',
              }}
                onMouseOver={e => e.target.style.color = '#f5ede0'}
                onMouseOut={e => e.target.style.color = 'rgba(245,237,224,0.55)'}
              >{l}</Link>
            ))}
{/* EASTER EGG — invisible bajo el texto */}
<Link to="/pagina-que-no-existe-404"
  style={{
    display: 'block',
    marginTop: 2,
    fontFamily: "'Courier Prime', monospace",
    fontSize: 13, letterSpacing: 1,
    color: 'rgba(245,237,224,0.0)',
    cursor: 'default',
    userSelect: 'none',
    transition: 'color 0.4s',
    lineHeight: 1.4,
  }}
  onMouseOver={e => {
    e.target.style.color = 'rgba(155,45,142,0.18)'
    e.target.style.cursor = 'pointer'
  }}
  onMouseOut={e => {
    e.target.style.color = 'rgba(245,237,224,0.0)'
    e.target.style.cursor = 'default'
  }}
>Me Encontraste</Link>
          </div>

          {/* EDITORIAL */}
          <div>
            <h4 style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, letterSpacing: 3,
              textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 20,
            }}>Editorial</h4>
            {[
              ['Escritura de la semana', '/escritura'],
              ['Notas', '/notas'],
              ['Lecturas recomendadas', '/lecturas'],
              ['Convocatorias', '/convocatorias'],
              ['Archivo', '/archivo'],
            ].map(([l, to]) => (
              <Link key={to} to={to} style={{
                display: 'block', marginBottom: 14,
                fontFamily: "'Courier Prime', monospace",
                fontSize: 13, color: 'rgba(245,237,224,0.55)',
                letterSpacing: 1, transition: 'color 0.2s',
              }}
                onMouseOver={e => e.target.style.color = '#f5ede0'}
                onMouseOut={e => e.target.style.color = 'rgba(245,237,224,0.55)'}
              >{l}</Link>
            ))}
          </div>

          {/* COMUNIDAD */}
          <div>
            <h4 style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, letterSpacing: 3,
              textTransform: 'uppercase', color: '#3AABDC', marginBottom: 20,
            }}>Comunidad</h4>
            {[
              ['Eventos', '/eventos'],
              ['Calendario', '/calendario'],
              ['Talleres', '/talleres'],
              ['Noticias', '/noticias'],
            ].map(([l, to]) => (
              <Link key={to} to={to} style={{
                display: 'block', marginBottom: 14,
                fontFamily: "'Courier Prime', monospace",
                fontSize: 13, color: 'rgba(245,237,224,0.55)',
                letterSpacing: 1, transition: 'color 0.2s',
              }}
                onMouseOver={e => e.target.style.color = '#f5ede0'}
                onMouseOut={e => e.target.style.color = 'rgba(245,237,224,0.55)'}
              >{l}</Link>
            ))}
          </div>
        </div>

        {/* BARRA INFERIOR */}
        <div style={{
          borderTop: '1px solid rgba(155,45,142,0.2)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 12, color: 'rgba(245,237,224,0.3)', letterSpacing: 1,
          }}>
            © {new Date().getFullYear()} Nadie Nos Lee — Todos los derechos reservados
          </p>
          <Link to="/admin/login" style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11, color: 'rgba(245,237,224,0.18)',
            letterSpacing: 2, textTransform: 'uppercase', transition: 'color 0.2s',
          }}
            onMouseOver={e => e.target.style.color = 'rgba(245,237,224,0.5)'}
            onMouseOut={e => e.target.style.color = 'rgba(245,237,224,0.18)'}
          >
            Acceso miembros
          </Link>
        </div>
      </div>
    </footer>
  )
}