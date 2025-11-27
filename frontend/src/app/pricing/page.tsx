import { ArrowLeft, Check, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Creed
              </h1>
            </Link>
            <div className="flex gap-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <Link href="/tools" className="text-gray-600 hover:text-gray-900">
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the service that fits your needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Service 1: Health Check */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-100 hover:border-blue-300 transition">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">AI Visibility Health-Check</h3>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">€1,700</span>
                  <span className="text-gray-500">- €4,300</span>
                </div>
                <p className="text-gray-600">One-time comprehensive audit</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">10-30 page deep analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">0-100 AI readiness score per page</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Screenshots of AI mentions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">15-slide picture report</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">1-hour video walkthrough</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Actionable fix list</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-semibold text-blue-900 mb-2">Timeline:</div>
                <div className="text-blue-700">≈ 10 days from kick-off</div>
              </div>

              <Link
                href="/tools/health-check"
                className="block w-full text-center bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Start Free Demo →
              </Link>
            </div>

            {/* Service 2: Schema Generator */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-cyan-100 hover:border-cyan-300 transition">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Schema & Labels Fix-Up</h3>
                <div className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Quick Win
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">€130</span>
                  <span className="text-gray-500">- €260</span>
                </div>
                <p className="text-gray-600">Per page type</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Ready-made JSON-LD code</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Product, FAQ, Article schemas</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Google validation screenshots</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Installation guide</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Developer notes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Testing support</span>
                </div>
              </div>

              <div className="bg-cyan-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-semibold text-cyan-900 mb-2">Timeline:</div>
                <div className="text-cyan-700">≈ 1 week per batch</div>
              </div>

              <Link
                href="/tools/schema-generator"
                className="block w-full text-center bg-cyan-600 text-white px-6 py-4 rounded-lg hover:bg-cyan-700 transition font-semibold"
              >
                Try Generator Free →
              </Link>
            </div>
          </div>

          {/* Service 3: Coming Soon */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-700">24/7 AI Mention Alerts</h3>
              <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
            </div>
            <p className="text-slate-600 mb-4">
              Get instant notifications when AI engines mention (or misquote) your brand. Real-time monitoring
              across ChatGPT, Bing Chat, Google Gemini, and more.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-700">€860</span>
              <span className="text-slate-500">- €2,600/month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Service Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-bold">Feature</th>
                  <th className="text-center p-4 font-bold text-blue-600">Health Check</th>
                  <th className="text-center p-4 font-bold text-cyan-600">Schema Fix-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-4">AI Visibility Analysis</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center text-gray-300">—</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Schema Markup</td>
                  <td className="p-4 text-center text-gray-600">Recommended</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Screenshots & Reports</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Expert Consultation</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center text-gray-600">Optional</td>
                </tr>
                <tr>
                  <td className="p-4">Installation Support</td>
                  <td className="p-4 text-center text-gray-600">Guide</td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Enterprise Solutions</h2>
          <p className="text-xl text-slate-300 mb-8">
            Need ongoing AI optimization, multi-brand tracking, or custom integrations?
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">Custom Packages</div>
              <div className="text-slate-300">Tailored to your needs</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">Dedicated Support</div>
              <div className="text-slate-300">Priority assistance</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl font-bold mb-2">API Access</div>
              <div className="text-slate-300">Integrate with your tools</div>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg hover:bg-slate-100 transition font-semibold text-lg"
          >
            Contact Sales
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-2">Can I try before I buy?</h3>
              <p className="text-gray-600">
                Yes! Both our tools have free demo versions. Try the Health Check and Schema Generator
                to see how they work before committing to a full service.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for enterprise clients.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a satisfaction guarantee. If you're not happy with the Health Check report
                within 7 days, we'll provide a full refund.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-2">Can I purchase multiple services together?</h3>
              <p className="text-gray-600">
                Absolutely! We offer bundled pricing for clients who purchase both the Health Check
                and Schema Fix-Up. Contact us for a custom quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Try our free tools or contact us for a custom solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
            >
              Try Free Tools
            </Link>
            <Link
              href="/contact"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg hover:bg-blue-800 transition font-semibold text-lg border-2 border-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
