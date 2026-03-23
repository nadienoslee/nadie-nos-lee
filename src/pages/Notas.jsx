import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const categorias = ['Todas', 'Ensayo', 'Reseña', 'Reflexión', 'Entrevista', 'Otro']

export default function Notas() {
  usePageTitle('NADIE NOS LEE | NOTAS')
  const [notas, setNotas]   = useState([])
  const [filtro, setFiltro] = useState('Todas')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('notas').select('*').eq('publicado', true).order('created_at', { ascending: false })
      if (data) setNotas(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('notas-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const filtradas = filtro === 'Todas' ? notas : notas.filter(n => n.categoria === filtro)

  return (
    <main style={{ paddingTop: 84 }}>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(139,26,26,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 60%, rgba(139,26,26,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#8B1A1A', marginBottom: 24 }}>Editorial</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 12vw, 140px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>NOTAS</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>Ensayos, reflexiones y crítica literaria del colectivo.</p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setFiltro(cat)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: 'none', border: 'none', color: filtro === cat ? '#1a1208' : 'rgba(26,18,8,0.35)', borderBottom: filtro === cat ? '3px solid #8B1A1A' : '3px solid transparent', padding: '18px 20px', cursor: 'pointer', transition: 'color 0.2s' }}>{cat}</button>
          ))}
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '40px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : filtradas.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '80px 0' }}>No hay notas publicadas aún.</p>
          ) : filtradas.map((nota, i) => (
            <AnimatedSection key={nota.id} direction="right" delay={i * 0.08}>
<div style={{ padding: '44px 0', borderBottom: '1px solid rgba(26,18,8,0.07)', cursor: 'pointer', transition: 'padding-left 0.3s' }}
  onMouseOver={e => e.currentTarget.style.paddingLeft = '16px'}
  onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}
>
  <div style={{ display: 'grid', gridTemplateColumns: nota.imagen_url ? '1fr auto' : '1fr auto', gap: 32, alignItems: 'start' }}>
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#8B1A1A', background: '#8B1A1A15', padding: '5px 12px' }}>{nota.categoria || 'Nota'}</span>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.3)', letterSpacing: 1 }}>
          {nota.fecha_publicacion ? new Date(nota.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </span>
        {nota.minutos_lectura && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.25)' }}>{nota.minutos_lectura} min de lectura</span>}
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 400, color: '#1a1208', lineHeight: 1.2, marginBottom: 16 }}>{nota.titulo}</h2>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, lineHeight: 1.75, color: 'rgba(26,18,8,0.55)', maxWidth: 680 }}>{nota.extracto}</p>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, color: 'rgba(26,18,8,0.35)', textTransform: 'uppercase', marginTop: 16 }}>{nota.autor}</p>
    </div>
    {nota.imagen_url ? (
      <img src={nota.imagen_url} alt={nota.titulo} style={{ width: 200, height: 140, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(139,26,26,0.12)' }} />
    ) : (
      <span style={{ color: 'rgba(26,18,8,0.2)', fontSize: 24, marginTop: 8 }}>→</span>
    )}
  </div>
</div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </main>
  )
}