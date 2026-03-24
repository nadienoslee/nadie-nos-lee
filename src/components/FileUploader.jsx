import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

function formatTamaño(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getIcono(tipo, size = 28) {
  const s = { width: size, height: size, display: 'block' }
  if (tipo?.includes('pdf')) return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )
  if (tipo?.includes('word') || tipo?.includes('doc')) return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  )
  if (tipo?.includes('text')) return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#22a16a" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
  )
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="#9B2D8E" strokeWidth="1.5" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
  )
}

function getExt(tipo, nombre) {
  if (tipo?.includes('pdf')) return 'PDF'
  if (tipo?.includes('word') || tipo?.includes('doc') || nombre?.endsWith('.docx') || nombre?.endsWith('.doc')) return 'DOC'
  if (tipo?.includes('text') || nombre?.endsWith('.txt')) return 'TXT'
  if (nombre?.endsWith('.rtf')) return 'RTF'
  return 'ARCH'
}

export default function FileUploader({
  archivos = [],
  setArchivos,
  maxArchivos = 3,
  color = '#8B1A1A',
  formatosPermitidos = ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
}) {
  const [dragging, setDragging]       = useState(false)
  const [preview, setPreview]         = useState(null)
  const [renombrando, setRenombrando] = useState(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const inputRef = useRef(null)

  const esImagen = (tipo) => tipo?.startsWith('image/')
  const lleno = archivos.length >= maxArchivos

  const agregarArchivos = useCallback((files) => {
    const espacio = maxArchivos - archivos.length
    if (espacio <= 0) return
    const nuevos = Array.from(files).slice(0, espacio).map(f => ({
      id: Date.now() + Math.random(),
      file: f,
      nombre: f.name,
      tipo: f.type,
      tamaño: f.size,
      url: URL.createObjectURL(f),
    }))
    setArchivos(prev => [...prev, ...nuevos])
  }, [archivos.length, maxArchivos, setArchivos])

  const eliminar = (id) => {
    setArchivos(prev => {
      const a = prev.find(x => x.id === id)
      if (a?.url) URL.revokeObjectURL(a.url)
      return prev.filter(x => x.id !== id)
    })
  }

  const guardarNombre = (id) => {
    if (!nuevoNombre.trim()) { setRenombrando(null); return }
    setArchivos(prev => prev.map(a => a.id === id ? { ...a, nombre: nuevoNombre.trim() } : a))
    setRenombrando(null)
    setNuevoNombre('')
  }

  return (
    <div>
      <input ref={inputRef} type="file" multiple accept={formatosPermitidos.join(',')} style={{ display: 'none' }}
        onChange={e => { agregarArchivos(e.target.files); e.target.value = '' }} />

      {/* ── ZONA DROP — solo si no está lleno ── */}
      {!lleno && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); agregarArchivos(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? color : 'rgba(26,18,8,0.18)'}`,
            borderRadius: 6,
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? color + '06' : 'rgba(26,18,8,0.015)',
            transition: 'all 0.2s',
            marginBottom: archivos.length > 0 ? 16 : 0,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragging ? color : 'rgba(26,18,8,0.2)'} strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 12px', display: 'block', transition: 'stroke 0.2s' }}>
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: dragging ? color : 'rgba(26,18,8,0.4)', fontWeight: '700', marginBottom: 6 }}>
            {dragging ? 'Suelta aquí' : 'Arrastra archivos o haz clic para seleccionar'}
          </p>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, color: 'rgba(26,18,8,0.3)', marginBottom: 12 }}>
            {formatosPermitidos.join('  ·  ')}
          </p>
          <div style={{ display: 'inline-block', padding: '4px 14px', background: color + '10', border: `1px solid ${color}22` }}>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color, fontWeight: '700' }}>
              {archivos.length} / {maxArchivos} archivos
            </span>
          </div>
        </div>
      )}

      {/* ── CARDS de archivos ── */}
      {archivos.length > 0 && (
        <div>
          {/* Encabezado cuando está lleno */}
          {lleno && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22a16a' }} />
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', fontWeight: '700' }}>
                  {archivos.length} / {maxArchivos} archivos — límite alcanzado
                </span>
              </div>
            </div>
          )}

          {/* Grid de cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`, gap: 12 }}>
            {archivos.map((a) => (
              <div key={a.id} style={{
                background: '#fff',
                border: `1px solid rgba(26,18,8,0.1)`,
                borderRadius: 6,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(26,18,8,0.08)`; e.currentTarget.style.borderColor = color + '44' }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(26,18,8,0.1)' }}
              >
                {/* Zona thumbnail / icono — click para preview */}
                <div
                  onClick={() => setPreview(a)}
                  style={{
                    height: 100,
                    background: esImagen(a.tipo) ? '#f5ede0' : `linear-gradient(135deg, ${color}08 0%, rgba(26,18,8,0.03) 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    borderBottom: '1px solid rgba(26,18,8,0.06)',
                  }}
                >
                  {esImagen(a.tipo) ? (
                    <img src={a.url} alt={a.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      {getIcono(a.tipo, 32)}
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, fontWeight: '700', color: 'rgba(26,18,8,0.3)', textTransform: 'uppercase' }}>
                        {getExt(a.tipo, a.nombre)}
                      </span>
                    </div>
                  )}
                  {/* Hover preview hint */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,18,8,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(26,18,8,0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(26,18,8,0)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(26,18,8,0.5)" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px' }}>
                  {renombrando === a.id ? (
                    <div style={{ display: 'flex', gap: 5 }}>
                      <input type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') guardarNombre(a.id); if (e.key === 'Escape') setRenombrando(null) }}
                        autoFocus
                        style={{ flex: 1, border: `1px solid ${color}`, padding: '4px 8px', fontFamily: "'Courier Prime', monospace", fontSize: 11, outline: 'none', borderRadius: 2, minWidth: 0 }} />
                      <button onClick={() => guardarNombre(a.id)} style={{ background: color, border: 'none', color: '#fff', padding: '4px 8px', cursor: 'pointer', borderRadius: 2, fontSize: 12 }}>✓</button>
                    </div>
                  ) : (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: '#1a1208', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{a.nombre}</p>
                  )}
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.4)', letterSpacing: 0.5 }}>{formatTamaño(a.tamaño)}</p>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', borderTop: '1px solid rgba(26,18,8,0.06)' }}>
{[
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, action: () => { setRenombrando(a.id); setNuevoNombre(a.nombre) }, title: 'Renombrar' },
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>, action: () => eliminar(a.id), title: 'Eliminar', red: true },
                  ].map((btn, bi) => (
                    <button key={bi} onClick={btn.action} title={btn.title}
                      style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: btn.red ? '#ef4444' : 'rgba(26,18,8,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', borderRight: bi < 1 ? '1px solid rgba(26,18,8,0.06)' : 'none' }}
                      onMouseOver={e => { e.currentTarget.style.background = btn.red ? 'rgba(239,68,68,0.06)' : 'rgba(26,18,8,0.04)'; e.currentTarget.style.color = btn.red ? '#ef4444' : '#1a1208' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = btn.red ? '#ef4444' : 'rgba(26,18,8,0.35)' }}
                    >{btn.icon}</button>
                  ))}
                </div>
              </div>
            ))}


          </div>
        </div>
      )}

{/* ── LIGHTBOX — Portal directo al body para evitar clipping ── */}
      {preview && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.88)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, boxSizing: 'border-box',
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
              width: 'min(820px, 92vw)',
              maxHeight: '88vh',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(26,18,8,0.08)', background: '#faf6ee', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {getIcono(preview.tipo, 20)}
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#1a1208', lineHeight: 1.1 }}>{preview.nombre}</p>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.4)', letterSpacing: 1 }}>{formatTamaño(preview.tamaño)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <a href={preview.url} download={preview.nombre}
                  style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color, background: color + '12', border: `1px solid ${color}33`, padding: '7px 16px', textDecoration: 'none', fontWeight: '700', borderRadius: 4 }}
                  onMouseOver={e => e.currentTarget.style.background = color + '22'}
                  onMouseOut={e => e.currentTarget.style.background = color + '12'}
                >↓ Descargar</a>
                <button onClick={() => setPreview(null)}
                  style={{ width: 34, height: 34, background: 'none', border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, borderRadius: 4 }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(26,18,8,0.06)'; e.currentTarget.style.color = '#1a1208' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(26,18,8,0.45)' }}
                >✕</button>
              </div>
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: esImagen(preview.tipo) ? '#f5ede0' : '#fff', minHeight: 240 }}>
              {esImagen(preview.tipo) ? (
                <img src={preview.url} alt={preview.nombre} style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', display: 'block' }} />
              ) : preview.tipo?.includes('pdf') ? (
                <iframe src={preview.url} style={{ width: '100%', height: '72vh', border: 'none', display: 'block' }} title={preview.nombre} />
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 32px' }}>
                  <div style={{ transform: 'scale(2.2)', transformOrigin: 'center', marginBottom: 36 }}>{getIcono(preview.tipo, 28)}</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#1a1208', marginBottom: 6, marginTop: 20 }}>{preview.nombre}</p>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, marginBottom: 28 }}>{formatTamaño(preview.tamaño)}</p>
                  <a href={preview.url} download={preview.nombre}
                    style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#fff', background: color, padding: '14px 28px', textDecoration: 'none', fontWeight: '700', borderRadius: 2, display: 'inline-block' }}>
                    ↓ Descargar archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}