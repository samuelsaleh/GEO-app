'use client'

import { Search, Code, ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-ink-500" />
              <h1 className="text-2xl font-display font-bold text-gradient-claude">
                Dwight
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4 text-ink-900">Free AI Optimization Tools</h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto">
            Try our tools to boost your visibility in AI search engines
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            href="/tools/health-check"
            className="card-elevated p-8 group"
          >
            <div className="w-14 h-14 bg-claude-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Search className="w-7 h-7 text-claude-500" />
            </div>
            <h2 className="font-display text-xl font-bold mb-3 text-ink-900 group-hover:text-claude-500 transition">
              AI Visibility Health-Check
            </h2>
            <p className="text-ink-500 mb-5 leading-relaxed text-sm">
              Get a free score showing how well your content performs in ChatGPT, Bing Chat, and Google Gemini.
            </p>
            <div className="flex items-center gap-2 text-claude-500 font-semibold text-sm">
              Start Free Check
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            href="/tools/ai-visibility"
            className="card-elevated p-8 group relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              NEW
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Eye className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="font-display text-xl font-bold mb-3 text-ink-900 group-hover:text-purple-600 transition">
              AI Visibility Checker
            </h2>
            <p className="text-ink-500 mb-5 leading-relaxed text-sm">
              Test if your brand appears when people ask AI for recommendations. See the actual AI response.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
              Test Your Visibility
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            href="/tools/schema-generator"
            className="card-elevated p-8 group"
          >
            <div className="w-14 h-14 bg-cream-300 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Code className="w-7 h-7 text-ink-600" />
            </div>
            <h2 className="font-display text-xl font-bold mb-3 text-ink-900 group-hover:text-ink-600 transition">
              Schema Generator
            </h2>
            <p className="text-ink-500 mb-5 leading-relaxed text-sm">
              Create perfect schema markup (invisible labels) in seconds. No coding required.
            </p>
            <div className="flex items-center gap-2 text-ink-600 font-semibold text-sm">
              Generate Schema
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-claude-500 to-claude-600 rounded-2xl p-10 text-white max-w-3xl mx-auto shadow-xl">
            <h2 className="font-display text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="mb-6 text-claude-100">
              Get a complete audit with screenshots, detailed analysis, and expert recommendations
            </p>
            <Link
              href="/#services"
              className="inline-block bg-white text-claude-600 px-8 py-4 rounded-lg hover:bg-cream-100 transition font-semibold shadow-lg"
            >
              View Full Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
