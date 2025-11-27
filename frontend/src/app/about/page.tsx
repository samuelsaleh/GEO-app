import { ArrowLeft, Target, Users, Lightbulb, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen hero-gradient">
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
              <Link href="/#services" className="text-ink-600 hover:text-claude-500 transition-colors">
                Services
              </Link>
              <Link href="/pricing" className="text-ink-600 hover:text-claude-500 transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-ink-600 hover:text-claude-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold mb-6 text-ink-900">About Dwight</h1>
          <p className="text-xl text-ink-500 leading-relaxed">
            We're building the future of search visibility in the age of AI. As traditional search
            evolves into conversational AI, we help businesses stay discoverable and relevant.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-claude-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-claude-500" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-4 text-ink-900">Our Mission</h2>
              <p className="text-lg text-ink-500 leading-relaxed mb-4">
                To ensure every worthy piece of content finds its voice in the world of AI-driven answers.
              </p>
              <p className="text-ink-500 leading-relaxed">
                We exist to make sure businesses and creators aren't left behind in the shift to AI-mediated
                search — bridging the gap between traditional SEO and the new generative AI frontier.
              </p>
            </div>
            <div className="bg-cream-200 rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold mb-6 text-ink-900">The Problem We're Solving</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div className="text-ink-600">
                    <strong>AI Search is Exploding:</strong> 33% of users now engage with AI chat instead of traditional search
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div className="text-ink-600">
                    <strong>Traffic is Shifting:</strong> Publishers predict 20-60% traffic loss from AI summaries alone
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">3</span>
                  </div>
                  <div className="text-ink-600">
                    <strong>No One Knows How:</strong> Traditional SEO doesn't translate to AI optimization
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-cream-300 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-8 h-8 text-ink-600" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 text-ink-900">Our Vision</h2>
            <p className="text-xl text-ink-500 max-w-3xl mx-auto">
              To be the premier platform that brands trust to stay visible and relevant when AI answers
              the world's questions.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-ink-900">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Customer First</h3>
              <p className="text-ink-500">
                We prioritize your success and provide hands-on support to ensure you get results from AI optimization.
              </p>
            </div>
            <div className="text-center card-elevated p-8">
              <div className="w-12 h-12 bg-cream-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-ink-600" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Innovation</h3>
              <p className="text-ink-500">
                We stay at the cutting edge of AI and search technology, adapting our tools as the landscape evolves.
              </p>
            </div>
            <div className="text-center card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Transparency</h3>
              <p className="text-ink-500">
                We believe in clear communication, honest reporting, and educating our customers about AI search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Context */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-ink-900 rounded-2xl p-12 text-white">
            <h2 className="font-display text-3xl font-bold mb-8 text-center">The Market Opportunity</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-claude-400 mb-2">$100B+</div>
                <div className="text-ink-400">SEO/MarTech Industry Size (2025)</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-claude-400 mb-2">100M+</div>
                <div className="text-ink-400">ChatGPT Users</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-claude-400 mb-2">50%</div>
                <div className="text-ink-400">Predicted Traffic Shift by 2028</div>
              </div>
            </div>
            <p className="mt-8 text-center text-ink-400 max-w-3xl mx-auto">
              The traditional SEO market is undergoing massive disruption. We're positioned at the forefront of
              this shift, helping businesses adapt to the new AI-driven search landscape.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-claude-500 to-claude-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Ready to Optimize for AI Search?
          </h2>
          <p className="text-xl text-claude-100 mb-8">
            Join forward-thinking businesses staying visible in the age of AI answers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/health-check"
              className="bg-white text-claude-600 px-8 py-4 rounded-lg hover:bg-cream-100 transition font-semibold text-lg"
            >
              Start Free Health Check
            </Link>
            <Link
              href="/contact"
              className="bg-ink-900 text-white px-8 py-4 rounded-lg hover:bg-ink-800 transition font-semibold text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
