'use client'

import { Search, Code, ArrowLeft, BarChart3, Lock, Sparkles } from 'lucide-react'
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
              <span className="font-display text-3xl font-medium tracking-wide text-ink-900">
                dwight
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 border border-claude-200">
            <Sparkles className="w-4 h-4 text-claude-500" />
            <span className="text-claude-600 text-sm tracking-wider uppercase font-medium">
              GEO Tools
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-6 text-ink-900">Free GEO Tools</h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Generative Engine Optimization tools to boost your visibility in AI search
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* GEO Score - FREE FLAGSHIP */}
          <Link
            href="/tools/ai-visibility"
            className="card-elevated p-8 group relative overflow-hidden border-2 border-claude-200 hover:border-claude-400"
          >
            <div className="absolute top-4 right-4 bg-claude-500 text-white text-[10px] px-3 py-1 tracking-widest uppercase font-medium">
              Free
            </div>
            <div className="w-14 h-14 border border-claude-200 bg-claude-50 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <BarChart3 className="w-6 h-6 text-claude-600" />
            </div>
            <h2 className="font-display text-xl font-medium mb-3 text-ink-900 group-hover:text-claude-600 transition">
              GEO Score
            </h2>
            <p className="text-ink-500 mb-5 leading-relaxed text-sm">
              Test how ChatGPT, Claude, and Gemini recommend your brand. Get a score out of 100 with actionable insights.
            </p>
            <ul className="text-xs text-ink-600 space-y-1 mb-5">
              <li>✓ 6 AI models tested</li>
              <li>✓ Competitor comparison</li>
              <li>✓ GEO strategy action plan</li>
            </ul>
            <div className="flex items-center gap-2 text-claude-600 text-xs tracking-widest uppercase font-medium">
              Get Your GEO Score
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          {/* GEO Audit - LOCKED */}
          <div className="card-elevated p-8 relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-4 right-4 bg-gray-100 text-ink-500 text-[10px] px-3 py-1 tracking-widest uppercase font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </div>
            <div className="w-14 h-14 border border-cream-300 flex items-center justify-center mb-6 bg-cream-50">
              <Search className="w-6 h-6 text-ink-400" />
            </div>
            <h2 className="font-display text-xl font-medium mb-3 text-ink-900">
              GEO Audit
            </h2>
            <p className="text-ink-500 mb-5 leading-relaxed text-sm">
              Deep analysis of your website's AI-readiness. Check schema, content structure, and citations.
            </p>
            <ul className="text-xs text-ink-400 space-y-1 mb-5">
              <li>○ Technical GEO analysis</li>
              <li>○ Content optimization tips</li>
              <li>○ Priority fixes list</li>
            </ul>
            <Link 
              href="/pricing"
              className="flex items-center gap-2 text-ink-400 text-xs tracking-widest uppercase font-medium hover:text-claude-600 transition"
            >
              Unlock in Pro Plan
              <Lock className="w-3 h-3" />
            </Link>
          </div>

          {/* Schema Generator - LOCKED */}
          <div className="card-elevated p-8 relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-4 right-4 bg-gray-100 text-ink-500 text-[10px] px-3 py-1 tracking-widest uppercase font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </div>
            <div className="w-14 h-14 border border-cream-300 flex items-center justify-center mb-6 bg-cream-50">
              <Code className="w-6 h-6 text-ink-400" />
            </div>
            <h2 className="font-display text-xl font-medium mb-3 text-ink-900">
              Schema Generator
            </h2>
            <p className="text-ink-500 mb-5 leading-relaxed text-sm">
              Create structured data that AI understands. Copy-paste ready JSON-LD for your website.
            </p>
            <ul className="text-xs text-ink-400 space-y-1 mb-5">
              <li>○ 7 schema types</li>
              <li>○ Valid JSON-LD output</li>
              <li>○ Implementation guide</li>
            </ul>
            <Link 
              href="/pricing"
              className="flex items-center gap-2 text-ink-400 text-xs tracking-widest uppercase font-medium hover:text-claude-600 transition"
            >
              Unlock in Pro Plan
              <Lock className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* GEO Strategies Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-medium text-ink-900 mb-3">Built on the 7 GEO Strategies</h2>
            <p className="text-ink-500">The proven framework for AI search visibility</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: '1', title: 'Questions → Content', desc: 'Answer real user queries' },
              { num: '2', title: 'AI-Friendly Structure', desc: 'Schema & formatting' },
              { num: '3', title: 'Topical Authority', desc: 'Content clusters' },
              { num: '4', title: 'Brand Mentions', desc: 'Citations AI trusts' },
            ].map((strategy) => (
              <div key={strategy.num} className="bg-white border border-ink-100 p-4 text-center">
                <div className="w-8 h-8 bg-claude-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  {strategy.num}
                </div>
                <h4 className="font-display text-sm font-medium text-ink-900 mb-1">{strategy.title}</h4>
                <p className="text-xs text-ink-500">{strategy.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-ink-900 p-12 text-white max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-medium mb-4">Unlock All GEO Tools</h2>
            <p className="mb-6 text-white/70 leading-relaxed">
              Get access to all premium tools, detailed audits, and expert recommendations.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-claude-500 text-white px-8 py-3 hover:bg-claude-600 transition text-xs tracking-widest uppercase font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
