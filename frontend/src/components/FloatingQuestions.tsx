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
    // Create 8-10 bubbles
    const initialBubbles = Array.from({ length: 9 }).map((_, i) => createBubble(i))
    setBubbles(initialBubbles)
  }, [])

  const createBubble = (id: number): Bubble => {
    return {
      id,
      text: QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
      // Spread them out more evenly initially if possible, but random is fine for organic feel
      x: Math.random() * 90, // Random left position (0-90%)
      y: Math.random() * 80 + 10, // Random top position (10-90%)
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6, // 8-14s float duration (slower is more elegant)
      scale: 0.85 + Math.random() * 0.3, // Random size
      isExploding: false
    }
  }

  const handleInteraction = (id: number) => {
    setBubbles(prev => prev.map(b => 
      b.id === id ? { ...b, isExploding: true } : b
    ))

    // Respawn the bubble after animation
    setTimeout(() => {
      setBubbles(prev => {
        // Create new bubble params
        const newBubble = createBubble(id)
        
        // Try to place it away from where it just exploded (simple check)
        // If we really wanted to be fancy we'd check against other bubbles, 
        // but random respawn usually works fine.
        
        return prev.map(b => b.id === id ? newBubble : b)
      })
    }, 500) // Match the transition duration
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
            flex items-center justify-center px-4 py-2 
            bg-white/40 backdrop-blur-sm border border-white/50 
            rounded-full shadow-sm text-ink-light/80 text-sm font-medium
            transition-all duration-500 ease-out
            hover:bg-white/80 hover:text-claude-orange hover:border-claude-orange/50 hover:shadow-md hover:scale-110
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

