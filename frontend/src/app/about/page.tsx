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
            We built Dwight because we noticed something: businesses spend millions on SEO, 
            but have zero visibility into how AI assistants describe their brand. That's a problem.
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
              <h2 className="font-display text-3xl font-bold mb-4 text-ink-900">Why We Exist</h2>
              <p className="text-lg text-ink-500 leading-relaxed mb-4">
                When someone asks ChatGPT "what's the best diamond jeweler in Antwerp?", does your name come up?
              </p>
              <p className="text-ink-500 leading-relaxed">
                Most businesses have no idea. They're optimizing for Google while ignoring the fastest-growing 
                discovery channel: AI assistants. We give you the tools to understand and fix this.
              </p>
            </div>
            <div className="bg-cream-200 rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold mb-6 text-ink-900">The Shift Happening Now</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div className="text-ink-600">
                    <strong>People are changing habits:</strong> Millions now ask AI for recommendations, not Google
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div className="text-ink-600">
                    <strong>AI picks favorites:</strong> Without proper structure, AI simply won't mention you
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-claude-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">3</span>
                  </div>
                  <div className="text-ink-600">
                    <strong>Schema matters more than ever:</strong> It's how AI understands what you offer
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
            <h2 className="font-display text-3xl font-bold mb-4 text-ink-900">Where We're Headed</h2>
            <p className="text-xl text-ink-500 max-w-3xl mx-auto">
              We're starting simple — two focused tools that solve real problems. As AI search evolves, 
              we'll build what you need to stay visible.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-ink-900">How We Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Keep It Simple</h3>
              <p className="text-ink-500">
                No feature bloat. We build what works, explain it clearly, and make it affordable for small teams.
              </p>
            </div>
            <div className="text-center card-elevated p-8">
              <div className="w-12 h-12 bg-cream-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-ink-600" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Show Our Work</h3>
              <p className="text-ink-500">
                Every score we give comes with a full breakdown. You'll know exactly what we measured and why it matters.
              </p>
            </div>
            <div className="text-center card-elevated p-8">
              <div className="w-12 h-12 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-ink-900">Undercut the Market</h3>
              <p className="text-ink-500">
                AI visibility tools shouldn't cost €200/month. We charge €19 because this should be accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-ink-900 rounded-2xl p-12 text-white">
            <h2 className="font-display text-3xl font-bold mb-8 text-center">Why This Matters Now</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-claude-400 mb-2">200M+</div>
                <div className="text-ink-400">Weekly ChatGPT Users</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-claude-400 mb-2">40%</div>
                <div className="text-ink-400">Of Gen Z prefer AI over Google</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-claude-400 mb-2">0</div>
                <div className="text-ink-400">Tools focused on AI visibility (until now)</div>
              </div>
            </div>
            <p className="mt-8 text-center text-ink-400 max-w-3xl mx-auto">
              The way people discover brands is changing faster than businesses can adapt. 
              We built Dwight to help you keep up.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-claude-500 to-claude-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            See how AI-ready your site is
          </h2>
          <p className="text-xl text-claude-100 mb-8">
            Takes 30 seconds. No signup. Completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/health-check"
              className="bg-white text-claude-600 px-8 py-4 rounded-lg hover:bg-cream-100 transition font-semibold text-lg"
            >
              Run Free Health Check
            </Link>
            <Link
              href="/contact"
              className="bg-ink-900 text-white px-8 py-4 rounded-lg hover:bg-ink-800 transition font-semibold text-lg"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
