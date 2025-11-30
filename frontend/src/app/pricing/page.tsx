'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Check, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const targetDate = new Date('2025-11-30T00:00:00Z')
    
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex gap-4 justify-center">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-ink-900 text-white w-14 h-14 flex items-center justify-center text-xl font-display font-medium">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-ink-500 mt-2 uppercase tracking-wider font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b border-cream-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="font-display text-lg text-ink-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-claude-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ink-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-6 text-ink-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const faqs = [
    {
      question: "What do I actually get?",
      answer: "Three tiers: Quick Check (free, 3 prompts, 1 AI model), Competitive Test (€97, 10 prompts, 2 AI models, rank vs 10 competitors), and Full Audit (€2,400, includes everything plus implementation roadmap and strategy call)."
    },
    {
      question: "Why is this so cheap compared to competitors?",
      answer: "We built focused tools, not a bloated platform. No enterprise sales team, no fancy offices. We pass those savings to you. €19/month gets you everything most businesses need."
    },
    {
      question: "Can I try before I buy?",
      answer: "Absolutely. The free Quick Check lets you test 3 prompts on 1 AI model — see your visibility score instantly. No credit card required. Upgrade to the €97 Competitive Test to see full rankings vs competitors."
    },
    {
      question: "How does the 30% Black Friday discount work?",
      answer: "Pay for 12 months upfront and save 30%. That's €228/year for Starter instead of €348. The discount applies automatically at checkout."
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
    <div className="min-h-screen hero-gradient">
      {/* Black Friday Banner */}
      <div className="bg-ink-900 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium tracking-wide">
          <span className="bg-claude-500 text-white px-3 py-1 text-xs tracking-wider mr-3 uppercase font-semibold">Black Friday</span>
          Get 30% off annual plans — Limited time offer
        </p>
      </div>

      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 text-ink-500" />
              <span className="font-display text-3xl font-medium text-ink-900">
                dwight
              </span>
            </Link>
            <div className="flex gap-10">
              <Link href="/about" className="nav-link text-ink-700 hover:text-claude-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="nav-link text-ink-700 hover:text-claude-500 transition-colors">
                Contact
              </Link>
              <Link href="/tools" className="nav-link text-ink-700 hover:text-claude-500 transition-colors">
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 border border-claude-200">
            <span className="text-claude-600 text-sm tracking-wider uppercase font-medium">Black Friday: 30% off annual</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-medium mb-8 text-ink-900">
            No hidden fees. No enterprise pricing.
          </h1>
          <p className="text-lg text-ink-600">
            Start free, upgrade when you need more. Cancel anytime.
          </p>
        </div>
      </section>

      {/* GEO Score Testing - One-Time Services */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-5 py-2 border border-claude-200 bg-claude-50">
              <span className="text-claude-600 text-sm tracking-wider uppercase font-medium">GEO Score Testing</span>
            </div>
            <h2 className="font-display text-3xl font-medium text-ink-900">Measure Your AI Search Visibility</h2>
            <p className="text-ink-600 mt-3">See how ChatGPT, Claude, and Gemini recommend your brand</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Quick Check */}
            <div className="card-elevated p-10 border border-cream-300 hover:border-claude-300 transition flex flex-col">
              <h3 className="font-display text-2xl text-ink-900 mb-3">Quick Check</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-display font-medium text-ink-900">FREE</span>
              </div>
              <p className="text-ink-500 mb-8 text-sm tracking-wider uppercase font-medium">One-time</p>
              <p className="text-ink-600 mb-8 leading-relaxed">
                Get your GEO Score in 30 seconds. See if AI recommends your brand.
              </p>
              
              <Link
                href="/tools/ai-visibility"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium border border-claude-500 text-claude-500 px-6 py-4 mb-8 hover:bg-claude-500 hover:text-white transition-all duration-300"
              >
                Get Free GEO Score
              </Link>

              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">3 strategic prompts tested</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">1 AI model (Claude Sonnet)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Basic visibility score</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Letter grade (A-F)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Email report</span>
                </li>
              </ul>
            </div>

            {/* Competitive Test - €97 */}
            <div className="card-elevated p-10 border-2 border-claude-500 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-claude-500 text-white px-5 py-1.5 text-xs tracking-wider uppercase font-semibold whitespace-nowrap">
                Most Popular
              </div>
              <h3 className="font-display text-2xl text-ink-900 mb-3">Competitive Test</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-display font-medium text-ink-900">€97</span>
              </div>
              <p className="text-ink-500 mb-8 text-sm tracking-wider uppercase font-medium">One-time</p>
              <p className="text-ink-600 mb-8 leading-relaxed">
                Full competitive analysis. See exactly where you rank vs 10 competitors.
              </p>
              
              <Link
                href="/contact"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-6 py-4 mb-8 hover:bg-claude-600 transition-all duration-300"
              >
                Get Competitive Test
              </Link>

              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">10 strategic prompts tested</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700"><strong>2 AI models (GPT-4o + Claude)</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700"><strong>Rank vs 10 competitors</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Full rankings & insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Actionable recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">PDF report emailed</span>
                </li>
              </ul>
            </div>

            {/* Full Audit - €2,400 */}
            <div className="card-elevated p-10 border border-cream-300 hover:border-claude-300 transition flex flex-col">
              <h3 className="font-display text-2xl text-ink-900 mb-3">Full Audit</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-display font-medium text-ink-900">€2,400</span>
              </div>
              <p className="text-ink-500 mb-8 text-sm tracking-wider uppercase font-medium">Includes €97 test</p>
              <p className="text-ink-600 mb-8 leading-relaxed">
                Complete audit with implementation roadmap and 1-hour strategy call.
              </p>
              
              <Link
                href="/contact"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-6 py-4 mb-8 hover:bg-claude-600 transition-all duration-300"
              >
                Book Full Audit
              </Link>

              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Everything in Competitive Test</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700"><strong>4 AI platforms tested</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700"><strong>20+ competitor analysis</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700"><strong>Implementation roadmap</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700"><strong>1-hour strategy call</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">30-day email support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring Bundles */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl font-medium text-ink-900">Save with Bundles</h3>
            <p className="text-ink-600 mt-2">Audit + ongoing monitoring packages</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-elevated p-8 border-2 border-purple-300">
              <h4 className="font-display text-xl text-ink-900 mb-2">Audit + 3 Months Monitoring</h4>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-display font-medium text-ink-900">€4,900</span>
                <span className="text-ink-400 line-through">€5,500</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 font-medium">Save €600</span>
              </div>
              <p className="text-ink-600 text-sm mb-6">Full audit + weekly tracking for 3 months</p>
              <Link href="/contact" className="block w-full text-center border border-purple-500 text-purple-500 px-6 py-3 hover:bg-purple-500 hover:text-white transition-all duration-300 text-sm tracking-wider uppercase font-medium">
                Get Started
              </Link>
            </div>
            
            <div className="card-elevated p-8 border-2 border-purple-500">
              <div className="inline-block bg-purple-500 text-white text-xs px-3 py-1 font-medium mb-3">BEST VALUE</div>
              <h4 className="font-display text-xl text-ink-900 mb-2">Audit + 12 Months Monitoring</h4>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-display font-medium text-ink-900">€15,000</span>
                <span className="text-ink-400 line-through">€18,400</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 font-medium">Save €3,400</span>
              </div>
              <p className="text-ink-600 text-sm mb-6">Full audit + weekly tracking for 12 months + priority support</p>
              <Link href="/contact" className="block w-full text-center bg-purple-500 text-white px-6 py-3 hover:bg-purple-600 transition-all duration-300 text-sm tracking-wider uppercase font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Subscriptions */}
      <section className="py-20 px-4 bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-5 py-2 border border-claude-200 bg-white">
              <span className="text-claude-600 text-sm tracking-wider uppercase font-medium">Platform Access</span>
            </div>
            <h2 className="font-display text-3xl font-medium text-ink-900">Monthly Platform Plans</h2>
            <p className="text-ink-600 mt-3">Unlimited access to all tools with monthly subscription</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card-elevated p-10 border border-cream-300 hover:border-claude-300 transition flex flex-col">
              <h3 className="font-display text-2xl text-ink-900 mb-3">Free</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-display font-medium text-ink-900">€0</span>
              </div>
              <p className="text-ink-500 mb-8 text-sm tracking-wider uppercase font-medium">Forever</p>
              <p className="text-ink-600 mb-8 leading-relaxed">
                Try our tools and see how AI-ready your website is.
              </p>
              
              <Link
                href="/tools"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium border border-claude-500 text-claude-500 px-6 py-4 mb-8 hover:bg-claude-500 hover:text-white transition-all duration-300"
              >
                Get Started Free
              </Link>

              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">3 GEO Audits per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">5 Schema generations per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Basic visibility report</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Email support</span>
                </li>
              </ul>
            </div>

            {/* Starter - Most Popular */}
            <div className="card-elevated p-10 border-2 border-claude-500 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-claude-500 text-white px-5 py-1.5 text-xs tracking-wider uppercase font-semibold whitespace-nowrap">
                Most Popular
              </div>
              <h3 className="font-display text-2xl text-ink-900 mb-3">Starter</h3>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-ink-400 line-through text-lg">€29</span>
                <span className="text-5xl font-display font-medium text-ink-900">€19</span>
              </div>
              <p className="text-ink-500 mb-8 text-sm tracking-wider uppercase font-medium">Per month</p>
              <p className="text-ink-600 mb-8 leading-relaxed">
                For startups ready to optimize their AI search visibility.
              </p>
              
              <Link
                href="/contact"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-6 py-4 mb-8 hover:bg-claude-600 transition-all duration-300"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Unlimited GEO Audits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Unlimited Schema generations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Detailed visibility reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Export reports as PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Priority email support</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="card-elevated p-10 border border-cream-300 hover:border-claude-300 transition flex flex-col">
              <h3 className="font-display text-2xl text-ink-900 mb-3">Pro</h3>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-ink-400 line-through text-lg">€59</span>
                <span className="text-5xl font-display font-medium text-ink-900">€39</span>
              </div>
              <p className="text-ink-500 mb-8 text-sm tracking-wider uppercase font-medium">Per month</p>
              <p className="text-ink-600 mb-8 leading-relaxed">
                For teams who need advanced features and white-label reports.
              </p>
              
              <Link
                href="/contact"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-6 py-4 mb-8 hover:bg-claude-600 transition-all duration-300"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">White-label reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Team collaboration (up to 5 seats)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-ink-500 mt-10 text-sm">
            All prices in EUR. Annual billing saves 30% — that's 4 months free.
          </p>
        </div>
      </section>

      {/* Countdown CTA */}
      <section className="py-20 bg-claude-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block border border-white/30 text-white px-5 py-2 text-xs tracking-wider uppercase font-medium mb-8">
            GEO is the New SEO
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-white mb-8">
            Know your GEO Score before your competitors do.
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI search is growing 40% monthly. Early GEO adopters will dominate the new search landscape.
          </p>
          
          <div className="mb-10">
            <p className="text-white/70 mb-5 text-sm tracking-wider uppercase font-medium">Black Friday sale ends in</p>
            <CountdownTimer />
          </div>

          <Link
            href="/tools/ai-visibility"
            className="inline-block bg-white text-claude-600 px-12 py-4 hover:bg-cream-100 transition text-sm tracking-wider uppercase font-medium"
          >
            Get Free GEO Score
          </Link>
          
          <p className="text-white/60 text-sm tracking-wider uppercase mt-8">
            No credit card required. Upgrade anytime.
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-3xl font-medium text-center mb-16 text-ink-900">Compare Plans</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-cream-300">
                  <th className="text-left p-4 text-ink-900">Feature</th>
                  <th className="text-center p-4 text-ink-600">Free</th>
                  <th className="text-center p-4 text-claude-500 font-medium">Starter</th>
                  <th className="text-center p-4 text-ink-600">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                <tr>
                  <td className="p-4 text-ink-700">GEO Audits</td>
                  <td className="p-4 text-center text-ink-600">3/month</td>
                  <td className="p-4 text-center text-ink-900 font-medium">Unlimited</td>
                  <td className="p-4 text-center text-ink-600">Unlimited</td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-700">Schema Generator</td>
                  <td className="p-4 text-center text-ink-600">5/month</td>
                  <td className="p-4 text-center text-ink-900 font-medium">Unlimited</td>
                  <td className="p-4 text-center text-ink-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-700">Visibility reports</td>
                  <td className="p-4 text-center text-ink-600">Basic</td>
                  <td className="p-4 text-center text-ink-900 font-medium">Detailed</td>
                  <td className="p-4 text-center text-ink-600">Detailed</td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-700">Export as PDF</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-700">White-label reports</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-700">API access</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-700">Team seats</td>
                  <td className="p-4 text-center text-ink-600">1</td>
                  <td className="p-4 text-center text-ink-900 font-medium">1</td>
                  <td className="p-4 text-center text-ink-600">Up to 5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl font-medium text-center mb-16 text-ink-900">What You Get</h2>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="card-elevated p-10">
              <div className="w-14 h-14 border border-claude-200 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-claude-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl mb-4 text-ink-900">GEO Audit</h3>
              <p className="text-ink-600 leading-relaxed">
                Get a complete analysis of your website's AI visibility. See how well AI systems can understand your content, find issues, and get actionable recommendations to improve.
              </p>
            </div>
            <div className="card-elevated p-10">
              <div className="w-14 h-14 border border-claude-200 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-claude-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-display text-2xl mb-4 text-ink-900">Schema Generator</h3>
              <p className="text-ink-600 leading-relaxed">
                Generate structured data markup for your pages. Help AI systems understand your business, products, and content better with properly formatted schema.org JSON-LD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl font-medium text-center mb-6 text-ink-900">FAQs</h2>
          <p className="text-center text-ink-600 mb-16">
            Get answers to the most common questions about AI search and Dwight.
          </p>

          <div className="card-elevated p-8 md:p-10">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-ink-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-medium text-white mb-8">
            What's your GEO Score?
          </h2>
          <p className="text-lg text-ink-400 mb-12">
            Test your brand across 6 AI models in 60 seconds. Free, no signup required.
          </p>
          <Link
            href="/tools/ai-visibility"
            className="inline-block bg-claude-500 text-white px-12 py-4 hover:bg-claude-600 transition text-sm tracking-wider uppercase font-medium"
          >
            Get Free GEO Score
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl">dwight</span>
              <span className="text-ink-500">— GEO tools for modern brands</span>
            </div>
            <div className="flex gap-8 text-ink-400 text-sm">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="border-t border-ink-800 mt-10 pt-10 text-center text-ink-500 text-sm">
            <p>© 2025 Dwight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
