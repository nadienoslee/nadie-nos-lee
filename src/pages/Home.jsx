import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import usePageTitle from '../hooks/usePageTitle'
import iconRosa from '../assets/ICONROSA.png'
import iconRojo from '../assets/ICONROJO.png'
import { supabase } from '../lib/supabase'

const frases = [
  'Escribimos porque el silencio también tiene gramática.',
  'Nadie nos lee. Y en ese nadie cabe todo el mundo.',
  'La página en blanco no tiene miedo — el miedo lo traemos nosotros.',
  'Escribir es habitar un lugar que no existe hasta que lo nombramos.',
  'Somos el colectivo que escribe aunque el mundo esté mirando hacia otro lado.',
  'Cada texto es una puerta. No sabemos si alguien la abrirá.',
]

// ── Fallbacks fuera del componente para que useEffect los pueda leer ──
const BANNERS_FB = [
  { id: 1, titulo: 'Lectura en voz alta',       subtitulo: 'Voces del margen · 28 Mar 2026 · Casa de la Cultura', link_url: '/eventos', color: '#9B2D8E', gradiente: 'linear-gradient(135deg, #9B2D8E 0%, #6b1f63 100%)' },
  { id: 2, titulo: 'Poesía Protesta',            subtitulo: 'No sentir rabia es un privilegio · Sábado 5 Abr',     link_url: '/eventos', color: '#8B1A1A', gradiente: 'linear-gradient(135deg, #8B1A1A 0%, #5a1010 100%)' },
  { id: 3, titulo: 'Nueva Convocatoria Abierta', subtitulo: 'Escrituras sobre el cuerpo · Cierre 15 Abril 2026',   link_url: '/convocatorias', color: '#3AABDC', gradiente: 'linear-gradient(135deg, #3AABDC 0%, #1a7fa8 100%)' },
]
const ESCRITURA_FB = {
  titulo: 'El peso del martes', autor: 'Valeria Rincón', genero: 'Narrativa',
  fragmento: 'Los martes tienen un peso específico que los otros días no conocen...', fecha: 'Marzo 2026',
}
const EVENTOS_FB = [
  { id: 'fb1', tipo: 'Lectura',      titulo: 'Lectura en voz alta: Voces del margen',   _diaStr: '28', _mesStr: 'MAR', lugar: 'Casa de la Cultura',         color: '#9B2D8E', imagen_url: '' },
  { id: 'fb2', tipo: 'Taller',       titulo: 'Taller de microficción',                  _diaStr: '5',  _mesStr: 'ABR', lugar: 'Biblioteca Central',          color: '#3AABDC', imagen_url: '' },
  { id: 'fb3', tipo: 'Presentación', titulo: 'Antología "Escrituras del Norte"',        _diaStr: '18', _mesStr: 'ABR', lugar: 'Librería El Péndulo Norte',   color: '#8B1A1A', imagen_url: '' },
]

// Normaliza un evento de Supabase (fecha ISO) o fallback (ya tiene _diaStr/_mesStr)
function normalizarEvento(ev) {
  if (ev._diaStr) {
    return {
      id: ev.id,
      tipo: ev.tipo || 'Evento',
      titulo: ev.titulo || '',
      fecha: ev._diaStr,
      mes: ev._mesStr,
      lugar: ev.lugar || '',
      color: ev.color || '#9B2D8E',
      imagen_url: ev.imagen_url || '',
    }
  }

  const d = ev.fecha ? new Date(ev.fecha) : null
  const fechaOk = d && !isNaN(d)

  return {
    id: ev.id,
    tipo: ev.tipo || 'Evento',
    titulo: ev.titulo || '',
    fecha: fechaOk ? d.getDate().toString() : '—',
    mes: fechaOk ? d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase() : '',
    lugar: ev.lugar || '',
    color: ev.color || '#9B2D8E',
    imagen_url: ev.imagen_url || '',
  }
}
function getTextColor(bgColor) {
  if (!bgColor) return '#1a1208'

  let color = bgColor.replace('#', '')

  if (color.length === 3) {
    color = color.split('').map((c) => c + c).join('')
  }

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b

  return luminance > 160 ? '#1a1208' : '#ffffff'
}
export default function Home() {
  usePageTitle('NADIE NOS LEE | HOME')
  const [fraseIdx, setFraseIdx]         = useState(0)
  const [fraseVisible, setFraseVisible] = useState(true)
  const [slide, setSlide]               = useState(0)
  const [pausado, setPausado]           = useState(false)
  const intervalRef                     = useRef(null)

const [escritura, setEscritura]             = useState(null)
const [banners, setBanners]                 = useState([])
const [eventos, setEventos]                 = useState([])
const [noticiasSemana, setNoticiasSemana]   = useState([])
const [paginaEscritura, setPaginaEscritura] = useState(0)

  // Frase aleatoria
  useEffect(() => {
    setFraseIdx(Math.floor(Math.random() * frases.length))
    const interval = setInterval(() => {
      setFraseVisible(false)
      setTimeout(() => { setFraseIdx(i => (i + 1) % frases.length); setFraseVisible(true) }, 600)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Cargar datos Supabase
useEffect(() => {
    const cargar = async () => {
      const { data: e } = await supabase.from('escrituras').select('*').eq('publicado', true).order('created_at', { ascending: false }).limit(1)
      if (e?.[0]) setEscritura(e[0])

      const { data: b } = await supabase.from('banners').select('*').eq('activo', true).order('orden', { ascending: true })
      if (b?.length) setBanners(b)

      const { data: ev } = await supabase.from('eventos').select('*').eq('publicado', true).eq('estado', 'Próximo').order('fecha', { ascending: true }).limit(3)
      if (ev?.length) setEventos(ev)

      // Noticias publicadas en los últimos 7 días
      const hace7dias = new Date()
      hace7dias.setDate(hace7dias.getDate() - 7)
      const { data: ns } = await supabase
        .from('noticias')
        .select('*')
        .eq('publicado', true)
        .gte('fecha_publicacion', hace7dias.toISOString().split('T')[0])
        .order('fecha_publicacion', { ascending: false })
        .limit(5)
      if (ns?.length) setNoticiasSemana(ns)
    }
    cargar()

    const ch1 = supabase.channel('home-e').on('postgres_changes', { event: '*', schema: 'public', table: 'escrituras' }, cargar).subscribe()
    const ch2 = supabase.channel('home-b').on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, cargar).subscribe()
    const ch3 = supabase.channel('home-ev').on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, cargar).subscribe()
    const ch4 = supabase.channel('home-ns').on('postgres_changes', { event: '*', schema: 'public', table: 'noticias' }, cargar).subscribe()
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); supabase.removeChannel(ch3); supabase.removeChannel(ch4) }
  }, [])

// Datos activos con fallback
  const escrituraActiva    = escritura || ESCRITURA_FB
  const bannersActivos     = banners.length  ? banners  : BANNERS_FB
  const eventosActivos     = eventos.length  ? eventos  : EVENTOS_FB
  // Carrusel: noticias de esta semana si hay, si no banners
  const carruselItems      = noticiasSemana.length ? noticiasSemana : bannersActivos
  const esCarruselNoticia  = noticiasSemana.length > 0

  // Carrusel automático — usa bannersActivos.length directamente
useEffect(() => {
    clearInterval(intervalRef.current)
    if (!pausado && carruselItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setSlide(s => (s + 1) % carruselItems.length)
      }, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [pausado, carruselItems.length])

  // Resetear slide si cambia el total de items
  useEffect(() => {
    setSlide(0)
  }, [carruselItems.length])

  const prevSlide = () => { setSlide(s => (s - 1 + bannersActivos.length) % bannersActivos.length) }
  const nextSlide = () => { setSlide(s => (s + 1) % bannersActivos.length) }

const fechaEscritura = escrituraActiva.fecha ||
  (escrituraActiva.fecha_publicacion
    ? new Date(escrituraActiva.fecha_publicacion).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    : '')

// Paginación del texto de la tarjeta derecha
const textoCard = escrituraActiva.fragmento || escrituraActiva.contenido || ''
const LIMITE_PAG = 280
const paginasTexto = (() => {
  if (!textoCard || textoCard.length <= LIMITE_PAG) return [textoCard || '—']
  const pages = []
  let restante = textoCard
  while (restante.length > 0) {
    if (restante.length <= LIMITE_PAG) { pages.push(restante); break }
    let corte = restante.lastIndexOf('\n', LIMITE_PAG)
    if (corte < 60) corte = restante.lastIndexOf(' ', LIMITE_PAG)
    if (corte < 60) corte = LIMITE_PAG
    pages.push(restante.slice(0, corte).trim())
    restante = restante.slice(corte).trim()
  }
  return pages.length ? pages : [textoCard]
})()
const totalPagsTexto  = paginasTexto.length
const paginaActualIdx = Math.min(paginaEscritura, totalPagsTexto - 1)

  return (
    <main>

      {/* ═══════ HERO ═══════ */}
      <section style={{ minHeight: '100vh', background: '#f5ede0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 32px 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(155,45,142,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(139,26,26,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(16px, 3vw, 48px)', marginBottom: 28, animation: 'fadeInUp 1s ease 0.2s both' }}>
          <img src={iconRosa} alt="" style={{ width: 'clamp(56px, 7vw, 100px)', height: 'auto', objectFit: 'contain', flexShrink: 0, marginTop: 'clamp(30px, 5vw, 60px)' }} />
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 14vw, 160px)', letterSpacing: 6, lineHeight: 0.92, color: '#1a1208', textAlign: 'center', flexShrink: 0 }}>
            NADIE<br /><span style={{ color: '#3AABDC' }}>NOS</span><br />LEE
          </h1>
          <img src={iconRojo} alt="" style={{ width: 'clamp(56px, 7vw, 100px)', height: 'auto', objectFit: 'contain', flexShrink: 0, marginTop: 'clamp(30px, 5vw, 60px)' }} />
        </div>

        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(26,18,8,0.45)', marginBottom: 48, animation: 'fadeInUp 1s ease 0.4s both' }}>
          Colectivo de Escritura Independiente
        </p>

        <div style={{ maxWidth: 680, marginBottom: 56, minHeight: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 1s ease 0.6s both' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(20px, 2.8vw, 28px)', fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(26,18,8,0.65)', opacity: fraseVisible ? 1 : 0, transform: fraseVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            "{frases[fraseIdx]}"
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeInUp 1s ease 0.8s both', position: 'relative', zIndex: 2, marginBottom: 80 }}>
          <Link to="/escritura" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', background: '#9B2D8E', color: '#f5ede0', padding: '16px 36px', border: '2px solid #9B2D8E', transition: 'background 0.3s, transform 0.2s', display: 'inline-block' }}
            onMouseOver={e => { e.target.style.background = '#b535a8'; e.target.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.target.style.background = '#9B2D8E'; e.target.style.transform = 'translateY(0)' }}>
            Leer escritura de la semana
          </Link>
          <Link to="/manifiesto" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', background: 'transparent', color: '#1a1208', padding: '16px 36px', border: '2px solid rgba(26,18,8,0.3)', transition: 'border-color 0.3s, transform 0.2s', display: 'inline-block' }}
            onMouseOver={e => { e.target.style.borderColor = '#1a1208'; e.target.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.target.style.borderColor = 'rgba(26,18,8,0.3)'; e.target.style.transform = 'translateY(0)' }}>
            Nuestro manifiesto
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)' }}>Desplazar</span>
          <div style={{ width: 1, height: 40, background: 'rgba(155,45,142,0.4)', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </section>

{/* ═══════ ESCRITURA DE LA SEMANA ═══════ */}
<section style={{ background: '#faf6ee', padding: '100px 40px', borderTop: '1px solid rgba(155,45,142,0.12)' }}>
  <div style={{ maxWidth: 1200, margin: '0 auto' }}>
    <AnimatedSection direction="right">
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', borderBottom: '1px solid #8B1A1A', paddingBottom: 4, display: 'inline-block', marginBottom: 48 }}>Editorial</p>
    </AnimatedSection>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'start' }}>

      {/* ── IZQUIERDA: título + imagen ── */}
      <AnimatedSection direction="right" delay={0.1}>
        <div>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 12 }}>Escritura de la semana</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, lineHeight: 1.05, color: '#1a1208', marginBottom: 10 }}>
            {escrituraActiva.titulo}
          </h2>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: 'rgba(26,18,8,0.6)', letterSpacing: 2, marginBottom: 28 }}>
            {escrituraActiva.autor} · {escrituraActiva.genero} · {fechaEscritura}
          </p>

          {/* Imagen del libro / autor */}
{escrituraActiva.imagen_url ? (
  <img
    src={escrituraActiva.imagen_url}
    alt={escrituraActiva.titulo}
    style={{ display: 'block', maxWidth: '100%', height: 'auto', marginBottom: 32 }}
  />
) : (
  <div style={{ marginBottom: 32, padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 96, color: 'rgba(155,45,142,0.1)', lineHeight: 1, userSelect: 'none' }}>
      {escrituraActiva.autor?.charAt(0).toUpperCase() || 'N'}
    </span>
    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.2)' }}>
      Sin imagen · agregar desde el panel
    </p>
  </div>
)}
          <Link to="/escritura" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#9B2D8E', borderBottom: '1px solid #9B2D8E', paddingBottom: 2, display: 'inline-block' }}>
            Leer texto completo →
          </Link>
        </div>
      </AnimatedSection>

      {/* ── DERECHA: tarjeta con texto paginado ── */}
      <AnimatedSection direction="left" delay={0.2}>
        <div style={{ background: 'rgba(155,45,142,0.04)', border: '1px solid rgba(155,45,142,0.15)', padding: '36px 32px 28px', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 380 }}>

          {/* Header de la tarjeta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, fontWeight: 300, color: 'rgba(155,45,142,0.12)', lineHeight: 0.8 }}>"</div>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, color: 'rgba(26,18,8,0.3)', textTransform: 'uppercase', paddingTop: 4 }}>
              {escrituraActiva.semana ? `Nº ${escrituraActiva.semana} / ${new Date().getFullYear()}` : `Nº — / ${new Date().getFullYear()}`}
            </span>
          </div>

          {/* Texto paginado */}
          <div style={{ flex: 1, minHeight: 160 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: 'italic', lineHeight: 1.85, color: 'rgba(26,18,8,0.65)', whiteSpace: 'pre-line', margin: 0 }}>
              {paginasTexto[paginaActualIdx]}
            </p>
          </div>

          {/* Footer: autor + paginación */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(155,45,142,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: '#1a1208', marginBottom: 2 }}>{escrituraActiva.autor}</p>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: 'rgba(26,18,8,0.5)', textTransform: 'uppercase' }}>{escrituraActiva.genero}</p>
            </div>

            {/* Paginación — solo si hay más de 1 página */}
            {totalPagsTexto > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setPaginaEscritura(p => Math.max(0, p - 1))}
                  disabled={paginaActualIdx === 0}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: paginaActualIdx === 0 ? 'transparent' : 'rgba(155,45,142,0.1)', border: `1px solid ${paginaActualIdx === 0 ? 'rgba(26,18,8,0.1)' : 'rgba(155,45,142,0.3)'}`, cursor: paginaActualIdx === 0 ? 'not-allowed' : 'pointer', color: paginaActualIdx === 0 ? 'rgba(26,18,8,0.2)' : '#9B2D8E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s', lineHeight: 1 }}
                >‹</button>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(26,18,8,0.45)', textTransform: 'uppercase', minWidth: 40, textAlign: 'center' }}>
                  {paginaActualIdx + 1} / {totalPagsTexto}
                </span>
                <button
                  onClick={() => setPaginaEscritura(p => Math.min(totalPagsTexto - 1, p + 1))}
                  disabled={paginaActualIdx === totalPagsTexto - 1}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: paginaActualIdx === totalPagsTexto - 1 ? 'transparent' : 'rgba(155,45,142,0.1)', border: `1px solid ${paginaActualIdx === totalPagsTexto - 1 ? 'rgba(26,18,8,0.1)' : 'rgba(155,45,142,0.3)'}`, cursor: paginaActualIdx === totalPagsTexto - 1 ? 'not-allowed' : 'pointer', color: paginaActualIdx === totalPagsTexto - 1 ? 'rgba(26,18,8,0.2)' : '#9B2D8E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s', lineHeight: 1 }}
                >›</button>
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

    </div>
  </div>
</section>

      {/* ═══════ PRÓXIMOS EVENTOS ═══════ */}
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

                    <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 760px))',
              justifyContent: 'start',
              gap: 28,
            }}
          >
            {eventosActivos.map((ev, i) => {
              const n = normalizarEvento(ev)
              return (
                <AnimatedSection
                  key={n.id}
                  direction="up"
                  delay={i * 0.1}
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <Link
                    to={`/eventos/${n.id}`}
                    style={{
                      textDecoration: 'none',
                      display: 'block',
                      width: '100%',
                      maxWidth: '760px',
                    }}
                  >
                    <div
                      style={{
                        background: '#fff',
                        border: `2px solid ${n.color}22`,
                        overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                        width: '100%',
                        boxShadow: '0 18px 54px rgba(26,18,8,0.08)',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-6px)'
                        e.currentTarget.style.boxShadow = '0 24px 64px rgba(26,18,8,0.14)'
                        e.currentTarget.style.borderColor = n.color + '66'
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 18px 54px rgba(26,18,8,0.08)'
                        e.currentTarget.style.borderColor = n.color + '22'
                      }}
                    >
                      <div
                        style={{
                          height: 270,
                          background: n.imagen_url
                            ? '#efe7dc'
                            : `linear-gradient(135deg, ${n.color}33 0%, ${n.color}10 100%)`,
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: '16px 20px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {n.imagen_url && (
                          <>
                            <img
                              src={n.imagen_url}
                              alt={n.titulo}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(26,18,8,0.34) 0%, rgba(26,18,8,0.10) 48%, rgba(26,18,8,0.03) 100%)',
                              }}
                            />
                          </>
                        )}

                        <div
                          style={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            background: n.color,
                            padding: '8px 14px',
                            textAlign: 'center',
                            minWidth: 64,
                            boxShadow: '0 10px 28px rgba(26,18,8,0.18)',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 32,
                              color: getTextColor(n.color),
                              lineHeight: 1,
                              fontWeight: '900',
                            }}
                          >
                            {n.fecha}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Courier Prime', monospace",
                              fontSize: 10,
                              letterSpacing: 2,
                              color: getTextColor(n.color),
                              textTransform: 'uppercase',
                              fontWeight: '900',
                            }}
                          >
                            {n.mes}
                          </div>
                        </div>

                        <span
                          style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: 9,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            color: n.imagen_url ? '#fff' : n.color,
                            background: n.imagen_url ? 'rgba(26,18,8,0.65)' : '#fff',
                            padding: '4px 10px',
                            backdropFilter: n.imagen_url ? 'blur(4px)' : 'none',
                            fontWeight: '700',
                          }}
                        >
                          {n.tipo}
                        </span>

                        {!n.imagen_url && (
                          <span
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 120,
                              color: n.color,
                              opacity: 0.08,
                              lineHeight: 1,
                              userSelect: 'none',
                              position: 'absolute',
                              bottom: -10,
                              right: 12,
                            }}
                          >
                            {n.tipo === 'Lectura' ? 'L' : n.tipo === 'Taller' ? 'T' : 'P'}
                          </span>
                        )}
                      </div>

                       <div style={{ padding: '26px 28px 30px', background: n.color }}>
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 24,
                            fontWeight: '900',
                            color: getTextColor(n.color),
                            lineHeight: 1.25,
                            marginBottom: 10,
                          }}
                        >
                          {n.titulo}
                        </h3>

                        <p
                          style={{
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: 12,
                            color: getTextColor(n.color),
                            letterSpacing: 1,
                            marginBottom: 20,
                            fontWeight: '900',
                          }}
                        >
                          {n.lugar}
                        </p>

                        <span
                          style={{
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: 11,
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            color: getTextColor(n.color),
                            borderBottom: `1px solid ${getTextColor(n.color)}`,
                            fontWeight: '900',
                          }}
                        >
                          Ver evento →
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ CARRUSEL — LO ÚLTIMO DEL COLECTIVO ═══════ */}
      <section style={{ background: '#14110e', padding: '100px 40px', borderTop: '1px solid rgba(155,45,142,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 8 }}>Noticias</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#f5ede0' }}>Lo último del colectivo</h2>
              <Link to="/noticias" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,237,224,0.4)', borderBottom: '1px solid rgba(245,237,224,0.2)', paddingBottom: 2 }}>Ver todas →</Link>
            </div>
          </AnimatedSection>

          <div style={{ position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            {/* Track con transición CSS */}
            <div style={{ display: 'flex', transform: `translateX(-${slide * 100}%)`, transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
{carruselItems.map((item, i) => {
                if (esCarruselNoticia) {
                  const n = item
                  const color = n.color || '#8B1A1A'
                  const href = n.link_url || '/noticias'
                  const esExterno = !!n.link_url
                  return (
                    <a key={n.id || i}
                      href={href}
                      target={esExterno ? '_blank' : '_self'}
                      rel={esExterno ? 'noopener noreferrer' : undefined}
                      style={{ minWidth: '100%', textDecoration: 'none', display: 'block' }}
                    >
                      <div style={{ height: 'clamp(240px, 40vw, 400px)', background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 60px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                        {n.imagen_url && (
                          <>
                            <img src={n.imagen_url} alt={n.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.88) 0%, rgba(26,18,8,0.4) 55%, rgba(26,18,8,0.1) 100%)' }} />
                          </>
                        )}
                        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(80px, 20vw, 220px)', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', letterSpacing: 4, whiteSpace: 'nowrap' }}>NADIE NOS LEE</div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', backdropFilter: 'blur(4px)' }}>{n.categoria || 'Noticia'}</span>
                            {n.fecha_publicacion && (
                              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(255,255,255,0.55)' }}>
                                {new Date(n.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 68px)', letterSpacing: 3, color: '#fff', lineHeight: 1, marginBottom: 16 }}>{n.titulo}</h3>
                          {n.cuerpo && (
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontStyle: 'italic', color: 'rgba(255,255,255,0.78)', maxWidth: 580, lineHeight: 1.6 }}>
                              {n.cuerpo.length > 140 ? n.cuerpo.slice(0, 140) + '...' : n.cuerpo}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  )
                } else {
                  const b = item
                  const href      = b.link_url || b.link || '/noticias'
                  const esExterno = b.link_tipo === 'externo'
                  const grad      = b.gradiente || `linear-gradient(135deg, ${b.color || '#9B2D8E'} 0%, ${(b.color || '#9B2D8E')}aa 100%)`
                  return (
                    <Link key={b.id || i} to={esExterno ? '#' : href}
                      onClick={esExterno ? e => { e.preventDefault(); window.open(href, '_blank') } : undefined}
                      style={{ minWidth: '100%', textDecoration: 'none', display: 'block' }}
                    >
                      <div style={{ height: 'clamp(240px, 40vw, 400px)', background: grad, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 60px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                        {b.imagen_url && <img src={b.imagen_url} alt={b.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />}
                        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(80px, 20vw, 220px)', color: 'rgba(255,255,255,0.06)', lineHeight: 1, userSelect: 'none', letterSpacing: 4, whiteSpace: 'nowrap' }}>NADIE NOS LEE</div>
                        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Nadie Nos Lee — Colectivo</p>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 7vw, 80px)', letterSpacing: 4, color: '#fff', lineHeight: 0.95, marginBottom: 20 }}>{b.titulo}</h3>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', maxWidth: 560 }}>{b.subtitulo}</p>
                      </div>
                    </Link>
                  )
                }
              })}
            </div>

            {/* Flechas — solo si hay más de 1 */}
            {carruselItems.length > 1 && (
              <>
                <button onClick={prevSlide} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 48, height: 48, cursor: 'pointer', fontSize: 20, backdropFilter: 'blur(4px)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >‹</button>
                <button onClick={nextSlide} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 48, height: 48, cursor: 'pointer', fontSize: 20, backdropFilter: 'blur(4px)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >›</button>

                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24 }}>
                  {carruselItems.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 28 : 10, height: 10, borderRadius: 5, background: i === slide ? '#9B2D8E' : 'rgba(245,237,224,0.25)', border: 'none', cursor: 'pointer', transition: 'width 0.3s ease, background 0.3s ease', padding: 0 }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ MANIFIESTO PREVIEW ═══════ */}
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
            >Leer el manifiesto completo</Link>
          </AnimatedSection>
        </div>
      </section>

      <style>{`
        @keyframes fadeInUp    { from { opacity: 0; transform: translateY(30px);  } to { opacity: 1; transform: translateY(0);  } }
        @keyframes fadeInDown  { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0);  } }
        @keyframes scrollLine  { 0%, 100% { transform: scaleY(1);   opacity: 1;   } 50% { transform: scaleY(0.6); opacity: 0.4; } }
        @media (max-width: 768px) { section { padding-left: 20px !important; padding-right: 20px !important; } }
      `}</style>
    </main>
  )
}