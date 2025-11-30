'use client'

import { useState, useEffect } from 'react'
import { Search, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Target, TrendingUp, ArrowUpRight, Globe, Lock } from 'lucide-react'
import Link from 'next/link'
import { waitlistAPI } from '@/lib/api'

// --- SVG Logos ---

function ChatGPTLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0462 0 0 0 4.9891 4.1414a6.0268 6.0268 0 0 0-2.0722 5.6815 5.9847 5.9847 0 0 0 .5157 4.9108 6.0462 6.0462 0 0 0 6.51 2.9 6.0651 6.0651 0 0 0 10.2662-2.1294 6.0268 6.0268 0 0 0 2.0722-5.6815ZM13.2056 2.2528a4.476 4.476 0 0 1 2.2045 1.034l-1.261 2.184a4.476 4.476 0 0 0-2.2045-1.034V2.2528Zm-2.411 0v2.184A4.476 4.476 0 0 0 8.59 5.4708l-1.261-2.184a4.476 4.476 0 0 1 3.4656-1.034Zm-5.4656 3.4656 1.89 1.091a4.476 4.476 0 0 0 .227 2.411L5.262 10.4814a4.476 4.476 0 0 1 .067-4.763ZM3.1444 8.59l2.184-1.261a4.476 4.476 0 0 0 1.034 2.2045l-2.184 1.261a4.476 4.476 0 0 1-1.034-2.2045Zm1.034 5.4656-1.091-1.89a4.476 4.476 0 0 1-2.411-.227l1.261-2.184a4.476 4.476 0 0 0 2.241 4.301Zm3.4656 2.0722-1.261 2.184a4.476 4.476 0 0 1-2.2045-1.034l1.261-2.184a4.476 4.476 0 0 0 2.2045 1.034Zm5.4656 0-1.89-1.091a4.476 4.476 0 0 0-.227-2.411l2.184-1.261a4.476 4.476 0 0 1-.067 4.763Zm2.184-2.8778-2.184 1.261a4.476 4.476 0 0 0-1.034-2.2045l2.184-1.261a4.476 4.476 0 0 1 1.034 2.2045Zm-1.034-5.4656 1.091 1.89a4.476 4.476 0 0 1 2.411.227l-1.261 2.184a4.476 4.476 0 0 0-2.241-4.301Z" />
    </svg>
  )
}

function ClaudeLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.0002 2.25c-5.385 0-9.7502 4.365-9.7502 9.75s4.3652 9.75 9.7502 9.75 9.75-4.365 9.75-9.75-4.365-9.75-9.75-9.75zm0 17.25c-4.1422 0-7.5002-3.358-7.5002-7.5s3.358-7.5 7.5002-7.5 7.5 3.358 7.5 7.5-3.358 7.5-7.5 7.5zm-.75-9.75h1.5v4.5h-1.5v-4.5zm.75-2.25c.414 0 .75-.336.75-.75s-.336-.75-.75-.75-.75.336-.75.75.336.75.75.75z"/>
    </svg>
  )
}

function PerplexityLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.236L19.764 8.118V15.882L12 19.764L4.236 15.882V8.118L12 4.236ZM12 8L8 10V14L12 16L16 14V10L12 8Z"/>
    </svg>
  )
}

function GeminiLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z"/>
    </svg>
  )
}

function BingChatLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.5 2C11.5 2 5 4 5 17L11.5 22L18 17C18 4 11.5 2 11.5 2ZM11.5 19L7.5 16C7.5 16 7 7 11.5 5.5C16 7 15.5 16 15.5 16L11.5 19Z"/>
    </svg>
  )
}

// --- Helper Components ---

function FloatingBadge({ text, delay = '0s' }: { text: string, delay?: string }) {
  return (
    <div 
      className="absolute hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 animate-float text-sm font-medium text-ink"
      style={{ animationDelay: delay }}
    >
      <div className="w-2 h-2 rounded-full bg-claude-500 animate-pulse" />
      {text}
    </div>
  )
}

function ToolCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  delay, 
  badge 
}: { 
  title: string, 
  description: string, 
  icon: any, 
  href: string, 
  delay: string,
  badge?: string
}) {
  return (
    <Link 
      href={href}
      className={`glass-card p-8 rounded-3xl flex flex-col justify-between h-full group animate-enter ${delay}`}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cream-100/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-claude-500" />
          </div>
          {badge && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-claude-50 text-claude-600 border border-claude-100">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-ink group-hover:text-claude-600 transition-colors">
          {title}
        </h3>
        <p className="text-ink-light/80 leading-relaxed mb-8">
          {description}
        </p>
      </div>
      <div className="flex items-center text-sm font-bold text-claude-500 tracking-wide uppercase">
        Try Tool <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

// --- Main Page ---

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Grain Overlay */}
      <div className="bg-grain" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <div className="w-8 h-8 bg-claude-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" fill="currentColor" />
            </div>
            dwight
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/tools" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">Tools</Link>
            <Link href="/pricing" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm font-medium text-ink/70 hover:text-ink transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hidden md:block text-sm font-semibold text-ink hover:text-claude-500 transition-colors">
              Sign In
            </Link>
            <Link href="/tools/ai-visibility" className="btn-primary text-sm shadow-lg shadow-claude-500/20">
              Get GEO Score
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-visible">
        {/* Background Orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-300/20 to-rose-300/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm mb-8 animate-enter">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-claude-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-claude-500"></span>
            </span>
            <span className="text-sm font-medium text-ink-light">The new standard for AI Visibility</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight animate-enter delay-100">
            Win the <br />
            <span className="text-gradient">AI Search Results</span>
          </h1>

          <p className="text-xl text-ink-light/80 mb-12 max-w-2xl mx-auto leading-relaxed animate-enter delay-200 text-balance">
            Millions now ask ChatGPT & Perplexity instead of Google. <br className="hidden md:block" />
            Dwight analyzes your brand's visibility in AI answers and tells you exactly how to rank.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-enter delay-300">
            <Link href="/tools/ai-visibility" className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
              Run Free Audit
            </Link>
            <Link href="/pricing" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 flex items-center gap-2 justify-center group">
              View Pricing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Floating UI Elements (Decorative) */}
          <div className="absolute top-1/2 left-0 -translate-x-12 -translate-y-1/2 hidden lg:block">
            <FloatingBadge text="GPT-5 Analysis: 92/100" delay="0s" />
          </div>
          <div className="absolute top-2/3 right-0 translate-x-12 -translate-y-1/2 hidden lg:block">
            <FloatingBadge text="Perplexity: Cited Source" delay="1.5s" />
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="border-y border-ink/5 bg-white/30 backdrop-blur-sm py-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <p className="text-sm font-bold text-ink-muted uppercase tracking-widest">Optimized for all major AI Engines</p>
        </div>
        <div className="flex justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2">
             <ChatGPTLogo className="w-8 h-8" />
             <span className="text-xl font-bold text-ink font-display">ChatGPT</span>
           </div>
           <div className="flex items-center gap-2">
             <PerplexityLogo className="w-8 h-8" />
             <span className="text-xl font-bold text-ink font-display">Perplexity</span>
           </div>
           <div className="flex items-center gap-2">
             <ClaudeLogo className="w-8 h-8" />
             <span className="text-xl font-bold text-ink font-display">Claude</span>
           </div>
           <div className="flex items-center gap-2">
             <GeminiLogo className="w-8 h-8" />
             <span className="text-xl font-bold text-ink font-display">Gemini</span>
           </div>
           <div className="flex items-center gap-2">
             <BingChatLogo className="w-8 h-8" />
             <span className="text-xl font-bold text-ink font-display">Bing Chat</span>
           </div>
        </div>
      </div>

      {/* Tools Bento Grid */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-enter">The GEO Toolkit</h2>
            <p className="text-xl text-ink-light max-w-2xl mx-auto animate-enter delay-100">
              Everything you need to measure, improve, and monitor your brand's presence in Large Language Models.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Big Card - AI Visibility */}
            <div className="md:col-span-8 h-[500px]">
              <Link href="/tools/ai-visibility" className="block h-full glass-card rounded-[2rem] relative overflow-hidden group animate-enter delay-200">
                <div className="p-10 h-full flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-claude-500 text-white flex items-center justify-center">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <span className="px-4 py-2 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider">Flagship</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-ink">AI Visibility Score</h3>
                  <p className="text-lg text-ink-light max-w-md mb-8">
                    See how GPT-5, Claude, and Gemini really see your brand. 
                    Compare your share of voice against 5 competitors instantly.
                  </p>
                  <div className="mt-auto inline-flex items-center text-claude-500 font-bold uppercase tracking-wide group-hover:translate-x-2 transition-transform">
                    Launch Tool <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
                
                {/* Decorative Abstract UI */}
                <div className="absolute right-0 bottom-0 w-2/3 h-full bg-gradient-to-tl from-cream-200 to-transparent opacity-50 rounded-tl-[4rem]" />
                <div className="absolute right-10 bottom-10 w-64 h-40 bg-white rounded-xl shadow-xl border border-black/5 p-4 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                   <div className="h-2 w-1/3 bg-gray-200 rounded mb-4" />
                   <div className="space-y-2">
                     <div className="h-2 w-full bg-claude-100 rounded" />
                     <div className="h-2 w-5/6 bg-claude-100 rounded" />
                     <div className="h-2 w-4/6 bg-claude-100 rounded" />
                   </div>
                </div>
              </Link>
            </div>

            {/* Tall Card - GEO Audit */}
            <div className="md:col-span-4 md:row-span-2 h-full">
              <Link href="/tools/health-check" className="block h-full glass-card rounded-[2rem] p-10 relative group animate-enter delay-300">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-8">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-ink">GEO Audit</h3>
                <p className="text-ink-light mb-8">
                  Technical deep-dive into your page structure. Fix the invisible blockers stopping AI from citing you.
                </p>
                <ul className="space-y-4 mb-10">
                  {['Schema Validation', 'Content Structure', 'Citability Check', 'Readability Score'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-ink-muted text-sm font-medium">
                      <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="absolute bottom-10 left-10 flex items-center text-rose-600 font-bold uppercase tracking-wide">
                  Start Audit <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Wide Card - Schema Gen */}
            <div className="md:col-span-8 h-[300px]">
              <Link href="/tools/schema-generator" className="block h-full glass-card rounded-[2rem] relative overflow-hidden group animate-enter delay-400">
                <div className="p-10 flex flex-col h-full relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-ink">Schema Generator</h3>
                  <p className="text-ink-light max-w-md">
                    Generate perfect JSON-LD to help AI parse your content.
                  </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[#1e1e1e] p-6 font-mono text-xs text-green-400 opacity-90 group-hover:scale-105 transition-transform duration-500">
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
            <span className="text-claude-500 font-bold tracking-widest uppercase text-sm mb-4 block">The Problem</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-ink leading-tight">
              Traditional SEO <br/> doesn't work here.
            </h2>
            <p className="text-lg text-ink-light mb-6 leading-relaxed">
              Keywords don't matter when AI generates the answer. Optimization for LLMs (GEO) requires a completely different strategy: <strong>Structure, Citability, and Authority.</strong>
            </p>
            <div className="flex gap-4 mt-8">
              <div className="flex-1 p-6 rounded-2xl bg-cream-100/50 border border-cream-200">
                <div className="text-3xl font-bold text-ink mb-2">40%</div>
                <div className="text-sm font-medium text-ink-muted">Drop in traditional <br/> search traffic</div>
              </div>
              <div className="flex-1 p-6 rounded-2xl bg-claude-50 border border-claude-100">
                <div className="text-3xl font-bold text-claude-600 mb-2">100M+</div>
                <div className="text-sm font-medium text-claude-700/70">Daily users on <br/> ChatGPT</div>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] bg-ink rounded-3xl p-8 text-white shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 animate-enter delay-200">
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
                <div className="w-8 h-8 rounded-full bg-claude-500 flex-shrink-0" />
                <div className="space-y-2">
                   <div className="bg-claude-600 p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed">
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
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-claude-500/5 -z-10" />
         <div className="max-w-4xl mx-auto">
           <h2 className="text-5xl md:text-7xl font-bold mb-8 text-ink animate-enter">
             Ready to be <br/> <span className="text-gradient">Recommended?</span>
           </h2>
           <p className="text-xl text-ink-light mb-12 max-w-2xl mx-auto animate-enter delay-100">
             Start with our free tools. No credit card required.
           </p>
           <div className="flex flex-col sm:flex-row gap-6 justify-center animate-enter delay-200">
             <Link href="/tools/ai-visibility" className="btn-primary text-lg px-10 py-5 shadow-xl shadow-claude-500/20">
               Get Your Score
             </Link>
             <Link href="/tools" className="btn-secondary text-lg px-10 py-5">
               Explore All Tools
             </Link>
           </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-ink/10 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-display text-2xl font-bold text-ink mb-2">dwight</div>
            <p className="text-sm text-ink-muted">© 2025 Dwight. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-ink-light">
            <Link href="/" className="hover:text-claude-500 transition-colors">Home</Link>
            <Link href="/tools" className="hover:text-claude-500 transition-colors">Tools</Link>
            <Link href="/contact" className="hover:text-claude-500 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
