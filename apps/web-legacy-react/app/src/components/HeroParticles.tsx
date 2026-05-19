import { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  radius: number
  speedX: number
  speedY: number
  opacity: number
  phase: number
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resize()

    // Initialize particles
    const particleCount = 55
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 1.5 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: 0.12 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
      })
    }
    particlesRef.current = particles

    let time = 0
    const animate = () => {
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particlesRef.current) {
        // Sine-wave drift
        p.x += p.speedX + Math.sin(time * 0.005 + p.phase) * 0.15
        p.y += p.speedY + Math.cos(time * 0.007 + p.phase) * 0.1

        // Wrap at edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.35,
      }}
    />
  )
}
