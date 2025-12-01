'use client'

import { useState, useEffect } from 'react'

const QUESTIONS = [
  // Discovery (Curiosity)
  "How do I rank on ChatGPT?",
  "What is my AI Visibility Score?",
  "Is Perplexity citing me?",
  "Who is recommending my brand?",
  "Do I have a Knowledge Graph entry?",
  
  // FOMO (Competitor/Risk)
  "Why is my competitor ranking #1?",
  "Am I invisible to AI Search?",
  "Losing traffic to chatbots?",
  "Your competitors are already optimized",
  "Why isn't Gemini showing my products?",
  
  // Additional Mix
  "Win the AI answer",
  "Is my content AI-ready?"
]

interface Bubble {
  id: number
  text: string
  x: number
  y: number
  delay: number
  duration: number
  scale: number
  isExploding: boolean
}

export function FloatingQuestions() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  // Initialize bubbles on mount
  useEffect(() => {
    // Create bubbles
    const initialBubbles = Array.from({ length: 9 }).map((_, i) => createBubble(i))
    setBubbles(initialBubbles)

    // Auto-explode a random bubble every 3 seconds
    const explodeInterval = setInterval(() => {
      setBubbles(currentBubbles => {
        // Find bubbles that aren't already exploding
        const availableBubbles = currentBubbles.filter(b => !b.isExploding)
        if (availableBubbles.length === 0) return currentBubbles

        // Pick a random one
        const randomBubble = availableBubbles[Math.floor(Math.random() * availableBubbles.length)]
        
        // Trigger interaction (explode & respawn logic needs to be inside the effect or moved out)
        // Since handleInteraction uses state setter, we can just call the logic here but cleaner to reuse
        // But we are inside a state setter callback here... 
        // Let's just flag it for explosion here and let a separate effect handle cleanup?
        // Or simpler: just replicate the logic.
        
        return currentBubbles.map(b => 
          b.id === randomBubble.id ? { ...b, isExploding: true } : b
        )
      })
    }, 3000)

    return () => clearInterval(explodeInterval)
  }, [])

  // Handle respawning of auto-exploded bubbles
  useEffect(() => {
    const explodingBubbles = bubbles.filter(b => b.isExploding)
    
    explodingBubbles.forEach(bubble => {
      const timer = setTimeout(() => {
        setBubbles(prev => {
          const newBubble = createBubble(bubble.id)
          return prev.map(b => b.id === bubble.id ? newBubble : b)
        })
      }, 500)
      
      return () => clearTimeout(timer)
    })
  }, [bubbles]) // Be careful with dependency loop here. 
  // Actually, checking "isExploding" changes is safer.
  // Better approach: When we set isExploding to true, we also queue the respawn timeout.

  const createBubble = (id: number): Bubble => {
    // Position bubbles STRICTLY on sides to avoid center content overlap
    // Left side: 2-25%, Right side: 75-98%
    const side = Math.random() > 0.5 ? 'left' : 'right'
    const xPosition = side === 'left' 
      ? 2 + Math.random() * 23 
      : 75 + Math.random() * 23

    // Vertical spacing to avoid overlap between themselves
    // We can slot them into vertical "zones" based on ID to guarantee separation
    // 9 bubbles -> 9 zones approx 10% height each?
    // Or just random with collision check? 
    // Simple zoning is robust:
    // id % 5 gives 0-4. 5 zones on left, 5 zones on right.
    const verticalZone = (id % 5) * 18 + 5 // 5%, 23%, 41%, 59%, 77%
    // Add some random jitter within the zone (+- 5%)
    const yPosition = verticalZone + (Math.random() * 10 - 5)

    return {
      id,
      text: QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
      x: xPosition,
      y: Math.max(5, Math.min(95, yPosition)), // Clamp to 5-95%
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      scale: 0.9 + Math.random() * 0.2,
      isExploding: false
    }
  }

  const handleInteraction = (id: number) => {
    setBubbles(prev => prev.map(b => 
      b.id === id ? { ...b, isExploding: true } : b
    ))
    
    // We rely on the useEffect hook to respawn this bubble now
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          onMouseEnter={() => handleInteraction(bubble.id)}
          onClick={() => handleInteraction(bubble.id)}
          className={`
            absolute cursor-pointer pointer-events-auto
            flex items-center justify-center px-6 py-3
            bg-white shadow-xl border border-claude-orange/10
            rounded-full text-ink font-bold text-sm tracking-wide
            transition-all duration-500 ease-out z-20
            hover:bg-claude-50 hover:border-claude-500 hover:scale-110 hover:shadow-claude-500/20
            ${bubble.isExploding ? 'scale-150 opacity-0' : 'opacity-100'}
          `}
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            transform: bubble.isExploding ? undefined : `scale(${bubble.scale})`,
            animation: bubble.isExploding ? 'none' : `float ${bubble.duration}s ease-in-out infinite`,
            animationDelay: `${bubble.delay}s`,
            zIndex: bubble.isExploding ? 50 : 10,
          }}
        >
          {bubble.text}
        </div>
      ))}
    </div>
  )
}

