'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Sparkles, Shield, Zap, HelpCircle } from 'lucide-react'
import Link from 'next/link'

// --- Helper Components ---

function PricingCard({ 
  title, 
  price, 
  description, 
  features, 
  ctaText, 
  ctaHref, 
  isPopular, 
  delay 
}: { 
  title: string, 
  price: string, 
  description: string, 
  features: string[], 
  ctaText: string, 
  ctaHref: string, 
  isPopular?: boolean, 
  delay: string 
}) {
  return (
    <div className={`relative group animate-enter ${delay} h-full`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-claude-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg z-10 animate-float">
          Best Value
        </div>
      )}
      <div className={`glass-card h-full p-8 rounded-[2rem] flex flex-col transition-all duration-500 ${isPopular ? 'border-claude-500/30 bg-white/70 shadow-xl scale-105' : 'hover:bg-white/70'}`}>
        <div className="mb-8">
          <h3 className="text-xl font-bold text-ink mb-4">{title}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-ink">{price}</span>
            {price !== 'Free' && <span className="text-ink-muted text-sm font-medium">/ one-time</span>}
          </div>
          <p className="text-ink-light text-sm leading-relaxed min-h-[3rem]">
            {description}
          </p>
        </div>

        <Link
          href={ctaHref}
          className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider mb-8 flex items-center justify-center gap-2 transition-all duration-300 ${
            isPopular 
              ? 'bg-claude-500 text-white hover:bg-claude-600 shadow-lg shadow-claude-500/20' 
              : 'bg-white text-ink border border-ink/10 hover:border-claude-500 hover:text-claude-500'
          }`}
        >
          {ctaText}
        </Link>

        <div className="space-y-4 flex-1">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-ink-light/90">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? 'bg-claude-100 text-claude-600' : 'bg-cream-200 text-ink-muted'}`}>
                <Check className="w-3 h-3" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b border-ink/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-ink text-lg group-hover:text-claude-500 transition-colors">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-claude-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ink-muted group-hover:text-claude-500 flex-shrink-0 transition-colors" />
        )}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <div className="text-ink-light leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---

export default function PricingPage() {
  const faqs = [
    {
      question: "What do I actually get?",
      answer: "You get three things that already work today: (1) free self‑serve tools (AI Visibility Score, GEO Audit, Schema Generator), (2) a Full GEO Report where we run deeper tests and send you a structured PDF, and (3) an optional Private GEO Audit where we manually review your site and give you a step‑by‑step action plan."
    },
    {
      question: "What is the difference between the Full GEO Report and the Private GEO Audit?",
      answer: "The Full GEO Report (€97) is a deeper version of the free AI Visibility Score – we run more prompts, more competitors and send you a structured PDF report. The Private GEO Audit (€490) goes further: we manually review your site, walk through the issues and strengths, and give you a prioritized roadmap you can implement straight away."
    },
    {
      question: "How much does the Private GEO Audit cost and what do I get?",
      answer: "The Private GEO Audit is €490 one‑time. You get: a review of up to 3 key pages, a deep dive into your AI Visibility & GEO Audit results, a written action plan with prioritized fixes, and a 45‑minute call or Loom walkthrough so you know exactly what to change."
    },
    {
      question: "What if I need help implementing the recommendations?",
      answer: "All reports include step-by-step instructions. The schema generator gives you copy-paste code. If you're still stuck, email us — we actually respond."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes. If you're not happy within 14 days, we'll refund you in full. No questions, no hassle."
    }
  ]

  return (
    <div className="min-h-screen hero-gradient relative">
      <div className="bg-grain" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 text-ink hover:text-claude-500 transition-colors group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-ink/5 group-hover:border-claude-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold">
                dwight
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm mb-8 animate-enter">
            <span className="text-sm font-bold text-ink-muted uppercase tracking-wider">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-ink animate-enter delay-100">
            Start Free. <br/>
            <span className="text-gradient">Scale with Insights.</span>
          </h1>
          <p className="text-xl text-ink-light max-w-2xl mx-auto animate-enter delay-200">
            Use our free tools to benchmark your visibility. Upgrade only when you need a deeper, human analysis.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Free Tier */}
            <PricingCard 
              title="Free Tools"
              price="Free"
              description="Self-serve tools to check your baseline visibility."
              ctaText="Use Free Tools"
              ctaHref="/tools"
              features={[
                "AI Visibility Score (Basic)",
                "Single-page GEO Audit",
                "Schema Generator (Coming Soon)",
                "Basic Email Report"
              ]}
              delay="delay-300"
            />

            {/* Full Report */}
            <PricingCard 
              title="Full GEO Report"
              price="€97"
              description="Comprehensive data run & PDF report for your team."
              ctaText="Get Full Report"
              ctaHref="/contact"
              features={[
                "We run the tools for you",
                "Multiple Prompt Variations",
                "Detailed Competitor Ranking",
                "Actionable PDF Report",
                "Key Strengths & Weaknesses"
              ]}
              isPopular={true}
              delay="delay-400"
            />

            {/* Private Audit */}
            <PricingCard 
              title="Private Audit"
              price="On Demand"
              description="Expert human analysis & implementation roadmap."
              ctaText="Contact Sales"
              ctaHref="/contact"
              features={[
                "Everything in Full Report",
                "Manual Review (3 Key Pages)",
                "Custom Implementation Roadmap",
                "45-min Strategy Call / Loom",
                "Priority Email Support"
              ]}
              delay="delay-500"
            />

          </div>
          
          <div className="mt-16 text-center animate-enter delay-600">
            <p className="text-ink-muted text-sm">
              All prices in EUR. One-time payments, no recurring subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white/40 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16 animate-enter">
            <h2 className="text-3xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
            <p className="text-ink-light">Everything you need to know about GEO pricing.</p>
          </div>

          <div className="glass-card p-8 md:p-12 rounded-[2rem] animate-enter delay-100">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-ink/10 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-display text-2xl font-bold text-ink mb-2">dwight</div>
            <p className="text-sm text-ink-muted">© 2025 Miageru. All rights reserved.</p>
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
