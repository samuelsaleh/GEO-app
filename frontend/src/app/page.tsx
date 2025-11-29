'use client'

import { useState, useEffect } from 'react'
import { Search, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { waitlistAPI } from '@/lib/api'

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
          <div className="bg-ink-900 text-white w-16 h-16 flex items-center justify-center text-2xl font-display font-medium">
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

export default function Home() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await waitlistAPI.join(email)
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Waitlist signup failed:', error)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    {
      question: "What exactly does the AI Website Audit analyze?",
      answer: "We check 6 key areas: content structure (headings, word count), schema markup, citability (how quotable your content is), authority signals, freshness indicators, and technical accessibility. You get a score out of 100 with specific fixes."
    },
    {
      question: "Do I need technical skills to use Dwight?",
      answer: "Not at all. Just paste your URL and we do the analysis. The schema generator gives you copy-paste code. If you can edit your website, you can implement our recommendations."
    },
    {
      question: "How is this different from regular SEO tools?",
      answer: "Traditional SEO focuses on Google rankings. We focus on how AI assistants like ChatGPT and Perplexity understand and recommend your brand. Different algorithms, different optimization."
    },
    {
      question: "How quickly will I see results?",
      answer: "Schema changes can be picked up by AI within days. Content improvements take longer — usually 2-4 weeks to see changes in how AI responds about your brand."
    },
    {
      question: "Is there really a free plan?",
      answer: "Yes. You get 3 website audits and 5 schema generations per month, forever free. No credit card required. Upgrade only when you need unlimited access."
    }
  ]

  return (
    <div className="min-h-screen hero-gradient">
      {/* Black Friday Banner */}
      <div className="bg-ink-900 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium tracking-wide">
          <span className="bg-claude-500 text-white px-3 py-1 text-xs tracking-wider mr-3 uppercase font-semibold">Black Friday</span>
          Get 30% off annual plans — Limited time offer
          <Link href="/pricing" className="ml-3 underline hover:text-claude-300 transition-colors">
            Claim Now →
          </Link>
        </p>
      </div>

      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="font-display text-3xl font-medium tracking-wide text-ink-900">
                dwight
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="nav-link text-ink-700 hover:text-claude-500 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="nav-link text-ink-700 hover:text-claude-500 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="nav-link text-ink-700 hover:text-claude-500 transition-colors">
                About
              </Link>
              <Link 
                href="/pricing" 
                className="uppercase text-xs tracking-wider font-medium border border-claude-500 text-claude-500 px-6 py-3 hover:bg-claude-500 hover:text-white transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 border border-claude-200 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-claude-500" />
            <span className="text-claude-600 text-sm tracking-wider uppercase font-medium">
              Black Friday — Save 30%
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-medium mb-8 leading-tight animate-fade-in-up animate-delay-100 text-ink-900">
            When people ask AI,
            <br />
            <span className="text-gradient-claude italic">
              does it mention you?
            </span>
          </h1>

          <p className="text-lg text-ink-600 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-200 leading-relaxed">
            Millions now ask ChatGPT and Perplexity for recommendations instead of Google. 
            Dwight shows you exactly how AI describes your brand — and how to make it better.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20 animate-fade-in-up animate-delay-300">
            <Link
              href="/pricing"
              className="uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-10 py-4 hover:bg-claude-600 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Claim Your 30% Off
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools"
              className="uppercase text-sm tracking-wider font-medium border border-ink-300 text-ink-700 px-10 py-4 hover:border-claude-500 hover:text-claude-500 transition-all duration-300"
            >
              Try Free Tools
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-5xl mx-auto animate-fade-in-up animate-delay-400">
            <div className="card-elevated p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-2xl text-ink-900">Your Brand's Dashboard</h3>
                  <p className="text-ink-500 text-sm tracking-wider uppercase mt-2">Last 7 days • All Models</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    +5.2%
                  </span>
                  <span className="text-ink-500">this month</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-cream-100 p-6">
                  <div className="text-3xl font-display font-medium text-claude-500">3/14</div>
                  <div className="text-ink-500 text-sm tracking-wider uppercase mt-2">Visibility Rank</div>
                </div>
                <div className="bg-cream-100 p-6">
                  <div className="text-3xl font-display font-medium text-green-600">2/14</div>
                  <div className="text-ink-500 text-sm tracking-wider uppercase mt-2">Sentiment</div>
                </div>
                <div className="bg-cream-100 p-6">
                  <div className="text-3xl font-display font-medium text-blue-600">5/14</div>
                  <div className="text-ink-500 text-sm tracking-wider uppercase mt-2">Position</div>
                </div>
              </div>

              <div className="bg-cream-50 p-6">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-ink-500 tracking-wider uppercase font-medium">Competitor Comparison</span>
                  <span className="text-ink-500">April 2025</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="w-28 text-sm text-ink-700 font-medium">Your Brand</span>
                    <div className="flex-1 bg-cream-200 h-2">
                      <div className="bg-claude-500 h-2" style={{ width: '47%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-claude-500 w-12 text-right">47%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-28 text-sm text-ink-600">Competitor A</span>
                    <div className="flex-1 bg-cream-200 h-2">
                      <div className="bg-ink-400 h-2" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-ink-600 w-12 text-right">65%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-28 text-sm text-ink-600">Competitor B</span>
                    <div className="flex-1 bg-cream-200 h-2">
                      <div className="bg-ink-300 h-2" style={{ width: '32%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-ink-500 w-12 text-right">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 border border-claude-200">
              <span className="text-claude-600 text-sm tracking-wider uppercase font-medium">Save 30% on annual plans</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 text-ink-900">
              Simple pricing. Powerful tools.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card-elevated p-10 border border-cream-300 hover:border-claude-300 transition">
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

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">3 AI Website Audits per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">5 Schema generations per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Basic visibility report</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Email support</span>
                </li>
              </ul>
            </div>

            {/* Starter - Most Popular */}
            <div className="card-elevated p-10 border-2 border-claude-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-claude-500 text-white px-5 py-1.5 text-xs tracking-wider uppercase font-semibold">
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
                href="/pricing"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-6 py-4 mb-8 hover:bg-claude-600 transition-all duration-300"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Unlimited AI Website Audits</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Unlimited Schema generations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Detailed visibility reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Export reports as PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Priority email support</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="card-elevated p-10 border border-cream-300 hover:border-claude-300 transition">
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
                href="/pricing"
                className="block w-full text-center uppercase text-sm tracking-wider font-medium bg-claude-500 text-white px-6 py-4 mb-8 hover:bg-claude-600 transition-all duration-300"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">White-label reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-700">Team collaboration (up to 5 seats)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
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

      {/* Features Section */}
      <section id="features" className="py-28 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 text-ink-900">
              Two tools. Everything you need.
            </h2>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed">
              We built the essentials for AI visibility — no bloat, no fluff. Just what works.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* AI Website Audit */}
            <div className="card-elevated p-10">
              <div className="w-14 h-14 border border-claude-200 flex items-center justify-center mb-8">
                <Search className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-2xl mb-4 text-ink-900">AI Website Audit</h3>
              <p className="text-ink-600 leading-relaxed mb-6">
                Scan any webpage and get a detailed report on how AI-ready it is. We check for schema markup, content structure, citations, and more.
              </p>
              <ul className="space-y-3 text-sm text-ink-700">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-claude-500" />
                  <span>Score out of 100 with letter grade</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-claude-500" />
                  <span>Competitor comparison</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-claude-500" />
                  <span>Priority fixes list</span>
                </li>
              </ul>
            </div>

            {/* Schema Generator */}
            <div className="card-elevated p-10">
              <div className="w-14 h-14 border border-claude-200 flex items-center justify-center mb-8">
                <Zap className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-2xl mb-4 text-ink-900">Schema Generator</h3>
              <p className="text-ink-600 leading-relaxed mb-6">
                Create the structured data AI needs to understand your content. Copy-paste ready JSON-LD for your website.
              </p>
              <ul className="space-y-3 text-sm text-ink-700">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-claude-500" />
                  <span>Organization, Product, FAQ schemas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-claude-500" />
                  <span>Valid JSON-LD output</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-claude-500" />
                  <span>Easy implementation guide</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown CTA */}
      <section className="py-24 bg-claude-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block border border-white/30 text-white px-5 py-2 text-xs tracking-wider uppercase font-medium mb-8">
            Black Friday Sale
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-white mb-8">
            Fix your AI visibility before competitors do.
          </h2>
          <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Lock in 30% off when you go annual. Your website's AI-readiness can't wait.
          </p>
          
          <div className="mb-12">
            <p className="text-white/70 mb-5 text-sm tracking-wider uppercase font-medium">Sale ends in</p>
            <CountdownTimer />
          </div>

          <Link
            href="/pricing"
            className="inline-block bg-white text-claude-600 px-12 py-4 hover:bg-cream-100 transition text-sm tracking-wider uppercase font-medium"
          >
            Get 30% Off
          </Link>
          
          <p className="text-white/60 text-sm tracking-wider uppercase mt-8">
            Valid until November 30 · Annual plans only
          </p>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-28 bg-cream-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 text-ink-900">Questions?</h2>
            <p className="text-ink-600">
              Here's what people usually ask before signing up.
            </p>
          </div>

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
            Your competitors are invisible to AI. Are you?
          </h2>
          <p className="text-lg text-ink-400 mb-12">
            Run your first audit in 30 seconds. No signup required.
          </p>
          <Link
            href="/tools/health-check"
            className="inline-block bg-claude-500 text-white px-12 py-4 hover:bg-claude-600 transition text-sm tracking-wider uppercase font-medium"
          >
            Audit Your Site Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-16">
            <div>
              <h3 className="font-display text-3xl mb-6">dwight</h3>
              <p className="text-ink-400">
                Make your brand visible to AI
              </p>
            </div>
            <div>
              <h4 className="text-sm tracking-wider uppercase mb-6 text-claude-400 font-medium">Product</h4>
              <ul className="space-y-4 text-ink-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm tracking-wider uppercase mb-6 text-claude-400 font-medium">Company</h4>
              <ul className="space-y-4 text-ink-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm tracking-wider uppercase mb-6 text-claude-400 font-medium">Legal</h4>
              <ul className="space-y-4 text-ink-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Services</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-ink-800 mt-16 pt-10 text-center text-ink-500">
            <p className="text-sm">© 2025 Dwight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
