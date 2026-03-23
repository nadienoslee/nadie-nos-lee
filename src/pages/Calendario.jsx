import { useState } from 'react'
import AnimatedSection from '../components/AnimatedSection'

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const eventosCalendario = [
  { dia: 28, mes: 2, anio: 2026, tipo: 'Lectura', titulo: 'Lectura: Voces del margen', color: '#9B2D8E' },
  { dia: 5,  mes: 3, anio: 2026, tipo: 'Taller',  titulo: 'Taller de microficción', color: '#3AABDC' },
  { dia: 5,  mes: 3, anio: 2026, tipo: 'Cierre',  titulo: 'Cierre conv. cuerpo', color: '#8B1A1A' },
  { dia: 15, mes: 3, anio: 2026, tipo: 'Cierre',  titulo: 'Cierre: Escrituras sobre el cuerpo', color: '#8B1A1A' },
  { dia: 18, mes: 3, anio: 2026, tipo: 'Evento',  titulo: 'Presentación antología', color: '#8B1A1A' },
  { dia: 18, mes: 3, anio: 2026, tipo: 'Lectura', titulo: 'Micro-lectura sorpresa', color: '#9B2D8E' },
  { dia: 30, mes: 3, anio: 2026, tipo: 'Cierre',  titulo: 'Cierre: Crónicas del norte', color: '#8B1A1A' },
]

function getDiasEnMes(mes, anio) { return new Date(anio, mes + 1, 0).getDate() }
function getPrimerDia(mes, anio) { return new Date(anio, mes, 1).getDay() }

export default function Calendario() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  const totalDias = getDiasEnMes(mes, anio)
  const primerDia = getPrimerDia(mes, anio)
  const eventosDelMes = eventosCalendario.filter(e => e.mes === mes && e.anio === anio)
  const eventosDelDia = diaSeleccionado ? eventosDelMes.filter(e => e.dia === diaSeleccionado) : []

  const anterior = () => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1); setDiaSeleccionado(null) }
  const siguiente = () => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1); setDiaSeleccionado(null) }

  const celdas = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let i = 1; i <= totalDias; i++) celdas.push(i)

  const btnNavStyle = { background: '#fff', border: '1px solid rgba(26,18,8,0.15)', color: '#1a1208', padding: '12px 24px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: 16, transition: 'border-color 0.2s' }

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

            {/* Días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
              {dias.map(d => (
                <div key={d} style={{ textAlign: 'center', padding: '14px 0', fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.4)' }}>{d}</div>
              ))}
            </div>

            {/* Celdas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {celdas.map((dia, idx) => {
                const eventosHoy = dia ? eventosDelMes.filter(e => e.dia === dia) : []
                const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
                const seleccionado = dia === diaSeleccionado
                const tieneMultiples = eventosHoy.length > 1
                const coloresUnicos = [...new Set(eventosHoy.map(e => e.color))]

                return (
                  <div key={idx}
                    onClick={() => dia && setDiaSeleccionado(seleccionado ? null : dia)}
                    style={{
                      minHeight: 88, padding: '10px 8px',
                      background: seleccionado ? 'rgba(155,45,142,0.08)' : esHoy ? 'rgba(155,45,142,0.04)' : '#fff',
                      border: seleccionado ? '2px solid rgba(155,45,142,0.4)' : esHoy ? '2px solid rgba(155,45,142,0.2)' : '1px solid rgba(26,18,8,0.06)',
                      cursor: dia ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { if (dia && !seleccionado) e.currentTarget.style.background = 'rgba(155,45,142,0.04)' }}
                    onMouseOut={e => { if (dia && !seleccionado && !esHoy) e.currentTarget.style.background = '#fff' }}
                  >
                    {dia && (
                      <>
                        <span style={{
                          fontFamily: "'Courier Prime', monospace", fontSize: 14,
                          color: esHoy ? '#9B2D8E' : seleccionado ? '#1a1208' : 'rgba(26,18,8,0.55)',
                          fontWeight: esHoy ? 'bold' : 'normal',
                          display: 'block', marginBottom: 6,
                        }}>{dia}</span>

                        {/* Si hay 1 evento: barra con texto */}
                        {!tieneMultiples && eventosHoy.map((ev, i) => (
                          <div key={i} style={{
                            background: ev.color + '18',
                            borderLeft: `2px solid ${ev.color}`,
                            padding: '2px 5px',
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: 8, color: ev.color,
                            overflow: 'hidden', whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}>{ev.titulo}</div>
                        ))}

                        {/* Si hay múltiples eventos: mostrar solo dots de colores */}
                        {tieneMultiples && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                            {eventosHoy.map((ev, i) => (
                              <div key={i} title={ev.titulo} style={{
                                width: 10, height: 10,
                                borderRadius: '50%',
                                background: ev.color,
                                flexShrink: 0,
                              }} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Detalle del día */}
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

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
              {[['Lectura', '#9B2D8E'], ['Taller', '#3AABDC'], ['Cierre / Evento', '#8B1A1A']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)' }}>{label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}