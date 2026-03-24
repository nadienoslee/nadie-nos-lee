import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const filtrosFecha = ['Todos', 'Hoy', 'Esta semana', 'Este mes']

export default function Noticias() {
  usePageTitle('NADIE NOS LEE | NOTICIAS')
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('Todos')

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('noticias').select('*').eq('publicado', true).order('fecha_publicacion', { ascending: false })
      if (data) setNoticias(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('noticias-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'noticias' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const filtradas = noticias.filter(n => {
    if (filtro === 'Todos') return true
    const fecha = n.fecha_publicacion ? new Date(n.fecha_publicacion) : null
    if (!fecha) return filtro === 'Todos'
    const hoy = new Date()
    if (filtro === 'Hoy') {
      return fecha.toDateString() === hoy.toDateString()
    }
    if (filtro === 'Esta semana') {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      return fecha >= inicioSemana
    }
    if (filtro === 'Este mes') {
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    }
    return true
  })

  return (
    <main style={{ paddingTop: 84 }}>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(139,26,26,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 60%, rgba(139,26,26,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 12vw, 140px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>NOTICIAS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>El pulso informativo del colectivo.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* FILTROS */}
      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {filtrosFecha.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: 'none', border: 'none', color: filtro === f ? '#1a1208' : 'rgba(26,18,8,0.35)', borderBottom: filtro === f ? '3px solid #8B1A1A' : '3px solid transparent', padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s' }}>{f}</button>
          ))}
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.3)', letterSpacing: 1, marginLeft: 'auto' }}>
            {filtradas.length} {filtradas.length === 1 ? 'noticia' : 'noticias'}
          </span>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', marginBottom: 20 }}>
                No hay noticias {filtro !== 'Todos' ? `para "${filtro.toLowerCase()}"` : 'publicadas aún'}.
              </p>
              {filtro !== 'Todos' && (
                <button onClick={() => setFiltro('Todos')} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: 'none', border: '1px solid rgba(26,18,8,0.2)', color: 'rgba(26,18,8,0.5)', padding: '10px 20px', cursor: 'pointer' }}>
                  Ver todas →
                </button>
              )}
            </div>
          ) : filtradas.map((n, i) => (
            <AnimatedSection key={n.id} direction="right" delay={i * 0.08}>
              <div style={{ display: 'grid', gridTemplateColumns: n.imagen_url ? '1fr 1fr' : '1fr', gap: 48, alignItems: 'start', padding: '56px 0', borderBottom: '1px solid rgba(26,18,8,0.07)' }}>

                {/* Texto */}
                <div>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: n.color || '#8B1A1A', padding: '5px 14px' }}>{n.categoria || 'Noticia'}</span>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.35)', letterSpacing: 1 }}>
                      {n.fecha_publicacion ? new Date(n.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 400, lineHeight: 1.2, color: '#1a1208', marginBottom: 22 }}>{n.titulo}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, lineHeight: 1.85, color: 'rgba(26,18,8,0.6)' }}>{n.cuerpo}</p>
                  {n.link_url && (
                    <a href={n.link_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: n.color || '#8B1A1A', borderBottom: `1px solid ${n.color || '#8B1A1A'}`, paddingBottom: 2, display: 'inline-block', marginTop: 24, textDecoration: 'none' }}>
                      Ver publicación original →
                    </a>
                  )}
                </div>

                {/* Imagen con link externo */}
                {n.imagen_url && (
                  <div style={{ position: 'relative' }}>
                    {n.link_url ? (
                      <a href={n.link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
                        <img
                          src={n.imagen_url}
                          alt={n.titulo}
                          style={{ width: '100%', height: 'auto', display: 'block', border: `1px solid ${n.color || '#8B1A1A'}22`, transition: 'opacity 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        />
                        <span style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: 'rgba(26,18,8,0.7)', padding: '4px 10px', backdropFilter: 'blur(4px)', fontWeight: '700', borderRadius: 2 }}>
                          Ver post →
                        </span>
                      </a>
                    ) : (
                      <img src={n.imagen_url} alt={n.titulo} style={{ width: '100%', height: 'auto', display: 'block', border: `1px solid ${n.color || '#8B1A1A'}22` }} />
                    )}
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </main>
  )
}