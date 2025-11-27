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
    <div className="flex gap-3 justify-center">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-ink-900 text-white w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold font-display">
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

export default function PricingPage() {
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
    },
    {
      question: "Is the offer available worldwide?",
      answer: "Yes, the Black Friday offer is available to customers worldwide. Pricing is displayed in EUR but we accept payments from all countries."
    }
  ]

  return (
    <div className="min-h-screen hero-gradient">
      {/* Black Friday Banner */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          <span className="bg-claude-500 text-white px-2 py-0.5 rounded text-xs font-bold mr-2">BLACK FRIDAY</span>
          Get 30% off annual plans — Limited time offer
        </p>
      </div>

      {/* Navigation */}
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-ink-500" />
              <h1 className="text-2xl font-display font-bold text-gradient-claude">
                Dwight
              </h1>
            </Link>
            <div className="flex gap-6">
              <Link href="/about" className="text-ink-600 hover:text-claude-500 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-ink-600 hover:text-claude-500 transition-colors">
                Contact
              </Link>
              <Link href="/tools" className="text-ink-600 hover:text-claude-500 transition-colors">
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-claude-100 rounded-full">
            <span className="text-claude-600 font-semibold text-sm">Save 30% on annual plans</span>
          </div>
          <h1 className="font-display text-5xl font-bold mb-6 text-ink-900">
            Black Friday prices to help you win AI search
          </h1>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="card-elevated p-8 border-2 border-cream-200 hover:border-claude-200 transition flex flex-col">
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
                href="/contact"
                className="block w-full text-center btn-claude text-white px-6 py-3 rounded-lg font-semibold mb-6"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-3 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Access to ChatGPT, Perplexity, and AIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Track up to 25 prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Prompts run across models on a daily interval</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Up to 2,250 AI answers analyzed per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited seats</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Email Support</span>
                </li>
              </ul>
            </div>

            {/* Pro - Most Popular */}
            <div className="card-elevated p-8 border-2 border-claude-500 relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-claude-500 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
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
                href="/contact"
                className="block w-full text-center btn-claude text-white px-6 py-3 rounded-lg font-semibold mb-6"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-3 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Access to ChatGPT, Perplexity, and AIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Track up to 100 prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Prompts run across models on a daily interval</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Up to 9,000 AI answers analyzed per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited seats</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Email + Slack Support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="card-elevated p-8 border-2 border-cream-200 hover:border-claude-200 transition flex flex-col">
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
                href="/contact"
                className="block w-full text-center btn-claude text-white px-6 py-3 rounded-lg font-semibold mb-6"
              >
                Claim your 30% off
              </Link>

              <ul className="space-y-3 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Access to ChatGPT, Perplexity, and AIO</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Track 300+ prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Prompts run across models on a daily interval</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">27,000+ AI answers analyzed per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Unlimited seats</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
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

      {/* Countdown CTA */}
      <section className="py-16 bg-gradient-to-br from-claude-500 to-claude-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold mb-6">
            Limited offer!
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Start tracking your AI visibility today.
          </h2>
          <p className="text-lg text-claude-100 mb-8 max-w-2xl mx-auto">
            Get 30% off Dwight annual plans — when you pay for 12 months upfront. Get ahead while others are still catching up.
          </p>
          
          <div className="mb-8">
            <p className="text-claude-100 mb-4 text-sm">Offer ends in</p>
            <CountdownTimer />
          </div>

          <Link
            href="/contact"
            className="inline-block bg-white text-claude-600 px-10 py-4 rounded-lg hover:bg-cream-100 transition font-bold text-lg shadow-lg"
          >
            Claim Your 30% Off
          </Link>
          
          <p className="text-claude-200 text-sm mt-6">
            Ends November 30 at 00:00 UTC. Offer valid only for annual plans, 12 months paid upfront.
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-ink-900">Compare Plans</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-cream-300">
                  <th className="text-left p-4 font-bold text-ink-900">Feature</th>
                  <th className="text-center p-4 font-bold text-ink-600">Starter</th>
                  <th className="text-center p-4 font-bold text-claude-500">Pro</th>
                  <th className="text-center p-4 font-bold text-ink-600">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                <tr>
                  <td className="p-4 text-ink-600">Prompts tracked</td>
                  <td className="p-4 text-center text-ink-600">25</td>
                  <td className="p-4 text-center font-semibold text-ink-900">100</td>
                  <td className="p-4 text-center text-ink-600">300+</td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-600">AI answers analyzed/month</td>
                  <td className="p-4 text-center text-ink-600">2,250</td>
                  <td className="p-4 text-center font-semibold text-ink-900">9,000</td>
                  <td className="p-4 text-center text-ink-600">27,000+</td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-600">ChatGPT, Perplexity, AIO</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-600">Daily analysis</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-600">Unlimited countries</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-600">Unlimited seats</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-600">Slack support</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-600">Dedicated Account Rep</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center text-ink-300">—</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-ink-900">Key Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Set up Prompts</h3>
              <p className="text-ink-500 text-sm">
                Prompts are the foundation of your AI search strategy. Uncover and organize the prompts that matter most.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Use Data to Pick Winners</h3>
              <p className="text-ink-500 text-sm">
                Leverage AI-suggested prompts and search volumes to focus on the biggest opportunities.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Add Brands</h3>
              <p className="text-ink-500 text-sm">
                See how you rank against the players that matter in your market.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Choose AI Models</h3>
              <p className="text-ink-500 text-sm">
                Track rankings across the models that drive the most traffic and visibility.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Find Key Sources</h3>
              <p className="text-ink-500 text-sm">
                Spot the citations shaping your visibility and refine your GEO strategy.
              </p>
            </div>
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Act on Insights</h3>
              <p className="text-ink-500 text-sm">
                Use recommendations to capture high-impact opportunities and boost your ranking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-ink-900">FAQs</h2>
          <p className="text-center text-ink-500 mb-12">
            Get answers to the most common questions about AI search and Dwight.
          </p>

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
            href="/contact"
            className="inline-block btn-claude text-white px-10 py-4 rounded-lg font-bold text-lg"
          >
            Get 30% Off Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-gradient-claude">Dwight</span>
              <span className="text-ink-500">— AI search analytics for marketing teams</span>
            </div>
            <div className="flex gap-6 text-ink-400 text-sm">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="border-t border-ink-800 mt-8 pt-8 text-center text-ink-500 text-sm">
            <p>© 2025 Dwight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
