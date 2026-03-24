import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoDesktop from '../assets/NADIENOSLEEV2NG.png'
import logoMobile from '../assets/ICONSPAREJA.png'

const links = [
  { label: 'Manifiesto', to: '/manifiesto' },
  { label: 'Quiénes somos', to: '/quienes-somos' },
  {
    label: 'Editorial', to: '/escritura',
    sub: [
      { label: 'Escritura de la semana', to: '/escritura' },
      { label: 'Notas', to: '/notas' },
      { label: 'Lecturas recomendadas', to: '/lecturas' },
      { label: 'Convocatorias', to: '/convocatorias' },
      { label: 'Archivo', to: '/archivo' },
    ]
  },
  {
    label: 'Comunidad', to: '/eventos',
    sub: [
      { label: 'Eventos', to: '/eventos' },
      { label: 'Calendario', to: '/calendario' },
      { label: 'Talleres', to: '/talleres' },
      { label: 'Noticias', to: '/noticias' },
    ]
  },
]

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [dropdown, setDropdown] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960)
  const dropdownTimeout = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 960)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { setMenuAbierto(false); setDropdown(null) }, [location])

  const abrirDropdown = (to) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setDropdown(to)
  }

  const cerrarDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setDropdown(null), 180)
  }

  const mantenerDropdown = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
  }

  return (
    <nav style={{
      position: 'relative',
      zIndex: 100,
      background: '#faf6ee',
      borderBottom: '2px solid rgba(155,45,142,0.18)',
      boxShadow: '0 2px 16px rgba(26,18,8,0.06)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 40px',
        height: isMobile ? 72 : 88,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* LOGO */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          {isMobile ? (
            <img src={logoMobile} alt="Nadie Nos Lee" style={{ height: 46, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <img src={logoDesktop} alt="Nadie Nos Lee" style={{ height: 62, width: 'auto', objectFit: 'contain' }} />
          )}
        </Link>

        {/* LINKS DESKTOP */}
        {!isMobile && (
          <ul style={{ display: 'flex', gap: 44, listStyle: 'none', alignItems: 'center' }}>
            {links.map((link) => (
              <li key={link.to} style={{ position: 'relative' }}
                onMouseEnter={() => link.sub && abrirDropdown(link.to)}
                onMouseLeave={() => link.sub && cerrarDropdown()}
              >
                <Link to={link.to} style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 13, letterSpacing: 2,
                  textTransform: 'uppercase', fontWeight: '700',
                  color: location.pathname.startsWith(link.to) && link.to !== '/' ? '#9B2D8E' : '#1a1208',
                  borderBottom: location.pathname.startsWith(link.to) && link.to !== '/' ? '2px solid #9B2D8E' : '2px solid transparent',
                  paddingBottom: 3, transition: 'color 0.2s, border-color 0.2s', display: 'block',
                }}
                  onMouseOver={e => { e.target.style.color = '#9B2D8E' }}
                  onMouseOut={e => { e.target.style.color = location.pathname.startsWith(link.to) && link.to !== '/' ? '#9B2D8E' : '#1a1208' }}
                >
                  {link.label}
                </Link>

                {link.sub && dropdown === link.to && (
                  <ul style={{
                    position: 'absolute', top: '100%', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#faf6ee',
                    border: '1px solid rgba(155,45,142,0.2)',
                    borderTop: '3px solid #9B2D8E',
                    listStyle: 'none', minWidth: 270,
                    padding: '8px 0', marginTop: 0,
                    boxShadow: '0 16px 48px rgba(26,18,8,0.1)',
                    zIndex: 200,
                  }}
                    onMouseEnter={mantenerDropdown}
                    onMouseLeave={cerrarDropdown}
                  >
                    {link.sub.map(s => (
                      <li key={s.to}>
                        <Link to={s.to} style={{
                          display: 'block', padding: '14px 28px',
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 12, letterSpacing: 1,
                          textTransform: 'uppercase', fontWeight: '600',
                          color: '#1a1208', transition: 'background 0.2s, color 0.2s',
                        }}
                          onMouseOver={e => { e.target.style.background = 'rgba(155,45,142,0.08)'; e.target.style.color = '#9B2D8E' }}
                          onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1a1208' }}
                        >
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* HAMBURGER */}
        {isMobile && (
          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{
            background: 'none', border: 'none',
            color: '#1a1208', fontSize: 30,
            cursor: 'pointer', padding: 4, lineHeight: 1,
          }}>
            {menuAbierto ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* MENÚ MOBILE */}
      {isMobile && menuAbierto && (
        <div style={{
          background: '#faf6ee',
          borderTop: '1px solid rgba(155,45,142,0.12)',
          maxHeight: '85vh', overflowY: 'auto',
        }}>
          {links.map(link => (
            <div key={link.to}>
              <Link to={link.to} style={{
                display: 'block', padding: '18px 32px',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 15, letterSpacing: 2,
                textTransform: 'uppercase', fontWeight: '700',
                color: '#1a1208',
                borderBottom: '1px solid rgba(155,45,142,0.1)',
              }}>{link.label}</Link>
              {link.sub && link.sub.map(s => (
                <Link key={s.to} to={s.to} style={{
                  display: 'block', padding: '14px 56px',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 13, letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: 'rgba(26,18,8,0.6)',
                  borderBottom: '1px solid rgba(155,45,142,0.06)',
                  background: 'rgba(155,45,142,0.03)',
                }}>→ {s.label}</Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}