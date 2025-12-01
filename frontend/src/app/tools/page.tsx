'use client'

import { Search, Code, ArrowLeft, BarChart3, Lock, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function ToolCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  delay, 
  badge,
  colorClass = "text-claude-500",
  bgClass = "bg-cream-100/50",
  locked = false
}: { 
  title: string, 
  description: string, 
  icon: any, 
  href: string, 
  delay: string,
  badge?: { text: string, icon?: any },
  colorClass?: string,
  bgClass?: string,
  locked?: boolean
}) {
  return (
    <Link 
      href={href}
      className={`glass-card p-8 rounded-3xl flex flex-col justify-between h-full group animate-enter ${delay} ${locked ? 'cursor-not-allowed opacity-80' : ''}`}
      onClick={(e) => locked && e.preventDefault()}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative`}>
            <Icon className={`w-7 h-7 ${colorClass}`} />
            {locked && (
              <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-sm border border-ink/5">
                <Lock className="w-3 h-3 text-ink-muted" />
              </div>
            )}
          </div>
          {badge && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white border border-ink/5 shadow-sm uppercase tracking-wider ${locked ? 'text-ink-muted' : 'text-ink-light'}`}>
              {badge.icon && <badge.icon className="w-3 h-3" />}
              {badge.text}
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-ink group-hover:text-claude-600 transition-colors">
          {title}
        </h3>
        <p className="text-ink-light/80 leading-relaxed mb-8">
          {description}
        </p>
      </div>
      
      <div className="border-t border-ink/5 pt-6 mt-auto">
        <ul className="space-y-2 mb-6">
          <li className="text-sm font-medium text-ink-muted flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
            Instant Analysis
          </li>
          <li className="text-sm font-medium text-ink-muted flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
            Actionable Report
          </li>
        </ul>
        <div className={`flex items-center text-sm font-bold ${colorClass} tracking-wide uppercase group-hover:translate-x-1 transition-transform`}>
          {locked ? (
            <span className="text-ink-muted flex items-center gap-2">
              <Lock className="w-4 h-4" /> Locked
            </span>
          ) : (
            <>Launch Tool <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen hero-gradient relative">
      <div className="bg-grain" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 text-cream-100 hover:text-white transition-colors group">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shadow-sm border border-white/10 group-hover:border-claude-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <div className="relative w-8 h-8">
                <Image src="/logos/miageru-geo.svg" alt="Miageru Logo" fill className="object-contain" />
              </div>
              <span className="font-display text-xl font-bold">
                Miageru
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm mb-6 animate-enter">
            <Sparkles className="w-4 h-4 text-claude-500" />
            <span className="text-sm font-medium text-ink-light uppercase tracking-wider">GEO Tools Suite</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-bold mb-6 text-ink animate-enter delay-100">
            Free GEO Tools
          </h1>
          <p className="text-xl text-ink-light max-w-2xl mx-auto leading-relaxed animate-enter delay-200">
            Professional-grade tools to measure and improve your visibility in AI search engines.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* GEO Score */}
          <ToolCard
            title="AI Visibility Score"
            description="See how GPT-5 and Claude talk about your brand versus key competitors. Get a 0–100 visibility score."
            icon={BarChart3}
            href="/tools/ai-visibility"
            delay="delay-300"
            badge={{ text: 'Free', icon: Sparkles }}
            colorClass="text-claude-500"
            bgClass="bg-claude-50"
          />

          {/* GEO Audit */}
          <ToolCard
            title="Private GEO Audit"
            description="Expert manual analysis of your site's AI readiness. Deep dive into schema, structure, and citations."
            icon={Search}
            href="/contact"
            delay="delay-400"
            badge={{ text: 'Contact Sales' }}
            colorClass="text-ink-muted"
            bgClass="bg-ink/5"
            locked={true}
          />

          {/* Schema Generator */}
          <ToolCard
            title="Schema Generator"
            description="Create structured data that AI understands. Generate copy‑paste ready JSON-LD."
            icon={Code}
            href="#"
            delay="delay-500"
            badge={{ text: 'Coming Soon' }}
            colorClass="text-ink-muted"
            bgClass="bg-ink/5"
            locked={true}
          />
        </div>

        {/* Education Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-enter delay-500">
            <h2 className="text-3xl font-bold text-ink mb-4">The 7 GEO Strategies</h2>
            <p className="text-ink-light">Our tools are built on the proven framework for AI visibility.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-enter delay-600">
            {[
              { num: '01', title: 'Questions', desc: 'Answer real user queries' },
              { num: '02', title: 'Structure', desc: 'Schema & formatting' },
              { num: '03', title: 'Authority', desc: 'Content clusters' },
              { num: '04', title: 'Mentions', desc: 'Citations AI trusts' },
            ].map((strategy) => (
              <div key={strategy.num} className="glass-card p-6 rounded-2xl text-center hover:bg-white/80">
                <div className="text-xs font-bold text-claude-500 mb-2 opacity-50">{strategy.num}</div>
                <h4 className="font-bold text-ink mb-1">{strategy.title}</h4>
                <p className="text-xs text-ink-light">{strategy.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center animate-enter delay-700">
          <div className="glass-card p-12 rounded-[2rem] max-w-3xl mx-auto relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-ink">Need a Deeper Analysis?</h2>
              <p className="mb-8 text-ink-light text-lg">
                Get a full human review of your site with our Private GEO Audit.
              </p>
              <Link
                href="/pricing"
                className="btn-primary inline-flex items-center"
              >
                View Audit Pricing <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-claude-50/50 to-transparent -z-0 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
