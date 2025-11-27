'use client'

import { Search, Code, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Creed
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Free AI Optimization Tools</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Try our tools to boost your visibility in AI search engines
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link
            href="/tools/health-check"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition">
              AI Visibility Health-Check
            </h2>
            <p className="text-gray-600 mb-6">
              Get a free score showing how well your content performs in ChatGPT, Bing Chat, and Google Gemini.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              Start Free Check
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            href="/tools/schema-generator"
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition group"
          >
            <div className="w-16 h-16 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Code className="w-8 h-8 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 group-hover:text-cyan-600 transition">
              Schema Generator
            </h2>
            <p className="text-gray-600 mb-6">
              Create perfect schema markup (invisible labels) in seconds. No coding required.
            </p>
            <div className="flex items-center gap-2 text-cyan-600 font-semibold">
              Generate Schema
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="mb-6">
              Get a complete audit with screenshots, detailed analysis, and expert recommendations
            </p>
            <Link
              href="/#services"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              View Full Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
