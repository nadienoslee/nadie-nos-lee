import { useState, useEffect } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function getDiasEnMes(mes, anio) { return new Date(anio, mes + 1, 0).getDate() }
function getPrimerDia(mes, anio) { return new Date(anio, mes, 1).getDay() }

export default function Calendario() {
  usePageTitle('NADIE NOS LEE | CALENDARIO')
  const hoy = new Date()
  const [mes, setMes]                       = useState(hoy.getMonth())
  const [anio, setAnio]                     = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [eventos, setEventos]               = useState([])

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('eventos')
        .select('id, titulo, tipo, fecha, color, publicado')
        .eq('publicado', true)
        .order('fecha', { ascending: true })
      if (data) setEventos(data)
    }
    cargar()
    const ch = supabase.channel('cal-eventos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  // Normaliza los eventos de Supabase al formato que usa el calendario
  const eventosCalendario = eventos
    .map(ev => {
      const d = ev.fecha ? new Date(ev.fecha) : null
      if (!d || isNaN(d)) return null
      return {
        id:    ev.id,
        dia:   d.getDate(),
        mes:   d.getMonth(),
        anio:  d.getFullYear(),
        tipo:  ev.tipo  || 'Evento',
        titulo: ev.titulo || '',
        color: '#ffffff',
        fontWeight: '900',
      }
    })
    .filter(Boolean)

  const totalDias  = getDiasEnMes(mes, anio)
  const primerDia  = getPrimerDia(mes, anio)
  const eventosDelMes = eventosCalendario.filter(e => e.mes === mes && e.anio === anio)
  const eventosDelDia = diaSeleccionado ? eventosDelMes.filter(e => e.dia === diaSeleccionado) : []

  const anterior  = () => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1); setDiaSeleccionado(null) }
  const siguiente = () => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1); setDiaSeleccionado(null) }

  const celdas = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let i = 1; i <= totalDias; i++) celdas.push(i)

  const btnNavStyle = { background: '#fff', border: '1px solid rgba(26,18,8,0.15)', color: '#1a1208', padding: '12px 24px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: 16, transition: 'border-color 0.2s' }

  // Colores únicos para la leyenda dinámica
  const tiposUnicos = [...new Map(eventosCalendario.map(e => [e.tipo, e.color])).entries()]

  return (
    <main>
      <section style={{ background: '#f5ede0', padding: '100px 40px 80px', borderBottom: '1px solid rgba(155,45,142,0.15)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedSection direction="up">
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 24 }}>Comunidad</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(60px, 10vw, 120px)', letterSpacing: 6, color: '#1a1208', lineHeight: 0.92, marginBottom: 36 }}>CALENDARIO</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', color: 'rgba(26,18,8,0.55)', lineHeight: 1.7 }}>
              Todas las actividades del colectivo en un solo lugar.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section style={{ background: '#faf6ee', padding: '80px 40px 120px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <AnimatedSection direction="up">

            {/* Navegación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <button onClick={anterior} style={btnNavStyle}
                onMouseOver={e => e.target.style.borderColor = '#9B2D8E'}
                onMouseOut={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'}
              >←</button>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 6, color: '#1a1208' }}>{meses[mes]} {anio}</h2>
              <button onClick={siguiente} style={btnNavStyle}
                onMouseOver={e => e.target.style.borderColor = '#9B2D8E'}
                onMouseOut={e => e.target.style.borderColor = 'rgba(26,18,8,0.15)'}
              >→</button>
            </div>

            {/* Cabecera días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
              {dias.map(d => (
                <div key={d} style={{ textAlign: 'center', padding: '14px 0', fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)' }}>{d}</div>
              ))}
            </div>

            {/* Celdas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {celdas.map((dia, idx) => {
                const eventosHoy    = dia ? eventosDelMes.filter(e => e.dia === dia) : []
                const esHoy         = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
                const seleccionado  = dia === diaSeleccionado
                const tieneMultiples = eventosHoy.length > 1

                return (
                  <div key={idx}
                    onClick={() => dia && setDiaSeleccionado(seleccionado ? null : dia)}
                    style={{ minHeight: 88, padding: '10px 8px', background: seleccionado ? 'rgba(155,45,142,0.08)' : esHoy ? 'rgba(155,45,142,0.04)' : '#fff', border: seleccionado ? '2px solid rgba(155,45,142,0.4)' : esHoy ? '2px solid rgba(155,45,142,0.2)' : '1px solid rgba(26,18,8,0.06)', cursor: dia ? 'pointer' : 'default', transition: 'all 0.2s' }}
                    onMouseOver={e => { if (dia && !seleccionado) e.currentTarget.style.background = 'rgba(155,45,142,0.04)' }}
                    onMouseOut={e => { if (dia && !seleccionado && !esHoy) e.currentTarget.style.background = '#fff' }}
                  >
                    {dia && (
                      <>
                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 14, color: esHoy ? '#9B2D8E' : seleccionado ? '#1a1208' : 'rgba(26,18,8,0.55)', fontWeight: esHoy ? 'bold' : 'normal', display: 'block', marginBottom: 6 }}>{dia}</span>

                        {!tieneMultiples && eventosHoy.map((ev, i) => (
                          <div key={i} style={{ background: ev.color + '18', borderLeft: `2px solid ${ev.color}`, padding: '2px 5px', fontFamily: "'Courier Prime', monospace", fontSize: 8, color: ev.color, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.titulo}</div>
                        ))}

                        {tieneMultiples && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                            {eventosHoy.map((ev, i) => (
                              <div key={i} title={ev.titulo} style={{ width: 10, height: 10, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Detalle del día seleccionado */}
            {diaSeleccionado && (
              <div style={{ marginTop: 32, padding: '28px 32px', border: '1px solid rgba(155,45,142,0.2)', background: '#fff' }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#9B2D8E', marginBottom: 20 }}>{diaSeleccionado} de {meses[mes]}</p>
                {eventosDelDia.length === 0 ? (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: 'italic', color: 'rgba(26,18,8,0.4)' }}>Sin actividades este día.</p>
                ) : eventosDelDia.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, paddingBottom: 16, borderBottom: i < eventosDelDia.length - 1 ? '1px solid rgba(26,18,8,0.06)' : 'none' }}>
                    <div style={{ width: 4, height: 48, background: ev.color, flexShrink: 0, borderRadius: 2 }} />
                    <div>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: ev.color }}>{ev.tipo}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1208' }}>{ev.titulo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leyenda dinámica */}
            {tiposUnicos.length > 0 && (
              <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
                {tiposUnicos.map(([tipo, color]) => (
                  <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)' }}>{tipo}</span>
                  </div>
                ))}
              </div>
            )}

          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}