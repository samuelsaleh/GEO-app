'use client'

import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { AIVisibilityTool } from '@/components/AIVisibilityTool'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-32 md:pt-40 pb-20 overflow-hidden font-display">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.jpg)' }}
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center relative z-10">
        
        {/* Hero Text Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h1 className="text-[#202128] text-5xl sm:text-6xl md:text-[64px] font-bold leading-[1.1] md:leading-[1.2] tracking-[-0.02em] mb-6">
            Optimize for the <br className="hidden sm:block" />
            AI Era
          </h1>
          
          <p className="text-[#202128]/60 text-lg md:text-[18px] font-medium leading-[1.5] tracking-[-0.02em] max-w-2xl mb-8 md:mb-10">
            Traditional search is fading. Miageru helps your brand dominate the answers in ChatGPT, Perplexity, and Gemini.
          </p>

          {/* CTA Buttons - ShipX Style */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link 
              href="/tools/ai-visibility" 
              className="bg-[#202128] text-white h-[56px] px-8 rounded-[60px] flex items-center gap-3 font-medium text-[18px] hover:bg-black transition-colors group"
            >
              Get Your Score
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="h-[56px] px-8 rounded-[60px] border border-white/20 bg-white/20 backdrop-blur-sm flex items-center justify-center font-medium text-[#131735] text-[18px] hover:bg-white/30 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview Card - Responsive Container */}
        <div className="w-full max-w-[1000px] relative perspective-1000 animate-enter delay-300">
          <div className="relative bg-white/60 backdrop-filter backdrop-blur-xl border-[16px] border-white/20 rounded-[20px] shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
            {/* Dashboard Header / Browser Chrome */}
            <div className="h-[74px] border-b border-black/5 flex items-center justify-between px-6 bg-white/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="hidden sm:flex bg-white/50 px-4 py-1.5 rounded-lg text-xs font-mono text-black/40">
                miageru.ai/dashboard
              </div>
              <div className="w-16" /> {/* Spacer for balance */}
            </div>

            {/* Dashboard Body - Replaced with AIVisibilityTool */}
            <div className="min-h-[600px] bg-white/40 relative p-4 md:p-8">
               {/* Ensure the tool fits nicely within the design */}
               <div className="w-full h-full bg-white/50 rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                 <AIVisibilityTool hideHeader={true} />
               </div>
            </div>
            
            {/* Decorative Bottom Fade (from original design) */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  )
}
