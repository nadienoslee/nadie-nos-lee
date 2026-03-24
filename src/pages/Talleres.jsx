import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

function parseFecha(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function diasRestantes(fecha) {
  if (!fecha) return null
  const f = parseFecha(fecha)
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.ceil((f - hoy) / (1000 * 60 * 60 * 24))
}

function useCountdown(fecha) {
  const [restante, setRestante] = useState(null)
  useEffect(() => {
    if (!fecha) return
    const calcular = () => {
      const f = parseFecha(fecha)
      if (!f) return
      f.setHours(23, 59, 59, 0)
      const diff = f - new Date()
      if (diff <= 0) { setRestante({ expirado: true }); return }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setRestante({ d, h, m, s, expirado: false })
    }
    calcular()
    const t = setInterval(calcular, 1000)
    return () => clearInterval(t)
  }, [fecha])
  return restante
}

function CountdownInline({ fecha, color }) {
  const cd = useCountdown(fecha)
  const dias = diasRestantes(fecha)
  const urgente = dias !== null && dias <= 7 && dias >= 0
  if (!cd) return null
  if (cd.expirado) return (
    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>Inscripción cerrada</span>
  )
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[{ v: cd.d, u: 'd' }, { v: cd.h, u: 'h' }, { v: cd.m, u: 'm' }, { v: cd.s, u: 's' }].map(({ v, u }) => (
        <div key={u} style={{ background: 'rgba(0,0,0,0.25)', padding: '3px 6px', textAlign: 'center', minWidth: 32 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#fff', lineHeight: 1 }}>{String(v).padStart(2, '0')}</div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 7, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>{u}</div>
        </div>
      ))}
      {urgente && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: '#fff', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700', marginLeft: 4 }}>¡Últimos días!</span>}
    </div>
  )
}

function getTextColor(bgColor) {
  if (!bgColor) return '#1a1208'
  let color = bgColor.replace('#', '')
  if (color.length === 3) color = color.split('').map(c => c + c).join('')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#1a1208' : '#ffffff'
}

const FILTROS_PERIODO = [
  { id: 'todos',  label: 'Todos' },
  { id: 'hoy',    label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes',    label: 'Este mes' },
]



function filtrarPorPeriodo(talleres, periodo) {
  if (periodo === 'todos') return talleres
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return talleres.filter(t => {
    const fecha = t.fecha_cierre || t.fecha
    if (!fecha) return false
    const f = parseFecha(fecha); if (!f) return false
    f.setHours(0,0,0,0)
    if (periodo === 'hoy') return f.getTime() === hoy.getTime()
    if (periodo === 'semana') { const fin = new Date(hoy); fin.setDate(hoy.getDate() + 6); return f >= hoy && f <= fin }
    if (periodo === 'mes') return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear()
    return true
  })
}

export default function Talleres() {
  usePageTitle('NADIE NOS LEE | TALLERES')
  const [talleres, setTalleres]     = useState([])
  const [cargando, setCargando]     = useState(true)
const [filtroPeriodo, setFiltroPeriodo] = useState('todos')

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('talleres').select('*').eq('activo', true).order('fecha', { ascending: true })
      if (data) setTalleres(data)
      setCargando(false)
    }
    cargar()
    const ch = supabase.channel('talleres-pub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'talleres' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

const filtrados = filtrarPorPeriodo(talleres, filtroPeriodo)

  const proximos = filtrados.filter(t => {
    if (!t.fecha) return true
    const f = parseFecha(t.fecha); f.setHours(0,0,0,0)
    return f >= new Date(new Date().setHours(0,0,0,0))
  })
  const pasados = filtrados.filter(t => {
    if (!t.fecha) return false
    const f = parseFecha(t.fecha); f.setHours(0,0,0,0)
    return f < new Date(new Date().setHours(0,0,0,0))
  })

  return (
    <main>
      {/* HERO */}
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(58,171,220,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(58,171,220,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3AABDC', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 12vw, 140px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>TALLERES</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>
              Espacios de escritura colectiva. Aprende, comparte, escribe.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FILTROS */}
<section style={{ background: '#faf6ee', padding: '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTROS_PERIODO.map(f => (
            <button key={f.id} onClick={() => setFiltroPeriodo(f.id)} style={{
              fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              background: 'none', border: 'none', color: filtroPeriodo === f.id ? '#1a1208' : 'rgba(26,18,8,0.35)',
              borderBottom: filtroPeriodo === f.id ? '3px solid #3AABDC' : '3px solid transparent',
              padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s',
            }}>{f.label}</button>
          ))}
        </div>
      </section>

      {/* CARDS */}
      <section style={{ background: '#faf6ee', padding: '60px 40px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {cargando ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: 'italic', color: 'rgba(26,18,8,0.3)' }}>No hay talleres en esta categoría.</p>
            </div>
          ) : (
            <>
              {proximos.length > 0 && (
                <>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 28 }}>Próximos talleres</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 64 }}>
                    {proximos.map((t, i) => <TallerCard key={t.id} t={t} i={i} />)}
                  </div>
                </>
              )}
              {pasados.length > 0 && (
                <>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.3)', marginBottom: 28, borderTop: proximos.length > 0 ? '1px solid rgba(26,18,8,0.07)' : 'none', paddingTop: proximos.length > 0 ? 48 : 0 }}>Talleres pasados</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                    {pasados.map((t, i) => <TallerCard key={t.id} t={t} i={i} pasado />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function TallerCard({ t, i, pasado = false }) {
  const color = t.color || '#3AABDC'
  const tc = getTextColor(color)
  const cupoUsado = (t.cupo_total || 0) - (t.cupo_disponible || 0)
  const porcentaje = t.cupo_tipo === 'limitado' && t.cupo_total ? (cupoUsado / t.cupo_total) * 100 : 0
  const agotado = t.cupo_tipo === 'limitado' && t.cupo_disponible !== null && t.cupo_disponible <= 0
  const fecha = t.fecha ? parseFecha(t.fecha) : null

  return (
    <AnimatedSection direction="up" delay={i * 0.08}>
      <Link to={`/talleres/${t.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ background: '#fff', border: `2px solid ${color}22`, overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s', opacity: pasado ? 0.72 : 1 }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,18,8,0.1)'; e.currentTarget.style.borderColor = color + '66' }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = color + '22' }}
        >
          {/* IMAGEN */}
          <div style={{ height: 220, background: t.imagen_url ? '#efe7dc' : `linear-gradient(135deg, ${color}33 0%, ${color}10 100%)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {t.imagen_url && (
              <>
                <img src={t.imagen_url} alt={t.titulo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: pasado ? 'grayscale(20%)' : 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.7) 0%, rgba(26,18,8,0.15) 50%, rgba(26,18,8,0.05) 100%)' }} />
              </>
            )}
            {!t.imagen_url && <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 120, color, opacity: 0.08, lineHeight: 1, userSelect: 'none' }}>T</span>}

            {/* Nivel badge */}
            {t.nivel && <span style={{ position: 'absolute', top: 16, left: 16, fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', background: color, padding: '4px 12px', fontWeight: '700' }}>{t.nivel}</span>}

            {/* Modalidad */}
            {t.modalidad && <span style={{ position: 'absolute', top: 16, right: 16, fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, color: '#fff', border: '1px solid rgba(255,255,255,0.5)', padding: '3px 8px', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>{t.modalidad}</span>}

            {/* Costo badge */}
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              {t.fecha_cierre && !pasado ? (
                <CountdownInline fecha={t.fecha_cierre} color={color} />
              ) : null}
            </div>



          </div>

{/* INFO */}
          <div style={{ padding: '22px 24px 20px', background: color }}>
            {fecha && (
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: tc === '#fff' ? 'rgba(255,255,255,0.75)' : 'rgba(26,18,8,0.6)', letterSpacing: 1, marginBottom: 8 }}>
                {fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                {t.horario ? ` · ${t.horario}` : ''}
              </p>
            )}
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: tc, lineHeight: 1.2, marginBottom: 10 }}>{t.titulo}</h3>
            {t.instructor && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: tc === '#fff' ? 'rgba(255,255,255,0.75)' : 'rgba(26,18,8,0.65)', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>Con {t.instructor}</p>}
            {t.descripcion && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.6, color: tc === '#fff' ? 'rgba(255,255,255,0.85)' : 'rgba(26,18,8,0.72)', marginBottom: 16 }}>{t.descripcion.length > 90 ? t.descripcion.slice(0, 90) + '...' : t.descripcion}</p>}

            {/* Precio */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700', color: '#fff', background: t.es_gratis !== false ? 'rgba(34,161,106,0.85)' : 'rgba(0,0,0,0.25)', padding: '5px 14px' }}>
                {t.es_gratis !== false ? '✓ Gratuito' : `$${t.costo || 0}`}
              </span>
            </div>

            {/* Cupo */}
            {t.cupo_tipo === 'limitado' && t.cupo_total && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, color: tc === '#fff' ? 'rgba(255,255,255,0.8)' : 'rgba(26,18,8,0.6)', textTransform: 'uppercase', fontWeight: '700' }}>
                    {agotado ? '⚠ Cupo lleno' : `${t.cupo_disponible} lugares disponibles`}
                  </span>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: tc === '#fff' ? 'rgba(255,255,255,0.6)' : 'rgba(26,18,8,0.45)', fontWeight: '700' }}>{cupoUsado}/{t.cupo_total}</span>
                </div>
                <div style={{ height: 6, background: tc === '#fff' ? 'rgba(255,255,255,0.2)' : 'rgba(26,18,8,0.12)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${porcentaje}%`, background: agotado ? '#ef4444' : (tc === '#fff' ? 'rgba(255,255,255,0.85)' : 'rgba(26,18,8,0.65)'), borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            )}
            {t.cupo_tipo === 'libre' && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, color: tc === '#fff' ? 'rgba(255,255,255,0.8)' : 'rgba(26,18,8,0.6)', textTransform: 'uppercase', fontWeight: '700' }}>∞ Cupo abierto</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: tc, borderBottom: `1px solid ${tc === '#fff' ? 'rgba(255,255,255,0.55)' : 'rgba(26,18,8,0.35)'}`, fontWeight: '700' }}>
                {agotado ? 'Ver taller →' : 'Inscribirme →'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </AnimatedSection>
  )
}