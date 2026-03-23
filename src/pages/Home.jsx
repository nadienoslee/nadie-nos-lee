import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import iconRosa from '../assets/ICONROSA.png'
import iconRojo from '../assets/ICONROJO.png'

const frases = [
  'Escribimos porque el silencio también tiene gramática.',
  'Nadie nos lee. Y en ese nadie cabe todo el mundo.',
  'La página en blanco no tiene miedo — el miedo lo traemos nosotros.',
  'Escribir es habitar un lugar que no existe hasta que lo nombramos.',
  'Somos el colectivo que escribe aunque el mundo esté mirando hacia otro lado.',
  'Cada texto es una puerta. No sabemos si alguien la abrirá.',
]

const escrituraDestacada = {
  titulo: 'El peso del martes',
  autor: 'Valeria Rincón',
  genero: 'Narrativa',
  fragmento: 'Los martes tienen un peso específico que los otros días no conocen. No es tristeza exactamente — es más como el eco de algo que estuvo a punto de suceder y decidió no hacerlo...',
  fecha: 'Marzo 2026',
}

// CARRUSEL — estas imágenes vendrán del admin/Supabase
const banners = [
  { id: 1, titulo: 'Lectura en voz alta', subtitulo: 'Voces del margen · 28 Mar 2026 · Casa de la Cultura', link: '/eventos/1', color: '#9B2D8E', gradiente: 'linear-gradient(135deg, #9B2D8E 0%, #6b1f63 100%)' },
  { id: 2, titulo: 'Poesía Protesta', subtitulo: 'No sentir rabia es un privilegio · Sábado 5 Abr · Biblioteca Central', link: '/eventos/2', color: '#8B1A1A', gradiente: 'linear-gradient(135deg, #8B1A1A 0%, #5a1010 100%)' },
  { id: 3, titulo: 'Nueva Convocatoria Abierta', subtitulo: 'Escrituras sobre el cuerpo · Cierre 15 Abril 2026', link: '/convocatorias', color: '#3AABDC', gradiente: 'linear-gradient(135deg, #3AABDC 0%, #1a7fa8 100%)' },
]

const eventosProximos = [
  { id: 1, tipo: 'Lectura', titulo: 'Lectura en voz alta: Voces del margen', fecha: '28', mes: 'Mar', lugar: 'Casa de la Cultura', color: '#9B2D8E' },
  { id: 2, tipo: 'Taller', titulo: 'Taller de microficción', fecha: '5', mes: 'Abr', lugar: 'Biblioteca Central', color: '#3AABDC' },
  { id: 3, tipo: 'Presentación', titulo: 'Antología "Escrituras del Norte"', fecha: '18', mes: 'Abr', lugar: 'Librería El Péndulo Norte', color: '#8B1A1A' },
]

export default function Home() {
  const [fraseIdx, setFraseIdx] = useState(0)
  const [fraseVisible, setFraseVisible] = useState(true)
  const [slide, setSlide] = useState(0)
  const [pausado, setPausado] = useState(false)
  const intervalRef = useRef(null)

  // Frase aleatoria
  useEffect(() => {
    setFraseIdx(Math.floor(Math.random() * frases.length))
    const interval = setInterval(() => {
      setFraseVisible(false)
      setTimeout(() => { setFraseIdx(i => (i + 1) % frases.length); setFraseVisible(true) }, 600)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Carrusel automático
  useEffect(() => {
    if (!pausado) {
      intervalRef.current = setInterval(() => {
        setSlide(s => (s + 1) % banners.length)
      }, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [pausado, slide])

  const prevSlide = () => { setSlide(s => (s - 1 + banners.length) % banners.length) }
  const nextSlide = () => { setSlide(s => (s + 1) % banners.length) }

  const banner = banners[slide]

  return (
    <main>

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        background: '#f5ede0',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: '80px 32px 100px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(155,45,142,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(139,26,26,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* ICONOS */}
        <div style={{
          display: 'flex', gap: 20, marginBottom: 40,
          justifyContent: 'center', alignItems: 'center',
          animation: 'fadeInDown 1s ease forwards',
        }}>
          <img src={iconRosa} alt="" style={{ width: 64, height: 'auto', objectFit: 'contain' }} />
          <img src={iconRojo} alt="" style={{ width: 64, height: 'auto', objectFit: 'contain' }} />
        </div>

        {/* TÍTULO */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(72px, 14vw, 160px)',
          letterSpacing: 6, lineHeight: 0.92,
          color: '#1a1208', marginBottom: 28,
          animation: 'fadeInUp 1s ease 0.2s both',
        }}>
          NADIE<br />
          <span style={{ color: '#3AABDC' }}>NOS</span><br />
          LEE
        </h1>

        <p style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 14, letterSpacing: 5,
          textTransform: 'uppercase',
          color: 'rgba(26,18,8,0.45)', marginBottom: 48,
          animation: 'fadeInUp 1s ease 0.4s both',
        }}>
          Colectivo de Escritura Independiente
        </p>

        {/* FRASE ALEATORIA */}
        <div style={{
          maxWidth: 680, marginBottom: 56,
          minHeight: 88,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeInUp 1s ease 0.6s both',
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(20px, 2.8vw, 28px)',
            fontStyle: 'italic', lineHeight: 1.6,
            color: 'rgba(26,18,8,0.65)',
            opacity: fraseVisible ? 1 : 0,
            transform: fraseVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            "{frases[fraseIdx]}"
          </p>
        </div>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 16,
          flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 1s ease 0.8s both',
          position: 'relative', zIndex: 2, marginBottom: 80,
        }}>
          <Link to="/escritura" style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 13, letterSpacing: 3, textTransform: 'uppercase',
            background: '#9B2D8E', color: '#f5ede0',
            padding: '16px 36px', border: '2px solid #9B2D8E',
            transition: 'background 0.3s, transform 0.2s', display: 'inline-block',
          }}
            onMouseOver={e => { e.target.style.background = '#b535a8'; e.target.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.target.style.background = '#9B2D8E'; e.target.style.transform = 'translateY(0)' }}
          >
            Leer escritura de la semana
          </Link>
          <Link to="/manifiesto" style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 13, letterSpacing: 3, textTransform: 'uppercase',
            background: 'transparent', color: '#1a1208',
            padding: '16px 36px', border: '2px solid rgba(26,18,8,0.3)',
            transition: 'border-color 0.3s, transform 0.2s', display: 'inline-block',
          }}
            onMouseOver={e => { e.target.style.borderColor = '#1a1208'; e.target.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.target.style.borderColor = 'rgba(26,18,8,0.3)'; e.target.style.transform = 'translateY(0)' }}
          >
            Nuestro manifiesto
          </Link>
        </div>

        {/* SCROLL INDICATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)' }}>Desplazar</span>
          <div style={{ width: 1, height: 40, background: 'rgba(155,45,142,0.4)', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ═══════════════════════════════════
          ESCRITURA DE LA SEMANA
      ═══════════════════════════════════ */}
      <section style={{ background: '#faf6ee', padding: '100px 40px', borderTop: '1px solid rgba(155,45,142,0.12)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimatedSection direction="right">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', borderBottom: '1px solid #8B1A1A', paddingBottom: 4, display: 'inline-block', marginBottom: 48 }}>Editorial</p>
          </AnimatedSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            <AnimatedSection direction="right" delay={0.1}>
              <div>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 12 }}>Escritura de la semana</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, lineHeight: 1.05, color: '#1a1208', marginBottom: 10 }}>{escrituraDestacada.titulo}</h2>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: 'rgba(26,18,8,0.6)', letterSpacing: 2, marginBottom: 32 }}>
                  {escrituraDestacada.autor} · {escrituraDestacada.genero} · {escrituraDestacada.fecha}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', lineHeight: 1.8, color: 'rgba(26,18,8,0.65)', marginBottom: 40, borderLeft: '3px solid #9B2D8E', paddingLeft: 24 }}>
                  {escrituraDestacada.fragmento}
                </p>
                <Link to="/escritura" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#9B2D8E', borderBottom: '1px solid #9B2D8E', paddingBottom: 2, display: 'inline-block' }}>
                  Leer texto completo →
                </Link>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="left" delay={0.2}>
              <div style={{ background: 'rgba(155,45,142,0.04)', border: '1px solid rgba(155,45,142,0.15)', padding: '48px 40px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 20, right: 24, fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, color: 'rgba(26,18,8,0.3)', textTransform: 'uppercase' }}>Nº 12 / 2026</span>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 96, fontWeight: 300, color: 'rgba(155,45,142,0.12)', lineHeight: 1, marginBottom: 8 }}>"</div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic', lineHeight: 1.85, color: 'rgba(26,18,8,0.6)' }}>
                  {escrituraDestacada.fragmento}
                </p>
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(155,45,142,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#1a1208' }}>{escrituraDestacada.autor}</p>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: 'rgba(26,18,8,0.5)', textTransform: 'uppercase' }}>{escrituraDestacada.genero}</p>
                  </div>
                  <span style={{ width: 32, height: 1, background: 'rgba(155,45,142,0.4)', display: 'block' }} />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          PRÓXIMOS EVENTOS (estilo img 8)
      ═══════════════════════════════════ */}
      <section style={{ background: '#f5ede0', padding: '100px 40px', borderTop: '1px solid rgba(58,171,220,0.12)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimatedSection direction="right">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 8 }}>Comunidad</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 300, color: '#1a1208' }}>Próximos eventos</h2>
              </div>
              <Link to="/eventos" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', borderBottom: '1px solid rgba(26,18,8,0.2)', paddingBottom: 2 }}>Ver todos →</Link>
            </div>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {eventosProximos.map((ev, i) => (
              <AnimatedSection key={ev.id} direction="up" delay={i * 0.1}>
                <Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    background: '#fff',
                    border: `2px solid ${ev.color}22`,
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.1)'; e.currentTarget.style.borderColor = ev.color + '66' }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = ev.color + '22' }}
                  >
                    {/* Imagen del evento (placeholder con gradiente) */}
                    <div style={{
                      height: 180,
                      background: `linear-gradient(135deg, ${ev.color}33 0%, ${ev.color}10 100%)`,
                      display: 'flex', alignItems: 'flex-end',
                      padding: '16px 20px',
                      position: 'relative',
                    }}>
                      {/* Badge de fecha */}
                      <div style={{
                        position: 'absolute', top: 16, left: 16,
                        background: ev.color,
                        padding: '8px 14px',
                        textAlign: 'center', minWidth: 64,
                      }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', lineHeight: 1 }}>{ev.fecha}</div>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>{ev.mes}</div>
                      </div>

                      {/* Tag tipo */}
                      <span style={{
                        position: 'absolute', top: 16, right: 16,
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                        color: ev.color, background: '#fff',
                        padding: '4px 10px',
                      }}>{ev.tipo}</span>

                      {/* Ícono grande decorativo */}
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color: ev.color, opacity: 0.08, lineHeight: 1, userSelect: 'none', position: 'absolute', bottom: -10, right: 12 }}>
                        {ev.tipo === 'Lectura' ? 'L' : ev.tipo === 'Taller' ? 'T' : 'P'}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '24px 24px 28px' }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 500, color: '#1a1208', lineHeight: 1.25, marginBottom: 10 }}>{ev.titulo}</h3>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: 'rgba(26,18,8,0.55)', letterSpacing: 1, marginBottom: 20 }}>{ev.lugar}</p>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: ev.color, borderBottom: `1px solid ${ev.color}` }}>
                        Ver evento →
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CARRUSEL — LO ÚLTIMO DEL COLECTIVO
      ═══════════════════════════════════ */}
      <section style={{
        background: '#1a1208',
        padding: '100px 40px',
        borderTop: '1px solid rgba(155,45,142,0.2)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 8 }}>Noticias</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#f5ede0' }}>Lo último del colectivo</h2>
              <Link to="/noticias" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,237,224,0.4)', borderBottom: '1px solid rgba(245,237,224,0.2)', paddingBottom: 2 }}>Ver todas →</Link>
            </div>
          </AnimatedSection>

          {/* CARRUSEL */}
          <div
            style={{ position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            {/* Slides */}
            <div style={{
              display: 'flex',
              transform: `translateX(-${slide * 100}%)`,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {banners.map((b, i) => (
                <Link key={b.id} to={b.link} style={{
                  minWidth: '100%', textDecoration: 'none',
                  display: 'block',
                }}>
                  <div style={{
                    height: 'clamp(240px, 40vw, 400px)',
                    background: b.gradiente,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '48px 60px',
                    position: 'relative', overflow: 'hidden',
                    cursor: 'pointer',
                  }}>
                    {/* Texto decorativo de fondo */}
                    <div style={{
                      position: 'absolute', right: -20, top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(80px, 20vw, 220px)',
                      color: 'rgba(255,255,255,0.06)',
                      lineHeight: 1, userSelect: 'none',
                      letterSpacing: 4, whiteSpace: 'nowrap',
                    }}>NADIE NOS LEE</div>

                    <p style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 11, letterSpacing: 3,
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: 16,
                    }}>Nadie Nos Lee — Colectivo</p>
                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(40px, 7vw, 80px)',
                      letterSpacing: 4, color: '#fff',
                      lineHeight: 0.95, marginBottom: 20,
                    }}>{b.titulo}</h3>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20, fontStyle: 'italic',
                      color: 'rgba(255,255,255,0.75)',
                      maxWidth: 560,
                    }}>{b.subtitulo}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Controles prev/next */}
            <button onClick={prevSlide} style={{
              position: 'absolute', left: 20, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff',
              width: 48, height: 48,
              cursor: 'pointer', fontSize: 20,
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >‹</button>
            <button onClick={nextSlide} style={{
              position: 'absolute', right: 20, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff',
              width: 48, height: 48,
              cursor: 'pointer', fontSize: 20,
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >›</button>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? 28 : 10,
                  height: 10, borderRadius: 5,
                  background: i === slide ? '#9B2D8E' : 'rgba(245,237,224,0.25)',
                  border: 'none', cursor: 'pointer',
                  transition: 'width 0.3s ease, background 0.3s ease',
                  padding: 0,
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          MANIFIESTO PREVIEW
      ═══════════════════════════════════ */}
      <section style={{ background: '#9B2D8E', padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(245,237,224,0.6)', marginBottom: 28 }}>Identidad</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.5, color: '#f5ede0', marginBottom: 44 }}>
              "Somos un colectivo que escribe desde los márgenes,<br />
              para los márgenes, y a veces contra los márgenes."
            </h2>
            <Link to="/manifiesto" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#f5ede0', border: '2px solid rgba(245,237,224,0.5)', padding: '14px 32px', display: 'inline-block', transition: 'background 0.3s' }}
              onMouseOver={e => e.target.style.background = 'rgba(245,237,224,0.1)'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              Leer el manifiesto completo
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ANIMACIONES */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scrollLine { 0%, 100% { transform: scaleY(1); opacity: 1; } 50% { transform: scaleY(0.6); opacity: 0.4; } }
        @media (max-width: 768px) { section { padding-left: 20px !important; padding-right: 20px !important; } }
      `}</style>
    </main>
  )
}