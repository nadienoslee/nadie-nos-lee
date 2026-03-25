import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const TIPO_COLOR = {
  evento:       '#3AABDC',
  taller:       '#9B2D8E',
  noticia:      '#8B1A1A',
  convocatoria: '#b8943a',
}
const TIPO_LABEL = {
  evento: 'Evento', taller: 'Taller', noticia: 'Noticia', convocatoria: 'Convocatoria'
}

export default function Calendario() {
  usePageTitle('NADIE NOS LEE | CALENDARIO')
  const hoy = new Date()
  const [mes, setMes]                         = useState(hoy.getMonth())
  const [anio, setAnio]                       = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [items, setItems]                     = useState([])
  const [cargando, setCargando]               = useState(true)
  const [filtroTipo, setFiltroTipo]           = useState('todos')

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
const [{ data: ev }, { data: tal }, { data: not }, { data: conv }] = await Promise.all([
        supabase.from('eventos').select('id, titulo, fecha, color, tipo, imagen_url, descripcion, lugar, estado').eq('publicado', true),
       supabase.from('talleres').select('id, titulo, fecha, color, imagen_url, descripcion, lugar, instructor, nivel').eq('activo', true),
        supabase.from('noticias').select('id, titulo, fecha_publicacion, color, categoria, imagen_url, cuerpo').eq('publicado', true),
        supabase.from('convocatorias').select('id, titulo, fecha_cierre, color, imagen_url, descripcion, estado, generos').eq('publicado', true),
      ])

      const todos = [
        ...(ev   || []).map(e => ({ id: `ev-${e.id}`,   rawId: e.id, tipo: 'evento',       label: e.titulo, fecha: e.fecha,            color: e.color || TIPO_COLOR.evento,       sub: e.tipo || 'Evento',         imagen_url: e.imagen_url, descripcion: e.descripcion, detalle1: e.lugar,      detalle2: e.estado,     href: `/eventos/${e.id}` })),
       ...(tal  || []).map(t => ({ id: `tal-${t.id}`,  rawId: t.id, tipo: 'taller',       label: t.titulo, fecha: t.fecha,             color: t.color || TIPO_COLOR.taller,       sub: 'Taller',                   imagen_url: t.imagen_url, descripcion: t.descripcion, detalle1: t.instructor, detalle2: t.nivel,      href: `/talleres/${t.id}` })),
        ...(not  || []).map(n => ({ id: `not-${n.id}`,  rawId: n.id, tipo: 'noticia',      label: n.titulo, fecha: n.fecha_publicacion, color: n.color || TIPO_COLOR.noticia,      sub: n.categoria || 'Noticia',   imagen_url: n.imagen_url, descripcion: n.cuerpo,      detalle1: n.categoria,  detalle2: null,         href: `/noticias` })),
        ...(conv || []).map(c => ({ id: `cv-${c.id}`,   rawId: c.id, tipo: 'convocatoria', label: c.titulo, fecha: c.fecha_cierre,      color: c.color || TIPO_COLOR.convocatoria, sub: 'Convocatoria',             imagen_url: c.imagen_url, descripcion: c.descripcion, detalle1: c.estado,     detalle2: c.generos?.join(', '), href: `/convocatorias/${c.id}` })),
      ].filter(x => x.fecha)

      setItems(todos)
      setCargando(false)
    }
    cargar()

    const chs = ['eventos','talleres','noticias','convocatorias'].map((tabla, i) =>
      supabase.channel(`cal-pub-${tabla}`).on('postgres_changes', { event: '*', schema: 'public', table: tabla }, cargar).subscribe()
    )
    return () => chs.forEach(ch => supabase.removeChannel(ch))
  }, [])

  const itemsFiltrados = filtroTipo === 'todos' ? items : items.filter(it => it.tipo === filtroTipo)

// Parsea "2026-06-25" o "2026-06-25T..." sin problemas de timezone
  const parseFecha = (dateStr) => {
    if (!dateStr) return null
    const s = dateStr.split('T')[0]
    const [y, m, d] = s.split('-').map(Number)
    return { year: y, month: m - 1, day: d }
  }

  const itemsDelDia = (dia) => {
    if (!dia) return []
    return itemsFiltrados.filter(it => {
      const f = parseFecha(it.fecha)
      return f && f.day === dia && f.month === mes && f.year === anio
    })
  }

  const itemsDelMes = itemsFiltrados.filter(it => {
    const f = parseFecha(it.fecha)
    return f && f.month === mes && f.year === anio
  }).sort((a, b) => {
    const fa = parseFecha(a.fecha), fb = parseFecha(b.fecha)
    if (!fa || !fb) return 0
    return (fa.year * 10000 + fa.month * 100 + fa.day) - (fb.year * 10000 + fb.month * 100 + fb.day)
  })

  const itemsDiaSeleccionado = diaSeleccionado ? itemsDelDia(diaSeleccionado) : []

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  const anterior  = () => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1); setDiaSeleccionado(null) }
  const siguiente = () => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1); setDiaSeleccionado(null) }

  const resumenMes = ['evento','taller','noticia','convocatoria'].map(tipo => ({
    tipo, color: TIPO_COLOR[tipo], label: TIPO_LABEL[tipo],
    count: items.filter(it => {
      if (!it.fecha) return false
      const f = new Date(it.fecha)
      return it.tipo === tipo && f.getMonth() === mes && f.getFullYear() === anio
    }).length,
  })).filter(r => r.count > 0)

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const btnNavStyle = { background: '#fff', border: '1px solid rgba(26,18,8,0.15)', color: '#1a1208', padding: isMobile ? '10px 16px' : '12px 24px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: isMobile ? 18 : 16, transition: 'border-color 0.2s', borderRadius: 4 }

  return (
    <main>
   {/* HERO */}
      <section style={{ background: '#f5ede0', padding: isMobile ? '80px 20px 60px' : '100px 40px 80px', borderBottom: '1px solid rgba(155,45,142,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(155,45,142,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 10vw, 120px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>CALENDARIO</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>
              Eventos, talleres, noticias y convocatorias del colectivo.
            </p>
          </AnimatedSection>
        </div>
      </section>

{/* FILTROS */}
      <section style={{ background: '#faf6ee', padding: isMobile ? '0 12px' : '0 40px', borderBottom: '1px solid rgba(26,18,8,0.06)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 4, flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[{ id: 'todos', label: 'Todos' }, ...Object.entries(TIPO_LABEL).map(([id, label]) => ({ id, label }))].map(f => (
            <button key={f.id} onClick={() => { setFiltroTipo(f.id); setDiaSeleccionado(null) }}
              style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: 'none', border: 'none', color: filtroTipo === f.id ? '#1a1208' : 'rgba(26,18,8,0.35)', borderBottom: filtroTipo === f.id ? `3px solid ${f.id === 'todos' ? '#9B2D8E' : TIPO_COLOR[f.id]}` : '3px solid transparent', padding: '18px 16px', cursor: 'pointer', transition: 'color 0.2s' }}
            >{f.label}</button>
          ))}
        </div>
      </section>

<section style={{ background: '#faf6ee', padding: isMobile ? '32px 16px 80px' : '60px 40px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* RESUMEN DEL MES */}
          {resumenMes.length > 0 && (
            <AnimatedSection direction="up">
              <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
                {resumenMes.map(r => (
                  <button key={r.tipo} onClick={() => { setFiltroTipo(filtroTipo === r.tipo ? 'todos' : r.tipo); setDiaSeleccionado(null) }}
                    style={{ padding: '12px 20px', background: filtroTipo === r.tipo ? r.color : r.color + '10', border: `1px solid ${r.color}33`, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: filtroTipo === r.tipo ? '#fff' : r.color, lineHeight: 1 }}>{r.count}</span>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: filtroTipo === r.tipo ? '#fff' : r.color, fontWeight: '700' }}>{r.label}{r.count !== 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </AnimatedSection>
          )}

         <div style={{ display: 'grid', gridTemplateColumns: (diaSeleccionado && !isMobile) ? 'repeat(auto-fit, minmax(560px, 1fr))' : '1fr', gap: 32, alignItems: 'start' }}>

            {/* CALENDARIO */}
            <AnimatedSection direction="up">
              <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,18,8,0.05)' }}>

                {/* Navegación mes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(26,18,8,0.07)' }}>
                  <button onClick={anterior} style={btnNavStyle}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#9B2D8E'; e.currentTarget.style.color = '#9B2D8E' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(26,18,8,0.15)'; e.currentTarget.style.color = '#1a1208' }}
                  >←</button>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 5, color: '#1a1208', textTransform: 'capitalize' }}>{meses[mes]} {anio}</h2>
                  <button onClick={siguiente} style={btnNavStyle}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#9B2D8E'; e.currentTarget.style.color = '#9B2D8E' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(26,18,8,0.15)'; e.currentTarget.style.color = '#1a1208' }}
                  >→</button>
                </div>

                {/* Cabecera días semana */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(26,18,8,0.05)' }}>
                  {diasSemana.map(d => (
                    <div key={d} style={{ textAlign: 'center', padding: '12px 4px', fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.35)', fontWeight: '700' }}>{d}</div>
                  ))}
                </div>

                {/* Grilla días */}
                {cargando ? (
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>Cargando...</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {celdas.map((dia, idx) => {
                      const itemsHoy = dia ? itemsDelDia(dia) : []
                      const esHoy = dia && dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
                      // (sin cambio — hoy usa getDate() local que sí es correcto)
                      const seleccionado = dia && dia === diaSeleccionado
                      return (
                      <div key={idx}
                          onClick={() => dia && setDiaSeleccionado(seleccionado ? null : dia)}
                          style={{ minHeight: isMobile ? 48 : 90, padding: isMobile ? '4px 2px' : '8px 6px 6px', borderRight: '1px solid rgba(26,18,8,0.04)', borderBottom: '1px solid rgba(26,18,8,0.04)', background: seleccionado ? 'rgba(155,45,142,0.07)' : esHoy ? 'rgba(58,171,220,0.05)' : '#fff', cursor: dia ? 'pointer' : 'default', transition: 'background 0.15s' }}
                          onMouseOver={e => { if (dia && !seleccionado) e.currentTarget.style.background = 'rgba(26,18,8,0.025)' }}
                          onMouseOut={e => { if (dia && !seleccionado) e.currentTarget.style.background = esHoy ? 'rgba(58,171,220,0.05)' : '#fff' }}
                        >
                          {dia && (
                            <>
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: isMobile ? 10 : 12, fontWeight: '700', color: esHoy ? '#3AABDC' : seleccionado ? '#9B2D8E' : 'rgba(26,18,8,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: isMobile ? 20 : 26, height: isMobile ? 20 : 26, borderRadius: '50%', background: esHoy ? 'rgba(58,171,220,0.15)' : seleccionado ? 'rgba(155,45,142,0.12)' : 'transparent', marginBottom: isMobile ? 2 : 4 }}>{dia}</span>
{!isMobile && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {itemsHoy.slice(0, 3).map(it => (
                                    <div key={it.id} style={{ background: it.color + '20', borderLeft: `2px solid ${it.color}`, padding: '1px 5px', borderRadius: '0 2px 2px 0', overflow: 'hidden' }}>
                                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: it.color, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', letterSpacing: 0.3 }}>{it.label}</span>
                                    </div>
                                  ))}
                                  {itemsHoy.length > 3 && (
                                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: 'rgba(26,18,8,0.4)', paddingLeft: 4 }}>+{itemsHoy.length - 3} más</span>
                                  )}
                                </div>
                              )}
                              {isMobile && itemsHoy.length > 0 && (
                                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                                  {itemsHoy.slice(0, 2).map(it => (
                                    <div key={it.id} style={{ width: 5, height: 5, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
                                  ))}
                                  {itemsHoy.length > 2 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(26,18,8,0.25)', flexShrink: 0 }} />}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Leyenda */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(26,18,8,0.05)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {Object.entries(TIPO_COLOR).map(([tipo, color]) => (
                    <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(26,18,8,0.45)', fontWeight: '700' }}>{TIPO_LABEL[tipo]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* PANEL DÍA SELECCIONADO */}
            {diaSeleccionado && (
              <AnimatedSection direction="left">
                <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,18,8,0.05)' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(26,18,8,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#1a1208', lineHeight: 1 }}>{diaSeleccionado}</p>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', fontWeight: '700' }}>
                        {new Date(anio, mes, diaSeleccionado).toLocaleDateString('es-MX', { weekday: 'long', month: 'long' })}
                      </p>
                    </div>
                    <button onClick={() => setDiaSeleccionado(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(26,18,8,0.35)', fontSize: 20 }}>✕</button>
                  </div>
<div style={{ padding: '16px', maxHeight: 560, overflowY: 'auto' }}>
                    {itemsDiaSeleccionado.length === 0 ? (
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '28px 0' }}>Sin actividad este día</p>
                    ) : itemsDiaSeleccionado.map(it => (
                      <div key={it.id} style={{ marginBottom: 16, border: `2px solid ${it.color}22`, borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(26,18,8,0.06)' }}>
                        {/* Imagen */}
                        {it.imagen_url ? (
                          <div style={{ height: 160, background: '#efe7dc', position: 'relative', overflow: 'hidden' }}>
                            <img src={it.imagen_url} alt={it.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.5) 0%, transparent 60%)' }} />
                            <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: '#fff', background: it.color, padding: '3px 10px', fontWeight: '700' }}>{TIPO_LABEL[it.tipo]}</span>
                          </div>
                        ) : (
                          <div style={{ height: 80, background: `linear-gradient(135deg, ${it.color}22 0%, ${it.color}08 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: it.color, opacity: 0.12, lineHeight: 1 }}>{it.label?.[0] || 'N'}</span>
                            <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: it.color, background: it.color + '18', padding: '3px 10px', borderRadius: 999, fontWeight: '700' }}>{TIPO_LABEL[it.tipo]}</span>
                          </div>
                        )}

                        {/* Info */}
                        <div style={{ padding: '16px', background: it.color }}>
                          {it.sub && it.sub !== TIPO_LABEL[it.tipo] && (
                            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: '700' }}>{it.sub}</p>
                          )}
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#fff', fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{it.label}</p>
                          {it.descripcion && (
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 10 }}>
                              {it.descripcion.length > 120 ? it.descripcion.slice(0, 120) + '...' : it.descripcion}
                            </p>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            {it.detalle1 && (
                              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, fontWeight: '700' }}>{it.detalle1}</p>
                            )}
                            <Link to={it.href} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.6)', paddingBottom: 1, textDecoration: 'none', fontWeight: '700' }}>
                              Ver {TIPO_LABEL[it.tipo].toLowerCase()} →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>

          {/* AGENDA DEL MES */}
          {itemsDelMes.length > 0 && (
            <AnimatedSection direction="up">
              <div style={{ marginTop: 48 }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)', marginBottom: 24 }}>
                  Agenda — {meses[mes]} {anio} · {itemsDelMes.length} {itemsDelMes.length === 1 ? 'actividad' : 'actividades'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, alignItems: 'stretch' }}>
                  {itemsDelMes.map(it => {
const fp = parseFecha(it.fecha)
                    const diaNum = fp ? fp.day : 1
                    const diaStr = fp
                      ? new Date(fp.year, fp.month, fp.day).toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '').toUpperCase()
                      : ''
                    return (
<div key={it.id} style={{ background: '#fff', border: `2px solid ${it.color}22`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(26,18,8,0.04)', transition: 'all 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${it.color}22` }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,18,8,0.04)' }}
                        onClick={() => setDiaSeleccionado(diaNum)}
                      >
                        {/* Imagen o placeholder */}
                        {it.imagen_url ? (
                          <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
                            <img src={it.imagen_url} alt={it.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.5) 0%, transparent 60%)' }} />
                            <div style={{ position: 'absolute', top: 10, left: 10, background: it.color, padding: '6px 12px', textAlign: 'center', minWidth: 48 }}>
                              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#fff', lineHeight: 1 }}>{diaNum}</div>
                              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, color: '#fff', textTransform: 'uppercase', fontWeight: '700' }}>{diaStr}</div>
                            </div>
                            <span style={{ position: 'absolute', top: 10, right: 10, fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: 'rgba(26,18,8,0.6)', padding: '3px 8px', backdropFilter: 'blur(4px)', fontWeight: '700' }}>{TIPO_LABEL[it.tipo]}</span>
                          </div>
                        ) : (
<div style={{ height: 140, background: `linear-gradient(135deg, ${it.color}22 0%, ${it.color}08 100%)`, position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: it.color, opacity: 0.1, lineHeight: 1, position: 'absolute', right: 12 }}>{it.label?.[0] || 'N'}</span>
                            <div style={{ background: it.color, padding: '6px 12px', textAlign: 'center', minWidth: 48, marginLeft: 0 }}>
                              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#fff', lineHeight: 1 }}>{diaNum}</div>
                              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, color: '#fff', textTransform: 'uppercase', fontWeight: '700' }}>{diaStr}</div>
                            </div>
                            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: it.color, background: it.color + '18', padding: '3px 10px', borderRadius: 999, fontWeight: '700', marginLeft: 12 }}>{TIPO_LABEL[it.tipo]}</span>
                          </div>
                        )}

                        {/* Contenido */}
                        <div style={{ padding: '14px 16px 16px', background: it.color, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#fff', fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{it.label}</p>
                          {it.descripcion && (
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, marginBottom: 10 }}>
                              {it.descripcion.length > 100 ? it.descripcion.slice(0, 100) + '...' : it.descripcion}
                            </p>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {it.detalle1 && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, fontWeight: '700' }}>{it.detalle1}</span>}
                            <Link to={it.href} onClick={e => e.stopPropagation()} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.55)', paddingBottom: 1, textDecoration: 'none', fontWeight: '700', marginLeft: 'auto' }}>
                              Ver {TIPO_LABEL[it.tipo].toLowerCase()} →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AnimatedSection>
          )}

          {!cargando && itemsDelMes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.3)' }}>
                Sin actividades en {meses[mes]} {anio}
                {filtroTipo !== 'todos' ? ` para "${TIPO_LABEL[filtroTipo]}"` : ''}
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  )
}