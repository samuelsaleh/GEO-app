'use client'

import { useState } from 'react'
import { Search, Code, Bell, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { waitlistAPI } from '@/lib/api'

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

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="glass-nav border-b border-peach-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-display font-bold text-gradient-warm">
                Dwight
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#services" className="text-warmgray-600 hover:text-rose-400 transition-colors font-medium">
                Services
              </Link>
              <Link href="#pricing" className="text-warmgray-600 hover:text-rose-400 transition-colors font-medium">
                Pricing
              </Link>
              <Link 
                href="/tools" 
                className="btn-rose text-white px-5 py-2.5 rounded-xl font-semibold"
              >
                Try Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-butter-200 border border-butter-300 rounded-full animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-warmgray-600" />
            <span className="text-warmgray-700 font-semibold text-sm">
              New: AI Search Optimization Tools
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animate-delay-100 text-warmgray-800">
            Is Your Brand
            <br />
            <span className="text-gradient-warm">
              Invisible to ChatGPT?
            </span>
          </h1>

          <p className="text-xl text-warmgray-500 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
            While your competitors get recommended by AI assistants, are you being left behind?
            Dwight helps you optimize for generative AI search engines like ChatGPT, Bing Chat, and Google Gemini.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animate-delay-300">
            <Link
              href="/tools/health-check"
              className="btn-rose text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
            >
              Start Free Health Check
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools/schema-generator"
              className="bg-white text-warmgray-700 border-2 border-peach-300 px-8 py-4 rounded-xl hover:border-peach-400 hover:bg-peach-50 transition-all font-semibold text-lg"
            >
              Schema Generator
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up animate-delay-400">
            <div className="card-elevated p-8">
              <div className="text-4xl font-display font-bold text-rose-400 mb-2">25%</div>
              <div className="text-warmgray-500">Predicted drop in traditional search by 2028</div>
            </div>
            <div className="card-elevated p-8">
              <div className="text-4xl font-display font-bold text-rose-400 mb-2">60%</div>
              <div className="text-warmgray-500">Potential traffic loss from AI-powered search</div>
            </div>
            <div className="card-elevated p-8">
              <div className="text-4xl font-display font-bold text-rose-400 mb-2">100M+</div>
              <div className="text-warmgray-500">ChatGPT users asking questions daily</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-warmgray-800">Our Core Services</h2>
            <p className="text-xl text-warmgray-500">
              Simple, powerful tools to boost your AI visibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Service 1 */}
            <div className="card-elevated p-10">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-warmgray-800">AI Visibility Health-Check</h3>
              <p className="text-warmgray-500 mb-6 leading-relaxed">
                Get a comprehensive 10-day audit showing exactly where your pages appear—or vanish—in ChatGPT,
                Bing Chat, and Google Gemini answers.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Score sheet with 0-100 AI readiness score</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Screenshots of AI mentions (or misses)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Top 5 fixes with clear action steps</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">15-slide picture report + video walkthrough</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-display font-bold text-warmgray-800">€1,700</span>
                <span className="text-warmgray-400">- €4,300</span>
              </div>

              <Link
                href="/tools/health-check"
                className="block w-full text-center btn-rose text-white px-6 py-4 rounded-xl font-semibold"
              >
                Start Health Check →
              </Link>
            </div>

            {/* Service 2 */}
            <div className="card-elevated p-10">
              <div className="w-14 h-14 bg-peach-200 rounded-2xl flex items-center justify-center mb-6">
                <Code className="w-7 h-7 text-warmgray-600" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-warmgray-800">Schema & Labels Fix-Up</h3>
              <p className="text-warmgray-500 mb-6 leading-relaxed">
                Add the right "invisible labels" (schema markup) in just 1 week so AI engines
                and search bots understand exactly what your pages are about.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-peach-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Ready-made JSON-LD code snippets</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-peach-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Product, FAQ, Article, How-to schemas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-peach-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Google validation screenshots</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-peach-400 mt-0.5 flex-shrink-0" />
                  <span className="text-warmgray-600">Installation guide for your developer</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-display font-bold text-warmgray-800">€130</span>
                <span className="text-warmgray-400">- €260 per page type</span>
              </div>

              <Link
                href="/tools/schema-generator"
                className="block w-full text-center btn-peach text-warmgray-800 px-6 py-4 rounded-xl font-semibold"
              >
                Generate Schema →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="py-24 bg-butter-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-4xl font-bold text-center mb-16 text-warmgray-800">Why This Matters Now</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center card-elevated p-10">
              <div className="text-5xl mb-6">🤖</div>
              <h3 className="font-display text-xl font-bold mb-4 text-warmgray-800">AI Search is Exploding</h3>
              <p className="text-warmgray-500 leading-relaxed">
                33% of Bing users already engage with AI chat. ChatGPT reached 100M users in 2 months.
              </p>
            </div>
            <div className="text-center card-elevated p-10">
              <div className="text-5xl mb-6">📉</div>
              <h3 className="font-display text-xl font-bold mb-4 text-warmgray-800">Traffic is Shifting</h3>
              <p className="text-warmgray-500 leading-relaxed">
                Publishers predict 20-60% traffic loss from Google's AI summaries alone.
              </p>
            </div>
            <div className="text-center card-elevated p-10">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="font-display text-xl font-bold mb-4 text-warmgray-800">Act Before Competitors</h3>
              <p className="text-warmgray-500 leading-relaxed">
                Most businesses don't know how to optimize for AI yet. First movers win.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-24 bg-gradient-to-br from-rose-400 via-peach-300 to-butter-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-sm">
            Get Early Access to Dwight
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join our waitlist for exclusive early-bird pricing and free tools
          </p>

          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl text-warmgray-800 border-0 shadow-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-warmgray-800 text-white px-8 py-4 rounded-xl hover:bg-warmgray-700 transition font-semibold whitespace-nowrap shadow-lg disabled:opacity-70"
            >
              {loading ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>

          {submitted && (
            <div className="mt-6 bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow">
              <CheckCircle className="w-5 h-5" />
              Thanks! We'll be in touch soon.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warmgray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-2xl font-bold mb-4 text-gradient-warm">Dwight</h3>
              <p className="text-warmgray-300">
                AI Search Visibility & Optimization
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-peach-300">Services</h4>
              <ul className="space-y-3 text-warmgray-300">
                <li><Link href="/tools/health-check" className="hover:text-white transition-colors">Health Check</Link></li>
                <li><Link href="/tools/schema-generator" className="hover:text-white transition-colors">Schema Generator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-peach-300">Company</h4>
              <ul className="space-y-3 text-warmgray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-peach-300">Legal</h4>
              <ul className="space-y-3 text-warmgray-300">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warmgray-700 mt-12 pt-8 text-center text-warmgray-400">
            <p>&copy; 2025 Dwight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
