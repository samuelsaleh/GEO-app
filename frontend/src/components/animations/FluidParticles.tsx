'use client'

import { useEffect, useRef } from 'react'

export function FluidParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight
    
    // Dream Palette Colors converted to RGB for opacity manipulation
    const colors = [
      { r: 139, g: 92, b: 246 },  // Purple (dream-purple-500)
      { r: 244, g: 63, b: 94 },   // Pink/Peach (dream-peach-500)
      { r: 59, g: 130, b: 246 },  // Blue (dream-blue-500)
      { r: 167, g: 139, b: 250 }, // Light Purple
    ]

    const particles: Particle[] = []
    const numParticles = Math.min(window.innerWidth / 10, 100) // Responsive count

    // Mouse interaction
    let mouse = { x: -1000, y: -1000 }

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: { r: number, g: number, b: number }
      baseX: number
      baseY: number
      density: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.baseX = this.x
        this.baseY = this.y
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 150 + 50 // Large, soft blobs
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.density = (Math.random() * 30) + 1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        // Create gradient for soft "orb" look
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`) // increased opacity
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)
        
        ctx.fillStyle = gradient
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }

      update() {
        // Mouse repulsion / attraction
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        let forceDirectionX = dx / distance
        let forceDirectionY = dy / distance
        let maxDistance = 300
        let force = (maxDistance - distance) / maxDistance
        let directionX = forceDirectionX * force * this.density
        let directionY = forceDirectionY * force * this.density

        if (distance < maxDistance) {
          this.x -= directionX
          this.y -= directionY
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX
            this.x -= dx / 50
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY
            this.y -= dy / 50
          }
        }
        
        // Natural flow
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges with damping
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        this.draw()
      }
    }

    function init() {
      particles.length = 0
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle())
      }
    }

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      
      // Global composite operation for blending "dreamy" effect
      ctx.globalCompositeOperation = 'screen' // or 'lighter'
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
      }
      requestAnimationFrame(animate)
    }

    init()
    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      init()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.x
      mouse.y = e.y
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-60 mix-blend-multiply"
    />
  )
}

