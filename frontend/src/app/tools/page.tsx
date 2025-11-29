'use client'

import { Search, Code, ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 text-ink-400" />
              <span className="font-display text-3xl font-light tracking-wide text-ink-900">
                dwight
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-6 text-ink-900 tracking-wide">Free AI Optimization Tools</h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto font-light leading-relaxed">
            Try our tools to boost your visibility in AI search engines
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <Link
            href="/tools/health-check"
            className="card-elevated p-10 group"
          >
            <div className="w-16 h-16 border border-claude-200 flex items-center justify-center mb-8 group-hover:border-claude-400 transition">
              <Search className="w-7 h-7 text-claude-500" />
            </div>
            <h2 className="font-display text-2xl font-light mb-4 text-ink-900 group-hover:text-claude-500 transition tracking-wide">
              AI Visibility Health-Check
            </h2>
            <p className="text-ink-500 mb-6 leading-relaxed font-light">
              Get a free score showing how well your content performs in ChatGPT, Bing Chat, and Google Gemini.
            </p>
            <div className="flex items-center gap-2 text-claude-500 text-xs tracking-widest uppercase font-light">
              Start Free Check
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            href="/tools/ai-visibility"
            className="card-elevated p-10 group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] px-3 py-1 tracking-widest uppercase font-light">
              New
            </div>
            <div className="w-16 h-16 border border-purple-200 flex items-center justify-center mb-8 group-hover:border-purple-400 transition">
              <Eye className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="font-display text-2xl font-light mb-4 text-ink-900 group-hover:text-purple-600 transition tracking-wide">
              AI Visibility Checker
            </h2>
            <p className="text-ink-500 mb-6 leading-relaxed font-light">
              Test if your brand appears when people ask AI for recommendations. See the actual AI response.
            </p>
            <div className="flex items-center gap-2 text-purple-600 text-xs tracking-widest uppercase font-light">
              Test Your Visibility
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            href="/tools/schema-generator"
            className="card-elevated p-10 group"
          >
            <div className="w-16 h-16 border border-ink-200 flex items-center justify-center mb-8 group-hover:border-ink-400 transition">
              <Code className="w-7 h-7 text-ink-600" />
            </div>
            <h2 className="font-display text-2xl font-light mb-4 text-ink-900 group-hover:text-ink-600 transition tracking-wide">
              Schema Generator
            </h2>
            <p className="text-ink-500 mb-6 leading-relaxed font-light">
              Create perfect schema markup (invisible labels) in seconds. No coding required.
            </p>
            <div className="flex items-center gap-2 text-ink-600 text-xs tracking-widest uppercase font-light">
              Generate Schema
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        </div>

        <div className="mt-20 text-center">
          <div className="bg-claude-500 p-14 text-white max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-light mb-6 tracking-wide">Need More Help?</h2>
            <p className="mb-8 text-white/80 font-light leading-relaxed">
              Get a complete audit with screenshots, detailed analysis, and expert recommendations
            </p>
            <Link
              href="/#services"
              className="inline-block bg-white text-claude-600 px-10 py-4 hover:bg-cream-100 transition text-xs tracking-widest uppercase font-light"
            >
              View Full Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
