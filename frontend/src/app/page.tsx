'use client'

import { Search, BarChart3, CheckCircle, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Hero } from '@/components/Hero'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Minimal Header */}
      <header className="fixed top-0 w-full z-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="font-display text-xl font-bold tracking-tight flex items-center gap-2 text-[#202128]">
            <div className="relative w-8 h-8">
              <Image src="/logos/miageru-geo.svg" alt="Miageru Logo" fill className="object-contain" />
            </div>
            <span className="hidden sm:inline">Miageru</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/tools" className="text-sm font-medium text-[#202128]/60 hover:text-[#202128] transition-colors">
              Tools
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-[#202128]/60 hover:text-[#202128] transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-semibold text-[#202128] hover:text-[#202128]/80 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Marquee Section */}
      <div className="border-y border-dream-ink/5 bg-white/50 backdrop-blur-md py-12 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <p className="text-sm font-bold text-dream-ink-muted uppercase tracking-widest">Optimized for all major AI Engines</p>
        </div>
        <div className="flex justify-center items-center gap-12 md:gap-32 w-full max-w-6xl mx-auto px-4">
           <div className="flex items-center gap-2">
             <div className="w-32 h-16 relative">
               <Image src="/logos/chatgpt.png" alt="ChatGPT" fill className="object-contain" />
             </div>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-32 h-16 relative">
               <Image src="/logos/perplexity.png" alt="Perplexity" fill className="object-contain" />
             </div>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-32 h-16 relative">
               <Image src="/logos/claude.png" alt="Claude" fill className="object-contain" />
             </div>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-32 h-16 relative">
               <Image src="/logos/gemini.png" alt="Gemini" fill className="object-contain" />
             </div>
           </div>
        </div>
      </div>

      {/* Tools Bento Grid */}
      <section className="py-32 px-4 relative z-10 bg-gradient-to-b from-white/0 to-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-enter text-dream-ink">The GEO Toolkit</h2>
            <p className="text-xl text-dream-ink-light max-w-2xl mx-auto animate-enter delay-100">
              Everything you need to measure, improve, and monitor your brand's presence in Large Language Models.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Big Card - AI Visibility */}
            <div className="md:col-span-8 h-[500px]">
              <Link href="/tools/ai-visibility" className="block h-full glass-card rounded-[2rem] relative overflow-hidden group animate-enter delay-200">
                <div className="p-10 h-full flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-dream-purple-500 text-white flex items-center justify-center shadow-lg shadow-dream-purple-500/30">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <span className="px-4 py-2 rounded-full bg-dream-ink text-white text-xs font-bold uppercase tracking-wider">Flagship</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-dream-ink">AI Visibility Score</h3>
                  <p className="text-lg text-dream-ink-light max-w-md mb-8">
                    See how GPT-5, Claude, and Gemini really see your brand. 
                    Compare your share of voice against 5 competitors instantly.
                  </p>
                  <div className="mt-auto inline-flex items-center text-dream-purple-600 font-bold uppercase tracking-wide group-hover:translate-x-2 transition-transform">
                    Launch Tool <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
                
                {/* Decorative Abstract UI */}
                <div className="absolute right-0 bottom-0 w-2/3 h-full bg-gradient-to-tl from-dream-purple-100/50 to-transparent opacity-50 rounded-tl-[4rem]" />
                <div className="absolute right-10 bottom-10 w-64 h-40 bg-white rounded-xl shadow-xl border border-black/5 p-4 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                   <div className="h-2 w-1/3 bg-gray-100 rounded mb-4" />
                   <div className="space-y-2">
                     <div className="h-2 w-full bg-dream-purple-100 rounded" />
                     <div className="h-2 w-5/6 bg-dream-purple-100 rounded" />
                     <div className="h-2 w-4/6 bg-dream-purple-100 rounded" />
                   </div>
                </div>
              </Link>
            </div>

            {/* Tall Card - GEO Audit */}
            <div className="md:col-span-4 md:row-span-2 h-full">
              <Link href="/tools/health-check" className="block h-full glass-card rounded-[2rem] p-10 relative group animate-enter delay-300">
                <div className="w-14 h-14 rounded-2xl bg-dream-peach-100 text-dream-peach-500 flex items-center justify-center mb-8 shadow-lg shadow-dream-peach-500/20">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-dream-ink">GEO Audit</h3>
                <p className="text-dream-ink-light mb-8">
                  Technical deep-dive into your page structure. Fix the invisible blockers stopping AI from citing you.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Schema Validation', 'Content Structure', 'Citability Check', 'Readability Score'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-dream-ink-muted text-sm font-medium">
                      <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="absolute bottom-10 left-10 flex items-center text-dream-peach-500 font-bold uppercase tracking-wide">
                  Start Audit <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Wide Card - Schema Gen */}
            <div className="md:col-span-8 h-[300px]">
              <Link href="/tools/schema-generator" className="block h-full glass-card rounded-[2rem] relative overflow-hidden group animate-enter delay-400">
                <div className="p-10 flex flex-col h-full relative z-10 w-1/2">
                  <div className="w-14 h-14 rounded-2xl bg-dream-blue-100 text-dream-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-dream-blue-500/20">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-dream-ink">Schema Generator</h3>
                  <p className="text-dream-ink-light max-w-sm relative z-20">
                    Generate perfect JSON-LD to help AI parse your content.
                  </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[#0F172A] p-6 font-mono text-xs text-green-400 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <div className="opacity-50 mb-2">// Generated Schema</div>
                  {`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dwight",
  "url": "https://dwight.ai"
}`}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-32 bg-white/50 backdrop-blur-sm border-y border-white/50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
          <div className="animate-enter">
            <span className="text-dream-purple-600 font-bold tracking-widest uppercase text-sm mb-4 block">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-dream-ink leading-tight">
              Traditional SEO <br/> doesn't work here.
            </h2>
            <p className="text-lg text-dream-ink-light mb-6 leading-relaxed">
              Keywords don't matter when AI generates the answer. Optimization for LLMs (GEO) requires a completely different strategy: <strong>Structure, Citability, and Authority.</strong>
            </p>
            <div className="flex gap-4 mt-8">
              <div className="flex-1 p-6 rounded-2xl bg-white border border-dream-ink/5 shadow-sm">
                <div className="text-3xl font-bold text-dream-ink mb-2">40%</div>
                <div className="text-sm font-medium text-dream-ink-muted">Drop in traditional <br/> search traffic</div>
              </div>
              <div className="flex-1 p-6 rounded-2xl bg-dream-purple-50 border border-dream-purple-100 shadow-sm">
                <div className="text-3xl font-bold text-dream-purple-600 mb-2">100M+</div>
                <div className="text-sm font-medium text-dream-purple-700/70">Daily users on <br/> ChatGPT</div>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] bg-dream-ink rounded-3xl p-8 text-white shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 animate-enter delay-200">
            <div className="absolute top-4 left-4 right-4 h-8 bg-white/10 rounded-full flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="mt-12 space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0" />
                <div className="space-y-2">
                   <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                     When I ask about the best running shoes, why isn't <strong>Nike</strong> showing up?
                   </div>
                </div>
              </div>
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-dream-purple-500 flex-shrink-0" />
                <div className="space-y-2">
                   <div className="bg-dream-purple-600 p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed">
                     Based on recent reviews and expert analysis, <strong>Hoka</strong> and <strong>Brooks</strong> are currently rated higher for comfort and durability...
                   </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 text-center text-sm text-white/40 font-mono">
              Is your brand being mentioned?
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 text-center relative">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dream-purple-500/5 -z-10" />
         <div className="max-w-4xl mx-auto">
           <h2 className="text-5xl md:text-7xl font-bold mb-8 text-dream-ink animate-enter">
             Ready to be <br/> <span className="text-gradient">Recommended?</span>
           </h2>
           <p className="text-xl text-dream-ink-light mb-12 max-w-2xl mx-auto animate-enter delay-100">
             Start with our free tools. No credit card required.
           </p>
           <div className="flex flex-col sm:flex-row gap-6 justify-center animate-enter delay-200">
             <Link href="/tools/ai-visibility" className="btn-primary text-lg px-10 py-5 shadow-xl shadow-dream-purple-500/20">
               Get Your Score
             </Link>
             <Link href="/tools" className="btn-secondary text-lg px-10 py-5">
               Explore All Tools
             </Link>
           </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/10 bg-dream-ink-dark text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-display text-2xl font-bold text-white mb-2 flex items-center gap-3 justify-center md:justify-start">
              <div className="relative w-8 h-8">
                <Image src="/logos/miageru-geo.svg" alt="Miageru Logo" fill className="object-contain brightness-0 invert" />
              </div>
              Miageru (見上げる)
            </div>
            <p className="text-sm text-white/40">© 2025 Miageru. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
