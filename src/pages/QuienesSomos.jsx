import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function QuienesSomos() {
  usePageTitle('NADIE NOS LEE | QUIÉNES SOMOS')
  const [miembros, setMiembros] = useState([])
  const [cargando, setCargando] = useState(true)

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

function PergaminoCard({ m, color, inicial, i }) {
  const [abierto, setAbierto] = useState(false)
  const [ancho, setAncho] = useState(window.innerWidth)

  useEffect(() => {
    const onResize = () => setAncho(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const esMobile = ancho < 600

  // Dimensiones adaptativas
const CARD_W_CERRADO  = esMobile ? '100%' : 260
  const CARD_H_CERRADO  = esMobile ? 'auto' : 520
  const CARD_W_ABIERTO  = esMobile ? '100%' : 580
  const CARD_H_ABIERTO  = esMobile ? 'auto' : 400

  const FOTO_W_CERRADO  = esMobile ? '100%' : 260
  const FOTO_H_CERRADO  = esMobile ? 260    : 280
  const FOTO_W_ABIERTO  = esMobile ? '100%' : 210
  const FOTO_H_ABIERTO  = esMobile ? 260    : 400

  const TEXTO_W_CERRADO = esMobile ? '100%' : 260
  const TEXTO_H_CERRADO = esMobile ? 'auto' : 240
  const TEXTO_W_ABIERTO = esMobile ? '100%' : 370
  const TEXTO_H_ABIERTO = esMobile ? 'auto' : 400

  const T = 'all 0.55s cubic-bezier(0.4, 0, 0.2, 1)'

  // En móvil abierto: foto arriba, texto abajo (apilado vertical siempre)
  // En desktop abierto: foto izq, texto der
  const fotoLeft   = (!esMobile && abierto) ? 0            : 0
  const fotoTop    = 0
  const textoLeft  = (!esMobile && abierto) ? FOTO_W_ABIERTO : 0
  const textoTop   = (!esMobile && abierto) ? 0              : FOTO_H_CERRADO

  // Flecha: en mobile siempre en borde inferior foto, en desktop cambia
  const flechaTop  = (!esMobile && abierto) ? '50%'  : (esMobile ? FOTO_H_CERRADO - 16 : -16)
  const flechaLeft = (!esMobile && abierto) ? -16    : (esMobile ? '50%' : '50%')

  return (
    <div
      onClick={() => setAbierto(a => !a)}
style={{
        position: 'relative',
        width:  abierto ? CARD_W_ABIERTO  : CARD_W_CERRADO,
        height: esMobile ? 'auto' : (abierto ? CARD_H_ABIERTO : CARD_H_CERRADO),
        transition: T,
        background: '#fff',
        border: `1px solid ${abierto ? color + '44' : 'rgba(26,18,8,0.08)'}`,
        borderTop: `4px solid ${color}`,
        overflow: 'hidden',
        boxShadow: abierto
          ? `0 24px 64px rgba(26,18,8,0.16), 0 0 0 2px ${color}22`
          : '0 4px 18px rgba(26,18,8,0.07)',
        cursor: 'pointer',
        zIndex: abierto ? 10 : 1,
      }}
    >
      {/* ── FOTO ── */}
<div style={{
        position: esMobile ? 'relative' : 'absolute',
        left: esMobile ? 'auto' : fotoLeft,
        top:  esMobile ? 'auto' : fotoTop,
        width:  abierto ? FOTO_W_ABIERTO  : FOTO_W_CERRADO,
        height: abierto ? FOTO_H_ABIERTO  : FOTO_H_CERRADO,
        transition: T,
        background: m.foto_url ? '#efe7dc' : `linear-gradient(180deg, ${color}22 0%, ${color}08 100%)`,
        overflow: 'hidden',
      }}>
        {m.foto_url ? (
          <img src={m.foto_url} alt={m.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', transition: T }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color, opacity: 0.12, lineHeight: 1, userSelect: 'none' }}>{inicial}</span>
          </div>
        )}
        <span style={{ position: 'absolute', bottom: 10, right: 12, fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, color: '#fff', opacity: 0.2, lineHeight: 1, userSelect: 'none' }}>
          {String(i + 1).padStart(2, '0')}
        </span>
        {/* Borde lateral solo en desktop abierto */}
        {!esMobile && (
          <div style={{ position: 'absolute', top: 0, right: 0, width: abierto ? 3 : 0, height: '100%', background: color, transition: T }} />
        )}
      </div>

      {/* ── TEXTO ── */}
<div style={{
        position: esMobile ? 'relative' : 'absolute',
        left:   esMobile ? 'auto' : textoLeft,
        top:    esMobile ? 'auto' : textoTop,
        width:  abierto ? TEXTO_W_ABIERTO : TEXTO_W_CERRADO,
        height: abierto ? TEXTO_H_ABIERTO : TEXTO_H_CERRADO,
        transition: T,
        background: (abierto && !esMobile) ? `linear-gradient(160deg, ${color}07 0%, #fff 35%)` : '#fff',
        borderTop:  (!abierto || esMobile) ? `1px solid ${color}20` : 'none',
        borderLeft: (abierto && !esMobile) ? `1px solid ${color}20` : 'none',
        padding: esMobile ? '18px 20px' : '20px 24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>


        {/* Decorativo */}
        <span style={{ position: 'absolute', bottom: 8, right: 12, fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, color, opacity: 0.04, lineHeight: 1, userSelect: 'none' }}>{inicial}</span>

        {m.rol && (
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color, fontWeight: '700', marginBottom: 10 }}>{m.rol}</p>
        )}
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: esMobile ? (abierto ? 30 : 26) : (abierto ? 36 : 32), fontWeight: 700, color: '#1a1208', lineHeight: 1.05, marginBottom: 12, transition: T }}>
          {m.nombre}
        </h2>
        <div style={{ width: 36, height: 2, background: color, marginBottom: 14, borderRadius: 1 }} />
        {m.bio && (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: esMobile ? (abierto ? 17 : 15) : (abierto ? 20 : 18), lineHeight: 1.8, color: 'rgba(26,18,8,0.7)', fontStyle: 'italic', transition: T }}>
            {m.bio}
          </p>
        )}
      </div>
    </div>
  )
}

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
<section style={{ background: '#faf6ee', padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : miembros.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay miembros publicados aún.</p>
          ) : (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 28, justifyContent: 'center' }}>
              {miembros.map((m, i) => {
                const color   = m.color || '#3AABDC'
                const inicial = m.nombre?.charAt(0).toUpperCase() || '?'
                return (
                  <AnimatedSection key={m.id} direction="up" delay={Math.min(i * 0.06, 0.4)}>
                    <PergaminoCard m={m} color={color} inicial={inicial} i={i} />
                  </AnimatedSection>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .miembro-card { grid-template-columns: 1fr !important; grid-template-areas: "foto" "texto" !important; }
        }
      `}</style>
    </main>
  )
}