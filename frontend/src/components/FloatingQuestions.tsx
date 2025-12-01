'use client'

const STATIC_QUESTIONS = [
  // Left Side (3 items) - Pushed down to avoid H1
  { 
    id: 1, 
    text: "How do I rank on ChatGPT?", 
    style: { left: '2%', top: '35%' }, // Moved down from 20%
    animation: 'animate-pulse-slow'
  },
  { 
    id: 2, 
    text: "Why is my competitor #1?", 
    style: { left: '4%', top: '55%' },
    animation: 'animate-float' 
  },
  { 
    id: 3, 
    text: "Is Perplexity citing me?", 
    style: { left: '2%', top: '75%' },
    animation: 'animate-pulse-slow'
  },
  
  // Right Side (2 items) - Pushed down to avoid H1
  { 
    id: 4, 
    text: "Win the AI answer", 
    style: { right: '2%', top: '45%' }, // Moved down from 30%
    animation: 'animate-float'
  },
  { 
    id: 5, 
    text: "What is my GEO score?", 
    style: { right: '3%', top: '65%' },
    animation: 'animate-pulse-slow'
  }
]

export function FloatingQuestions() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden xl:block">
      {STATIC_QUESTIONS.map((q) => (
        <div
          key={q.id}
          className={`
            absolute px-5 py-3
            bg-white/80 backdrop-blur-md border border-white/60 
            rounded-2xl shadow-lg text-ink font-bold text-sm
            transition-transform hover:scale-105 duration-300
            ${q.animation}
          `}
          style={{
            ...q.style,
            animationDuration: '4s', // Faster but subtle "jiggle/pulse" feel
          }}
        >
          <div className="absolute -right-1 -top-1 w-3 h-3 bg-claude-500 rounded-full animate-ping opacity-20" />
          {q.text}
        </div>
      ))}
    </div>
  )
}
