import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const textos404 = [
  'Esta página no existe. Igual que todos los libros que aún no hemos escrito. Pero tú seguiste buscando, y eso ya dice algo.',
  'El mapa termina aquí. Lo que está más allá todavía no tiene nombre — pero alguien lo nombrará.',
  'Llegaste a un lugar que no existe en el índice. Los mejores lugares nunca están en el índice.',
  'Error 404: texto no encontrado. Quizás nunca fue escrito. Quizás ese es tu trabajo ahora.',
]

export default function NotFound() {
  const [texto, setTexto] = useState('')

  useEffect(() => {
    setTexto(textos404[Math.floor(Math.random() * textos404.length)])
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f5ede0',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px',
      paddingTop: 84,
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(120px, 22vw, 280px)',
        color: 'rgba(155,45,142,0.1)',
        lineHeight: 1, letterSpacing: 8,
        userSelect: 'none',
      }}>404</div>

      <div style={{ maxWidth: 620, marginTop: -32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 36 }}>
          <span style={{ color: '#9B2D8E', fontSize: 24 }}>✕</span>
          <span style={{ color: '#8B1A1A', fontSize: 24 }}>✕</span>
        </div>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(22px, 3vw, 30px)',
          fontStyle: 'italic', lineHeight: 1.7,
          color: 'rgba(26,18,8,0.65)', marginBottom: 48,
        }}>"{texto}"</p>

        <p style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(26,18,8,0.25)', marginBottom: 44,
        }}>— Nadie Nos Lee</p>

        <Link to="/" style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 12, letterSpacing: 3,
          textTransform: 'uppercase', color: '#1a1208',
          border: '2px solid rgba(155,45,142,0.35)',
          padding: '16px 36px', display: 'inline-block',
          transition: 'border-color 0.3s, background 0.3s',
        }}
          onMouseOver={e => { e.target.style.borderColor = '#9B2D8E'; e.target.style.background = 'rgba(155,45,142,0.05)' }}
          onMouseOut={e => { e.target.style.borderColor = 'rgba(155,45,142,0.35)'; e.target.style.background = 'transparent' }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  )
}