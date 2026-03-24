import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Notificacion from '../components/Notificacion'

const C = {
  purple: '#9B2D8E', red: '#8B1A1A', blue: '#3AABDC',
  green: '#22a16a', gold: '#b8943a', ink: '#1a1208',
}

export const CONFIG_SECCIONES = {
  notas: {
    tabla: 'notas', titulo: 'Notas', color: C.purple,
    campos: [
      { key: 'titulo',    label: 'Título',      tipo: 'text',     requerido: true },
      { key: 'autor',     label: 'Autor',        tipo: 'text',     requerido: true },
      { key: 'categoria', label: 'Categoría',    tipo: 'select',   opciones: ['Ensayo', 'Reseña', 'Reflexión', 'Entrevista', 'Otro'] },
      { key: 'extracto',  label: 'Extracto',     tipo: 'textarea', rows: 3 },
      { key: 'contenido', label: 'Contenido',    tipo: 'textarea', rows: 10 },
{ key: 'minutos_lectura', label: 'Min. lectura', tipo: 'number' },
{ key: 'imagen_url', label: 'URL imagen', tipo: 'text', placeholder: 'https://...' },
{ key: 'link_url', label: 'Enlace externo', tipo: 'text', placeholder: 'https://instagram.com/p/...' },
{ key: 'publicado', label: 'Publicado', tipo: 'toggle' },
    ],
    columnas: ['titulo', 'autor', 'categoria', 'publicado'],
  },
  lecturas: {
    tabla: 'lecturas', titulo: 'Lecturas recomendadas', color: C.gold,
    campos: [
      { key: 'titulo',              label: 'Título del libro',         tipo: 'text',     requerido: true },
      { key: 'autor_libro',         label: 'Autor del libro',          tipo: 'text',     requerido: true },
      { key: 'anio',                label: 'Año de publicación',       tipo: 'number' },
      { key: 'genero',              label: 'Género',                   tipo: 'select', opciones: ['Novela', 'Cuento', 'Poesía', 'Ensayo', 'Crónica', 'Teatro', 'No ficción', 'Terror', 'Ciencia ficción', 'Fantasía', 'Otro'] },
      { key: 'etiqueta',            label: 'Etiqueta',                 tipo: 'select', opciones: ['Recomendación', 'Imperdible', 'Favorito', 'Nuevo', 'Clásico', 'Selección del colectivo', 'Especial', 'Convocatoria'] },
      { key: 'comentario',          label: 'Extracto / cita corta',    tipo: 'textarea', rows: 3 },
      { key: 'sinopsis',            label: 'Sinopsis del libro',       tipo: 'textarea', rows: 5 },
      { key: 'recomendacion_texto', label: 'Por qué lo recomendamos',  tipo: 'textarea', rows: 6 },
      { key: 'recomendado_por',     label: 'Recomendado por',          tipo: 'usuario_selector' },
      { key: 'recomendador_fecha',  label: 'Fecha de recomendación',   tipo: 'date' },
      { key: 'imagen_url',          label: 'URL portada del libro',    tipo: 'text', placeholder: 'https://...' },
      { key: 'color',               label: 'Color acento',             tipo: 'color' },
      { key: 'publicado',           label: 'Publicado',                tipo: 'toggle' },
    ],
    columnas: ['titulo', 'autor_libro', 'genero', 'recomendado_por', 'publicado'],
  },
convocatorias: {
    tabla: 'convocatorias', titulo: 'Convocatorias', color: C.red,
    campos: [
      { key: 'titulo',              label: 'Título',                  tipo: 'text',     requerido: true },
      { key: 'descripcion',         label: 'Descripción corta',       tipo: 'textarea', rows: 3 },
      { key: 'descripcion_larga',   label: 'Descripción larga',       tipo: 'textarea', rows: 7 },
      { key: 'estado',              label: 'Estado',                  tipo: 'select', opciones: ['Abierta', 'Cerrada', 'Próximamente', 'En revisión'] },
      { key: 'fecha_cierre',        label: 'Fecha de cierre',         tipo: 'date' },
      { key: 'extension', label: 'Extensión', tipo: 'text', placeholder: 'ej: máx. 3000 palabras' },
      { key: 'formato',             label: 'Formato de entrega',      tipo: 'text', placeholder: 'ej: Texto en el formulario / PDF' },
      { key: 'limite_por_usuario',  label: 'Límite de envíos por persona', tipo: 'number', placeholder: '1' },
      { key: 'permite_pseudonimo',  label: 'Permite pseudónimo',      tipo: 'toggle' },
      { key: 'permite_archivo',     label: 'Permite adjuntar archivo', tipo: 'toggle' },
      { key: 'limite_archivos',     label: 'Límite de archivos',       tipo: 'number', placeholder: '3' },
      { key: 'color',               label: 'Color',                   tipo: 'color' },
      { key: 'imagen_url',          label: 'URL imagen/banner',       tipo: 'text', placeholder: 'https://...' },
      { key: 'link_url',            label: 'Enlace externo',          tipo: 'text', placeholder: 'https://instagram.com/p/...' },
      { key: 'publicado',           label: 'Publicado',               tipo: 'toggle' },
    ],
    columnas: ['titulo', 'estado', 'fecha_cierre', 'publicado'],
  },
  archivo: {
    tabla: 'escrituras', titulo: 'Archivo de escrituras', color: C.gold,
    campos: [
      { key: 'titulo',      label: 'Título',      tipo: 'text',     requerido: true },
      { key: 'autor',       label: 'Autor',       tipo: 'text',     requerido: true },
      { key: 'genero',      label: 'Género',      tipo: 'select', opciones: ['Narrativa', 'Poesía', 'Ensayo', 'Crónica', 'Microficción'] },
      { key: 'semana',      label: 'Semana',      tipo: 'number' },
      { key: 'fragmento',   label: 'Fragmento',   tipo: 'textarea', rows: 4 },
      { key: 'contenido',   label: 'Contenido',   tipo: 'textarea', rows: 12 },
      { key: 'imagen_url',  label: 'URL imagen (libro/autor)', tipo: 'text', placeholder: 'https://...' },
      { key: 'publicado',   label: 'Publicado',   tipo: 'toggle' },
    ],
    columnas: ['titulo', 'autor', 'genero', 'semana', 'publicado'],
  },
  eventos: {
    tabla: 'eventos', titulo: 'Eventos', color: C.purple,
    campos: [
      { key: 'titulo',            label: 'Título',             tipo: 'text',     requerido: true },
      { key: 'tipo',              label: 'Tipo',               tipo: 'select', opciones: ['Lectura en voz alta', 'Taller', 'Presentación', 'Conversatorio', 'Otro'] },
      { key: 'estado',            label: 'Estado',             tipo: 'select', opciones: ['Próximo', 'En curso', 'Pasado', 'Cancelado'] },
      { key: 'fecha',             label: 'Fecha',              tipo: 'date',     requerido: true },
      { key: 'hora',              label: 'Hora',               tipo: 'text', placeholder: 'ej: 19:00' },
      { key: 'lugar',             label: 'Lugar',              tipo: 'text' },
      { key: 'direccion',         label: 'Dirección',          tipo: 'text' },
      { key: 'descripcion',       label: 'Descripción corta',  tipo: 'textarea', rows: 3 },
      { key: 'descripcion_larga', label: 'Descripción larga',  tipo: 'textarea', rows: 6 },
{ key: 'color', label: 'Color', tipo: 'color' },
{ key: 'imagen_url', label: 'URL imagen', tipo: 'text', placeholder: 'https://...' },
{ key: 'link_url', label: 'Enlace externo', tipo: 'text', placeholder: 'https://instagram.com/p/...' },
{ key: 'publicado', label: 'Publicado', tipo: 'toggle' },
    ],
    columnas: ['titulo', 'tipo', 'fecha', 'estado', 'publicado'],
  },
  talleres: {
    tabla: 'talleres', titulo: 'Talleres', color: C.blue,
    campos: [
      { key: 'titulo',          label: 'Título',          tipo: 'text',     requerido: true },
      { key: 'instructor',      label: 'Instructor',      tipo: 'text' },
      { key: 'fecha',           label: 'Fecha',           tipo: 'date' },
      { key: 'horario',         label: 'Horario',         tipo: 'text', placeholder: 'ej: Sábados 10:00–12:00' },
      { key: 'lugar',           label: 'Lugar',           tipo: 'text' },
      { key: 'cupo_tipo',       label: 'Tipo de cupo',    tipo: 'select', opciones: ['limitado', 'libre'] },
      { key: 'cupo_total',      label: 'Cupo total',      tipo: 'number' },
      { key: 'cupo_disponible', label: 'Cupo disponible', tipo: 'number' },
      { key: 'es_gratis',       label: 'Gratuito',        tipo: 'toggle' },
      { key: 'costo',           label: 'Costo ($)',       tipo: 'number', placeholder: '0' },
      { key: 'descripcion_costo', label: 'Descripción del costo', tipo: 'text', placeholder: 'ej: Pago en efectivo el día del taller' },
      { key: 'modalidad',       label: 'Modalidad',       tipo: 'select', opciones: ['Presencial', 'En línea', 'Híbrido'] },
      { key: 'fecha_cierre',    label: 'Fecha límite inscripción', tipo: 'date' },
      { key: 'descripcion',     label: 'Descripción corta', tipo: 'textarea', rows: 3 },
      { key: 'descripcion_larga', label: 'Descripción larga', tipo: 'textarea', rows: 6 },
{ key: 'color', label: 'Color', tipo: 'color' },
{ key: 'imagen_url', label: 'URL imagen', tipo: 'text', placeholder: 'https://...' },
{ key: 'link_url', label: 'Enlace externo', tipo: 'text', placeholder: 'https://instagram.com/p/...' },
{ key: 'activo', label: 'Activo', tipo: 'toggle' },
    ],
    columnas: ['titulo', 'instructor', 'fecha', 'cupo_disponible', 'activo'],
  },
  noticias: {
    tabla: 'noticias', titulo: 'Noticias', color: C.red,
    campos: [
      { key: 'titulo',            label: 'Título',            tipo: 'text',     requerido: true },
      { key: 'categoria',         label: 'Categoría',         tipo: 'select', opciones: ['Colectivo', 'Convocatoria', 'Publicación', 'Evento', 'Otro'] },
      { key: 'cuerpo',            label: 'Cuerpo',            tipo: 'textarea', rows: 10 },
{ key: 'imagen_url',        label: 'URL de imagen',     tipo: 'text' },
{ key: 'link_url',          label: 'Enlace externo',    tipo: 'text', placeholder: 'https://instagram.com/p/...' },
{ key: 'fecha_publicacion', label: 'Fecha publicación', tipo: 'date' },
{ key: 'color',             label: 'Color',             tipo: 'color' },
{ key: 'publicado',         label: 'Publicado',         tipo: 'toggle' },
    ],
    columnas: ['titulo', 'categoria', 'fecha_publicacion', 'publicado'],
  },
  banners: {
    tabla: 'banners', titulo: 'Banners del carrusel', color: C.blue,
    campos: [
      { key: 'titulo',     label: 'Título',        tipo: 'text',     requerido: true },
      { key: 'subtitulo',  label: 'Subtítulo',     tipo: 'text' },
      { key: 'imagen_url', label: 'URL de imagen', tipo: 'text' },
      { key: 'link_url',   label: 'URL del link',  tipo: 'text' },
      { key: 'link_tipo',  label: 'Tipo de link',  tipo: 'select', opciones: ['interno', 'externo'] },
      { key: 'orden',      label: 'Orden',         tipo: 'number' },
      { key: 'color',      label: 'Color',         tipo: 'color' },
      { key: 'activo',     label: 'Activo',        tipo: 'toggle' },
    ],
    columnas: ['titulo', 'subtitulo', 'orden', 'activo'],
  },
  miembros: {
    tabla: 'miembros', titulo: 'Miembros del colectivo', color: C.purple,
    campos: [
      { key: 'nombre',   label: 'Nombre',    tipo: 'text',     requerido: true },
      { key: 'rol',      label: 'Rol',       tipo: 'text', placeholder: 'ej: Poeta, Narradora...' },
      { key: 'bio',      label: 'Biografía', tipo: 'textarea', rows: 5 },
      { key: 'foto_url', label: 'URL foto',  tipo: 'text' },
      { key: 'color',    label: 'Color',     tipo: 'color' },
      { key: 'orden',    label: 'Orden',     tipo: 'number' },
      { key: 'activo',   label: 'Activo',    tipo: 'toggle' },
    ],
    columnas: ['nombre', 'rol', 'orden', 'activo'],
  },
}

export default function SeccionCRUD({ seccion }) {
  const config = CONFIG_SECCIONES[seccion]

  const [items, setItems]           = useState([])
  const [cargando, setCargando]     = useState(true)
  const [modal, setModal]           = useState(null)       // null | 'nuevo' | item (editar)
  const [confirmDel, setConfirmDel] = useState(null)
  const [form, setForm]             = useState({})
  const [guardando, setGuardando]   = useState(false)

  // ── Notificaciones modales ──
  const [alerta, setAlerta] = useState(null)

  // ── Confirmación antes de guardar edición ──
const [pendienteGuardar, setPendienteGuardar] = useState(false)
  const [perfilesLista, setPerfilesLista]       = useState([])

  useEffect(() => {
    if (config) cargar()
    if (seccion === 'lecturas') {
      supabase.from('perfiles').select('id, nombre, foto_url, username').eq('activo', true).order('nombre')
        .then(({ data }) => { if (data) setPerfilesLista(data) })
    }
  }, [seccion])

  if (!config) return null

  const cargar = async () => {
    setCargando(true)
    const { data } = await supabase.from(config.tabla).select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setCargando(false)
  }

  const abrirNuevo = () => {
    const defaults = {}
    config.campos.forEach(c => {
      if (c.tipo === 'toggle') defaults[c.key] = false
      else if (c.tipo === 'number') defaults[c.key] = c.key === 'orden' ? 0 : c.key.includes('cupo') ? 20 : c.key === 'minutos_lectura' ? 5 : undefined
      else if (c.tipo === 'color') defaults[c.key] = '#9B2D8E'
      else defaults[c.key] = ''
    })
    setForm(defaults)
    setModal('nuevo')
  }

  const abrirEditar = (item) => {
    setForm({ ...item })
    setModal(item)
  }

  // ── GUARDAR (nuevo o editar) ──
  const solicitarGuardar = () => {
    // Validar requeridos
    for (const campo of config.campos) {
      if (campo.requerido && !form[campo.key]?.toString().trim()) {
        setAlerta({
          tipo: 'error',
          titulo: 'Campo obligatorio',
          mensaje: `"${campo.label}" es obligatorio para continuar.`,
          botonTexto: 'Entendido',
        })
        return
      }
    }

    if (modal === 'nuevo') {
      // Crear: sin confirmación, directo
      ejecutarGuardar()
    } else {
      // Editar: pedir confirmación
      setPendienteGuardar(true)
      setAlerta({
        tipo: 'advertencia',
        titulo: '¿Guardar cambios?',
        mensaje: `Vas a editar "${form[config.columnas[0]] || config.titulo}". Esta acción actualizará el contenido publicado.`,
        botonTexto: 'Sí, guardar',
        botonAccion: () => { setPendienteGuardar(false); ejecutarGuardar() },
      })
    }
  }

  const ejecutarGuardar = async () => {
    setGuardando(true)
    const payload = { ...form }
    delete payload.id; delete payload.created_at; delete payload.updated_at

    let error
    if (modal === 'nuevo') {
      const res = await supabase.from(config.tabla).insert(payload)
      error = res.error
    } else {
      const res = await supabase.from(config.tabla).update(payload).eq('id', modal.id)
      error = res.error
    }

    setGuardando(false)

    if (error) {
      setAlerta({
        tipo: 'error',
        titulo: 'Error al guardar',
        mensaje: error.message,
        botonTexto: 'Entendido',
      })
      return
    }

    setModal(null)
    setAlerta({
      tipo: 'exito',
      titulo: modal === 'nuevo' ? '¡Creado!' : '¡Actualizado!',
      mensaje: modal === 'nuevo'
        ? `"${form[config.columnas[0]] || config.titulo}" fue creado correctamente.`
        : `"${form[config.columnas[0]] || config.titulo}" fue actualizado.`,
      botonTexto: 'Perfecto',
      autoclose: 3000,
    })
    cargar()
  }

  // ── ELIMINAR ──
  const solicitarEliminar = (item) => {
    setConfirmDel(item)
    setAlerta({
      tipo: 'error',
      titulo: '¿Eliminar este registro?',
      mensaje: `Vas a eliminar "${item[config.columnas[0]]}". Esta acción no se puede deshacer.`,
      botonTexto: 'Sí, eliminar',
      botonAccion: () => ejecutarEliminar(item.id),
    })
  }

  const ejecutarEliminar = async (id) => {
    const { error } = await supabase.from(config.tabla).delete().eq('id', id)
    setConfirmDel(null)
    if (error) {
      setAlerta({ tipo: 'error', titulo: 'Error', mensaje: error.message, botonTexto: 'Entendido' })
      return
    }
    setAlerta({
      tipo: 'advertencia',
      titulo: 'Eliminado',
      mensaje: 'El registro fue eliminado correctamente.',
      botonTexto: 'Aceptar',
      autoclose: 2500,
    })
    cargar()
  }

  const togglePublicado = async (item) => {
    const campo = config.tabla === 'talleres' || config.tabla === 'miembros' ? 'activo' : 'publicado'
    const nuevoValor = !item[campo]
    const { error } = await supabase.from(config.tabla).update({ [campo]: nuevoValor }).eq('id', item.id)
    if (!error) {
      cargar()
      setAlerta({
        tipo: nuevoValor ? 'exito' : 'advertencia',
        titulo: nuevoValor ? 'Publicado' : 'Ocultado',
        mensaje: `"${item[config.columnas[0]]}" ahora está ${nuevoValor ? 'visible al público' : 'oculto'}.`,
        botonTexto: 'OK',
        autoclose: 2000,
      })
    }
  }

  const renderValor = (item, col) => {
    const v = item[col]
    if (v === null || v === undefined || v === '') return <span style={{ color: 'rgba(26,18,8,0.2)' }}>—</span>
    if (typeof v === 'boolean') return (
      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 4, fontWeight: '700', background: v ? 'rgba(34,161,106,0.1)' : 'rgba(26,18,8,0.05)', color: v ? C.green : 'rgba(26,18,8,0.35)' }}>{v ? 'Sí' : 'No'}</span>
    )
    if (col === 'fecha' || col === 'fecha_cierre' || col === 'fecha_publicacion') {
      try { return new Date(v).toLocaleDateString('es-MX') } catch { return v }
    }
    if (col === 'color') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: v, display: 'inline-block', border: '1px solid rgba(26,18,8,0.1)' }} />
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10 }}>{v}</span>
      </span>
    )
    const s = String(v)
    return s.length > 40 ? s.slice(0, 40) + '…' : s
  }

  const inputStyle = { width: '100%', padding: '14px 16px', background: '#faf6ee', border: '1px solid rgba(26,18,8,0.12)', color: C.ink, outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 24, marginBottom: 16, borderRadius: 5, boxSizing: 'border-box', lineHeight: 1.45 }
  const labelStyle = { fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.58)', display: 'block', marginBottom: 8, fontWeight: '700' }
  const btnP = (color = config.color, extra = {}) => ({ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', background: color, color: '#fff', border: 'none', padding: '10px 18px', cursor: 'pointer', borderRadius: 5, fontWeight: '700', ...extra })

  const renderCampo = (campo) => {
    const v = form[campo.key] ?? ''
    const base = { onFocus: e => e.target.style.borderColor = config.color, onBlur: e => e.target.style.borderColor = 'rgba(26,18,8,0.12)' }

    if (campo.tipo === 'toggle') return (
      <div key={campo.key} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => setForm(prev => ({ ...prev, [campo.key]: !prev[campo.key] }))}
          style={{ width: 44, height: 24, borderRadius: 12, background: v ? config.color : 'rgba(26,18,8,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: v ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </button>
        <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }} onClick={() => setForm(prev => ({ ...prev, [campo.key]: !prev[campo.key] }))}>{campo.label}</label>
      </div>
    )

    if (campo.tipo === 'color') return (
      <div key={campo.key} style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{campo.label}</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="color" value={v || '#9B2D8E'} onChange={e => setForm(prev => ({ ...prev, [campo.key]: e.target.value }))} style={{ width: 48, height: 40, padding: 2, background: '#faf6ee', border: '1px solid rgba(26,18,8,0.12)', borderRadius: 5, cursor: 'pointer' }} />
          <input type="text" value={v || ''} onChange={e => setForm(prev => ({ ...prev, [campo.key]: e.target.value }))} style={{ ...inputStyle, marginBottom: 0, flex: 1, fontFamily: "'Courier Prime', monospace", fontSize: 14 }} {...base} />
        </div>
      </div>
    )

if (campo.tipo === 'usuario_selector') {
      const seleccionado = perfilesLista.find(p => p.nombre === v)
      return (
        <div key={campo.key} style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{campo.label}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Preview del seleccionado */}
            {seleccionado && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: config.color + '08', border: `1px solid ${config.color}22`, borderRadius: 5 }}>
                {seleccionado.foto_url
                  ? <img src={seleccionado.foto_url} alt={seleccionado.nombre}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${config.color}44` }} />
                  : <div style={{ width: 36, height: 36, borderRadius: '50%', background: config.color + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${config.color}33` }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: config.color }}>
                        {seleccionado.nombre?.[0]}
                      </span>
                    </div>
                }
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.ink, fontWeight: 600 }}>
                    {seleccionado.nombre}
                  </p>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.45)', letterSpacing: 1, fontWeight: '700' }}>
                    @{seleccionado.username}
                  </p>
                </div>
              </div>
            )}
            <select
              value={v}
              onChange={e => {
                const perfil = perfilesLista.find(p => p.nombre === e.target.value)
                setForm(prev => ({
                  ...prev,
                  recomendado_por: perfil?.nombre || '',
                  recomendador_foto: perfil?.foto_url || '',
                }))
              }}
              style={{ ...inputStyle, cursor: 'pointer' }}
              {...base}
            >
              <option value="">— Seleccionar usuario —</option>
              {perfilesLista.map(p => (
                <option key={p.id} value={p.nombre}>{p.nombre} (@{p.username})</option>
              ))}
            </select>
          </div>
        </div>
      )
    }

    return (
      <div key={campo.key} style={{ marginBottom: 0 }}>
        <label style={labelStyle}>{campo.label}{campo.requerido && <span style={{ color: config.color }}> *</span>}</label>
        {campo.tipo === 'textarea' ? (
          <textarea rows={campo.rows || 4} placeholder={campo.placeholder || ''} value={v} onChange={e => setForm(prev => ({ ...prev, [campo.key]: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} {...base} />
        ) : campo.tipo === 'select' ? (
          <select value={v} onChange={e => setForm(prev => ({ ...prev, [campo.key]: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">— Seleccionar —</option>
            {campo.opciones.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={campo.tipo} placeholder={campo.placeholder || ''} value={v} onChange={e => setForm(prev => ({ ...prev, [campo.key]: e.target.value }))} style={inputStyle} {...base} />
        )}
      </div>
    )
  }

  const campoPublicado = config.campos.find(c => c.key === 'publicado' || c.key === 'activo')

  return (
    <div>
      {/* ── NOTIFICACION MODAL ── */}
      {alerta && (
        <Notificacion
          tipo={alerta.tipo}
          titulo={alerta.titulo}
          mensaje={alerta.mensaje}
          botonTexto={alerta.botonTexto}
          botonAccion={alerta.botonAccion}
          autoclose={alerta.autoclose}
          onCerrar={() => setAlerta(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, color: C.ink }}>{config.titulo}</h2>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, fontWeight: '600' }}>{items.length} registros</p>
        </div>
        <button onClick={abrirNuevo} style={btnP()}>+ Nuevo</button>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: 'rgba(26,18,8,0.4)', fontWeight: '700' }}>Cargando...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>No hay {config.titulo.toLowerCase()} aún</p>
          <button onClick={abrirNuevo} style={{ ...btnP(), marginTop: 20 }}>Crear el primero</button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.08)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {config.columnas.map(col => (
                  <th key={col} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', padding: '14px 18px', textAlign: 'left', borderBottom: '1px solid rgba(26,18,8,0.08)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th style={{ padding: '14px 18px', borderBottom: '1px solid rgba(26,18,8,0.08)', width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(26,18,8,0.04)' : 'none', transition: 'background 0.15s', cursor: 'default' }}
                  onMouseOver={e => e.currentTarget.style.background = '#faf6ee'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  {config.columnas.map(col => (
                    <td key={col} style={{ padding: '15px 18px', fontFamily: col === config.columnas[0] ? "'Cormorant Garamond', serif" : "'Courier Prime', monospace", fontSize: col === config.columnas[0] ? 19 : 11, color: col === config.columnas[0] ? C.ink : 'rgba(26,18,8,0.6)', fontWeight: col === config.columnas[0] ? '500' : '600', letterSpacing: col === config.columnas[0] ? 0 : 0.5 }}>
                      {renderValor(item, col)}
                    </td>
                  ))}
<td style={{ padding: '15px 18px' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {campoPublicado && (
                        <button
                          onClick={() => togglePublicado(item)}
                          title={item[campoPublicado.key] ? 'Despublicar' : 'Publicar'}
                          style={{
                            width: 32, height: 32, cursor: 'pointer', borderRadius: 6,
                            background: item[campoPublicado.key] ? 'rgba(34,161,106,0.1)' : 'rgba(26,18,8,0.05)',
                            color: item[campoPublicado.key] ? C.green : 'rgba(26,18,8,0.35)',
                            border: `1px solid ${item[campoPublicado.key] ? 'rgba(34,161,106,0.25)' : 'rgba(26,18,8,0.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s', flexShrink: 0,
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = item[campoPublicado.key] ? 'rgba(34,161,106,0.2)' : 'rgba(26,18,8,0.1)'
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = item[campoPublicado.key] ? 'rgba(34,161,106,0.1)' : 'rgba(26,18,8,0.05)'
                          }}
                        >
                          {item[campoPublicado.key] ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94"/>
                              <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.31"/>
                              <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/><path d="M1 1l22 22"/>
                            </svg>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => abrirEditar(item)}
                        title="Editar"
                        style={{
                          width: 32, height: 32, cursor: 'pointer', borderRadius: 6,
                          background: 'transparent', color: 'rgba(26,18,8,0.45)',
                          border: '1px solid rgba(26,18,8,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(26,18,8,0.06)'; e.currentTarget.style.color = C.ink }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(26,18,8,0.45)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => solicitarEliminar(item)}
                        title="Eliminar"
                        style={{
                          width: 32, height: 32, cursor: 'pointer', borderRadius: 6,
                          background: 'transparent', color: `${C.red}99`,
                          border: `1px solid ${C.red}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = `${C.red}10`; e.currentTarget.style.color = C.red }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = `${C.red}99` }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL CREAR / EDITAR ── */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '40px', width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, borderBottom: `2px solid ${config.color}22`, paddingBottom: 16 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: C.ink, fontWeight: 400 }}>
                {modal === 'nuevo' ? `Nuevo — ${config.titulo}` : `Editar — ${form[config.columnas[0]] || config.titulo}`}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'rgba(26,18,8,0.4)' }}>✕</button>
            </div>
            {config.campos.map(campo => renderCampo(campo))}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={solicitarGuardar} disabled={guardando} style={{ ...btnP(), flex: 1, padding: '14px', opacity: guardando ? 0.6 : 1 }}>
                {guardando ? 'Guardando...' : modal === 'nuevo' ? 'Crear' : 'Guardar cambios'}
              </button>
              <button onClick={() => setModal(null)} style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.4)', padding: '14px 24px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}