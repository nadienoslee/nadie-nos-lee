import { useEffect, useRef, useState } from 'react'

export default function AnimatedSection({
  children,
  className = '',
  direction = 'up', // 'up' | 'left' | 'right' | 'fade'
  delay = 0,
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const transforms = {
    up:    'translateY(50px)',
    left:  'translateX(80px)',
    right: 'translateX(-80px)',
    fade:  'translateY(0px)',
  }

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate(0,0)' : transforms[direction],
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  }

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
}