'use client'

import { AIVisibilityDemo } from '@/components/AIVisibilityDemo'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen hero-gradient relative">
      <div className="bg-grain" />

      <nav className="fixed top-0 w-full z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/tools" className="flex items-center gap-3 text-ink hover:text-claude-500 transition-colors group">
              <span className="font-display text-xl font-bold">
                Miageru (見上げる)
              </span>
            </Link>
            <Link
              href="/tools/ai-visibility"
              className="text-sm text-ink-light hover:text-claude-500 transition-colors"
            >
              ← Back to Real Tool
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-ink mb-3">AI Visibility Demo</h1>
          <p className="text-ink-light">Preview of the new results page design (using sample data)</p>
        </div>

        <AIVisibilityDemo />
      </div>

      {/* Sticky Conversion Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-enter delay-700 w-full max-w-xs sm:max-w-fit px-4">
        <Link 
          href="/tools/ai-visibility" 
          className="flex items-center justify-center gap-2 bg-ink text-white px-6 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold border border-white/20 backdrop-blur-md hover:bg-ink-dark w-full sm:w-auto group"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 group-hover:rotate-12 transition-transform" />
          <span>Analyze YOUR Brand Free</span>
        </Link>
      </div>
    </div>
  )
}
