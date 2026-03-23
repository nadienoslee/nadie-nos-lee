import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

// ── Datos de ejemplo ──────────────────────────────────
const datosVisitas = [
  { mes: 'Oct', visitas: 120 },
  { mes: 'Nov', visitas: 198 },
  { mes: 'Dic', visitas: 240 },
  { mes: 'Ene', visitas: 310 },
  { mes: 'Feb', visitas: 428 },
  { mes: 'Mar', visitas: 612 },
]

const datosSeccion = [
  { nombre: 'Escritura', visitas: 340 },
  { nombre: 'Notas', visitas: 210 },
  { nombre: 'Eventos', visitas: 180 },
  { nombre: 'Talleres', visitas: 165 },
  { nombre: 'Archivo', visitas: 120 },
  { nombre: 'Manifiesto', visitas: 95 },
]

const statsCards = [
  { label: 'Visitas este mes', valor: '612', sub: '+43% vs mes anterior', color: '#9B2D8E' },
  { label: 'Textos publicados', valor: '12', sub: 'Escrituras semanales', color: '#8B1A1A' },
  { label: 'Inscripciones', valor: '47', sub: 'A talleres este año', color: '#3AABDC' },
  { label: 'Convocatorias', valor: '3', sub: '2 abiertas actualmente', color: '#9B2D8E' },
]

// ── Secciones del panel ──────────────────────────────
const secciones = [
  { id: 'inicio',        label: 'Inicio',          icon: '◈' },
  { id: 'escritura',     label: 'Escritura semana', icon: '✎' },
  { id: 'notas',         label: 'Notas',            icon: '≡' },
  { id: 'convocatorias', label: 'Convocatorias',    icon: '◻' },
  { id: 'eventos',       label: 'Eventos',          icon: '◷' },
  { id: 'talleres',      label: 'Talleres',         icon: '◈' },
  { id: 'noticias',      label: 'Noticias',         icon: '◉' },
  { id: 'archivo',       label: 'Archivo',          icon: '▤' },
  { id: 'inscripciones', label: 'Inscripciones',    icon: '✓' },
  { id: 'estadisticas',  label: 'Estadísticas',     icon: '◎' },
]

// ── Tooltip personalizado para gráficas ──────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1a1a', border: '1px solid rgba(155,45,142,0.3)',
        padding: '10px 16px',
        fontFamily: "'Courier Prime', monospace", fontSize: 11,
        color: '#f5f0e8',
      }}>
        <p style={{ marginBottom: 4, color: 'rgba(245,240,232,0.5)', letterSpacing: 1 }}>{label}</p>
        <p style={{ color: '#9B2D8E', fontWeight: 'bold' }}>{payload[0].value} visitas</p>
      </div>
    )
  }
  return null
}

// ── Tabla de inscripciones de ejemplo ────────────────
const inscripciones = [
  { nombre: 'Ana Gutiérrez',  taller: 'Microficción',    fecha: '20 Mar 2026', estado: 'Confirmada' },
  { nombre: 'Jorge Medina',   taller: 'Ensayo personal', fecha: '19 Mar 2026', estado: 'Confirmada' },
  { nombre: 'Sofía Leal',     taller: 'Microficción',    fecha: '18 Mar 2026', estado: 'Pendiente'  },
  { nombre: 'Ramón Estrada',  taller: 'Crónica',         fecha: '17 Mar 2026', estado: 'Confirmada' },
  { nombre: 'Claudia Torres', taller: 'Ensayo personal', fecha: '16 Mar 2026', estado: 'Cancelada'  },
]

// ── Textos de ejemplo para gestión ──────────────────
const textosEjemplo = [
  { titulo: 'El peso del martes',    autor: 'Valeria Rincón', genero: 'Narrativa', semana: 12, fecha: 'Mar 2026' },
  { titulo: 'Cartografía del olvido', autor: 'Marco Tello',   genero: 'Poesía',    semana: 11, fecha: 'Mar 2026' },
  { titulo: 'Sobre el hambre',       autor: 'Daniela Ortiz',  genero: 'Ensayo',    semana: 10, fecha: 'Feb 2026' },
]

export default function Dashboard() {
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  const [sidebarAbierto, setSidebarAbierto] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({ titulo: '', autor: '', genero: 'Narrativa', contenido: '' })
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUsuario(user))
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  // ── Estilos reutilizables ──
  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(245,240,232,0.04)',
    border: '1px solid rgba(245,240,232,0.1)',
    color: '#f5f0e8', outline: 'none',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16, marginBottom: 16,
  }

  const labelStyle = {
    fontFamily: "'Courier Prime', monospace",
    fontSize: 9, letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(245,240,232,0.4)',
    display: 'block', marginBottom: 6,
  }

  const btnPrimary = (color = '#9B2D8E') => ({
    fontFamily: "'Courier Prime', monospace",
    fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase',
    background: color, color: '#f5f0e8',
    border: 'none', padding: '10px 20px',
    cursor: 'pointer',
  })

  // ── Renders por sección ──────────────────────────
  const renderContenido = () => {
    switch (seccionActiva) {

      // INICIO ──────────────────────────────────────
      case 'inicio': return (
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, fontWeight: 300,
            color: '#f5f0e8', marginBottom: 8,
          }}>Bienvenido al panel</h2>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11, color: 'rgba(245,240,232,0.3)',
            letterSpacing: 1, marginBottom: 40,
          }}>{usuario?.email}</p>

          {/* Stats cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 48,
          }}>
            {statsCards.map((s, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                border: `1px solid ${s.color}33`,
                background: s.color + '08',
              }}>
                <p style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9, letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: s.color, marginBottom: 12,
                }}>{s.label}</p>
                <p style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 52, color: '#f5f0e8',
                  lineHeight: 1, marginBottom: 8,
                }}>{s.valor}</p>
                <p style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10, color: 'rgba(245,240,232,0.3)',
                }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráfica de visitas */}
          <div style={{
            padding: '32px',
            border: '1px solid rgba(245,240,232,0.07)',
            background: 'rgba(245,240,232,0.02)',
            marginBottom: 24,
          }}>
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10, letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#9B2D8E', marginBottom: 24,
            }}>Visitas mensuales</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={datosVisitas}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
                <XAxis dataKey="mes" stroke="rgba(245,240,232,0.2)"
                  tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, fill: 'rgba(245,240,232,0.4)' }} />
                <YAxis stroke="rgba(245,240,232,0.2)"
                  tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, fill: 'rgba(245,240,232,0.4)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="visitas"
                  stroke="#9B2D8E" strokeWidth={2}
                  dot={{ fill: '#9B2D8E', r: 4 }}
                  activeDot={{ r: 6, fill: '#b535a8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica por sección */}
          <div style={{
            padding: '32px',
            border: '1px solid rgba(245,240,232,0.07)',
            background: 'rgba(245,240,232,0.02)',
          }}>
            <p style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10, letterSpacing: 3,
              textTransform: 'uppercase',
              color: '#3AABDC', marginBottom: 24,
            }}>Visitas por sección</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={datosSeccion}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
                <XAxis dataKey="nombre" stroke="rgba(245,240,232,0.2)"
                  tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, fill: 'rgba(245,240,232,0.4)' }} />
                <YAxis stroke="rgba(245,240,232,0.2)"
                  tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, fill: 'rgba(245,240,232,0.4)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visitas" fill="#3AABDC" opacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )

      // ESCRITURA ───────────────────────────────────
      case 'escritura': return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32, fontWeight: 300, color: '#f5f0e8',
            }}>Escritura de la semana</h2>
            <button style={btnPrimary()} onClick={() => setModalNuevo(true)}>
              + Nueva escritura
            </button>
          </div>

          {textosEjemplo.map((t, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: 16, alignItems: 'center',
              padding: '20px 24px', marginBottom: 4,
              border: '1px solid rgba(245,240,232,0.06)',
              background: 'rgba(245,240,232,0.02)',
            }}>
              <div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20, color: '#f5f0e8', marginBottom: 4,
                }}>{t.titulo}</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 9, color: '#9B2D8E',
                    letterSpacing: 1, textTransform: 'uppercase',
                  }}>Sem. {t.semana}</span>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 9, color: 'rgba(245,240,232,0.3)',
                    letterSpacing: 1,
                  }}>{t.autor} · {t.genero} · {t.fecha}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  ...btnPrimary('transparent'),
                  border: '1px solid rgba(245,240,232,0.15)',
                  color: 'rgba(245,240,232,0.6)',
                }}>Editar</button>
                <button style={{
                  ...btnPrimary('rgba(139,26,26,0.3)'),
                  border: '1px solid rgba(139,26,26,0.4)',
                }}>Eliminar</button>
              </div>
            </div>
          ))}

          {/* Modal nuevo texto */}
          {modalNuevo && (
            <div style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10,8,4,0.95)',
              zIndex: 200, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: 32,
            }}>
              <div style={{
                width: '100%', maxWidth: 640,
                background: '#111', padding: '40px',
                border: '1px solid rgba(155,45,142,0.3)',
                maxHeight: '90vh', overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 28, color: '#f5f0e8',
                  }}>Nueva escritura</h3>
                  <button onClick={() => setModalNuevo(false)} style={{
                    background: 'none', border: 'none',
                    color: 'rgba(245,240,232,0.4)', fontSize: 24,
                    cursor: 'pointer',
                  }}>✕</button>
                </div>

                {[
                  { key: 'titulo', label: 'Título', type: 'text', placeholder: 'Título del texto' },
                  { key: 'autor', label: 'Autor', type: 'text', placeholder: 'Nombre del autor' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={formNuevo[f.key]}
                      onChange={e => setFormNuevo({ ...formNuevo, [f.key]: e.target.value })}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#9B2D8E'}
                      onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
                    />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Género</label>
                  <select
                    value={formNuevo.genero}
                    onChange={e => setFormNuevo({ ...formNuevo, genero: e.target.value })}
                    style={{ ...inputStyle, background: '#0a0804', cursor: 'pointer' }}
                  >
                    {['Narrativa', 'Poesía', 'Ensayo', 'Crónica', 'Microficción'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Contenido</label>
                  <textarea rows={10} placeholder="Texto completo..."
                    value={formNuevo.contenido}
                    onChange={e => setFormNuevo({ ...formNuevo, contenido: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                    onFocus={e => e.target.style.borderColor = '#9B2D8E'}
                    onBlur={e => e.target.style.borderColor = 'rgba(245,240,232,0.1)'}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button style={btnPrimary()} onClick={() => setModalNuevo(false)}>
                    Publicar
                  </button>
                  <button style={{ ...btnPrimary('transparent'), border: '1px solid rgba(245,240,232,0.15)', color: 'rgba(245,240,232,0.5)' }}
                    onClick={() => setModalNuevo(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )

      // INSCRIPCIONES ───────────────────────────────
      case 'inscripciones': return (
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32, fontWeight: 300,
            color: '#f5f0e8', marginBottom: 32,
          }}>Inscripciones a talleres</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nombre', 'Taller', 'Fecha', 'Estado'].map(h => (
                    <th key={h} style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 9, letterSpacing: 2,
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,232,0.3)',
                      padding: '12px 16px', textAlign: 'left',
                      borderBottom: '1px solid rgba(245,240,232,0.07)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inscripciones.map((ins, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid rgba(245,240,232,0.04)',
                    transition: 'background 0.2s',
                  }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(245,240,232,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18, color: '#f5f0e8',
                      padding: '16px',
                    }}>{ins.nombre}</td>
                    <td style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, color: 'rgba(245,240,232,0.5)',
                      padding: '16px', letterSpacing: 1,
                    }}>{ins.taller}</td>
                    <td style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 10, color: 'rgba(245,240,232,0.35)',
                      padding: '16px',
                    }}>{ins.fecha}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9, letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: ins.estado === 'Confirmada' ? '#3AABDC'
                          : ins.estado === 'Pendiente' ? '#b8943a' : '#8B1A1A',
                        background: ins.estado === 'Confirmada' ? 'rgba(58,171,220,0.1)'
                          : ins.estado === 'Pendiente' ? 'rgba(184,148,58,0.1)' : 'rgba(139,26,26,0.1)',
                        padding: '4px 10px',
                      }}>{ins.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

      // ESTADÍSTICAS ────────────────────────────────
      case 'estadisticas': return (
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32, fontWeight: 300,
            color: '#f5f0e8', marginBottom: 32,
          }}>Estadísticas detalladas</h2>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 24, marginBottom: 24,
          }}>
            <div style={{ padding: '32px', border: '1px solid rgba(245,240,232,0.07)', background: 'rgba(245,240,232,0.02)' }}>
              <p style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10, letterSpacing: 3,
                textTransform: 'uppercase',
                color: '#9B2D8E', marginBottom: 24,
              }}>Tendencia de visitas</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={datosVisitas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
                  <XAxis dataKey="mes" stroke="rgba(245,240,232,0.2)"
                    tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, fill: 'rgba(245,240,232,0.4)' }} />
                  <YAxis stroke="rgba(245,240,232,0.2)"
                    tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, fill: 'rgba(245,240,232,0.4)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="visitas" stroke="#9B2D8E" strokeWidth={2}
                    dot={{ fill: '#9B2D8E', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ padding: '32px', border: '1px solid rgba(245,240,232,0.07)', background: 'rgba(245,240,232,0.02)' }}>
              <p style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10, letterSpacing: 3,
                textTransform: 'uppercase',
                color: '#8B1A1A', marginBottom: 24,
              }}>Secciones más visitadas</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={datosSeccion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,240,232,0.05)" />
                  <XAxis type="number" stroke="rgba(245,240,232,0.2)"
                    tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, fill: 'rgba(245,240,232,0.4)' }} />
                  <YAxis type="category" dataKey="nombre" stroke="rgba(245,240,232,0.2)" width={70}
                    tick={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, fill: 'rgba(245,240,232,0.4)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="visitas" fill="#8B1A1A" opacity={0.8} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Métricas extra */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}>
            {[
              { label: 'Textos enviados', valor: '63', color: '#9B2D8E' },
              { label: 'Talleres realizados', valor: '4', color: '#3AABDC' },
              { label: 'Lecturas en voz alta', valor: '3', color: '#8B1A1A' },
              { label: 'Miembros activos', valor: '4', color: '#9B2D8E' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: '24px 20px',
                border: `1px solid ${m.color}22`,
                background: m.color + '06',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 48, color: m.color, lineHeight: 1,
                  marginBottom: 8,
                }}>{m.valor}</p>
                <p style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9, letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.35)',
                }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )

      // DEFAULT para secciones sin contenido aún ────
      default: return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48, color: 'rgba(155,45,142,0.2)',
            marginBottom: 16,
          }}>
            {secciones.find(s => s.id === seccionActiva)?.icon}
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32, fontWeight: 300,
            color: '#f5f0e8', marginBottom: 12,
          }}>{secciones.find(s => s.id === seccionActiva)?.label}</h2>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 11, letterSpacing: 2,
            color: 'rgba(245,240,232,0.3)',
          }}>Sección en desarrollo · Conectar con Supabase</p>
        </div>
      )
    }
  }

  // ── RENDER PRINCIPAL ──────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080604' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: sidebarAbierto ? 240 : 64,
        background: '#0a0804',
        borderRight: '1px solid rgba(155,45,142,0.15)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>

        {/* Header sidebar */}
        <div style={{
          padding: '24px 16px',
          borderBottom: '1px solid rgba(245,240,232,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarAbierto ? 'space-between' : 'center',
        }}>
          {sidebarAbierto && (
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 16, letterSpacing: 3,
              color: '#f5f0e8', whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#9B2D8E' }}>✕</span> NNL
            </div>
          )}
          <button onClick={() => setSidebarAbierto(!sidebarAbierto)} style={{
            background: 'none', border: 'none',
            color: 'rgba(245,240,232,0.4)',
            cursor: 'pointer', fontSize: 16,
            padding: 4,
          }}>{sidebarAbierto ? '←' : '→'}</button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {secciones.map(sec => (
            <button key={sec.id}
              onClick={() => setSeccionActiva(sec.id)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                gap: 12, padding: '10px 12px',
                background: seccionActiva === sec.id
                  ? 'rgba(155,45,142,0.12)' : 'transparent',
                border: 'none',
                borderLeft: seccionActiva === sec.id
                  ? '2px solid #9B2D8E' : '2px solid transparent',
                color: seccionActiva === sec.id
                  ? '#f5f0e8' : 'rgba(245,240,232,0.4)',
                cursor: 'pointer', marginBottom: 2,
                transition: 'all 0.2s',
                justifyContent: sidebarAbierto ? 'flex-start' : 'center',
              }}
              onMouseOver={e => {
                if (seccionActiva !== sec.id)
                  e.currentTarget.style.background = 'rgba(245,240,232,0.03)'
              }}
              onMouseOut={e => {
                if (seccionActiva !== sec.id)
                  e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{sec.icon}</span>
              {sidebarAbierto && (
                <span style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 10, letterSpacing: 1,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>{sec.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(245,240,232,0.06)' }}>
          <button onClick={cerrarSesion} style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            gap: 12, padding: '10px 12px',
            background: 'none', border: 'none',
            color: 'rgba(245,240,232,0.25)',
            cursor: 'pointer', transition: 'color 0.2s',
            justifyContent: sidebarAbierto ? 'flex-start' : 'center',
          }}
            onMouseOver={e => e.currentTarget.style.color = '#8B1A1A'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(245,240,232,0.25)'}
          >
            <span style={{ fontSize: 14 }}>⏻</span>
            {sidebarAbierto && (
              <span style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 10, letterSpacing: 1,
                textTransform: 'uppercase',
              }}>Cerrar sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 60,
          background: '#0a0804',
          borderBottom: '1px solid rgba(245,240,232,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px', flexShrink: 0,
        }}>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 10, letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.3)',
          }}>
            {secciones.find(s => s.id === seccionActiva)?.label}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#3AABDC',
              boxShadow: '0 0 6px #3AABDC',
            }} />
            <span style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 10, color: 'rgba(245,240,232,0.3)',
              letterSpacing: 1,
            }}>{usuario?.email?.split('@')[0]}</span>
          </div>
        </header>

        {/* Área de contenido */}
        <main style={{
          flex: 1, padding: '40px 48px',
          overflowY: 'auto',
        }}>
          {renderContenido()}
        </main>
      </div>
    </div>
  )
}