'use client'

import { Search, Code, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="glass-nav border-b border-mulberry-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-mulberry-600" />
              <h1 className="text-2xl font-display font-bold text-gradient-booth">
                Dwight
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4 text-mulberry-900">Free AI Optimization Tools</h1>
          <p className="text-xl text-mulberry-600 max-w-2xl mx-auto">
            Try our tools to boost your visibility in AI search engines
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link
            href="/tools/health-check"
            className="card-elevated p-10 group"
          >
            <div className="w-16 h-16 bg-booth-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Search className="w-8 h-8 text-booth-500" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4 text-mulberry-900 group-hover:text-booth-500 transition">
              AI Visibility Health-Check
            </h2>
            <p className="text-mulberry-600 mb-6 leading-relaxed">
              Get a free score showing how well your content performs in ChatGPT, Bing Chat, and Google Gemini.
            </p>
            <div className="flex items-center gap-2 text-booth-500 font-semibold">
              Start Free Check
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            href="/tools/schema-generator"
            className="card-elevated p-10 group"
          >
            <div className="w-16 h-16 bg-mulberry-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Code className="w-8 h-8 text-mulberry-600" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4 text-mulberry-900 group-hover:text-mulberry-600 transition">
              Schema Generator
            </h2>
            <p className="text-mulberry-600 mb-6 leading-relaxed">
              Create perfect schema markup (invisible labels) in seconds. No coding required.
            </p>
            <div className="flex items-center gap-2 text-mulberry-600 font-semibold">
              Generate Schema
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-booth-500 via-booth-600 to-mulberry-700 rounded-2xl p-10 text-white max-w-3xl mx-auto shadow-xl">
            <h2 className="font-display text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="mb-6 text-booth-100">
              Get a complete audit with screenshots, detailed analysis, and expert recommendations
            </p>
            <Link
              href="/#services"
              className="inline-block bg-white text-booth-600 px-8 py-4 rounded-xl hover:bg-cream-50 transition font-semibold shadow-lg"
            >
              View Full Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
