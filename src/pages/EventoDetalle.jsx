import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function EventoDetalle() {
  const { id } = useParams()
  const [ev, setEv]           = useState(null)
  const [cargando, setCargando] = useState(true)

  usePageTitle(`NADIE NOS LEE | ${ev?.titulo || 'EVENTO'}`)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single()
      setEv(data || null)
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, color: 'rgba(26,18,8,0.35)' }}>Cargando...</p>
    </main>
  )

  if (!ev) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: 'rgba(26,18,8,0.4)', fontStyle: 'italic' }}>Evento no encontrado.</p>
        <Link to="/eventos" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#9B2D8E', display: 'inline-block', marginTop: 20 }}>← Volver a eventos</Link>
      </div>
    </main>
  )

  const color     = ev.color || '#9B2D8E'
  const gradiente = ev.gradiente || `linear-gradient(135deg, ${color}22, ${color}08)`

const fechaFormateada = ev.fecha
  ? new Date(`${ev.fecha}T12:00:00`).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  : '—'
  return (
    <main>
      {/* HERO */}
      <section style={{ background: gradiente, borderBottom: `3px solid ${color}33`, padding: '80px 40px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link to="/eventos" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.45)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = color}
            onMouseOut={e => e.target.style.color = 'rgba(26,18,8,0.45)'}
          >← Volver a eventos</Link>

          <AnimatedSection direction="up">
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: color, padding: '5px 14px' }}>{ev.tipo}</span>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.55)', letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(26,18,8,0.06)', padding: '4px 12px' }}>{ev.estado}</span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 80px)', letterSpacing: 3, color: '#1a1208', lineHeight: 0.95, marginBottom: 24 }}>{ev.titulo}</h1>
          </AnimatedSection>
        </div>
      </section>

      {/* CONTENIDO */}
      <section style={{ background: '#faf6ee', padding: '60px 40px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60 }}>

          <AnimatedSection direction="right">
            {/* Imagen o placeholder */}
{ev.imagen_url ? (
  ev.link_url ? (
    <a href={ev.link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative', marginBottom: 32 }}>
      <img
        src={ev.imagen_url}
        alt={ev.titulo}
        style={{
          width: '100%',
          aspectRatio: '16/9',
          objectFit: 'cover',
          border: `2px solid ${color}22`,
          boxShadow: '0 18px 40px rgba(26,18,8,0.08)',
          display: 'block',
          transition: 'opacity 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      />
      <span style={{
        position: 'absolute', bottom: 12, right: 12,
        fontFamily: "'Courier Prime', monospace",
        fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
        color: '#fff', background: 'rgba(26,18,8,0.7)',
        padding: '4px 10px', backdropFilter: 'blur(4px)',
        fontWeight: '700', borderRadius: 2,
      }}>Ver post →</span>
    </a>
  ) : (
    <img
      src={ev.imagen_url}
      alt={ev.titulo}
      style={{
        width: '100%',
        aspectRatio: '16/9',
        objectFit: 'cover',
        border: `2px solid ${color}22`,
        marginBottom: 32,
        boxShadow: '0 18px 40px rgba(26,18,8,0.08)',
      }}
    />
  )
) : (
  <div
    style={{
      width: '100%',
      aspectRatio: '16/9',
      background: gradiente,
      border: `2px solid ${color}33`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    }}
  >
    <span
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 80,
        color,
        opacity: 0.2,
      }}
    >
      {ev.tipo?.[0] || 'E'}
    </span>
  </div>
)}

            {/* Info básica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { label: 'Fecha',     valor: fechaFormateada },
                { label: 'Horario',   valor: ev.hora },
                { label: 'Lugar',     valor: ev.lugar },
                { label: 'Dirección', valor: ev.direccion },
              ].filter(i => i.valor).map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: '1px solid rgba(26,18,8,0.07)' }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color, minWidth: 80, paddingTop: 3 }}>{item.label}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#1a1208', lineHeight: 1.4 }}>{item.valor}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection direction="left" delay={0.1}>
            <div>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 20 }}>Sobre el evento</p>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.9, color: 'rgba(26,18,8,0.7)', whiteSpace: 'pre-line', marginBottom: 48 }}>
                {ev.descripcion_larga || ev.descripcion}
              </div>

              {ev.estado === 'Próximo' && (
                <Link to="/talleres" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', background: color, color: '#fff', border: 'none', padding: '18px 36px', display: 'inline-block', transition: 'opacity 0.2s, transform 0.2s' }}
                  onMouseOver={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-2px)' }}
                  onMouseOut={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
                >Inscribirme a este evento →</Link>
              )}
            </div>
          </AnimatedSection>

        </div>
      </section>
    </main>
  )
}