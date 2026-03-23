import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

export default function Noticias() {
  usePageTitle('NADIE NOS LEE | NOTICIAS')
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)

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

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : noticias.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay noticias publicadas aún.</p>
          ) : noticias.map((n, i) => (
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
                </div>

                {/* Imagen */}
                {n.imagen_url && (
                  <div>
                    <img src={n.imagen_url} alt={n.titulo} style={{ width: '100%', height: 'auto', display: 'block', border: `1px solid ${n.color || '#8B1A1A'}22` }} />
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