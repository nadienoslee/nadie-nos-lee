import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import Notificacion from '../components/Notificacion'
import Usuarios from './Usuarios'
import SeccionCRUD from './SeccionCRUD'
import logoDesktop from '../assets/LOGOCENTRADONG.png'
import logoMobile from '../assets/ICONSPAREJA.png'
import usePageTitle from '../hooks/usePageTitle'
const C = {
  purple: '#9B2D8E', red: '#8B1A1A', blue: '#3AABDC',
  green: '#22a16a', gold: '#b8943a', ink: '#1a1208',
}

// ── Iconos SVG ──
const Icon = {
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Plus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Activity: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Power: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Camera: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
}

function SecIcon({ icon, size = 16 }) {
  const s = { width: size, height: size, flexShrink: 0 }
  const icons = {
    home:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    stats:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    edit:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    note:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    book:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    call:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    archive: <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    event:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    taller:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    news:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>,
    banner:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    user:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    check:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    users:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  }
  return icons[icon] || null
}

const secciones = [
  { id: 'inicio',        label: 'Inicio',           icon: 'home',    grupo: 'panel' },
  { id: 'estadisticas',  label: 'Estadísticas',      icon: 'stats',   grupo: 'panel' },
  { id: 'escritura',     label: 'Escritura semana',  icon: 'edit',    grupo: 'editorial' },
  { id: 'notas',         label: 'Notas',             icon: 'note',    grupo: 'editorial' },
  { id: 'lecturas',      label: 'Lecturas',          icon: 'book',    grupo: 'editorial' },
  { id: 'convocatorias', label: 'Convocatorias',     icon: 'call',    grupo: 'editorial' },
  { id: 'archivo',       label: 'Archivo',           icon: 'archive', grupo: 'editorial' },
  { id: 'eventos',       label: 'Eventos',           icon: 'event',   grupo: 'comunidad' },
  { id: 'talleres',      label: 'Talleres',          icon: 'taller',  grupo: 'comunidad' },
  { id: 'noticias',      label: 'Noticias',          icon: 'news',    grupo: 'comunidad' },
  { id: 'banners',       label: 'Banners',           icon: 'banner',  grupo: 'comunidad' },
  { id: 'miembros',      label: 'Miembros',          icon: 'user',    grupo: 'identidad' },
  { id: 'inscripciones', label: 'Inscripciones',     icon: 'check',   grupo: 'datos' },
  { id: 'usuarios',      label: 'Usuarios',          icon: 'users',   grupo: 'admin' },
]

const grupos = [
  { id: 'panel',     label: 'Panel' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'comunidad', label: 'Comunidad' },
  { id: 'identidad', label: 'Identidad' },
  { id: 'datos',     label: 'Datos' },
  { id: 'admin',     label: 'Administración' },
]

// ── Avatar con foto o inicial ──
function Avatar({ email, fotoUrl, size = 36, fontSize = 16 }) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={email}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${C.purple}33`,
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'rgba(155,45,142,0.12)',
      border: `2px solid ${C.purple}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize, color: C.purple,
        lineHeight: 1,
      }}>
        {email?.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

// ── Gráfica multivista ──
function GraficaMultivista({ titulo, color, datos, etiquetas }) {
  const [vista, setVista] = useState('area')
  const vistas = [
    { id: 'linea', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'barra', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { id: 'area',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
  ]
  const chartSx = { '& .MuiChartsAxis-line': { stroke: 'rgba(26,18,8,0.07)' }, '& .MuiChartsAxis-tick': { stroke: 'rgba(26,18,8,0.07)' } }
  const tickStyle = { fontFamily: "'Courier Prime', monospace", fontSize: 11, fill: 'rgba(26,18,8,0.55)', fontWeight: '600' }
  const margin = { top: 8, right: 16, bottom: 30, left: 50 }
  const d = datos.length ? datos : [0]
  const e = etiquetas.length ? etiquetas : ['—']

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, padding: '20px 20px 12px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color, fontWeight: '700' }}>{titulo}</p>
        <div style={{ display: 'flex', gap: 3 }}>
          {vistas.map(v => (
            <button key={v.id} onClick={() => setVista(v.id)} style={{ padding: '6px 10px', cursor: 'pointer', borderRadius: 5, background: vista === v.id ? color : 'transparent', color: vista === v.id ? '#fff' : 'rgba(26,18,8,0.35)', border: `1px solid ${vista === v.id ? color : 'rgba(26,18,8,0.1)'}`, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>{v.svg}</button>
          ))}
        </div>
      </div>
      {vista === 'linea' && <LineChart xAxis={[{ data: e, scaleType: 'point', tickLabelStyle: tickStyle }]} series={[{ data: d, color, curve: 'catmullRom', showMark: true }]} height={190} margin={margin} slotProps={{ legend: { hidden: true } }} sx={chartSx} />}
      {vista === 'barra' && <BarChart xAxis={[{ data: e, scaleType: 'band', tickLabelStyle: tickStyle }]} series={[{ data: d, color }]} height={190} margin={margin} slotProps={{ legend: { hidden: true } }} sx={chartSx} borderRadius={4} />}
      {vista === 'area'  && <LineChart xAxis={[{ data: e, scaleType: 'point', tickLabelStyle: tickStyle }]} series={[{ data: d, color, area: true, curve: 'catmullRom', showMark: false }]} height={190} margin={margin} slotProps={{ legend: { hidden: true } }} sx={{ ...chartSx, '& .MuiAreaElement-root': { fillOpacity: 0.1 } }} />}
    </div>
  )
}
function LogoHeader({ sidebarAbierto, setSidebarAbierto, logoDesktop, logoMobile, purple }) {
  const [hoverLogo, setHoverLogo] = useState(false)

  const iconoPanel = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  )

  return (
    <div style={{
      padding: '16px',
      borderBottom: '1px solid rgba(26,18,8,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarAbierto ? 'space-between' : 'center',
      minHeight: 70,
    }}>
      {sidebarAbierto ? (
        // Sidebar abierto: logo normal + botón colapsar
        <>
          <img src={logoDesktop} alt="Nadie Nos Lee" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
          <button
            onClick={() => setSidebarAbierto(false)}
            style={{
              background: 'none',
              border: '1px solid rgba(26,18,8,0.1)',
              cursor: 'pointer',
              color: 'rgba(26,18,8,0.4)',
              padding: '5px 6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 6,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(26,18,8,0.05)'; e.currentTarget.style.color = purple }}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(26,18,8,0.4)' }}
          >
            {iconoPanel}
          </button>
        </>
      ) : (
        // Sidebar cerrado: logo que al hacer hover se convierte en botón
        <button
          onClick={() => setSidebarAbierto(true)}
          onMouseEnter={() => setHoverLogo(true)}
          onMouseLeave={() => setHoverLogo(false)}
          style={{
            background: hoverLogo ? 'rgba(26,18,8,0.05)' : 'none',
            border: hoverLogo ? '1px solid rgba(26,18,8,0.1)' : '1px solid transparent',
            cursor: 'pointer',
            color: hoverLogo ? purple : 'rgba(26,18,8,0.4)',
            padding: '5px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'all 0.2s ease',
            width: 44,
            height: 44,
          }}
          title="Expandir panel"
        >
          {hoverLogo ? (
            // Al hacer hover: mostrar ícono de panel
            iconoPanel
          ) : (
            // Sin hover: mostrar logo mobile
            <img
              src={logoMobile}
              alt="NNL"
              style={{ height: 34, width: 'auto', objectFit: 'contain', pointerEvents: 'none' }}
            />
          )}
        </button>
      )}
    </div>
  )
}

function EscrituraSeccion({ escriturasList, usuario, cargarDatos, registrarAccion, btnP, labelStyle, inputStyle, modalNuevo, setModalNuevo, formNuevo, setFormNuevo, setAlertaGeneral }) {
  const [modalEditar, setModalEditar] = useState(null) // item a editar
  const [formEditar, setFormEditar]   = useState({})

  const abrirEditar = (t) => {
    setFormEditar({ ...t })
    setModalEditar(t)
  }

  const guardarEdicion = async () => {
    const { error } = await supabase.from('escrituras').update({
      titulo:    formEditar.titulo,
      autor:     formEditar.autor,
      genero:    formEditar.genero,
      contenido: formEditar.contenido,
      fragmento: formEditar.fragmento || null,
      semana:    formEditar.semana || null,
      imagen_url: formEditar.imagen_url || null,
      publicado: formEditar.publicado ?? true,
    }).eq('id', modalEditar.id)

    if (error) {
      setAlertaGeneral({ tipo: 'error', titulo: 'Error', mensaje: error.message, botonTexto: 'Entendido' })
      return
    }
    setModalEditar(null)
    registrarAccion('edicion', 'escritura', `Editó "${formEditar.titulo}"`)
    setAlertaGeneral({ tipo: 'exito', titulo: '¡Actualizado!', mensaje: `"${formEditar.titulo}" fue guardado.`, botonTexto: 'OK', autoclose: 2500 })
    cargarDatos()
  }

  const confirmarEliminar = (t) => {
    setAlertaGeneral({
      tipo: 'error',
      titulo: '¿Eliminar esta escritura?',
      mensaje: `Vas a eliminar "${t.titulo}". Esta acción no se puede deshacer.`,
      botonTexto: 'Sí, eliminar',
      botonAccion: () => ejecutarEliminar(t),
    })
  }

  const ejecutarEliminar = async (t) => {
    const { error } = await supabase.from('escrituras').delete().eq('id', t.id)
    if (error) {
      setAlertaGeneral({ tipo: 'error', titulo: 'Error', mensaje: error.message, botonTexto: 'Entendido' })
      return
    }
    registrarAccion('eliminar', 'escritura', `Eliminó "${t.titulo}"`)
    setAlertaGeneral({ tipo: 'advertencia', titulo: 'Eliminado', mensaje: `"${t.titulo}" fue eliminado.`, botonTexto: 'OK', autoclose: 2500 })
    cargarDatos()
  }

  const campos = [
    { key: 'titulo',     label: 'Título',     placeholder: 'Título del texto' },
    { key: 'autor',      label: 'Autor',       placeholder: 'Nombre del autor' },
    { key: 'fragmento',  label: 'Fragmento',   placeholder: 'Fragmento corto (opcional)' },
    { key: 'imagen_url', label: 'URL imagen',  placeholder: 'https://...' },
  ]

  const ModalForm = ({ titulo, form, setForm, onGuardar, onCerrar }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(250,246,238,0.97)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 640, background: '#fff', padding: '40px', border: '1px solid rgba(155,45,142,0.2)', maxHeight: '90vh', overflowY: 'auto', borderRadius: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: '#1a1208' }}>{titulo}</h3>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: 'rgba(26,18,8,0.4)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {campos.map(f => (
          <div key={f.key}>
            <label style={labelStyle}>{f.label}</label>
            <input type="text" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'} />
          </div>
        ))}

        <div>
          <label style={labelStyle}>Género</label>
          <select value={form.genero || 'Narrativa'} onChange={e => setForm({ ...form, genero: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
            {['Narrativa', 'Poesía', 'Ensayo', 'Crónica', 'Microficción'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Semana</label>
          <input type="number" placeholder="Número de semana" value={form.semana || ''} onChange={e => setForm({ ...form, semana: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'} />
        </div>

        <div>
          <label style={labelStyle}>Contenido</label>
          <textarea rows={10} placeholder="Texto completo..." value={form.contenido || ''} onChange={e => setForm({ ...form, contenido: e.target.value })} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'} />
        </div>

        {/* Toggle publicado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button type="button" onClick={() => setForm({ ...form, publicado: !form.publicado })}
            style={{ width: 44, height: 24, borderRadius: 12, background: form.publicado ? '#9B2D8E' : 'rgba(26,18,8,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: form.publicado ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </button>
          <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => setForm({ ...form, publicado: !form.publicado })}>Publicado</label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button style={btnP()} onClick={onGuardar}>Guardar</button>
          <button style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.15)', color: 'rgba(26,18,8,0.5)' }} onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, color: '#1a1208' }}>Escritura de la semana</h2>
        <button style={{ ...btnP(), display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setModalNuevo(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva escritura
        </button>
      </div>

      {escriturasList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>No hay escrituras publicadas aún</p>
        </div>
      ) : escriturasList.map((t, i) => (
        <div key={t.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '20px 22px', marginBottom: 4, border: '1px solid rgba(26,18,8,0.08)', background: '#fff', borderRadius: 7 }}>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1208', marginBottom: 5, fontWeight: '600' }}>{t.titulo}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {t.semana && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: '#9B2D8E', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' }}>Sem. {t.semana}</span>}
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.5)', letterSpacing: 1, fontWeight: '600' }}>{t.autor} · {t.genero}</span>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, fontWeight: '700', background: t.publicado ? 'rgba(34,161,106,0.1)' : 'rgba(26,18,8,0.05)', color: t.publicado ? '#22a16a' : 'rgba(26,18,8,0.35)' }}>
                {t.publicado ? '✓ Publicado' : '○ Oculto'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.15)', color: 'rgba(26,18,8,0.65)', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => abrirEditar(t)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button style={{ ...btnP('transparent'), border: '1px solid rgba(139,26,26,0.25)', color: '#8B1A1A', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => confirmarEliminar(t)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* Modal nueva escritura */}
      {modalNuevo && (
        <ModalForm
          titulo="Nueva escritura"
          form={formNuevo}
          setForm={setFormNuevo}
          onCerrar={() => setModalNuevo(false)}
          onGuardar={async () => {
            const { error } = await supabase.from('escrituras').insert({
              titulo:    formNuevo.titulo,
              autor:     formNuevo.autor,
              genero:    formNuevo.genero,
              contenido: formNuevo.contenido,
              fragmento: formNuevo.fragmento || null,
              semana:    formNuevo.semana || null,
              imagen_url: formNuevo.imagen_url || null,
              publicado: true,
              created_by: usuario?.id,
            })
            if (!error) {
              setModalNuevo(false)
              registrarAccion('nuevo', 'escritura', `Publicó "${formNuevo.titulo}"`)
              setAlertaGeneral({ tipo: 'exito', titulo: '¡Publicada!', mensaje: `"${formNuevo.titulo}" fue creada.`, botonTexto: 'OK', autoclose: 2500 })
              cargarDatos()
            }
          }}
        />
      )}

      {/* Modal editar escritura */}
      {modalEditar && (
        <ModalForm
          titulo={`Editar — ${modalEditar.titulo}`}
          form={formEditar}
          setForm={setFormEditar}
          onCerrar={() => setModalEditar(null)}
          onGuardar={guardarEdicion}
        />
      )}
    </div>
  )
}
export default function Dashboard() {
  usePageTitle('NADIE NOS LEE | DASHBOARD')
  const [seccionActiva, setSeccionActiva]   = useState('inicio')
  const [sidebarAbierto, setSidebarAbierto] = useState(true)
  const [usuario, setUsuario]               = useState(null)
  const [fotoUrl, setFotoUrl]               = useState(null)
  const [subiendoFoto, setSubiendoFoto]     = useState(false)
  const [modalPerfil, setModalPerfil]       = useState(false)
  const [modalNuevo, setModalNuevo]         = useState(false)
  const [formNuevo, setFormNuevo]           = useState({ titulo: '', autor: '', genero: 'Narrativa', contenido: '' })
  const fileInputRef = useRef(null)

  const [stats, setStats]                           = useState({ visitas: 0, escrituras: 0, inscripciones: 0, convocatorias: 0 })
  const [visitasPorMes, setVisitasPorMes]           = useState({ etiquetas: [], datos: [] })
  const [visitasRT, setVisitasRT]                   = useState({ etiquetas: [], datos: [] })
  const [inscripcionesPorMes, setInscripcionesPorMes] = useState({ etiquetas: [], datos: [] })
  const [escriturasPorMes, setEscriturasPorMes]     = useState({ etiquetas: [], datos: [] })
  const [seccionesPopulares, setSeccionesPopulares] = useState([])
  const [generosDist, setGenerosDist]               = useState([])
  const [inscripcionesList, setInscripcionesList]   = useState([])
  const [escriturasList, setEscriturasList]         = useState([])
  const [notificaciones, setNotificaciones]         = useState([])
  const [panelNotif, setPanelNotif]                 = useState(false)
  const [alertaGeneral, setAlertaGeneral]           = useState(null)
  const navigate = useNavigate()
  const noLeidas = notificaciones.filter(n => !n.leida).length

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user)
      if (user) cargarFotoPerfil(user)
    })
  }, [])

  const cargarFotoPerfil = async (user) => {
    const { data } = await supabase
      .from('perfiles')
      .select('foto_url')
      .eq('user_id', user.id)
      .single()
    if (data?.foto_url) setFotoUrl(data.foto_url)
  }

  const subirFoto = async (e) => {
    const file = e.target.files[0]
    if (!file || !usuario) return
    setSubiendoFoto(true)

    const ext = file.name.split('.').pop()
    const path = `${usuario.id}/avatar.${ext}`

    const { error: upError } = await supabase.storage
      .from('avatares')
      .upload(path, file, { upsert: true })

    if (!upError) {
      const { data: urlData } = supabase.storage
        .from('avatares')
        .getPublicUrl(path)

      const url = urlData.publicUrl + '?t=' + Date.now()
      await supabase.from('perfiles').update({ foto_url: url }).eq('user_id', usuario.id)
      setFotoUrl(url)
      setAlertaGeneral({ tipo: 'exito', titulo: 'Foto actualizada', mensaje: 'Tu foto de perfil se actualizó correctamente.', botonTexto: 'Aceptar', autoclose: 3000 })
    } else {
      setAlertaGeneral({ tipo: 'error', titulo: 'Error al subir', mensaje: 'No se pudo actualizar la foto. Intenta de nuevo.', botonTexto: 'Entendido' })
    }
    setSubiendoFoto(false)
  }

  useEffect(() => {
    cargarDatos()
    cargarNotificaciones()

    const ch1 = supabase.channel('visitas-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitas' }, () => {
        cargarDatos()
        setVisitasRT(prev => {
          const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          const newD = [...prev.datos.slice(-7), (prev.datos[prev.datos.length - 1] || 0) + 1]
          const newE = [...prev.etiquetas.slice(-7), hora]
          return { datos: newD, etiquetas: newE }
        })
      })
      .subscribe()

    const ch2 = supabase.channel('inscripciones-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inscripciones' }, (payload) => {
        cargarDatos()
        agregarNotif('inscripcion', `Nueva inscripción — ${payload.new.nombre || 'visitante'}`)
      })
      .subscribe()

    const ch3 = supabase.channel('actividad-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actividad_log' }, () => {
        cargarNotificaciones()
      })
      .subscribe()

    const ch4 = supabase.channel('escrituras-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escrituras' }, (payload) => {
        cargarDatos()
        const accion = payload.eventType === 'INSERT' ? 'publicó' : payload.eventType === 'UPDATE' ? 'editó' : 'eliminó'
        agregarNotif('edicion', `Se ${accion} "${payload.new?.titulo || payload.old?.titulo || 'un texto'}"`)
      })
      .subscribe()

    const ch5 = supabase.channel('eventos-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, (payload) => {
        const accion = payload.eventType === 'INSERT' ? 'creó' : payload.eventType === 'UPDATE' ? 'actualizó' : 'eliminó'
        agregarNotif('evento', `Se ${accion} el evento "${payload.new?.titulo || payload.old?.titulo || ''}"`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ch1); supabase.removeChannel(ch2)
      supabase.removeChannel(ch3); supabase.removeChannel(ch4)
      supabase.removeChannel(ch5)
    }
  }, [])

  const agregarNotif = (tipo, texto) => {
    setNotificaciones(prev => [{
      id: Date.now(), tipo, texto, leida: false,
      tiempo: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    }, ...prev.slice(0, 49)])
  }

const cargarNotificaciones = async () => {
  const { data } = await supabase
    .from('actividad_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  if (data) {
    setNotificaciones(data.map(n => {
      const fecha = new Date(n.created_at)
      const hoy   = new Date()
      const esHoy = fecha.toDateString() === hoy.toDateString()
      return {
        id:        n.id,
        tipo:      n.accion,
        texto:     n.descripcion,
        seccion:   n.seccion,
        afecta_a:  n.afecta_a,
        leida:     false,
        email:     n.usuario_email,
        nombre:    n.usuario_email?.split('@')[0] || 'Admin',
        fotoUrl:   null,
        fecha:     esHoy
          ? `Hoy · ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
          : fecha.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      }
    }))
  }
}

  const cargarDatos = async () => {
    const { data: visitas } = await supabase.from('visitas').select('pagina, created_at').order('created_at')
    if (visitas) {
      setStats(prev => ({ ...prev, visitas: visitas.length }))
      const porMes = {}
      visitas.forEach(v => {
        const mes = new Date(v.created_at).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        porMes[mes] = (porMes[mes] || 0) + 1
      })
      const u6 = Object.entries(porMes).slice(-6)
      setVisitasPorMes({ etiquetas: u6.map(([k]) => k), datos: u6.map(([, v]) => v) })
      setVisitasRT({ etiquetas: u6.map(([k]) => k), datos: u6.map(([, v]) => v) })
      const porPag = {}
      visitas.forEach(v => { porPag[v.pagina] = (porPag[v.pagina] || 0) + 1 })
      setSeccionesPopulares(Object.entries(porPag).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([pagina, count]) => ({ label: pagina.replace('/', '').replace(/-/g, ' ') || 'Inicio', value: count })))
    }

    const { data: escrituras } = await supabase.from('escrituras').select('id, genero, created_at, titulo, autor, semana, fragmento, contenido, imagen_url, publicado').order('created_at', { ascending: false })
    if (escrituras) {
      setStats(prev => ({ ...prev, escrituras: escrituras.length }))
      setEscriturasList(escrituras.slice(0, 5))
      const porMes = {}
      escrituras.forEach(e => { const mes = new Date(e.created_at).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }); porMes[mes] = (porMes[mes] || 0) + 1 })
      const u6 = Object.entries(porMes).slice(-6)
      setEscriturasPorMes({ etiquetas: u6.map(([k]) => k), datos: u6.map(([, v]) => v) })
      const gMap = {}
      escrituras.forEach(e => { gMap[e.genero] = (gMap[e.genero] || 0) + 1 })
      const cols = [C.purple, C.red, C.blue, C.green, C.gold]
      setGenerosDist(Object.entries(gMap).map(([label, value], i) => ({ id: i, value, label, color: cols[i % cols.length] })))
    }

    const { data: inscripciones } = await supabase.from('inscripciones').select('*, talleres(titulo)').order('created_at', { ascending: false })
    if (inscripciones) {
      setStats(prev => ({ ...prev, inscripciones: inscripciones.length }))
      setInscripcionesList(inscripciones.slice(0, 10))
      const porMes = {}
      inscripciones.forEach(i => { const mes = new Date(i.created_at).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }); porMes[mes] = (porMes[mes] || 0) + 1 })
      const u6 = Object.entries(porMes).slice(-6)
      setInscripcionesPorMes({ etiquetas: u6.map(([k]) => k), datos: u6.map(([, v]) => v) })
    }

    const { count } = await supabase.from('convocatorias').select('*', { count: 'exact', head: true }).eq('estado', 'Abierta')
    if (count !== null) setStats(prev => ({ ...prev, convocatorias: count }))
  }

  const cerrarSesion = async () => { await supabase.auth.signOut(); navigate('/admin/login') }
  const marcarTodasLeidas = () => setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))

const registrarAccion = async (accion, seccion, descripcion, afecta_a = null) => {
  await supabase.from('actividad_log').insert({
    usuario_email: usuario?.email,
    usuario_id: usuario?.id,
    accion, seccion, descripcion,
    afecta_a,
  })
  agregarNotif(accion, descripcion)
}

  const colorNotif = t => ({ edicion: C.blue, nuevo: C.green, inscripcion: C.purple, eliminar: C.red, evento: C.gold }[t] || C.ink)
  const IconNotif = ({ tipo }) => {
    if (tipo === 'inscripcion') return <Icon.Check />
    if (tipo === 'eliminar') return <Icon.Trash />
    if (tipo === 'nuevo') return <Icon.Plus />
    return <Icon.Edit />
  }

  const statsCards = [
    { label: 'Visitas',        valor: stats.visitas,       sub: 'páginas vistas', color: C.purple },
    { label: 'Escrituras',     valor: stats.escrituras,    sub: 'publicadas',     color: C.red    },
    { label: 'Inscripciones',  valor: stats.inscripciones, sub: 'en total',       color: C.blue   },
    { label: 'Convocatorias',  valor: stats.convocatorias, sub: 'abiertas',       color: C.green  },
  ]

  // Estilos comunes
  const inputStyle = { width: '100%', padding: '13px 16px', background: '#faf6ee', border: '1px solid rgba(26,18,8,0.12)', color: C.ink, outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, marginBottom: 18, borderRadius: 5 }
  const labelStyle = { fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.55)', display: 'block', marginBottom: 7, fontWeight: '700' }
  const btnP = (color = C.purple, extra = {}) => ({ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', background: color, color: '#fff', border: 'none', padding: '11px 20px', cursor: 'pointer', borderRadius: 5, fontWeight: '700', ...extra })

  // ── Estadísticas ──
  const SeccionEstadisticas = () => {
    const [vistaVisitas, setVistaVisitas] = useState('area')
    const [vistaGeneros, setVistaGeneros] = useState('pie')
    const vistas = [
      { id: 'linea', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
      { id: 'barra', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
      { id: 'area',  svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
    ]
    const vistasG = [
      { id: 'pie',   svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg> },
      { id: 'barra', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
      { id: 'linea', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    ]
    const chartSx = { '& .MuiChartsAxis-line': { stroke: 'rgba(26,18,8,0.07)' }, '& .MuiChartsAxis-tick': { stroke: 'rgba(26,18,8,0.07)' } }
    const tickStyle = { fontFamily: "'Courier Prime', monospace", fontSize: 11, fill: 'rgba(26,18,8,0.55)', fontWeight: '600' }
    const margin = { top: 8, right: 16, bottom: 30, left: 50 }
    const etq = visitasRT.etiquetas.length ? visitasRT.etiquetas : ['—']
    const dat = visitasRT.datos.length ? visitasRT.datos : [0]

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 400, color: C.ink }}>Estadísticas</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: 'rgba(26,18,8,0.5)', fontWeight: '700' }}>EN VIVO — actualización automática</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {statsCards.map((s, i) => (
            <div key={i} style={{ padding: '22px 18px', border: `1px solid ${s.color}22`, background: s.color + '07', borderRadius: 10 }}>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: s.color, marginBottom: 10, fontWeight: '700' }}>{s.label}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: C.ink, lineHeight: 1, marginBottom: 6 }}>{s.valor}</p>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.5)', fontWeight: '600' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, padding: '20px', flex: '2 1 360px', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.purple, fontWeight: '700' }}>Visitas — tiempo real</p>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.45)', letterSpacing: 1, marginTop: 3, fontWeight: '600' }}>Se actualiza con cada visita al sitio</p>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {vistas.map(v => <button key={v.id} onClick={() => setVistaVisitas(v.id)} style={{ padding: '6px 10px', cursor: 'pointer', borderRadius: 5, background: vistaVisitas === v.id ? C.purple : 'transparent', color: vistaVisitas === v.id ? '#fff' : 'rgba(26,18,8,0.35)', border: `1px solid ${vistaVisitas === v.id ? C.purple : 'rgba(26,18,8,0.1)'}`, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>{v.svg}</button>)}
              </div>
            </div>
            {vistaVisitas === 'linea' && <LineChart xAxis={[{ data: etq, scaleType: 'point', tickLabelStyle: tickStyle }]} series={[{ data: dat, color: C.purple, curve: 'catmullRom', showMark: true }]} height={210} margin={margin} slotProps={{ legend: { hidden: true } }} sx={chartSx} />}
            {vistaVisitas === 'barra' && <BarChart xAxis={[{ data: etq, scaleType: 'band', tickLabelStyle: tickStyle }]} series={[{ data: dat, color: C.purple }]} height={210} margin={margin} slotProps={{ legend: { hidden: true } }} sx={chartSx} borderRadius={4} />}
            {vistaVisitas === 'area'  && <LineChart xAxis={[{ data: etq, scaleType: 'point', tickLabelStyle: tickStyle }]} series={[{ data: dat, color: C.purple, area: true, curve: 'catmullRom', showMark: false }]} height={210} margin={margin} slotProps={{ legend: { hidden: true } }} sx={{ ...chartSx, '& .MuiAreaElement-root': { fillOpacity: 0.1 } }} />}
          </div>

          <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, padding: '20px', flex: '1 1 220px', minWidth: 0 }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.red, marginBottom: 16, fontWeight: '700' }}>Páginas más visitadas</p>
            {seccionesPopulares.length === 0 ? (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>Sin datos aún</p>
            ) : seccionesPopulares.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(26,18,8,0.65)', fontWeight: '700' }}>{s.label || 'inicio'}</span>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: C.red, fontWeight: '700' }}>{s.value}</span>
                </div>
                <div style={{ height: 5, background: 'rgba(26,18,8,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.value / (seccionesPopulares[0]?.value || 1)) * 100}%`, background: `hsl(${320 - i * 28}, 60%, ${42 + i * 6}%)`, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
          <GraficaMultivista titulo="Inscripciones acumuladas" color={C.blue} datos={inscripcionesPorMes.datos} etiquetas={inscripcionesPorMes.etiquetas} />
          <GraficaMultivista titulo="Textos publicados" color={C.green} datos={escriturasPorMes.datos} etiquetas={escriturasPorMes.etiquetas} />
        </div>

        <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.gold, fontWeight: '700' }}>Distribución por género literario</p>
            <div style={{ display: 'flex', gap: 3 }}>
              {vistasG.map(v => <button key={v.id} onClick={() => setVistaGeneros(v.id)} style={{ padding: '6px 10px', cursor: 'pointer', borderRadius: 5, background: vistaGeneros === v.id ? C.gold : 'transparent', color: vistaGeneros === v.id ? '#fff' : 'rgba(26,18,8,0.35)', border: `1px solid ${vistaGeneros === v.id ? C.gold : 'rgba(26,18,8,0.1)'}`, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>{v.svg}</button>)}
            </div>
          </div>
          {generosDist.length === 0 ? (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '32px 0' }}>Sin datos de géneros aún</p>
          ) : (
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                {vistaGeneros === 'pie'   && <PieChart series={[{ data: generosDist, innerRadius: 44, outerRadius: 100, paddingAngle: 3, cornerRadius: 4 }]} height={220} width={240} slotProps={{ legend: { hidden: true } }} />}
                {vistaGeneros === 'barra' && <BarChart xAxis={[{ data: generosDist.map(g => g.label), scaleType: 'band', tickLabelStyle: { fontFamily: "'Courier Prime', monospace", fontSize: 11, fill: 'rgba(26,18,8,0.55)', fontWeight: '600' } }]} series={[{ data: generosDist.map(g => g.value) }]} colors={generosDist.map(g => g.color)} height={220} margin={{ top: 8, right: 16, bottom: 30, left: 44 }} slotProps={{ legend: { hidden: true } }} sx={chartSx} borderRadius={4} />}
                {vistaGeneros === 'linea' && <LineChart xAxis={[{ data: generosDist.map(g => g.label), scaleType: 'point', tickLabelStyle: { fontFamily: "'Courier Prime', monospace", fontSize: 11, fill: 'rgba(26,18,8,0.55)', fontWeight: '600' } }]} series={[{ data: generosDist.map(g => g.value), color: C.gold, curve: 'catmullRom', showMark: true }]} height={220} margin={{ top: 8, right: 16, bottom: 30, left: 44 }} slotProps={{ legend: { hidden: true } }} sx={chartSx} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 140 }}>
                {generosDist.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(26,18,8,0.65)', fontWeight: '700' }}>{g.label}</p>
                      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: g.color, lineHeight: 1.1 }}>{g.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderContenido = () => {
    switch (seccionActiva) {

      case 'inicio': return (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 400, color: C.ink, marginBottom: 4 }}>Bienvenido al panel</h2>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: 'rgba(26,18,8,0.5)', letterSpacing: 1, marginBottom: 28, fontWeight: '700' }}>
            {usuario?.email} · {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            {statsCards.map((s, i) => (
              <div key={i} style={{ padding: '20px 16px', border: `1px solid ${s.color}22`, background: s.color + '07', borderRadius: 10 }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: s.color, marginBottom: 8, fontWeight: '700' }}>{s.label}</p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 50, color: C.ink, lineHeight: 1, marginBottom: 4 }}>{s.valor}</p>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.5)', fontWeight: '600' }}>{s.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.purple, marginBottom: 14, fontWeight: '700' }}>Visitas — últimos meses</p>
            {visitasPorMes.datos.length > 0 ? (
              <LineChart xAxis={[{ data: visitasPorMes.etiquetas, scaleType: 'point', tickLabelStyle: { fontFamily: "'Courier Prime', monospace", fontSize: 11, fill: 'rgba(26,18,8,0.55)', fontWeight: '600' } }]} series={[{ data: visitasPorMes.datos, color: C.purple, area: true, curve: 'catmullRom', showMark: true }]} height={200} margin={{ top: 8, right: 16, bottom: 30, left: 50 }} slotProps={{ legend: { hidden: true } }} sx={{ '& .MuiChartsAxis-line': { stroke: 'rgba(26,18,8,0.07)' }, '& .MuiChartsAxis-tick': { stroke: 'rgba(26,18,8,0.07)' }, '& .MuiAreaElement-root': { fillOpacity: 0.1 } }} />
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>Sin visitas registradas aún</p>
              </div>
            )}
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10, padding: '20px' }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.blue, marginBottom: 16, fontWeight: '700' }}>Actividad reciente</p>
            {notificaciones.length === 0 ? (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>Sin actividad aún</p>
            ) : notificaciones.slice(0, 6).map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '13px 0', borderBottom: i < 5 ? '1px solid rgba(26,18,8,0.05)' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: colorNotif(n.tipo) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colorNotif(n.tipo), flexShrink: 0, marginTop: 2 }}><IconNotif tipo={n.tipo} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.ink, marginBottom: 3, lineHeight: 1.4, fontWeight: '500' }}>{n.texto}</p>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.45)', letterSpacing: 1, fontWeight: '600' }}>{n.tiempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      case 'estadisticas': return <SeccionEstadisticas />

case 'escritura': return (
  <EscrituraSeccion
    escriturasList={escriturasList}
    usuario={usuario}
    cargarDatos={cargarDatos}
    registrarAccion={registrarAccion}
    btnP={btnP}
    labelStyle={labelStyle}
    inputStyle={inputStyle}
    modalNuevo={modalNuevo}
    setModalNuevo={setModalNuevo}
    formNuevo={formNuevo}
    setFormNuevo={setFormNuevo}
    alertaGeneral={alertaGeneral}
    setAlertaGeneral={setAlertaGeneral}
  />
)

      case 'inscripciones': return (
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, color: C.ink, marginBottom: 24 }}>Inscripciones a talleres</h2>
          {inscripcionesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>Sin inscripciones registradas</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid rgba(26,18,8,0.08)', borderRadius: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Nombre', 'Taller', 'Fecha', 'Estado'].map(h => <th key={h} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', padding: '15px 20px', textAlign: 'left', borderBottom: '1px solid rgba(26,18,8,0.08)', fontWeight: '700' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {inscripcionesList.map((ins, i) => (
                    <tr key={ins.id || i} style={{ borderBottom: '1px solid rgba(26,18,8,0.04)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#faf6ee'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.ink, padding: '16px 20px', fontWeight: '500' }}>{ins.nombre}</td>
                      <td style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.6)', padding: '16px 20px', letterSpacing: 1, fontWeight: '600' }}>{ins.talleres?.titulo || '—'}</td>
                      <td style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.5)', padding: '16px 20px', fontWeight: '600' }}>{new Date(ins.created_at).toLocaleDateString('es-MX')}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: ins.estado === 'Confirmada' ? C.green : ins.estado === 'Pendiente' ? C.gold : C.red, background: ins.estado === 'Confirmada' ? 'rgba(34,161,106,0.1)' : ins.estado === 'Pendiente' ? 'rgba(184,148,58,0.1)' : 'rgba(139,26,26,0.1)', padding: '5px 12px', borderRadius: 4, fontWeight: '700' }}>{ins.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )

      case 'usuarios': return <Usuarios esAdmin={true} />

default:
  const seccionesConCRUD = ['notas', 'lecturas', 'convocatorias', 'archivo', 'eventos', 'talleres', 'noticias', 'banners', 'miembros']
  if (seccionesConCRUD.includes(seccionActiva)) {
    return <SeccionCRUD seccion={seccionActiva} />
  }
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(155,45,142,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.purple }}>
        <SecIcon icon={secciones.find(s => s.id === seccionActiva)?.icon || 'home'} size={28} />
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: C.ink, marginBottom: 10 }}>{secciones.find(s => s.id === seccionActiva)?.label}</h2>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, color: 'rgba(26,18,8,0.4)', fontWeight: '700' }}>Próximamente</p>
    </div>
  )
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f0e8' }}>

      {alertaGeneral && <Notificacion {...alertaGeneral} onCerrar={() => setAlertaGeneral(null)} />}

      {/* ── MODAL PERFIL / FOTO ── */}
      {modalPerfil && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '40px', width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: C.ink, marginBottom: 28 }}>Tu perfil</h3>

            {/* Avatar grande */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
              <Avatar email={usuario?.email} fotoUrl={fotoUrl} size={100} fontSize={40} />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: C.purple, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#b535a8'}
                onMouseOut={e => e.currentTarget.style.background = C.purple}
                title="Cambiar foto"
              >
                <Icon.Camera />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={subirFoto} />
            </div>

            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.ink, fontWeight: '600', marginBottom: 4 }}>{usuario?.email?.split('@')[0]}</p>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.45)', letterSpacing: 1, marginBottom: 28, fontWeight: '600' }}>{usuario?.email}</p>

            {subiendoFoto && (
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: C.purple, letterSpacing: 1, marginBottom: 16, fontWeight: '700' }}>Subiendo foto...</p>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...btnP(), width: '100%', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Icon.Camera /> Cambiar foto de perfil
            </button>
            <button onClick={() => setModalPerfil(false)} style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.15)', color: 'rgba(26,18,8,0.5)', width: '100%' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{ width: sidebarAbierto ? 248 : 68, background: '#fff', borderRight: '1px solid rgba(26,18,8,0.07)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden', flexShrink: 0, boxShadow: '2px 0 10px rgba(26,18,8,0.04)' }}>
<LogoHeader
  sidebarAbierto={sidebarAbierto}
  setSidebarAbierto={setSidebarAbierto}
  logoDesktop={logoDesktop}
  logoMobile={logoMobile}
  purple={C.purple}
/>
        <nav style={{ flex: 1, padding: '10px 6px', overflowY: 'auto' }}>
          {grupos.map(grupo => {
            const secGrupo = secciones.filter(s => s.grupo === grupo.id)
            return (
              <div key={grupo.id} style={{ marginBottom: 6 }}>
                {sidebarAbierto && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.25)', padding: '6px 12px 3px', fontWeight: '700' }}>{grupo.label}</p>}
                {secGrupo.map(sec => (
                  <button key={sec.id} onClick={() => setSeccionActiva(sec.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: sidebarAbierto ? '10px 12px' : '10px', background: seccionActiva === sec.id ? 'rgba(155,45,142,0.09)' : 'transparent', border: 'none', borderLeft: seccionActiva === sec.id ? `3px solid ${C.purple}` : '3px solid transparent', color: seccionActiva === sec.id ? C.purple : 'rgba(26,18,8,0.55)', cursor: 'pointer', marginBottom: 1, transition: 'all 0.15s', justifyContent: sidebarAbierto ? 'flex-start' : 'center', borderRadius: '0 7px 7px 0' }}
                    onMouseOver={e => { if (seccionActiva !== sec.id) e.currentTarget.style.background = 'rgba(26,18,8,0.04)' }}
                    onMouseOut={e => { if (seccionActiva !== sec.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <SecIcon icon={sec.icon} size={16} />
                    {sidebarAbierto && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: '700' }}>{sec.label}</span>}
                  </button>
                ))}
              </div>
            )
          })}
        </nav>

<div style={{ padding: '10px 6px', borderTop: '1px solid rgba(26,18,8,0.06)' }}>
  {/* Ver sitio */}
  <button onClick={() => window.open('/', '_blank')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: sidebarAbierto ? '10px 12px' : '10px', background: 'none', border: 'none', color: 'rgba(26,18,8,0.35)', cursor: 'pointer', transition: 'color 0.2s', justifyContent: sidebarAbierto ? 'flex-start' : 'center', borderRadius: '0 7px 7px 0', marginBottom: 2 }}
    onMouseOver={e => e.currentTarget.style.color = C.blue}
    onMouseOut={e => e.currentTarget.style.color = 'rgba(26,18,8,0.35)'}
    title="Ver sitio público"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
    {sidebarAbierto && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' }}>Ver sitio</span>}
  </button>

  {/* Cerrar sesión */}
  <button onClick={cerrarSesion} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: sidebarAbierto ? '10px 12px' : '10px', background: 'none', border: 'none', color: 'rgba(26,18,8,0.35)', cursor: 'pointer', transition: 'color 0.2s', justifyContent: sidebarAbierto ? 'flex-start' : 'center', borderRadius: '0 7px 7px 0' }}
    onMouseOver={e => e.currentTarget.style.color = C.red}
    onMouseOut={e => e.currentTarget.style.color = 'rgba(26,18,8,0.35)'}
  >
    <Icon.Power />
    {sidebarAbierto && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700' }}>Cerrar sesión</span>}
  </button>
</div>
      </aside>

      {/* ── CONTENIDO ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ height: 66, background: '#fff', borderBottom: '1px solid rgba(26,18,8,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0, boxShadow: '0 1px 8px rgba(26,18,8,0.04)' }}>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(26,18,8,0.45)', fontWeight: '700' }}>
            {secciones.find(s => s.id === seccionActiva)?.label}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Campana */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setPanelNotif(!panelNotif)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: panelNotif ? C.purple : 'rgba(26,18,8,0.45)', padding: '6px', transition: 'color 0.2s', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon.Bell />
                {noLeidas > 0 && <span style={{ position: 'absolute', top: 2, right: 0, width: 17, height: 17, borderRadius: '50%', background: '#ef4444', color: '#fff', fontFamily: "'Courier Prime', monospace", fontSize: 9, fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{noLeidas > 9 ? '9+' : noLeidas}</span>}
              </button>

{panelNotif && (
  <div style={{ position: 'absolute', top: '100%', right: 0, width: 420, background: '#fff', border: '1px solid rgba(26,18,8,0.1)', boxShadow: '0 16px 48px rgba(26,18,8,0.1)', zIndex: 150, borderRadius: 10, marginTop: 8, overflow: 'hidden' }}>

    {/* Header */}
    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(26,18,8,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: C.ink, fontWeight: '700' }}>
        Actividad {noLeidas > 0 && <span style={{ background: C.purple, color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 9 }}>{noLeidas}</span>}
      </p>
      {noLeidas > 0 && <button onClick={marcarTodasLeidas} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', background: 'none', border: 'none', color: C.purple, cursor: 'pointer', fontWeight: '700' }}>Marcar leídas</button>}
    </div>

    {/* Lista */}
    <div style={{ maxHeight: 420, overflowY: 'auto' }}>
      {notificaciones.length === 0 ? (
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(26,18,8,0.35)', textAlign: 'center', padding: '28px', fontStyle: 'italic' }}>Sin actividad aún</p>
      ) : notificaciones.map((n, i) => (
        <div key={n.id} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(26,18,8,0.04)', background: n.leida ? 'transparent' : 'rgba(155,45,142,0.03)', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(26,18,8,0.02)'}
          onMouseOut={e => e.currentTarget.style.background = n.leida ? 'transparent' : 'rgba(155,45,142,0.03)'}
        >
          {/* Avatar del usuario */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {n.fotoUrl ? (
              <img src={n.fotoUrl} alt={n.nombre} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colorNotif(n.tipo)}33` }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: colorNotif(n.tipo) + '18', border: `2px solid ${colorNotif(n.tipo)}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: colorNotif(n.tipo) }}>
                  {n.nombre?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            )}
            {/* Ícono de acción sobre el avatar */}
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: colorNotif(n.tipo), display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
              <span style={{ color: '#fff', fontSize: 7, lineHeight: 1 }}><IconNotif tipo={n.tipo} /></span>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nombre + acción */}
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: n.leida ? 'rgba(26,18,8,0.55)' : C.ink, lineHeight: 1.45, marginBottom: 4, fontWeight: n.leida ? '400' : '600' }}>
              <span style={{ color: colorNotif(n.tipo), fontWeight: 700 }}>{n.nombre}</span>
              {' '}{n.texto}
            </p>

            {/* Sección afectada */}
            {n.seccion && (
              <span style={{ display: 'inline-block', fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: colorNotif(n.tipo), background: colorNotif(n.tipo) + '12', padding: '2px 8px', borderRadius: 4, marginBottom: 4 }}>
                {n.seccion}
              </span>
            )}

            {/* Si afecta a otro usuario */}
            {n.afecta_a && (
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.4)', letterSpacing: 0.5, marginBottom: 4 }}>
                → Afecta a: <span style={{ color: C.red }}>{n.afecta_a}</span>
              </p>
            )}

            {/* Fecha y hora */}
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.3)', letterSpacing: 1, fontWeight: '600' }}>
              {n.fecha}
            </p>
          </div>

          {/* Dot no leída */}
          {!n.leida && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.purple, flexShrink: 0, marginTop: 6 }} />}
        </div>
      ))}
    </div>
  </div>
)}
            </div>

            {/* Usuario — clic abre modal perfil */}
            <button onClick={() => setModalPerfil(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(26,18,8,0.04)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar email={usuario?.email} fotoUrl={fotoUrl} size={36} fontSize={16} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.65)', letterSpacing: 1, fontWeight: '700', lineHeight: 1 }}>{usuario?.email?.split('@')[0]}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 5px ${C.green}` }} />
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.35)', letterSpacing: 1, fontWeight: '600' }}>ACTIVO</span>
                </div>
              </div>
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          {renderContenido()}
        </main>
      </div>

      {panelNotif && <div style={{ position: 'fixed', inset: 0, zIndex: 149 }} onClick={() => setPanelNotif(false)} />}
    </div>
  )
}