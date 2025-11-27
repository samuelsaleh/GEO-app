'use client'

import { useState, useEffect } from 'react'
import { Search, BarChart3, CheckCircle, ArrowRight, Sparkles, Zap, Target, TrendingUp, Quote, ChevronDown, ChevronUp } from 'lucide-react'
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
    <div className="flex gap-3 justify-center">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-ink-900 text-white w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold font-display">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-ink-500 mt-1">{item.label}</div>
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
        <span className="font-display text-lg font-semibold text-ink-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-claude-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-ink-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-6 text-ink-500 leading-relaxed">
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

  const testimonials = [
    {
      quote: "Dwight offers key insights on AI visibility, helping brands stay at the forefront of discovery in the age of AI and generative search. As ChatGPT, Perplexity, and Gemini drive traffic and conversions, Dwight measures the growth.",
      author: "Sarah Mitchell",
      role: "Head of SEO, TechFlow"
    },
    {
      quote: "Dwight's platform cuts through the complexity of AI responses. Leveraging its analytical capabilities allows us to focus on specific content optimizations and identify the variants that perform best in AI search.",
      author: "Marcus Chen",
      role: "Team Lead SEO, FinanceHub"
    },
    {
      quote: "Dwight gave us a data-informed view of our AI optimization strategy virtually overnight. With its insights, our blog posts started ranking for targeted ChatGPT prompts within 24 hours.",
      author: "Emma Rodriguez",
      role: "Head of Marketing, StartupScale"
    }
  ]

  const faqs = [
    {
      question: "What's included in the 30% off Black Friday offer?",
      answer: "The 30% discount applies to all annual plans when you pay for 12 months upfront. This includes access to all features in your chosen tier, with the discount applied to the total annual cost."
    },
    {
      question: "How long is the offer available?",
      answer: "The Black Friday offer is available until November 30th at 00:00 UTC. After this date, regular pricing will apply to all new subscriptions."
    },
    {
      question: "Do I need to pay the full year upfront?",
      answer: "Yes, the 30% discount is only available when you pay for the full year upfront. Monthly billing is available at regular prices."
    },
    {
      question: "Can I upgrade my current plan to get the discount?",
      answer: "Yes! Existing customers can upgrade their plan during the Black Friday period and receive the 30% discount on the difference for their upgraded tier."
    },
    {
      question: "What happens after the first year?",
      answer: "After your first year, your subscription will renew at the standard annual rate unless you choose to cancel. We'll notify you before renewal."
    }
  ]

  return (
    <div className="min-h-screen hero-gradient">
      {/* Black Friday Banner */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          <span className="bg-claude-500 text-white px-2 py-0.5 rounded text-xs font-bold mr-2">BLACK FRIDAY</span>
          Get 30% off annual plans — Limited time offer
          <Link href="/pricing" className="ml-2 underline hover:text-claude-300 transition-colors">
            Claim Now →
          </Link>
        </p>
      </div>

      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-display font-bold text-gradient-claude">
                Dwight
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-ink-600 hover:text-claude-500 transition-colors font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-ink-600 hover:text-claude-500 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-ink-600 hover:text-claude-500 transition-colors font-medium">
                About
              </Link>
              <Link 
                href="/pricing" 
                className="btn-claude text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-claude-50 border border-claude-200 rounded-full animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-claude-500" />
            <span className="text-claude-600 font-semibold text-sm">
              Black Friday — Save 30%
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animate-delay-100 text-ink-900">
            Search is changing.
            <br />
            <span className="text-gradient-claude">
              Is your brand visible in AI?
            </span>
          </h1>

          <p className="text-xl text-ink-500 mb-10 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
            Dwight helps you understand, measure, and improve your brand's visibility inside AI platforms — 
            so customers discover your brand when they ask ChatGPT, Perplexity, or Gemini for recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animate-delay-300">
            <Link
              href="/pricing"
              className="btn-claude text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
            >
              Claim Your 30% Off
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools"
              className="btn-outline px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Try Free Tools
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-5xl mx-auto animate-fade-in-up animate-delay-400">
            <div className="card-elevated p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-ink-900">Your Brand's Dashboard</h3>
                  <p className="text-ink-500 text-sm">Last 7 days • All Models</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    +5.2%
                  </span>
                  <span className="text-ink-400">this month</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-cream-100 rounded-lg p-4">
                  <div className="text-2xl font-display font-bold text-claude-500">3/14</div>
                  <div className="text-ink-500 text-sm">Visibility Rank</div>
                </div>
                <div className="bg-cream-100 rounded-lg p-4">
                  <div className="text-2xl font-display font-bold text-green-600">2/14</div>
                  <div className="text-ink-500 text-sm">Sentiment</div>
                </div>
                <div className="bg-cream-100 rounded-lg p-4">
                  <div className="text-2xl font-display font-bold text-blue-600">5/14</div>
                  <div className="text-ink-500 text-sm">Position</div>
                </div>
              </div>

              <div className="bg-cream-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-ink-500">Competitor Comparison</span>
                  <span className="text-ink-400">April 2025</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm text-ink-600">Your Brand</span>
                    <div className="flex-1 bg-cream-200 rounded-full h-3">
                      <div className="bg-claude-500 h-3 rounded-full" style={{ width: '47%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-claude-500">47%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm text-ink-600">Competitor A</span>
                    <div className="flex-1 bg-cream-200 rounded-full h-3">
                      <div className="bg-ink-400 h-3 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-ink-600">65%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm text-ink-600">Competitor B</span>
                    <div className="flex-1 bg-cream-200 rounded-full h-3">
                      <div className="bg-ink-300 h-3 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-ink-500">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-claude-100 rounded-full">
              <span className="text-claude-600 font-semibold text-sm">Save 30% on annual plans</span>
            </div>
            <h2 className="font-display text-4xl font-bold mb-4 text-ink-900">
              Black Friday prices to help you win AI search
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="card-elevated p-8 border-2 border-cream-200 hover:border-claude-200 transition">
              <h3 className="font-display text-xl font-bold text-ink-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-ink-400 line-through text-lg">€89</span>
                <span className="text-4xl font-display font-bold text-ink-900">€61</span>
              </div>
              <p className="text-ink-500 mb-6">per month</p>
              <p className="text-ink-600 mb-6 text-sm leading-relaxed">
                For growing startups that are starting to track and grow their AI search visibility.
              </p>
              
              <Link
                href="/pricing"
                className="block w-full text-center btn-claude text-white px-6 py-3 rounded-lg font-semibold mb-6"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Access to ChatGPT, Perplexity, and AIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Track up to 25 prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Daily prompt analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Up to 2,250 AI answers analyzed/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited seats</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Email Support</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="card-elevated p-8 border-2 border-claude-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-claude-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="font-display text-xl font-bold text-ink-900 mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-ink-400 line-through text-lg">€199</span>
                <span className="text-4xl font-display font-bold text-ink-900">€133</span>
              </div>
              <p className="text-ink-500 mb-6">per month</p>
              <p className="text-ink-600 mb-6 text-sm leading-relaxed">
                For agile SMEs wanting deeper insights into their AI search efforts and faster growth.
              </p>
              
              <Link
                href="/pricing"
                className="block w-full text-center btn-claude text-white px-6 py-3 rounded-lg font-semibold mb-6"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Access to ChatGPT, Perplexity, and AIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Track up to 100 prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Daily prompt analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Up to 9,000 AI answers analyzed/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited seats</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Email + Slack Support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="card-elevated p-8 border-2 border-cream-200 hover:border-claude-200 transition">
              <h3 className="font-display text-xl font-bold text-ink-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-ink-400 line-through text-lg">€499</span>
                <span className="text-4xl font-display font-bold text-ink-900">€349+</span>
              </div>
              <p className="text-ink-500 mb-6">per month</p>
              <p className="text-ink-600 mb-6 text-sm leading-relaxed">
                For enterprises needing advanced tracking and custom reporting.
              </p>
              
              <Link
                href="/pricing"
                className="block w-full text-center btn-claude text-white px-6 py-3 rounded-lg font-semibold mb-6"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Access to ChatGPT, Perplexity, and AIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Track 300+ prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Daily prompt analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">27,000+ AI answers analyzed/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited seats</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Dedicated Account Rep</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-ink-500 mt-8 text-sm">
            Add Gemini, AI Mode, Claude, DeepSeek, Llama, Grok and more for an additional fee.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-ink-900">
              Turn AI search insights into new customers with Dwight
            </h2>
            <p className="text-xl text-ink-500 max-w-2xl mx-auto">
              Identify the prompts that matter, monitor your rankings, and act before your competitors do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Set up Prompts</h3>
              <p className="text-ink-500 leading-relaxed">
                Prompts are the foundation of your AI search strategy. Uncover and organize the prompts that matter most.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Use Data to Pick Winners</h3>
              <p className="text-ink-500 leading-relaxed">
                Leverage AI-suggested prompts and search volumes to focus on the biggest opportunities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Add Brands</h3>
              <p className="text-ink-500 leading-relaxed">
                See how you rank against the players that matter in your market.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Choose AI Models</h3>
              <p className="text-ink-500 leading-relaxed">
                Track rankings across the models that drive the most traffic and visibility.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Find Key Sources</h3>
              <p className="text-ink-500 leading-relaxed">
                Spot the citations shaping your visibility and refine your GEO strategy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Act on Insights</h3>
              <p className="text-ink-500 leading-relaxed">
                Use recommendations to capture high-impact opportunities and boost your ranking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown CTA */}
      <section className="py-20 bg-gradient-to-br from-claude-500 to-claude-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold mb-6">
            Limited offer!
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Start tracking your AI visibility today.
          </h2>
          <p className="text-xl text-claude-100 mb-10 max-w-2xl mx-auto">
            Get 30% off Dwight annual plans — when you pay for 12 months upfront. Get ahead while others are still catching up.
          </p>
          
          <div className="mb-10">
            <p className="text-claude-100 mb-4 text-sm">Offer ends in</p>
            <CountdownTimer />
          </div>

          <Link
            href="/pricing"
            className="inline-block bg-white text-claude-600 px-10 py-4 rounded-lg hover:bg-cream-100 transition font-bold text-lg shadow-lg"
          >
            Claim Your 30% Off
          </Link>
          
          <p className="text-claude-200 text-sm mt-6">
            Ends November 30 at 00:00 UTC. Offer valid only for annual plans, 12 months paid upfront.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-ink-900">
              Trusted by forward-thinking marketers and growth teams
            </h2>
            <p className="text-xl text-ink-500">
              Leading marketing teams, digital strategists, and AI researchers use Dwight to understand how their brands perform in AI search.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-elevated p-8">
                <Quote className="w-8 h-8 text-claude-300 mb-4" />
                <p className="text-ink-600 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-display font-bold text-ink-900">{testimonial.author}</div>
                  <div className="text-ink-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4 text-ink-900">FAQs</h2>
            <p className="text-ink-500">
              Get answers to the most common questions about AI search and Dwight.
            </p>
          </div>

          <div className="card-elevated p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-ink-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Take control of your AI visibility.
          </h2>
          <p className="text-xl text-ink-400 mb-10">
            Start measuring and improving your brand's visibility across AI systems today — 
            and secure 30% off your annual plan when you pay upfront.
          </p>
          <Link
            href="/pricing"
            className="inline-block btn-claude text-white px-10 py-4 rounded-lg font-bold text-lg"
          >
            Get 30% Off Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-2xl font-bold mb-4 text-gradient-claude">Dwight</h3>
              <p className="text-ink-400">
                AI search analytics for marketing teams
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-claude-400">Product</h4>
              <ul className="space-y-3 text-ink-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-claude-400">Company</h4>
              <ul className="space-y-3 text-ink-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-claude-400">Legal</h4>
              <ul className="space-y-3 text-ink-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Services</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-ink-800 mt-12 pt-8 text-center text-ink-500">
            <p>© 2025 Dwight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
