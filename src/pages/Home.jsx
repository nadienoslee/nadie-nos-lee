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
      descripcion: ev.descripcion || '',
      fecha: ev._diaStr,
      mes: ev._mesStr,
      lugar: ev.lugar || '',
      color: ev.color || '#f74fb4',
      imagen_url: ev.imagen_url || '',
    }
  }

  const d = ev.fecha ? new Date(`${ev.fecha}T12:00:00`) : null
  const fechaOk = d && !isNaN(d)

  return {
    id: ev.id,
    tipo: ev.tipo || 'Evento',
    titulo: ev.titulo || '',
    descripcion: ev.descripcion || ev.descripcion_larga || '',
    fecha: fechaOk ? d.getDate().toString() : '—',
    mes: fechaOk ? d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase() : '',
    lugar: ev.lugar || '',
    color: ev.color || '#f74fb4',
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
const eventosCarouselRef              = useRef(null)

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

const { data: ev } = await supabase.from('eventos').select('*').eq('publicado', true).eq('estado', 'Próximo').order('fecha', { ascending: true }).limit(12)
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
// Carrusel: noticias + banners mezclados
  const carruselItems     = [
    ...noticiasSemana.map(n => ({ ...n, _tipo: 'noticia' })),
    ...bannersActivos.map(b => ({ ...b, _tipo: 'banner' })),
  ]

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

const prevSlide = () => { setSlide(s => (s - 1 + carruselItems.length) % carruselItems.length) }
  const nextSlide = () => { setSlide(s => (s + 1) % carruselItems.length) }

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

const moverEventos = (direccion) => {
  if (!eventosCarouselRef.current) return

  eventosCarouselRef.current.scrollBy({
    left: direccion === 'right' ? 340 : -340,
    behavior: 'smooth',
  })
}

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
            onMouseOver={e => { e.target.style.background = '#f74fb4'; e.target.style.transform = 'translateY(-2px)' }}
            onMouseOut={e => { e.target.style.background = '#f74fb4'; e.target.style.transform = 'translateY(0)' }}>
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
          <div style={{ width: 1, height: 40, background: '#f74fb4', animation: 'scrollLine 2s ease-in-out infinite' }} />
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
<section style={{ background: '#f5ede0', padding: '90px 40px', borderTop: '1px solid rgba(58,171,220,0.12)' }}>
  <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
    <AnimatedSection direction="right">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 8 }}>Comunidad</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 60px)', fontWeight: 300, color: '#1a1208' }}>Próximos eventos</h2>
        </div>
        <Link to="/eventos" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', borderBottom: '1px solid rgba(26,18,8,0.2)', paddingBottom: 2 }}>Ver todos →</Link>
      </div>
    </AnimatedSection>

{eventosActivos.length > 4 && (
      <>
        <button
          onClick={() => moverEventos('left')}
          style={{
            position: 'absolute',
            left: -22,
            top: '58%',
            zIndex: 5,
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: '1px solid rgba(26,18,8,0.12)',
            background: '#faf6ee',
            color: '#1a1208',
            cursor: 'pointer',
            fontSize: 24,
            boxShadow: '0 12px 30px rgba(26,18,8,0.14)',
          }}
        >
          ‹
        </button>

        <button
          onClick={() => moverEventos('right')}
          style={{
            position: 'absolute',
            right: -22,
            top: '58%',
            zIndex: 5,
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: '1px solid rgba(26,18,8,0.12)',
            background: '#faf6ee',
            color: '#1a1208',
            cursor: 'pointer',
            fontSize: 24,
            boxShadow: '0 12px 30px rgba(26,18,8,0.14)',
          }}
        >
          ›
        </button>
      </>
    )}

<div
  ref={eventosCarouselRef}
  className="eventos-home-track"
  style={{
    display: 'flex',
    gap: 24,
    overflowX: eventosActivos.length > 4 ? 'auto' : 'visible',
    scrollBehavior: 'smooth',
    justifyContent: eventosActivos.length <= 4 ? 'center' : 'flex-start',
    padding: '8px 4px 24px',
    scrollbarWidth: 'none',
  }}
>
      {eventosActivos.map((ev, i) => {
        const n = normalizarEvento(ev)
        const textColor = getTextColor(n.color)

        return (
<AnimatedSection key={n.id} direction="up" delay={i * 0.1} className="evento-home-card-wrap" style={{ flex: '0 0 310px' }}>
            <Link to={`/eventos/${n.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
<div
  className="evento-home-card"
  style={{
    background: '#fff',
                  border: `2px solid ${n.color}22`,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 14px 38px rgba(26,18,8,0.08)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 22px 54px rgba(26,18,8,0.13)'
                  e.currentTarget.style.borderColor = n.color + '66'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 14px 38px rgba(26,18,8,0.08)'
                  e.currentTarget.style.borderColor = n.color + '22'
                }}
              >
<div
  className="evento-home-img"
  style={{
    height: 210,
                    background: n.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${n.color}33 0%, ${n.color}10 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {n.imagen_url ? (
                    <img
                      src={n.imagen_url}
                      alt={n.titulo}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 120,
                        color: n.color,
                        opacity: 0.08,
                        lineHeight: 1,
                        userSelect: 'none',
                        position: 'absolute',
                        bottom: -12,
                        right: 14,
                      }}
                    >
                      {n.tipo?.[0] || 'E'}
                    </span>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: n.imagen_url ? 'linear-gradient(to top, rgba(26,18,8,0.22), rgba(26,18,8,0.02))' : 'transparent',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      background: n.color,
                      padding: '7px 12px',
                      textAlign: 'center',
                      minWidth: 58,
                      boxShadow: '0 10px 24px rgba(26,18,8,0.16)',
                    }}
                  >
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: textColor, lineHeight: 1, fontWeight: '900' }}>
                      {n.fecha}
                    </div>
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, color: textColor, textTransform: 'uppercase', fontWeight: '900' }}>
                      {n.mes}
                    </div>
                  </div>

                  <span
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 8,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: 'rgba(26,18,8,0.68)',
                      padding: '4px 9px',
                      backdropFilter: 'blur(4px)',
                      fontWeight: '700',
                    }}
                  >
                    {n.tipo}
                  </span>
                </div>

<div
  className="evento-home-info"
  style={{
    padding: '24px 22px 26px',
                    background: n.color,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                    minHeight: 230,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 23,
                      fontWeight: '900',
                      color: textColor,
                      lineHeight: 1.22,
                      marginBottom: 10,
                      textAlign: 'center',
                    }}
                  >
                    {n.titulo}
                  </h3>

                  {n.descripcion && (
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 17,
                        lineHeight: 1.5,
                        color: textColor,
                        opacity: 0.92,
                        marginBottom: 14,
                        textAlign: 'center',
                      }}
                    >
                      {n.descripcion.length > 110 ? n.descripcion.slice(0, 110) + '…' : n.descripcion}
                    </p>
                  )}

                  <p
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 11,
                      color: textColor,
                      letterSpacing: 1,
                      marginTop: 'auto',
                      marginBottom: 16,
                      fontWeight: '900',
                      textAlign: 'center',
                    }}
                  >
                    {n.lugar}
                  </p>

                  <span
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: textColor,
                      borderBottom: `1px solid ${textColor}`,
                      fontWeight: '900',
                      alignSelf: 'center',
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

     {/* ═══════ ANUNCIOS Y COLABORADORES ═══════ */}
<section className="anuncios-section">
  <div className="anuncios-container">
    <AnimatedSection direction="up">
      <p className="anuncios-kicker">Anuncios</p>

      <div className="anuncios-header">
        <h2>Anuncios y Colaboradores</h2>

        <Link to="/noticias" className="anuncios-link">
          Ver todas →
        </Link>
      </div>
    </AnimatedSection>

    <div
      className="anuncios-carousel-wrap"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="anuncios-carousel-viewport">
        <div
          className="anuncios-carousel-track"
          style={{
            transform: `translateX(-${slide * 100}%)`,
          }}
        >
          {carruselItems.map((item, i) => {
            if (item._tipo === 'noticia') {
              const n = item
              const color = n.color || '#8B1A1A'
              const href = n.link_url || '/noticias'
              const esExterno = !!n.link_url

              return (
                <a
                  key={n.id || i}
                  href={href}
                  target={esExterno ? '_blank' : '_self'}
                  rel={esExterno ? 'noopener noreferrer' : undefined}
                  className="anuncios-slide-link"
                >
                  <div
                    className="anuncios-slide"
                    style={{
                      background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                    }}
                  >
                    {n.imagen_url && (
                      <>
                        <img src={n.imagen_url} alt={n.titulo} className="anuncios-slide-img" />
                        <div className="anuncios-slide-overlay" />
                      </>
                    )}

                    <div className="anuncios-bg-text">NADIE NOS LEE</div>

                    <div className="anuncios-content">
                      <div className="anuncios-meta-row">
                        <span className="anuncios-pill">{n.categoria || 'Noticia'}</span>

                        {n.fecha_publicacion && (
                          <span className="anuncios-date">
                            {new Date(n.fecha_publicacion).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      <h3>{n.titulo}</h3>

                      {n.cuerpo && (
                        <p>
                          {n.cuerpo.length > 140 ? n.cuerpo.slice(0, 140) + '...' : n.cuerpo}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              )
            }

            const b = item
            const href = b.link_url || b.link || '/noticias'
            const esExterno = b.link_tipo === 'externo'
            const grad = b.gradiente || `linear-gradient(135deg, ${b.color || '#9B2D8E'} 0%, ${(b.color || '#9B2D8E')}aa 100%)`

            return (
              <Link
                key={b.id || i}
                to={esExterno ? '#' : href}
                onClick={esExterno ? e => { e.preventDefault(); window.open(href, '_blank') } : undefined}
                className="anuncios-slide-link"
              >
                <div
                  className="anuncios-slide"
                  style={{ background: grad }}
                >
                  {b.imagen_url && (
                    <img src={b.imagen_url} alt={b.titulo} className="anuncios-slide-img banner" />
                  )}

                  <div className="anuncios-bg-text">NADIE NOS LEE</div>

                  <div className="anuncios-content">
                    <p className="anuncios-eyebrow">Colectivo</p>
                    <h3>{b.titulo}</h3>
                    <p>{b.subtitulo}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {carruselItems.length > 1 && (
        <>
          <div className="anuncios-controls">
            <button onClick={prevSlide} className="anuncios-arrow">
              ‹
            </button>

            <button onClick={nextSlide} className="anuncios-arrow">
              ›
            </button>
          </div>

          <div className="anuncios-dots">
            {carruselItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={i === slide ? 'active' : ''}
              />
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
  @keyframes scrollLine  { 0%, 100% { transform: scaleY(1); opacity: 1; } 50% { transform: scaleY(0.6); opacity: 0.4; } }
  .anuncios-section {
    background: #14110e;
    padding: 100px 40px;
    border-top: 1px solid rgba(155,45,142,0.2);
  }

  .anuncios-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .anuncios-kicker {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #9B2D8E;
    margin-bottom: 8px;
  }

  .anuncios-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .anuncios-header h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(34px, 4.6vw, 58px);
    font-weight: 300;
    color: #f5ede0;
    line-height: 1;
    margin: 0;
  }

  .anuncios-link {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(245,237,224,0.45);
    border-bottom: 1px solid rgba(245,237,224,0.2);
    padding-bottom: 2px;
  }

  .anuncios-carousel-wrap {
    position: relative;
  }

  .anuncios-carousel-viewport {
    overflow: hidden;
  }

  .anuncios-carousel-track {
    display: flex;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .anuncios-slide-link {
    min-width: 100%;
    text-decoration: none;
    display: block;
  }

  .anuncios-slide {
    height: clamp(300px, 40vw, 400px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 60px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .anuncios-slide-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
  }

  .anuncios-slide-img.banner {
    opacity: 0.25;
  }

  .anuncios-slide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(26,18,8,0.88) 0%, rgba(26,18,8,0.4) 55%, rgba(26,18,8,0.1) 100%);
  }

  .anuncios-bg-text {
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(80px, 20vw, 220px);
    color: rgba(255,255,255,0.06);
    line-height: 1;
    user-select: none;
    letter-spacing: 4px;
    white-space: nowrap;
  }

  .anuncios-content {
    position: relative;
    z-index: 1;
    max-width: 760px;
  }

  .anuncios-meta-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .anuncios-pill {
    font-family: 'Courier Prime', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #fff;
    background: rgba(255,255,255,0.18);
    padding: 4px 12px;
    backdrop-filter: blur(4px);
  }

  .anuncios-date {
    font-family: 'Courier Prime', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.55);
  }

  .anuncios-eyebrow {
    font-family: 'Courier Prime', monospace !important;
    font-size: 11px !important;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.65) !important;
    margin-bottom: 16px !important;
  }

  .anuncios-content h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 7vw, 80px);
    letter-spacing: 4px;
    color: #fff;
    line-height: 0.95;
    margin: 0 0 20px;
    max-width: 850px;
  }

  .anuncios-content p {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-style: italic;
    color: rgba(255,255,255,0.78);
    max-width: 620px;
    line-height: 1.55;
    margin: 0;
  }

  .anuncios-controls {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
  }

  .anuncios-arrow {
    width: 52px;
    height: 44px;
    border: 1px solid rgba(245,237,224,0.14);
    background: rgba(245,237,224,0.06);
    color: #f5ede0;
    cursor: pointer;
    font-size: 24px;
    backdrop-filter: blur(4px);
    transition: background 0.2s, border-color 0.2s;
  }

  .anuncios-arrow:hover {
    background: rgba(245,237,224,0.12);
    border-color: rgba(245,237,224,0.28);
  }

  .anuncios-dots {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 18px;
  }

  .anuncios-dots button {
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background: rgba(245,237,224,0.25);
    border: none;
    cursor: pointer;
    transition: width 0.3s ease, background 0.3s ease;
    padding: 0;
  }

  .anuncios-dots button.active {
    width: 28px;
    background: #9B2D8E;
  }

  @media (max-width: 900px) {
    .anuncios-section {
      padding: 80px 24px;
    }

    .anuncios-header {
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .anuncios-header h2 {
      font-size: clamp(36px, 8vw, 52px);
    }

    .anuncios-slide {
      height: auto;
      min-height: 360px;
      padding: 42px 34px;
      justify-content: center;
    }

    .anuncios-content h3 {
      font-size: clamp(42px, 11vw, 64px);
      line-height: 0.98;
      letter-spacing: 2px;
    }

    .anuncios-content p {
      font-size: 19px;
      line-height: 1.45;
    }

    .anuncios-bg-text {
      font-size: 140px;
      right: -80px;
      opacity: 0.7;
    }
  }

  @media (max-width: 520px) {
    .anuncios-section {
      padding: 72px 24px;
    }

    .anuncios-kicker {
      font-size: 10px;
      letter-spacing: 4px;
    }

    .anuncios-header {
      display: block;
    }

    .anuncios-header h2 {
      font-size: 40px;
      line-height: 1.02;
      margin-bottom: 22px;
    }

    .anuncios-slide {
      min-height: 330px;
      padding: 36px 26px;
      justify-content: center;
    }

    .anuncios-content {
      width: 100%;
      max-width: 100%;
    }

    .anuncios-content h3 {
      font-size: clamp(32px, 10.5vw, 46px);
      line-height: 1.05;
      letter-spacing: 1px;
      margin-bottom: 16px;
      max-width: 100%;
      word-break: keep-all;
      overflow-wrap: normal;
      hyphens: none;
      text-wrap: balance;
    }

    .anuncios-content p {
      font-size: 18px;
      line-height: 1.4;
      max-width: 100%;
    }

    .anuncios-eyebrow {
      font-size: 10px !important;
      letter-spacing: 3px;
      margin-bottom: 12px !important;
    }

    .anuncios-bg-text {
      font-size: 110px;
      right: -95px;
    }

    .anuncios-controls {
      margin-top: 14px;
    }

    .anuncios-arrow {
      width: 48px;
      height: 42px;
    }
  }
  .eventos-home-track::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1024px) {
    .eventos-home-track {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(220px, 240px)) !important;
      justify-content: center !important;
      gap: 22px !important;
      overflow-x: visible !important;
      padding: 8px 0 24px !important;
    }

    .evento-home-card-wrap {
      flex: unset !important;
      width: 100% !important;
    }

    .evento-home-card {
      aspect-ratio: auto !important;
      min-height: auto !important;
    }

    .evento-home-img {
      height: 150px !important;
    }

    .evento-home-info {
      min-height: 190px !important;
      padding: 20px 18px 22px !important;
    }
  }

  @media (max-width: 768px) {
    section {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }

    .eventos-home-track {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
      gap: 16px !important;
      align-items: stretch !important;
    }

    .evento-home-img {
      height: 120px !important;
    }

    .evento-home-info {
      min-height: 160px !important;
      padding: 16px 12px 18px !important;
    }

    .evento-home-info h3 {
      font-size: 18px !important;
      line-height: 1.15 !important;
      margin-bottom: 8px !important;
    }

    .evento-home-info p {
      font-size: 13px !important;
      line-height: 1.35 !important;
    }
  }

  @media (max-width: 420px) {
    .eventos-home-track {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 14px !important;
    }

    .evento-home-img {
      height: 105px !important;
    }

    .evento-home-info {
      min-height: 150px !important;
      padding: 14px 10px 16px !important;
    }

    .evento-home-info h3 {
      font-size: 16px !important;
    }

    .evento-home-info p {
      font-size: 12px !important;
    }
  }
`}</style>
    </main>
  )
}