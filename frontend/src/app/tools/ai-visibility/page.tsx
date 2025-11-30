'use client'

import { AIVisibilityTool } from '@/components/AIVisibilityTool'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-screen hero-gradient relative">
      <div className="bg-grain" />
      
      <nav className="fixed top-0 w-full z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/tools" className="flex items-center gap-3 text-ink hover:text-claude-500 transition-colors group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-ink/5 group-hover:border-claude-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold">
                dwight
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <AIVisibilityTool />
      </div>
    </div>
  )
}
