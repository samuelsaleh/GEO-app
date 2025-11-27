import { ArrowLeft, Check, Star } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
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
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold mb-6 text-ink-900">Simple, Transparent Pricing</h1>
          <p className="text-xl text-ink-500">
            Choose the service that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Service 1: Health Check */}
            <div className="card-elevated p-8 border-2 border-claude-100 hover:border-claude-300 transition">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-ink-900">AI Visibility Health-Check</h3>
                <div className="bg-claude-100 text-claude-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-display font-bold text-ink-900">€1,700</span>
                  <span className="text-ink-400">- €4,300</span>
                </div>
                <p className="text-ink-500">One-time comprehensive audit</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">10-30 page deep analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">0-100 AI readiness score per page</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Screenshots of AI mentions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">15-slide picture report</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">1-hour video walkthrough</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-claude-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Actionable fix list</span>
                </div>
              </div>

              <div className="bg-claude-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-semibold text-claude-700 mb-2">Timeline:</div>
                <div className="text-claude-600">≈ 10 days from kick-off</div>
              </div>

              <Link
                href="/tools/health-check"
                className="block w-full text-center btn-claude text-white px-6 py-4 rounded-lg font-semibold"
              >
                Start Free Demo →
              </Link>
            </div>

            {/* Service 2: Schema Generator */}
            <div className="card-elevated p-8 border-2 border-cream-300 hover:border-cream-400 transition">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-ink-900">Schema & Labels Fix-Up</h3>
                <div className="bg-cream-300 text-ink-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Quick Win
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-display font-bold text-ink-900">€130</span>
                  <span className="text-ink-400">- €260</span>
                </div>
                <p className="text-ink-500">Per page type</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Ready-made JSON-LD code</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Product, FAQ, Article schemas</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Google validation screenshots</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Installation guide</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Developer notes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span className="text-ink-600">Testing support</span>
                </div>
              </div>

              <div className="bg-cream-200 rounded-lg p-4 mb-6">
                <div className="text-sm font-semibold text-ink-700 mb-2">Timeline:</div>
                <div className="text-ink-600">≈ 1 week per batch</div>
              </div>

              <Link
                href="/tools/schema-generator"
                className="block w-full text-center btn-ink text-white px-6 py-4 rounded-lg font-semibold"
              >
                Try Generator Free →
              </Link>
            </div>
          </div>

          {/* Service 3: Coming Soon */}
          <div className="bg-cream-200 rounded-2xl p-8 border-2 border-dashed border-cream-400">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-bold text-ink-600">24/7 AI Mention Alerts</h3>
              <div className="bg-cream-300 text-ink-600 px-3 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
            </div>
            <p className="text-ink-500 mb-4">
              Get instant notifications when AI engines mention (or misquote) your brand. Real-time monitoring
              across ChatGPT, Bing Chat, Google Gemini, and more.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-ink-600">€860</span>
              <span className="text-ink-400">- €2,600/month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-ink-900">Service Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-cream-300">
                  <th className="text-left p-4 font-bold text-ink-900">Feature</th>
                  <th className="text-center p-4 font-bold text-claude-500">Health Check</th>
                  <th className="text-center p-4 font-bold text-ink-600">Schema Fix-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                <tr>
                  <td className="p-4 text-ink-600">AI Visibility Analysis</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center text-ink-300">—</td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-600">Schema Markup</td>
                  <td className="p-4 text-center text-ink-500">Recommended</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-600">Screenshots & Reports</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-cream-50">
                  <td className="p-4 text-ink-600">Expert Consultation</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center text-ink-500">Optional</td>
                </tr>
                <tr>
                  <td className="p-4 text-ink-600">Installation Support</td>
                  <td className="p-4 text-center text-ink-500">Guide</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-claude-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-20 bg-ink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Star className="w-12 h-12 text-claude-400 mx-auto mb-6" />
          <h2 className="font-display text-4xl font-bold mb-6">Enterprise Solutions</h2>
          <p className="text-xl text-ink-400 mb-8">
            Need ongoing AI optimization, multi-brand tracking, or custom integrations?
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">Custom Packages</div>
              <div className="text-ink-400">Tailored to your needs</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">Dedicated Support</div>
              <div className="text-ink-400">Priority assistance</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">API Access</div>
              <div className="text-ink-400">Integrate with your tools</div>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-block bg-white text-ink-900 px-8 py-4 rounded-lg hover:bg-cream-100 transition font-semibold text-lg"
          >
            Contact Sales
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-ink-900">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Can I try before I buy?</h3>
              <p className="text-ink-500">
                Yes! Both our tools have free demo versions. Try the Health Check and Schema Generator
                to see how they work before committing to a full service.
              </p>
            </div>

            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">What payment methods do you accept?</h3>
              <p className="text-ink-500">
                We accept all major credit cards, PayPal, and bank transfers for enterprise clients.
              </p>
            </div>

            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Do you offer refunds?</h3>
              <p className="text-ink-500">
                We offer a satisfaction guarantee. If you're not happy with the Health Check report
                within 7 days, we'll provide a full refund.
              </p>
            </div>

            <div className="card-elevated p-6">
              <h3 className="font-display text-lg font-bold mb-2 text-ink-900">Can I purchase multiple services together?</h3>
              <p className="text-ink-500">
                Absolutely! We offer bundled pricing for clients who purchase both the Health Check
                and Schema Fix-Up. Contact us for a custom quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-claude-500 to-claude-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-claude-100 mb-8">
            Try our free tools or contact us for a custom solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="bg-white text-claude-600 px-8 py-4 rounded-lg hover:bg-cream-100 transition font-semibold text-lg"
            >
              Try Free Tools
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
