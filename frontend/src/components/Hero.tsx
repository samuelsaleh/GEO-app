'use client'

import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { FluidParticles } from '@/components/animations/FluidParticles'
import { AIVisibilityTool } from '@/components/AIVisibilityTool'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-aurora -z-20" />
      <FluidParticles />

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm mb-8 animate-enter">
          <span className="w-2 h-2 rounded-full bg-dream-peach-500 animate-pulse" />
          <span className="text-sm font-medium text-dream-ink-light tracking-wide uppercase">The New Standard for AI SEO</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tight text-dream-ink animate-enter delay-100 leading-[1.1]">
          Optimize for the <br />
          <span className="text-gradient">AI Era</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl md:text-2xl text-dream-ink-light/80 mb-12 max-w-2xl mx-auto leading-relaxed animate-enter delay-200 text-balance">
          Traditional search is fading. Miageru helps your brand dominate the answers in ChatGPT, Perplexity, and Gemini.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-enter delay-300">
          <Link href="/tools/ai-visibility" className="btn-primary flex items-center justify-center gap-2 text-lg shadow-lg shadow-dream-purple-500/20 group">
            Get Your Score <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="btn-secondary flex items-center justify-center gap-2 text-lg group">
            <Play className="w-5 h-5 fill-current opacity-50 group-hover:opacity-100 transition-opacity" /> Watch Demo
          </button>
        </div>

        {/* Floating Glass Dashboard Mockup */}
        <div className="relative max-w-5xl mx-auto perspective-1000 animate-enter delay-400">
          <div className="glass-card rounded-3xl p-2 md:p-4 transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out shadow-2xl shadow-dream-purple-900/10 border border-white/80 bg-white/40">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="mx-auto bg-white/30 h-6 w-64 rounded-lg text-[10px] flex items-center justify-center text-dream-ink/40 font-mono">
                miageru.ai/dashboard
              </div>
            </div>

            {/* Actual Functional Tool Embedded */}
            <div className="bg-white/50 rounded-2xl overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10" />
               <AIVisibilityTool hideHeader={true} />
            </div>
            
            {/* Decorative Floating Elements */}
            <div className="absolute -right-12 top-1/4 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 animate-float hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-dream-purple-100 flex items-center justify-center text-dream-purple-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div className="text-xs text-dream-ink-light font-semibold">Visibility Score</div>
                  <div className="text-lg font-bold text-dream-ink">94/100</div>
                </div>
              </div>
              <div className="h-1.5 w-32 bg-dream-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-dream-purple-500 w-[94%]" />
              </div>
            </div>

            <div className="absolute -left-12 bottom-1/4 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 animate-float delay-500 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dream-peach-50 flex items-center justify-center">
                  <Image src="/logos/perplexity.png" alt="Perplexity" width={20} height={20} className="object-contain" />
                </div>
                <div>
                  <div className="text-xs text-dream-ink-light font-semibold">Top Source</div>
                  <div className="text-sm font-bold text-dream-ink">Perplexity AI</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

