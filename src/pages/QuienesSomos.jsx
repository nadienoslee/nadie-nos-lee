import { useState, useEffect, useRef } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'
function MiembroSlide({ m, color, inicial, i, activo, abierto, isMobile, onSelect, onToggleOpen }) {
  const [visualAbierto, setVisualAbierto] = useState(false)
  const openTimerRef = useRef(null)

  useEffect(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (activo && abierto) {
      openTimerRef.current = setTimeout(() => {
        setVisualAbierto(true)
      }, 90)
    } else {
      setVisualAbierto(false)
    }
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
    }
  }, [activo, abierto])

  const handleClick = (e) => {
    if (!activo) return
    e.stopPropagation()
    onToggleOpen()
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%',
        height: isMobile ? (abierto ? 660 : 520) : 560,
        background: isMobile && abierto ? '#fff' : '#111',
        border: `1px solid ${activo ? color + '55' : 'rgba(26,18,8,0.08)'}`,
        borderTop: `4px solid ${color}`,
        overflow: 'hidden',
        boxShadow: activo
          ? `0 28px 64px rgba(26,18,8,0.22), 0 0 0 1px ${color}16`
          : '0 12px 32px rgba(26,18,8,0.09)',
        cursor: 'pointer',
        transition: 'height 0.72s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.72s cubic-bezier(0.22, 1, 0.36, 1), transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), filter 0.72s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: activo ? 'translateY(-6px)' : 'translateY(0)',
        filter: activo ? 'none' : 'saturate(0.86) opacity(0.88)',
        position: 'relative',
        display: visualAbierto ? (isMobile ? 'block' : 'flex') : 'block',
        flexDirection: 'row',
        borderRadius: isMobile ? 0 : 24,
      }}
    >
      {/* FOTO — cubre toda la card cuando está cerrada, columna izquierda cuando está abierta */}
      <div
        style={{
          position: visualAbierto ? 'relative' : 'absolute',
          inset: visualAbierto ? 'auto' : 0,
          width: visualAbierto ? (isMobile ? '100%' : '38%') : '100%',
          minWidth: visualAbierto ? (isMobile ? '100%' : '38%') : '100%',
          height: visualAbierto ? (isMobile ? 200 : '100%') : '100%',
          background: m.foto_url ? '#efe7dc' : `linear-gradient(180deg, ${color}22 0%, ${color}08 100%)`,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.78s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.78s cubic-bezier(0.22, 1, 0.36, 1)',
          borderRadius: isMobile ? 0 : (visualAbierto ? '0' : '20px'),
        }}
      >
        {m.foto_url ? (
          <img
            src={m.foto_url}
            alt={m.nombre}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center center',
              display: 'block',
              transition: 'transform 0.78s cubic-bezier(0.22, 1, 0.36, 1), filter 0.78s cubic-bezier(0.22, 1, 0.36, 1)',
              transform: visualAbierto ? 'scale(1.03)' : (activo ? 'scale(1.04)' : 'scale(1.0)'),
              filter: visualAbierto ? 'contrast(1.03) saturate(1.03)' : 'brightness(0.88)',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 96 : 120, color, opacity: 0.12, lineHeight: 1, userSelect: 'none' }}>
              {inicial}
            </span>
          </div>
        )}

        {/* Gradiente oscuro en la parte inferior cuando está cerrada */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
background: visualAbierto
              ? 'none'
              : 'linear-gradient(180deg, rgba(8,4,2,0.0) 25%, rgba(8,4,2,0.28) 60%, rgba(8,4,2,0.72) 100%)',
            pointerEvents: 'none',
            transition: 'opacity 0.72s ease',
          }}
        />

        {/* Número en esquina superior derecha */}
        <span
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            color: '#fff',
            opacity: 0.3,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {String(i + 1).padStart(2, '0')}
        </span>

        {/* Separador de color entre foto y texto cuando está abierta (desktop) */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: visualAbierto ? -12 : -26,
              width: visualAbierto ? 22 : 30,
              height: '100%',
              pointerEvents: 'none',
              opacity: visualAbierto ? 0.95 : 0,
              transition: 'right 0.78s cubic-bezier(0.22, 1, 0.36, 1), width 0.78s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.42s ease',
              background: `linear-gradient(90deg, ${color}00 0%, ${color}18 32%, ${color}30 50%, ${color}18 68%, ${color}00 100%)`,
              filter: 'blur(0.5px)',
            }}
          />
        )}
      </div>

      {/* TEXTO — superpuesto al fondo cuando cerrada, columna derecha cuando abierta */}
      <div
        style={{
          position: visualAbierto ? 'relative' : 'absolute',
          bottom: visualAbierto ? 'auto' : 0,
          left: visualAbierto ? 'auto' : 0,
          right: visualAbierto ? 'auto' : 0,
          zIndex: 2,
          width: visualAbierto ? (isMobile ? '100%' : '62%') : '100%',
          minWidth: visualAbierto ? (isMobile ? '100%' : '62%') : '100%',
          height: visualAbierto ? (isMobile ? (abierto ? 380 : 240) : '100%') : 'auto',
          padding: visualAbierto
            ? (isMobile ? '20px 20px 18px' : '28px 30px 24px')
            : '24px 24px 22px',
          background: visualAbierto ? '#fff' : 'transparent',
          borderLeft: !isMobile && visualAbierto ? `1px solid ${color}18` : 'none',
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'width 0.78s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.78s cubic-bezier(0.22, 1, 0.36, 1), height 0.72s cubic-bezier(0.22, 1, 0.36, 1), background 0.72s cubic-bezier(0.22, 1, 0.36, 1), padding 0.72s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Destellos decorativos cuando está abierta */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: visualAbierto ? 1 : 0,
            transition: 'opacity 0.72s cubic-bezier(0.22, 1, 0.36, 1)',
            background: `
              linear-gradient(90deg, ${color}18 0%, ${color}08 3%, transparent 8%),
              linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.18) 16%, rgba(255,255,255,0) 34%)
            `,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: visualAbierto ? -10 : -22,
            width: visualAbierto ? 18 : 26,
            height: '100%',
            pointerEvents: 'none',
            opacity: visualAbierto ? 1 : 0,
            transition: 'left 0.72s cubic-bezier(0.22, 1, 0.36, 1), width 0.72s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.42s ease',
            background: `linear-gradient(90deg, ${color}28 0%, ${color}10 38%, ${color}05 70%, transparent 100%)`,
            filter: 'blur(0.6px)',
          }}
        />

        {/* Contenido */}
        <div style={{ width: '100%', maxWidth: '100%' }}>
          {m.rol && (
            <p
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 9,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: visualAbierto ? color : `${color}dd`,
                fontWeight: '700',
                marginBottom: 8,
                transition: 'color 0.42s ease',
              }}
            >
              {m.rol}
            </p>
          )}

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: isMobile ? 30 : (visualAbierto ? 44 : 36),
              fontWeight: 700,
              color: visualAbierto ? '#1a1208' : '#ffffff',
              lineHeight: 1.02,
              marginBottom: 10,
              letterSpacing: visualAbierto ? '0.2px' : '0.3px',
              textShadow: visualAbierto ? 'none' : '0 2px 14px rgba(0,0,0,0.5)',
              transition: 'font-size 0.72s cubic-bezier(0.22, 1, 0.36, 1), color 0.42s ease',
            }}
          >
            {m.nombre}
          </h2>

          <div
            style={{
              width: visualAbierto ? 52 : 32,
              height: 2,
              background: color,
              marginBottom: visualAbierto ? 18 : 12,
              borderRadius: 1,
              transition: 'width 0.72s cubic-bezier(0.22, 1, 0.36, 1), margin 0.72s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />

          {visualAbierto && (
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: isMobile ? 18 : 24,
                lineHeight: 1.82,
                color: 'rgba(26,18,8,0.7)',
                fontStyle: 'italic',
                marginBottom: 0,
                maxHeight: isMobile ? 220 : 360,
                overflow: 'hidden',
              }}
            >
              {m.bio}
            </p>
          )}

          <p
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: visualAbierto ? color : 'rgba(255,255,255,0.75)',
              marginTop: visualAbierto ? 14 : 8,
              fontWeight: '700',
              opacity: activo ? 0.9 : 0.5,
              textShadow: visualAbierto ? 'none' : '0 1px 6px rgba(0,0,0,0.4)',
              transition: 'color 0.42s ease, opacity 0.42s ease',
            }}
          >
            {!activo ? 'Seleccionar' : abierto ? 'Cerrar ↑' : 'Leer más ↓'}
          </p>
        </div>
      </div>
    </div>
  )
}

function MiembrosCarousel({ miembros, isMobileGrid, abiertoId, setAbiertoId }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartRef = useRef(0)
  const touchDeltaRef = useRef(0)
  const openTimerRef = useRef(null)
  const resumeTimerRef = useRef(null)

  useEffect(() => {
    if (!miembros.length || paused || abiertoId) return
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % miembros.length)
    }, isMobileGrid ? 5200 : 4600)
    return () => clearInterval(timer)
  }, [miembros.length, paused, abiertoId, isMobileGrid])

  useEffect(() => {
    if (!miembros.length) return
    if (idx > miembros.length - 1) setIdx(0)
  }, [idx, miembros.length])

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [])

  const abrirCard = (targetIdx, miembroId) => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    setPaused(true)
    if (idx !== targetIdx) {
      setIdx(targetIdx)
      setAbiertoId(null)
      openTimerRef.current = setTimeout(() => {
        setAbiertoId(miembroId)
      }, isMobileGrid ? 120 : 520)
      return
    }
    setAbiertoId(miembroId)
  }

  const cerrarCard = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    setAbiertoId(null)
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false)
    }, 700)
  }

  const ir = (dir) => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    setAbiertoId(null)
    setPaused(true)
    setIdx((prev) => (prev + dir + miembros.length) % miembros.length)
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false)
    }, 420)
  }

  const irA = (nextIdx) => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    setAbiertoId(null)
    setPaused(true)
    setIdx(nextIdx)
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false)
    }, 420)
  }

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX
    touchDeltaRef.current = 0
    setPaused(true)
  }

  const handleTouchMove = (e) => {
    touchDeltaRef.current = e.touches[0].clientX - touchStartRef.current
  }

  const handleTouchEnd = () => {
    if (touchDeltaRef.current <= -40) ir(1)
    if (touchDeltaRef.current >= 40) ir(-1)
    setTimeout(() => setPaused(false), 1800)
  }

  const baseSlideBasis = isMobileGrid ? 88 : 46
  const gap = isMobileGrid ? 14 : 28
  const offset = `calc(50% - ${baseSlideBasis / 2}% - ${idx * baseSlideBasis}% - ${idx * gap}px)`

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      onMouseEnter={() => !isMobileGrid && setPaused(true)}
      onMouseLeave={() => !isMobileGrid && !abiertoId && setPaused(false)}
    >
      {!isMobileGrid && (
        <>
          <button
            onClick={() => ir(-1)}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px solid rgba(26,18,8,0.12)',
              background: 'rgba(255,255,255,0.92)',
              color: '#1a1208',
              fontSize: 24,
              cursor: 'pointer',
              boxShadow: '0 14px 28px rgba(26,18,8,0.08)',
            }}
          >
            ‹
          </button>
          <button
            onClick={() => ir(1)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 5,
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px solid rgba(26,18,8,0.12)',
              background: 'rgba(255,255,255,0.92)',
              color: '#1a1208',
              fontSize: 24,
              cursor: 'pointer',
              boxShadow: '0 14px 28px rgba(26,18,8,0.08)',
            }}
          >
            ›
          </button>
        </>
      )}

      <div
        style={{
          overflow: 'hidden',
          padding: isMobileGrid ? '0 0 10px' : '0 82px',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: 'flex',
            gap: gap,
            alignItems: 'center',
            transform: `translateX(${offset})`,
            transition: 'transform 0.82s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {miembros.map((m, i) => {
            const color = m.color || '#3AABDC'
            const inicial = m.nombre?.charAt(0).toUpperCase() || '?'
            const activo = i === idx
            const abierto = abiertoId === m.id

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (!activo) {
                    irA(i)
                  }
                }}
                style={{
                  flex: `0 0 ${baseSlideBasis}%`,
                  transform: activo
                    ? (abierto && !isMobileGrid ? 'scale(1.02)' : 'scale(1)')
                    : isMobileGrid
                      ? 'scale(0.94)'
                      : 'scale(0.88)',
                  opacity: activo ? 1 : 0.62,
                  transition: 'transform 0.82s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.82s cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: 'auto',
                }}
              >
                <AnimatedSection direction="up" delay={0}>
                  <MiembroSlide
                    m={m}
                    color={color}
                    inicial={inicial}
                    i={i}
                    activo={activo}
                    abierto={abierto}
                    isMobile={isMobileGrid}
                    onSelect={() => {}}
                    onToggleOpen={() => {
                      if (!abierto) {
                        abrirCard(i, m.id)
                      } else {
                        cerrarCard()
                      }
                    }}
                  />
                </AnimatedSection>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          marginTop: isMobileGrid ? 18 : 26,
        }}
      >
        {isMobileGrid && (
          <button
            onClick={() => ir(-1)}
            style={{
              background: '#fff',
              border: '1px solid rgba(26,18,8,0.12)',
              color: '#1a1208',
              width: 44,
              height: 44,
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              boxShadow: '0 10px 24px rgba(26,18,8,0.08)',
            }}
          >
            ‹
          </button>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {miembros.map((m, di) => {
            const color = m.color || '#3AABDC'
            const activeDot = di === idx
            return (
              <div
                key={di}
                onClick={() => irA(di)}
                style={{
                  width: activeDot ? 26 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: activeDot ? color : `${color}33`,
                  transition: 'all 0.32s ease',
                  cursor: 'pointer',
                }}
              />
            )
          })}
        </div>

        {isMobileGrid && (
          <button
            onClick={() => ir(1)}
            style={{
              background: '#fff',
              border: '1px solid rgba(26,18,8,0.12)',
              color: '#1a1208',
              width: 44,
              height: 44,
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              boxShadow: '0 10px 24px rgba(26,18,8,0.08)',
            }}
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}

export default function QuienesSomos() {
  usePageTitle('NADIE NOS LEE | QUIÉNES SOMOS')
  const [miembros, setMiembros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [abiertoId, setAbiertoId] = useState(null)
const [isMobileGrid, setIsMobileGrid] = useState(window.innerWidth < 1100)

  useEffect(() => {
    const onResize = () => setIsMobileGrid(window.innerWidth < 1100)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('miembros')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
      if (data) setMiembros(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('miembros-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'miembros' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  return (
    <main>
      {/* HERO */}
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.12)', position: 'relative', overflow: 'hidden' }}>
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

      {/* MIEMBROS */}
      <section style={{ background: '#faf6ee', padding: isMobileGrid ? '48px 20px 80px' : '80px 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : miembros.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay miembros publicados aún.</p>
          ) : (
            <MiembrosCarousel
              miembros={miembros}
              isMobileGrid={isMobileGrid}
              abiertoId={abiertoId}
              setAbiertoId={setAbiertoId}
            />
          )}
        </div>
      </section>
    </main>
  )
}