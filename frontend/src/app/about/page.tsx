import { ArrowLeft, Target, Users, Lightbulb, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="glass-nav border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 text-cream-200" />
              <div className="relative w-8 h-8">
                <Image src="/logos/miageru-geo.svg" alt="Miageru Logo" fill className="object-contain" />
              </div>
              <span className="font-display text-3xl font-light tracking-wide text-cream-100">
                Miageru
              </span>
            </Link>
            <div className="flex gap-10">
              <Link href="/#services" className="nav-link text-cream-200 hover:text-white transition-colors">
                Services
              </Link>
              <Link href="/pricing" className="nav-link text-cream-200 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="nav-link text-cream-200 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-6xl font-light mb-8 text-ink-900 tracking-wide">About Miageru</h1>
          <p className="text-lg text-ink-500 leading-relaxed font-light tracking-wide">
            We built Miageru because we noticed something: businesses spend millions on SEO, 
            but have zero visibility into how AI assistants describe their brand. That's a problem.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 border border-claude-200 flex items-center justify-center mb-8">
                <Target className="w-7 h-7 text-claude-500" />
              </div>
              <h2 className="font-display text-3xl font-light mb-6 text-ink-900 tracking-wide">Why We Exist</h2>
              <p className="text-lg text-ink-500 leading-relaxed mb-5 font-light">
                When someone asks ChatGPT "what's the best diamond jeweler in Antwerp?", does your name come up?
              </p>
              <p className="text-ink-500 leading-relaxed font-light">
                Most businesses have no idea. They're optimizing for Google while ignoring the fastest-growing 
                discovery channel: AI assistants. We give you the tools to understand and fix this.
              </p>
            </div>
            <div className="bg-cream-100 p-10">
              <h3 className="font-display text-2xl font-light mb-8 text-ink-900 tracking-wide">The Shift Happening Now</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-claude-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-light">1</span>
                  </div>
                  <div className="text-ink-600 font-light">
                    <strong className="font-normal">People are changing habits:</strong> Millions now ask AI for recommendations, not Google
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-claude-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-light">2</span>
                  </div>
                  <div className="text-ink-600 font-light">
                    <strong className="font-normal">AI picks favorites:</strong> Without proper structure, AI simply won't mention you
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-claude-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-light">3</span>
                  </div>
                  <div className="text-ink-600 font-light">
                    <strong className="font-normal">Schema matters more than ever:</strong> It's how AI understands what you offer
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="w-16 h-16 border border-ink-200 flex items-center justify-center mx-auto mb-8">
              <Lightbulb className="w-7 h-7 text-ink-600" />
            </div>
            <h2 className="font-display text-3xl font-light mb-6 text-ink-900 tracking-wide">Where We're Headed</h2>
            <p className="text-lg text-ink-500 max-w-3xl mx-auto font-light leading-relaxed">
              We're starting simple — two focused tools that solve real problems. As AI search evolves, 
              we'll build what you need to stay visible.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-light text-center mb-16 text-ink-900 tracking-wide">How We Work</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center card-elevated p-10">
              <div className="w-14 h-14 border border-claude-200 flex items-center justify-center mx-auto mb-6">
                <Users className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-light mb-4 text-ink-900 tracking-wide">Keep It Simple</h3>
              <p className="text-ink-500 font-light leading-relaxed">
                No feature bloat. We build what works, explain it clearly, and make it affordable for small teams.
              </p>
            </div>
            <div className="text-center card-elevated p-10">
              <div className="w-14 h-14 border border-ink-200 flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-6 h-6 text-ink-600" />
              </div>
              <h3 className="font-display text-xl font-light mb-4 text-ink-900 tracking-wide">Show Our Work</h3>
              <p className="text-ink-500 font-light leading-relaxed">
                Every score we give comes with a full breakdown. You'll know exactly what we measured and why it matters.
              </p>
            </div>
            <div className="text-center card-elevated p-10">
              <div className="w-14 h-14 border border-claude-200 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-6 h-6 text-claude-500" />
              </div>
              <h3 className="font-display text-xl font-light mb-4 text-ink-900 tracking-wide">Undercut the Market</h3>
              <p className="text-ink-500 font-light leading-relaxed">
                AI visibility tools shouldn't cost €200/month. We charge €19 because this should be accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-ink-900 p-16 text-white">
            <h2 className="font-display text-3xl font-light mb-12 text-center tracking-wide">Why This Matters Now</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-5xl font-display font-light text-claude-400 mb-3 tracking-wide">200M+</div>
                <div className="text-ink-400 text-xs tracking-widest uppercase font-light">Weekly ChatGPT Users</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-display font-light text-claude-400 mb-3 tracking-wide">40%</div>
                <div className="text-ink-400 text-xs tracking-widest uppercase font-light">Of Gen Z prefer AI over Google</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-display font-light text-claude-400 mb-3 tracking-wide">0</div>
                <div className="text-ink-400 text-xs tracking-widest uppercase font-light">Tools focused on AI visibility (until now)</div>
              </div>
            </div>
            <p className="mt-12 text-center text-ink-400 max-w-3xl mx-auto font-light leading-relaxed">
              The way people discover brands is changing faster than businesses can adapt. 
              We built Miageru to help you keep up.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-claude-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-8 tracking-wide">
            See how AI-ready your site is
          </h2>
          <p className="text-lg text-white/80 mb-10 font-light">
            Takes 30 seconds. No signup. Completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/tools/health-check"
              className="bg-white text-claude-600 px-10 py-4 hover:bg-cream-100 transition text-xs tracking-widest uppercase font-light"
            >
              Run Free Health Check
            </Link>
            <Link
              href="/contact"
              className="bg-ink-900 text-white px-10 py-4 hover:bg-ink-800 transition text-xs tracking-widest uppercase font-light"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
