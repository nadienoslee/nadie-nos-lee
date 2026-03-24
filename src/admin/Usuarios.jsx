import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const permisos = ['crear', 'editar', 'eliminar', 'publicar', 'gestionar_usuarios']

function generarPassword() {
  const mayus = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const minus = 'abcdefghijklmnopqrstuvwxyz'
  const nums  = '0123456789'
  const simbs = '!@#$%&*?'
  const getRand = (str) => str[Math.floor(Math.random() * str.length)]
  const obligatorios = [getRand(mayus), getRand(nums), getRand(simbs)]
  const relleno = Array.from({ length: 5 }, () => getRand(minus))
  return [...obligatorios, ...relleno].sort(() => Math.random() - 0.5).join('')
}

function validarPassword(pass) {
  const errores = []
  if (pass.length < 8) errores.push('Mínimo 8 caracteres')
  if ((pass.match(/[A-Z]/g) || []).length !== 1) errores.push('Exactamente 1 mayúscula')
  if (!/[a-z]/.test(pass)) errores.push('Al menos una minúscula')
  if (!/[0-9]/.test(pass)) errores.push('Al menos un número')
  if (!/[!@#$%&*?]/.test(pass)) errores.push('Al menos un símbolo (!@#$%&*?)')
  return errores
}

function capitalizarNombre(texto) {
  return texto.split(' ').map(palabra => {
    if (!palabra) return ''
    return palabra[0].toUpperCase() + palabra.slice(1).toLowerCase()
  }).join(' ')
}

function generarUsername(nombre) {
  return nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

const permisosDefault = {
  crear: true, editar: true, eliminar: false,
  publicar: false, gestionar_usuarios: false,
}

export default function Usuarios({ esAdmin = true }) {
  const [usuarios, setUsuarios]         = useState([])
  const [cargando, setCargando]         = useState(true)
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalEditar, setModalEditar]   = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [feedback, setFeedback]         = useState(null)
  const [passGenerada, setPassGenerada] = useState(generarPassword())
  const [passManual, setPassManual]     = useState('')
  const [passErrores, setPassErrores]   = useState([])
  const [modoPass, setModoPass]         = useState('auto')
  const [form, setForm] = useState({ nombre: '', email: '', rol: 'editor', permisos: { ...permisosDefault } })

  const usernamePreview = generarUsername(form.nombre)

  useEffect(() => { cargarUsuarios() }, [])

  const cargarUsuarios = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setUsuarios(data.map(u => ({
      ...u,
      permisos: u.permisos || permisosDefault,
      debe_cambiar_pass: u.debe_cambiar_pass || false,
      pass_temporal: u.pass_temporal || null,
    })))
    setCargando(false)
  }

  const mostrarFeedback = (msg, tipo = 'exito') => {
    setFeedback({ msg, tipo })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleNombreChange = (e) => {
    setForm(prev => ({ ...prev, nombre: capitalizarNombre(e.target.value) }))
  }

  const abrirNuevo = () => {
    setForm({ nombre: '', email: '', rol: 'editor', permisos: { ...permisosDefault } })
    setPassGenerada(generarPassword())
    setPassManual('')
    setPassErrores([])
    setModoPass('auto')
    setModalNuevo(true)
  }

const crearUsuario = async () => {
    const pass = modoPass === 'auto' ? passGenerada : passManual
    const errores = validarPassword(pass)
    if (errores.length > 0) { setPassErrores(errores); return }
    if (!form.nombre.trim()) { mostrarFeedback('El nombre es obligatorio', 'error'); return }
    if (!form.email.trim()) { mostrarFeedback('El correo es obligatorio', 'error'); return }

    const username = generarUsername(form.nombre)
    if (!username) { mostrarFeedback('Nombre no válido', 'error'); return }
    if (usuarios.some(u => u.username === username)) {
      mostrarFeedback(`El usuario "@${username}" ya existe`, 'error'); return
    }
    if (usuarios.some(u => u.email?.toLowerCase() === form.email.trim().toLowerCase())) {
      mostrarFeedback(`El correo "${form.email}" ya está registrado`, 'error'); return
    }

    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: {
        action: 'create',
        email: form.email.trim().toLowerCase(),
        password: pass,
        nombre: form.nombre,
        username,
        rol: form.rol,
        permisos: form.permisos,
      },
    })

    if (error || data?.error) {
      mostrarFeedback(`Error al crear usuario: ${data?.error || error.message}`, 'error')
    } else {
      setModalNuevo(false)
      mostrarFeedback(`Usuario "${form.nombre}" creado · @${username} · Contraseña: ${pass}`)
      cargarUsuarios()
    }
  }

  const guardarEdicion = async () => {
    const username = generarUsername(form.nombre)

    if (!form.nombre.trim()) {
      mostrarFeedback('El nombre es obligatorio', 'error')
      return
    }

    if (!form.email.trim()) {
      mostrarFeedback('El correo es obligatorio', 'error')
      return
    }

    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre: form.nombre,
        email: form.email,
        username,
        rol: form.rol,
        permisos: form.permisos,
      })
      .eq('id', modalEditar.id)

    if (error) {
      mostrarFeedback('Error al actualizar', 'error')
      return
    }

    setModalEditar(null)
    mostrarFeedback('Usuario actualizado')
    cargarUsuarios()
  }
  const toggleActivo = async (usuario) => {
    const { error } = await supabase
      .from('perfiles')
      .update({ activo: !usuario.activo })
      .eq('id', usuario.id)
    if (!error) { cargarUsuarios(); mostrarFeedback(`${usuario.nombre} ${usuario.activo ? 'desactivado' : 'activado'}`) }
  }

  const resetearPass = async (usuario) => {
    const nuevaPass = generarPassword()
    const { error } = await supabase
      .from('perfiles')
      .update({ debe_cambiar_pass: true, pass_temporal: nuevaPass })
      .eq('id', usuario.id)
    if (!error) { cargarUsuarios(); mostrarFeedback(`Contraseña restablecida para ${usuario.nombre}: ${nuevaPass}`) }
  }

  const hacerAdmin = async (usuario) => {
    const nuevoRol = usuario.rol === 'admin' ? 'editor' : 'admin'
    const nuevosPermisos = nuevoRol === 'admin'
      ? Object.fromEntries(permisos.map(p => [p, true]))
      : { ...permisosDefault }
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol, permisos: nuevosPermisos })
      .eq('id', usuario.id)
    if (!error) { cargarUsuarios(); mostrarFeedback(`${usuario.nombre} ahora es ${nuevoRol}`) }
  }

const eliminarUsuario = async (id) => {
    // Obtener el user_id de Auth antes de eliminar
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('user_id, nombre')
      .eq('id', id)
      .single()

    if (perfilError || !perfil) {
      mostrarFeedback('No se encontró el perfil', 'error'); return
    }

    // Eliminar de Supabase Auth (si tiene user_id vinculado)
    if (perfil.user_id) {
      const { data: authData, error: authError } = await supabase.functions.invoke('admin-users', {
        body: { action: 'delete', userId: perfil.user_id },
      })
      if (authError || authData?.error) {
        mostrarFeedback(`Error al revocar acceso: ${authData?.error || authError.message}`, 'error')
        return
      }
    }

    // Eliminar perfil (contribuciones —escrituras, notas, etc.— se conservan por nombre de autor)
    const { error } = await supabase
      .from('perfiles')
      .delete()
      .eq('id', id)

    if (error) { mostrarFeedback('Error al eliminar perfil', 'error'); return }
    setConfirmEliminar(null)
    mostrarFeedback('Usuario eliminado · Sus contribuciones se conservan', 'advertencia')
    cargarUsuarios()
  }

  const inputStyle = { width: '100%', padding: '12px 14px', background: '#faf6ee', border: '1px solid rgba(26,18,8,0.12)', color: '#1a1208', outline: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, marginBottom: 4, borderRadius: 5 }
  const labelStyle = { fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(26,18,8,0.5)', display: 'block', marginBottom: 6, fontWeight: '700' }
  const hintStyle  = { fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, color: 'rgba(26,18,8,0.4)', marginBottom: 16, display: 'block', fontWeight: '600' }
  const btnP = (color = '#9B2D8E', extra = {}) => ({ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', background: color, color: color === 'transparent' ? undefined : '#fff', border: 'none', padding: '10px 18px', cursor: 'pointer', borderRadius: 5, fontWeight: '700', ...extra })

  if (cargando) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: 'rgba(26,18,8,0.4)', fontWeight: '700' }}>Cargando usuarios...</p>
    </div>
  )

  return (
    <div>
      {feedback && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: feedback.tipo === 'error' ? '#8B1A1A' : feedback.tipo === 'advertencia' ? '#b8943a' : '#22a16a', color: '#fff', padding: '14px 28px', fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 1, zIndex: 300, boxShadow: '0 8px 32px rgba(26,18,8,0.2)', borderRadius: 6, maxWidth: '80vw', textAlign: 'center', fontWeight: '600' }}>
          {feedback.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 400, color: '#1a1208' }}>Gestión de usuarios</h2>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, fontWeight: '600' }}>{usuarios.length} usuarios registrados</p>
        </div>
        {esAdmin && <button onClick={abrirNuevo} style={btnP()}>+ Nuevo usuario</button>}
      </div>

      {usuarios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', border: '1px solid rgba(26,18,8,0.07)', borderRadius: 10 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>No hay usuarios registrados aún</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {usuarios.map(u => (
            <div key={u.id} style={{ background: '#fff', border: '1px solid rgba(26,18,8,0.08)', padding: '24px 28px', borderRadius: 8, opacity: u.activo ? 1 : 0.5 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: u.rol === 'admin' ? '#9B2D8E22' : '#3AABDC22', border: `2px solid ${u.rol === 'admin' ? '#9B2D8E' : '#3AABDC'}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {u.foto_url ? (
                      <img src={u.foto_url} alt={u.nombre} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: u.rol === 'admin' ? '#9B2D8E' : '#3AABDC' }}>{u.nombre?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#1a1208' }}>{u.nombre}</p>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#1a1208', background: 'rgba(26,18,8,0.06)', padding: '3px 10px', borderRadius: 4, fontWeight: '700' }}>@{u.username}</span>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: u.rol === 'admin' ? '#fff' : '#3AABDC', background: u.rol === 'admin' ? '#9B2D8E' : '#3AABDC22', padding: '3px 10px', borderRadius: 4 }}>{u.rol}</span>
                      {!u.activo && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8B1A1A', background: '#8B1A1A22', padding: '3px 10px', borderRadius: 4 }}>Inactivo</span>}
                      {u.debe_cambiar_pass && <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#b8943a', background: '#b8943a22', padding: '3px 10px', borderRadius: 4 }}>Cambio pendiente</span>}
                    </div>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, fontWeight: '600' }}>
                      {u.email || 'Sin correo'} · Desde {new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {permisos.map(p => (
                        <span key={p} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: u.permisos?.[p] ? '#22a16a18' : 'rgba(26,18,8,0.04)', color: u.permisos?.[p] ? '#22a16a' : 'rgba(26,18,8,0.25)', border: `1px solid ${u.permisos?.[p] ? '#22a16a33' : 'rgba(26,18,8,0.08)'}`, fontWeight: '700' }}>
                          {u.permisos?.[p] ? '✓' : '✕'} {p.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {esAdmin && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setModalEditar(u)
                        setForm({
                          nombre: u.nombre,
                          email: u.email || '',
                          rol: u.rol,
                          permisos: { ...(u.permisos || permisosDefault) },
                        })
                      }}
                      style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.15)', color: 'rgba(26,18,8,0.6)' }}
                    >
                      Editar
                    </button>
                    <button onClick={() => resetearPass(u)} style={{ ...btnP('transparent'), border: '1px solid rgba(184,148,58,0.4)', color: '#b8943a' }}>Reset pass</button>
                    <button onClick={() => hacerAdmin(u)} style={{ ...btnP('transparent'), border: '1px solid rgba(155,45,142,0.3)', color: '#9B2D8E' }}>{u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}</button>
                    <button onClick={() => toggleActivo(u)} style={{ ...btnP('transparent'), border: `1px solid ${u.activo ? 'rgba(139,26,26,0.3)' : 'rgba(34,161,106,0.3)'}`, color: u.activo ? '#8B1A1A' : '#22a16a' }}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                    <button onClick={() => setConfirmEliminar(u)} style={btnP('#8B1A1A')}>Eliminar</button>
                  </div>
                )}
              </div>
              {u.pass_temporal && u.debe_cambiar_pass && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', border: '1px solid rgba(184,148,58,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: '#b8943a', letterSpacing: 1, fontWeight: '600' }}>Contraseña temporal: <strong style={{ fontSize: 15, letterSpacing: 2 }}>{u.pass_temporal}</strong></span>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' }}>El usuario debe cambiarla al ingresar</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVO */}
      {modalNuevo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '40px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: '#1a1208' }}>Nuevo usuario</h3>
              <button onClick={() => setModalNuevo(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'rgba(26,18,8,0.4)' }}>✕</button>
            </div>
            <label style={labelStyle}>Nombre completo</label>
            <input
              style={inputStyle}
              placeholder="Nombre Apellido"
              value={form.nombre}
              onChange={handleNombreChange}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
            />

            <label style={labelStyle}>Correo electrónico</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="correo@empresa.com"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
            />
            {form.nombre ? (
              <span style={hintStyle}>Usuario: <strong style={{ color: '#9B2D8E', letterSpacing: 1 }}>@{usernamePreview || '—'}</strong><span style={{ color: 'rgba(26,18,8,0.3)', marginLeft: 8 }}>· Nombre de acceso al panel</span></span>
            ) : (
              <span style={{ ...hintStyle, marginBottom: 18 }}>El usuario se genera automáticamente del nombre</span>
            )}
            <label style={{ ...labelStyle, marginTop: 8 }}>Rol</label>
            <select style={{ ...inputStyle, cursor: 'pointer', marginBottom: 18 }} value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
            <label style={{ ...labelStyle, marginTop: 4 }}>Permisos</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {permisos.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: form.permisos[p] ? '#f0fdf4' : '#faf6ee', border: `1px solid ${form.permisos[p] ? '#22a16a33' : 'rgba(26,18,8,0.08)'}`, borderRadius: 6, transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={form.permisos[p] || false} onChange={e => setForm({ ...form, permisos: { ...form.permisos, [p]: e.target.checked } })} style={{ accentColor: '#22a16a', width: 16, height: 16 }} />
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: form.permisos[p] ? '#22a16a' : 'rgba(26,18,8,0.5)', fontWeight: '700' }}>{p.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <label style={labelStyle}>Contraseña temporal</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {['auto', 'manual'].map(m => (
                <button key={m} onClick={() => setModoPass(m)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', borderRadius: 5, background: modoPass === m ? '#9B2D8E' : 'transparent', color: modoPass === m ? '#fff' : 'rgba(26,18,8,0.5)', border: '1px solid rgba(155,45,142,0.3)', fontWeight: '700' }}>{m}</button>
              ))}
            </div>
            {modoPass === 'auto' ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ flex: 1, padding: '12px 16px', background: '#faf6ee', border: '1px solid rgba(26,18,8,0.1)', fontFamily: "'Courier Prime', monospace", fontSize: 17, letterSpacing: 3, color: '#1a1208', fontWeight: '700', borderRadius: 5 }}>{passGenerada}</div>
                <button onClick={() => setPassGenerada(generarPassword())} style={btnP()}>Nueva</button>
              </div>
            ) : (
              <>
                <input type="text" style={{ ...inputStyle, fontFamily: "'Courier Prime', monospace", fontSize: 17, letterSpacing: 2 }} placeholder="Escribe la contraseña" value={passManual} onChange={e => { setPassManual(e.target.value); setPassErrores(validarPassword(e.target.value)) }} onFocus={e => e.target.style.borderColor = '#9B2D8E'} onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'} />
                {passErrores.length > 0 && passManual && passErrores.map((e, i) => <p key={i} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#8B1A1A', letterSpacing: 1, marginBottom: 3, fontWeight: '600' }}>✕ {e}</p>)}
                {passManual && passErrores.length === 0 && <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: '#22a16a', letterSpacing: 1, marginBottom: 4, fontWeight: '700' }}>✓ Contraseña válida</p>}
              </>
            )}
            <div style={{ padding: '12px 16px', background: '#f0f9ff', border: '1px solid rgba(58,171,220,0.2)', marginBottom: 24, borderRadius: 6 }}>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: '#3AABDC', letterSpacing: 1, lineHeight: 1.8, fontWeight: '600' }}>Requisitos: exactamente 1 mayúscula · minúsculas · 1 número · 1 símbolo (!@#$%&*?) · mínimo 8 caracteres</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={crearUsuario} style={{ ...btnP(), flex: 1, padding: '14px' }}>Crear usuario</button>
              <button onClick={() => setModalNuevo(false)} style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.4)', padding: '14px 24px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {modalEditar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '40px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#1a1208' }}>Editar usuario</h3>
              <button onClick={() => setModalEditar(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'rgba(26,18,8,0.4)' }}>✕</button>
            </div>
            <label style={labelStyle}>Nombre</label>
            <input
              style={inputStyle}
              value={form.nombre}
              onChange={handleNombreChange}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
            />

            {form.nombre && (
              <span style={hintStyle}>
                Usuario: <strong style={{ color: '#9B2D8E' }}>@{generarUsername(form.nombre)}</strong>
              </span>
            )}

            <label style={labelStyle}>Correo electrónico</label>
            <input
              style={inputStyle}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={e => e.target.style.borderColor = '#9B2D8E'}
              onBlur={e => e.target.style.borderColor = 'rgba(26,18,8,0.12)'}
            />

            <label style={{ ...labelStyle, marginTop: 8 }}>Rol</label>
            <select style={{ ...inputStyle, cursor: 'pointer', marginBottom: 20 }} value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
            <label style={labelStyle}>Permisos</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
              {permisos.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: form.permisos[p] ? '#f0fdf4' : '#faf6ee', border: `1px solid ${form.permisos[p] ? '#22a16a33' : 'rgba(26,18,8,0.08)'}`, borderRadius: 6 }}>
                  <input type="checkbox" checked={form.permisos[p] || false} onChange={e => setForm({ ...form, permisos: { ...form.permisos, [p]: e.target.checked } })} style={{ accentColor: '#22a16a', width: 16, height: 16 }} />
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: form.permisos[p] ? '#22a16a' : 'rgba(26,18,8,0.5)', fontWeight: '700' }}>{p.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={guardarEdicion} style={{ ...btnP(), flex: 1, padding: '14px' }}>Guardar cambios</button>
              <button onClick={() => setModalEditar(null)} style={{ ...btnP('transparent'), border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.4)', padding: '14px 24px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {confirmEliminar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', padding: '40px', width: '100%', maxWidth: 420, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff5f5', border: '2px solid #8B1A1A33', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>⚠</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: '#1a1208', marginBottom: 12 }}>¿Eliminar usuario?</h3>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: 'rgba(26,18,8,0.6)', marginBottom: 8 }}>Estás por eliminar a <strong>{confirmEliminar.nombre}</strong></p>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: 'rgba(26,18,8,0.4)', letterSpacing: 1, marginBottom: 28, fontWeight: '600' }}>Sus contribuciones se conservarán pero el acceso será revocado permanentemente.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => eliminarUsuario(confirmEliminar.id)} style={{ ...btnP('#8B1A1A'), flex: 1, padding: '14px' }}>Sí, eliminar</button>
              <button onClick={() => setConfirmEliminar(null)} style={{ ...btnP('transparent'), flex: 1, border: '1px solid rgba(26,18,8,0.12)', color: 'rgba(26,18,8,0.4)', padding: '14px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}