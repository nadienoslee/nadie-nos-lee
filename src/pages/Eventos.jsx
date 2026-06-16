import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const filtros = ['Todos', 'Próximos', 'Pasados', 'Lectura', 'Taller', 'Presentación']

export default function Eventos() {
  usePageTitle('NADIE NOS LEE | EVENTOS')
  const [eventos, setEventos] = useState([])
  const [filtro, setFiltro]   = useState('Todos')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('eventos').select('*').eq('publicado', true).order('fecha', { ascending: true })
      if (data) setEventos(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('eventos-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const filtrados = eventos.filter(ev => {
    if (filtro === 'Todos') return true
    if (filtro === 'Próximos') return ev.estado === 'Próximo'
    if (filtro === 'Pasados') return ev.estado === 'Pasado'
    return ev.tipo?.toLowerCase().includes(filtro.toLowerCase())
  })

  const proximos = filtrados.filter(e => e.estado === 'Próximo')
  const pasados  = filtrados.filter(e => e.estado === 'Pasado')

const getFecha = (ev) =>
  ev.fecha ? new Date(`${ev.fecha}T12:00:00`).getDate().toString() : '—'

const getMes = (ev) =>
  ev.fecha
    ? new Date(`${ev.fecha}T12:00:00`)
        .toLocaleDateString('es-MX', { month: 'short' })
        .replace('.', '')
        .toUpperCase()
    : ''

  const getTextColor = (bgColor) => {
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
  return (
    <main>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(58,171,220,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 12vw, 140px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>EVENTOS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>Lecturas, talleres y encuentros. Donde la escritura sale de la página.</p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: 'none', border: 'none', color: filtro === f ? '#1a1208' : 'rgba(26,18,8,0.35)', borderBottom: filtro === f ? '3px solid #3AABDC' : '3px solid transparent', padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s' }}>{f}</button>
          ))}
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '60px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : (
            <>
              {proximos.length > 0 && (
                <>
                  {(filtro === 'Todos' || filtro === 'Próximos') && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 28 }}>Próximos eventos</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 64, alignItems: 'stretch' }}>
                    {proximos.map((ev, i) => (
                     <AnimatedSection key={ev.id} direction="up" delay={i * 0.08}>
<div style={{ border: `2px solid ${ev.color || '#9B2D8E'}22`, overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s', height: '100%', display: 'flex', flexDirection: 'column' }}
    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.1)'; e.currentTarget.style.borderColor = (ev.color || '#9B2D8E') + '66' }}
    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = (ev.color || '#9B2D8E') + '22' }}
  >
    {/* IMAGEN — link externo si hay link_url, si no va al detalle */}
    {ev.link_url ? (
      <a href={ev.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
        <div
          style={{
            height: 220,
            background: ev.imagen_url
              ? '#efe7dc'
              : `linear-gradient(135deg, ${ev.color || '#9B2D8E'}25 0%, ${ev.color || '#9B2D8E'}08 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {ev.imagen_url && (
            <>
              <img src={ev.imagen_url} alt={ev.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.58) 0%, rgba(26,18,8,0.18) 45%, rgba(26,18,8,0.08) 100%)' }} />
            </>
          )}
          {/* Badge link externo */}
          <span style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: 'rgba(26,18,8,0.7)', padding: '4px 10px', backdropFilter: 'blur(4px)', fontWeight: '700', borderRadius: 2 }}>
            Ver post →
          </span>
          <div style={{ position: 'absolute', top: 16, left: 16, background: ev.color || '#9B2D8E', padding: '10px 18px', textAlign: 'center', minWidth: 72, boxShadow: '0 10px 28px rgba(26,18,8,0.18)' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: getTextColor(ev.color), lineHeight: 1, fontWeight: '900' }}>{getFecha(ev)}</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: getTextColor(ev.color), textTransform: 'uppercase', fontWeight: '900' }}>{getMes(ev)}</div>
          </div>
          <span style={{ position: 'absolute', top: 16, right: 16, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: ev.imagen_url ? '#fff' : ev.color || '#9B2D8E', background: ev.imagen_url ? 'rgba(26,18,8,0.65)' : '#fff', padding: '4px 10px', backdropFilter: ev.imagen_url ? 'blur(4px)' : 'none', fontWeight: '700' }}>{ev.tipo}</span>
          {!ev.imagen_url && (<span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 140, color: '#ffffff', fontWeight: '900', opacity: 0.07, lineHeight: 1, userSelect: 'none' }}>{ev.tipo?.[0] || 'E'}</span>)}
        </div>
      </a>
    ) : (
      <Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            height: 220,
            background: ev.imagen_url
              ? '#efe7dc'
              : `linear-gradient(135deg, ${ev.color || '#9B2D8E'}25 0%, ${ev.color || '#9B2D8E'}08 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {ev.imagen_url && (
            <>
              <img src={ev.imagen_url} alt={ev.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.58) 0%, rgba(26,18,8,0.18) 45%, rgba(26,18,8,0.08) 100%)' }} />
            </>
          )}
          <div style={{ position: 'absolute', top: 16, left: 16, background: ev.color || '#9B2D8E', padding: '10px 18px', textAlign: 'center', minWidth: 72, boxShadow: '0 10px 28px rgba(26,18,8,0.18)' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: getTextColor(ev.color), lineHeight: 1, fontWeight: '900' }}>{getFecha(ev)}</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, color: getTextColor(ev.color), textTransform: 'uppercase', fontWeight: '900' }}>{getMes(ev)}</div>
          </div>
          <span style={{ position: 'absolute', top: 16, right: 16, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: ev.imagen_url ? '#fff' : ev.color || '#9B2D8E', background: ev.imagen_url ? 'rgba(26,18,8,0.65)' : '#fff', padding: '4px 10px', backdropFilter: ev.imagen_url ? 'blur(4px)' : 'none', fontWeight: '700' }}>{ev.tipo}</span>
          {!ev.imagen_url && (<span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 140, color: '#ffffff', fontWeight: '900', opacity: 0.07, lineHeight: 1, userSelect: 'none' }}>{ev.tipo?.[0] || 'E'}</span>)}
        </div>
      </Link>
    )}

    {/* CONTENIDO — siempre va al detalle del evento */}
<Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
<div style={{ padding: '28px 28px 32px', background: ev.color || '#9B2D8E', height: '100%', display: 'flex', flexDirection: 'column' }}>
  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: '900', color: getTextColor(ev.color), lineHeight: 1.25, marginBottom: 12, minHeight: 90, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.titulo}</h3>
  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.6, color: getTextColor(ev.color), fontWeight: '700', marginBottom: 16, minHeight: 145, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.descripcion}</p>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: getTextColor(ev.color), letterSpacing: 1, fontWeight: '900' }}>{ev.lugar}</p>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: getTextColor(ev.color), borderBottom: `1px solid ${getTextColor(ev.color)}`, fontWeight: '900' }}>Ver evento →</span>
        </div>
      </div>
    </Link>
  </div>
</AnimatedSection>
                    ))}
                  </div>
                </>
              )}

              {pasados.length > 0 && (
                <>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)', marginBottom: 28, borderTop: proximos.length > 0 ? '1px solid rgba(26,18,8,0.07)' : 'none', paddingTop: proximos.length > 0 ? 48 : 0 }}>Eventos pasados</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {pasados.map((ev, i) => (
<AnimatedSection key={ev.id} direction="up" delay={i * 0.08}>
  <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', overflow: 'hidden', opacity: 0.7, transition: 'opacity 0.3s' }}
    onMouseOver={e => e.currentTarget.style.opacity = '0.95'}
    onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
  >
    {/* IMAGEN — link externo si hay link_url, si no va al detalle */}
    {ev.link_url ? (
      <a href={ev.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
        <div
          style={{
            height: 170,
            background: ev.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${ev.color || '#9B2D8E'}15 0%, ${ev.color || '#9B2D8E'}05 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {ev.imagen_url && (
            <>
              <img src={ev.imagen_url} alt={ev.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(18%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,246,238,0.48) 0%, rgba(250,246,238,0.14) 100%)' }} />
            </>
          )}
          <span style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: 'rgba(26,18,8,0.7)', padding: '4px 10px', backdropFilter: 'blur(4px)', fontWeight: '700', borderRadius: 2 }}>Ver post →</span>
          <div style={{ position: 'absolute', top: 16, left: 16, background: ev.color || '#9B2D8E', padding: '6px 14px', textAlign: 'center', minWidth: 64, boxShadow: '0 8px 24px rgba(26,18,8,0.08)', border: `1px solid ${(ev.color || '#9B2D8E')}22` }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: getTextColor(ev.color), lineHeight: 1, fontWeight: '900' }}>{getFecha(ev)}</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, color: getTextColor(ev.color), textTransform: 'uppercase', fontWeight: '900' }}>{getMes(ev)}</div>
          </div>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: ev.imagen_url ? '#fff' : 'rgba(26,18,8,0.3)', position: 'absolute', top: 16, right: 16, border: ev.imagen_url ? 'none' : '1px solid rgba(26,18,8,0.15)', background: ev.imagen_url ? 'rgba(26,18,8,0.55)' : 'transparent', padding: '3px 8px', backdropFilter: ev.imagen_url ? 'blur(4px)' : 'none', fontWeight: '700' }}>Pasado</span>
          {!ev.imagen_url && (<span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 100, color: '#ffffff', fontWeight: '900', opacity: 0.06, lineHeight: 1 }}>{ev.tipo?.[0] || 'E'}</span>)}
        </div>
      </a>
    ) : (
      <Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            height: 170,
            background: ev.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${ev.color || '#9B2D8E'}15 0%, ${ev.color || '#9B2D8E'}05 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {ev.imagen_url && (
            <>
              <img src={ev.imagen_url} alt={ev.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(18%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,246,238,0.48) 0%, rgba(250,246,238,0.14) 100%)' }} />
            </>
          )}
          <div style={{ position: 'absolute', top: 16, left: 16, background: ev.color || '#9B2D8E', padding: '6px 14px', textAlign: 'center', minWidth: 64, boxShadow: '0 8px 24px rgba(26,18,8,0.08)', border: `1px solid ${(ev.color || '#9B2D8E')}22` }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: getTextColor(ev.color), lineHeight: 1, fontWeight: '900' }}>{getFecha(ev)}</div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, color: getTextColor(ev.color), textTransform: 'uppercase', fontWeight: '900' }}>{getMes(ev)}</div>
          </div>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: ev.imagen_url ? '#fff' : 'rgba(26,18,8,0.3)', position: 'absolute', top: 16, right: 16, border: ev.imagen_url ? 'none' : '1px solid rgba(26,18,8,0.15)', background: ev.imagen_url ? 'rgba(26,18,8,0.55)' : 'transparent', padding: '3px 8px', backdropFilter: ev.imagen_url ? 'blur(4px)' : 'none', fontWeight: '700' }}>Pasado</span>
          {!ev.imagen_url && (<span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 100, color: '#ffffff', fontWeight: '900', opacity: 0.06, lineHeight: 1 }}>{ev.tipo?.[0] || 'E'}</span>)}
        </div>
      </Link>
    )}

    {/* CONTENIDO — siempre va al detalle del evento */}
    <Link to={`/eventos/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ padding: '22px 24px 26px', background: ev.color || '#9B2D8E' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: '900', color: getTextColor(ev.color), lineHeight: 1.25, marginBottom: 8 }}>{ev.titulo}</h3>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: getTextColor(ev.color), letterSpacing: 1, fontWeight: '900' }}>{ev.lugar}</p>
      </div>
    </Link>
  </div>
</AnimatedSection>
                    ))}
                  </div>
                </>
              )}

              {filtrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: 'italic', color: 'rgba(26,18,8,0.3)' }}>No hay eventos en esta categoría.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}