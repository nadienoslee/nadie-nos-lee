import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      onClick={scrollToTop}
      aria-label="Volver arriba"
      style={{
        position: 'fixed',
        bottom: 36, right: 36,
        width: 56, height: 56,
        borderRadius: '50%',
        background: '#9B2D8E',
        border: 'none',
        color: '#fff',
        fontSize: 24,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.7)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow: '0 4px 24px rgba(155,45,142,0.45)',
      }}
    >
      ↑
    </button>
  )
}