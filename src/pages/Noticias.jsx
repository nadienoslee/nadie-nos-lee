import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { supabase } from '../lib/supabase'
import usePageTitle from '../hooks/usePageTitle'

const filtrosFecha = [
  'Todos',
  'Hoy',
  'Esta semana',
  'Este mes',
]

function parseFecha(fecha) {
  if (!fecha) return null

  const partes = fecha.split('-').map(Number)

  if (partes.length !== 3) {
    const fechaNormal = new Date(fecha)
    return Number.isNaN(fechaNormal.getTime())
      ? null
      : fechaNormal
  }

  const [anio, mes, dia] = partes
  return new Date(anio, mes - 1, dia, 12, 0, 0)
}

function fechaFormateada(fecha) {
  const valor = parseFecha(fecha)

  if (!valor) return ''

  return valor.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Noticias() {
  usePageTitle('NADIE NOS LEE | NOTICIAS')

  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('Todos')
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  )

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)

      const [
        {
          data: noticiasData,
          error: errorNoticias,
        },
        {
          data: talleresData,
          error: errorTalleres,
        },
      ] = await Promise.all([
        supabase
          .from('noticias')
          .select('*')
          .eq('publicado', true),

        supabase
          .from('talleres')
          .select('*')
          .eq('activo', true),
      ])

      if (errorNoticias) {
        console.error(
          'Error cargando noticias:',
          errorNoticias
        )
      }

      if (errorTalleres) {
        console.error(
          'Error cargando talleres:',
          errorTalleres
        )
      }

      const noticiasNormalizadas = (
        noticiasData || []
      ).map(noticia => ({
        ...noticia,

        _idUnico: `noticia-${noticia.id}`,
        _tipo: 'noticia',
        _fecha: noticia.fecha_publicacion,
        _categoria: noticia.categoria || 'Noticia',
        _descripcion: noticia.cuerpo || '',
        _color: noticia.color || '#8B1A1A',
        _linkInterno: null,
      }))

      const talleresNormalizados = (
        talleresData || []
      ).map(taller => ({
        ...taller,

        _idUnico: `taller-${taller.id}`,
        _tipo: 'taller',
        _fecha: taller.fecha,
        _categoria: 'Taller',
        _descripcion:
          taller.descripcion ||
          taller.descripcion_larga ||
          'Consulta todos los detalles de este taller.',
        _color: taller.color || '#3AABDC',
        _linkInterno: `/talleres/${taller.id}`,
      }))

      const publicacionesMezcladas = [
        ...noticiasNormalizadas,
        ...talleresNormalizados,
      ].sort((a, b) => {
        const fechaA = parseFecha(a._fecha)
        const fechaB = parseFecha(b._fecha)

        const tiempoA = fechaA
          ? fechaA.getTime()
          : 0

        const tiempoB = fechaB
          ? fechaB.getTime()
          : 0

        return tiempoB - tiempoA
      })

      setPublicaciones(publicacionesMezcladas)
      setCargando(false)
    }

    cargar()

    const canalNoticias = supabase
      .channel('noticias-pub')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'noticias',
        },
        cargar
      )
      .subscribe()

    const canalTalleres = supabase
      .channel('talleres-en-noticias')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'talleres',
        },
        cargar
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalNoticias)
      supabase.removeChannel(canalTalleres)
    }
  }, [])

  const filtradas = publicaciones.filter(publicacion => {
    if (filtro === 'Todos') return true

    const fecha = parseFecha(publicacion._fecha)

    if (!fecha) return false

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (filtro === 'Hoy') {
      return (
        fecha.getDate() === hoy.getDate() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getFullYear() === hoy.getFullYear()
      )
    }

    if (filtro === 'Esta semana') {
      const inicioSemana = new Date(hoy)

      inicioSemana.setDate(
        hoy.getDate() - hoy.getDay()
      )

      inicioSemana.setHours(0, 0, 0, 0)

      const finSemana = new Date(inicioSemana)

      finSemana.setDate(
        inicioSemana.getDate() + 7
      )

      return (
        fecha >= inicioSemana &&
        fecha < finSemana
      )
    }

    if (filtro === 'Este mes') {
      return (
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getFullYear() === hoy.getFullYear()
      )
    }

    return true
  })

  const renderImagen = publicacion => {
    if (!publicacion.imagen_url) return null

    const imagen = (
      <img
        src={publicacion.imagen_url}
        alt={publicacion.titulo}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          border: `1px solid ${publicacion._color}22`,
          transition: 'opacity 0.2s',
        }}
        onMouseOver={event => {
          event.currentTarget.style.opacity = '0.88'
        }}
        onMouseOut={event => {
          event.currentTarget.style.opacity = '1'
        }}
      />
    )

    if (publicacion._tipo === 'taller') {
      return (
        <Link
          to={publicacion._linkInterno}
          style={{
            display: 'block',
            position: 'relative',
            textDecoration: 'none',
          }}
        >
          {imagen}

          <span
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              fontFamily: "'Courier Prime', monospace",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: '#fff',
              background: 'rgba(26,18,8,0.7)',
              padding: '4px 10px',
              backdropFilter: 'blur(4px)',
              fontWeight: '700',
              borderRadius: 2,
            }}
          >
            Ver taller →
          </span>
        </Link>
      )
    }

    if (publicacion.link_url) {
      return (
        <a
          href={publicacion.link_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            position: 'relative',
            textDecoration: 'none',
          }}
        >
          {imagen}

          <span
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              fontFamily: "'Courier Prime', monospace",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: '#fff',
              background: 'rgba(26,18,8,0.7)',
              padding: '4px 10px',
              backdropFilter: 'blur(4px)',
              fontWeight: '700',
              borderRadius: 2,
            }}
          >
            Ver post →
          </span>
        </a>
      )
    }

    return imagen
  }

  return (
    <main>
      {/* HERO */}
      <section
        style={{
          background: '#f5ede0',
          padding: isMobile
            ? '80px 20px 60px'
            : '100px 40px 80px',
          borderBottom:
            '1px solid rgba(139,26,26,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 70% 60%, rgba(139,26,26,0.07) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <AnimatedSection direction="up">
            <p
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 12,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: '#8B1A1A',
                marginBottom: 24,
              }}
            >
              Comunidad
            </p>

            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(72px, 12vw, 140px)',
                letterSpacing: 6,
                color: '#1a1208',
                lineHeight: 0.92,
                marginBottom: 36,
              }}
            >
              NOTICIAS
            </h1>

            <p
              style={{
                fontFamily:
                  "'Cormorant Garamond', serif",
                fontSize: 24,
                fontStyle: 'italic',
                color: 'rgba(26,18,8,0.55)',
                lineHeight: 1.7,
              }}
            >
              Noticias, talleres y actualizaciones del
              colectivo.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FILTROS */}
      <section
        style={{
          background: '#faf6ee',
          padding: isMobile
            ? '0 12px'
            : '0 40px',
          borderBottom:
            '1px solid rgba(26,18,8,0.06)',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            gap: 4,
            flexWrap: 'nowrap',
            alignItems: 'center',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filtrosFecha.map(opcion => (
            <button
              key={opcion}
              onClick={() => setFiltro(opcion)}
              style={{
                fontFamily:
                  "'Courier Prime', monospace",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                color:
                  filtro === opcion
                    ? '#1a1208'
                    : 'rgba(26,18,8,0.35)',
                borderBottom:
                  filtro === opcion
                    ? '3px solid #8B1A1A'
                    : '3px solid transparent',
                padding: '18px 16px',
                cursor: 'pointer',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {opcion}
            </button>
          ))}

          <span
            style={{
              fontFamily:
                "'Courier Prime', monospace",
              fontSize: 10,
              color: 'rgba(26,18,8,0.3)',
              letterSpacing: 1,
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
              paddingRight: 8,
            }}
          >
            {filtradas.length}{' '}
            {filtradas.length === 1
              ? 'publicación'
              : 'publicaciones'}
          </span>
        </div>
      </section>

      {/* PUBLICACIONES */}
      <section
        style={{
          background: '#faf6ee',
          padding: isMobile
            ? '32px 16px 80px'
            : '80px 40px 120px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {cargando ? (
            <p
              style={{
                fontFamily:
                  "'Cormorant Garamond', serif",
                fontSize: 20,
                color: 'rgba(26,18,8,0.35)',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '60px 0',
              }}
            >
              Cargando...
            </p>
          ) : filtradas.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 24px',
                border:
                  '1px solid rgba(26,18,8,0.07)',
                background:
                  'rgba(255,255,255,0.4)',
              }}
            >
              <p
                style={{
                  fontFamily:
                    "'Courier Prime', monospace",
                  fontSize: 10,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: '#8B1A1A',
                  fontWeight: '700',
                  marginBottom: 16,
                }}
              >
                Próximamente
              </p>

              <h2
                style={{
                  fontFamily:
                    "'Cormorant Garamond', serif",
                  fontSize: 32,
                  fontWeight: 400,
                  color: '#1a1208',
                  marginBottom: 12,
                }}
              >
                {filtro === 'Todos'
                  ? 'Por ahora no hay noticias ni talleres'
                  : `No hay publicaciones para “${filtro.toLowerCase()}”`}
              </h2>

              <p
                style={{
                  fontFamily:
                    "'Cormorant Garamond', serif",
                  fontSize: 20,
                  color: 'rgba(26,18,8,0.45)',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  marginBottom:
                    filtro === 'Todos' ? 0 : 24,
                }}
              >
                Mantente al pendiente de nuevas
                actualizaciones del colectivo.
              </p>

              {filtro !== 'Todos' && (
                <button
                  onClick={() => setFiltro('Todos')}
                  style={{
                    fontFamily:
                      "'Courier Prime', monospace",
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    background: 'none',
                    border:
                      '1px solid rgba(26,18,8,0.2)',
                    color: 'rgba(26,18,8,0.5)',
                    padding: '10px 20px',
                    cursor: 'pointer',
                  }}
                >
                  Ver todas →
                </button>
              )}
            </div>
          ) : (
            filtradas.map((publicacion, index) => (
              <AnimatedSection
                key={publicacion._idUnico}
                direction="right"
                delay={index * 0.08}
              >
                <article
                  style={{
                    display: 'flex',
                    flexDirection: isMobile
                      ? 'column'
                      : 'row',
                    gap: isMobile ? 24 : 48,
                    alignItems: 'flex-start',
                    padding: isMobile
                      ? '36px 0'
                      : '56px 0',
                    borderBottom:
                      '1px solid rgba(26,18,8,0.07)',
                  }}
                >
                  {/* Imagen superior en móvil */}
                  {publicacion.imagen_url &&
                    isMobile && (
                      <div style={{ width: '100%' }}>
                        {renderImagen(publicacion)}
                      </div>
                    )}

                  {/* Información */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 14,
                        marginBottom: 20,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily:
                            "'Courier Prime', monospace",
                          fontSize: 10,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          color: '#fff',
                          background:
                            publicacion._color,
                          padding: '5px 14px',
                        }}
                      >
                        {publicacion._categoria}
                      </span>

                      <span
                        style={{
                          fontFamily:
                            "'Courier Prime', monospace",
                          fontSize: 11,
                          color:
                            'rgba(26,18,8,0.35)',
                          letterSpacing: 1,
                        }}
                      >
                        {fechaFormateada(
                          publicacion._fecha
                        )}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', serif",
                        fontSize:
                          'clamp(24px, 3.5vw, 36px)',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        color: '#1a1208',
                        marginBottom: 22,
                      }}
                    >
                      {publicacion.titulo}
                    </h2>

                    <p
                      style={{
                        fontFamily:
                          "'Cormorant Garamond', serif",
                        fontSize: 21,
                        lineHeight: 1.85,
                        color:
                          'rgba(26,18,8,0.6)',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {publicacion._descripcion}
                    </p>

                    {publicacion._tipo ===
                    'taller' ? (
                      <Link
                        to={
                          publicacion._linkInterno
                        }
                        style={{
                          fontFamily:
                            "'Courier Prime', monospace",
                          fontSize: 11,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          color:
                            publicacion._color,
                          borderBottom: `1px solid ${publicacion._color}`,
                          paddingBottom: 2,
                          display: 'inline-block',
                          marginTop: 24,
                          textDecoration: 'none',
                        }}
                      >
                        Ver taller →
                      </Link>
                    ) : publicacion.link_url ? (
                      <a
                        href={
                          publicacion.link_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily:
                            "'Courier Prime', monospace",
                          fontSize: 11,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          color:
                            publicacion._color,
                          borderBottom: `1px solid ${publicacion._color}`,
                          paddingBottom: 2,
                          display: 'inline-block',
                          marginTop: 24,
                          textDecoration: 'none',
                        }}
                      >
                        Ver publicación original →
                      </a>
                    ) : null}
                  </div>

                  {/* Imagen lateral en escritorio */}
                  {publicacion.imagen_url &&
                    !isMobile && (
                      <div
                        style={{
                          width: '50%',
                          flexShrink: 0,
                        }}
                      >
                        {renderImagen(publicacion)}
                      </div>
                    )}
                </article>
              </AnimatedSection>
            ))
          )}
        </div>
      </section>
    </main>
  )
}