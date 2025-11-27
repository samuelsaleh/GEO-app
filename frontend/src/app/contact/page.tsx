'use client'

import { useState } from 'react'
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'health-check',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', company: '', service: 'health-check', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
              <Link href="/pricing" className="text-ink-600 hover:text-claude-500 transition-colors">
                Pricing
              </Link>
              <Link href="/tools" className="text-ink-600 hover:text-claude-500 transition-colors">
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-claude-500" />
          </div>
          <h1 className="font-display text-5xl font-bold mb-4 text-ink-900">Get in Touch</h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto">
            Ready to boost your AI search visibility? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card-elevated p-8">
            <h2 className="font-display text-2xl font-bold mb-6 text-ink-900">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                ✅ Thank you! We'll get back to you within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-ink-700">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-ink-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-ink-700">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-ink-700">Service Interested In</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                >
                  <option value="health-check">AI Visibility Health-Check</option>
                  <option value="schema">Schema & Labels Fix-Up</option>
                  <option value="alerts">24/7 AI Mention Alerts</option>
                  <option value="custom">Custom/Enterprise Solution</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-ink-700">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-claude text-white px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Email */}
            <div className="bg-cream-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-claude-500 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2 text-ink-900">Email Us</h3>
              <p className="text-ink-500 mb-4">
                For general inquiries and support
              </p>
              <a
                href="mailto:hello@dwight.app"
                className="text-claude-500 font-semibold hover:text-claude-600"
              >
                hello@dwight.app
              </a>
            </div>

            {/* Quick Links */}
            <div className="card-elevated p-8">
              <h3 className="font-display text-xl font-bold mb-4 text-ink-900">Quick Start</h3>
              <div className="space-y-3">
                <Link
                  href="/tools/health-check"
                  className="block p-4 bg-claude-50 rounded-lg hover:bg-claude-100 transition"
                >
                  <div className="font-semibold text-ink-900">Try Free Health Check</div>
                  <div className="text-sm text-ink-500">Get your AI visibility score</div>
                </Link>
                <Link
                  href="/tools/schema-generator"
                  className="block p-4 bg-cream-200 rounded-lg hover:bg-cream-300 transition"
                >
                  <div className="font-semibold text-ink-900">Use Schema Generator</div>
                  <div className="text-sm text-ink-500">Create schema markup instantly</div>
                </Link>
                <Link
                  href="/pricing"
                  className="block p-4 bg-cream-100 rounded-lg hover:bg-cream-200 transition"
                >
                  <div className="font-semibold text-ink-900">View Pricing</div>
                  <div className="text-sm text-ink-500">See all our services</div>
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="card-elevated p-8">
              <h3 className="font-display text-xl font-bold mb-4 text-ink-900">Common Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <strong className="text-ink-900">How quickly will I get a response?</strong>
                  <p className="text-ink-500 mt-1">Within 24 hours on business days</p>
                </div>
                <div>
                  <strong className="text-ink-900">Do you offer custom packages?</strong>
                  <p className="text-ink-500 mt-1">Yes! Contact us for enterprise solutions</p>
                </div>
                <div>
                  <strong className="text-ink-900">Can I try before buying?</strong>
                  <p className="text-ink-500 mt-1">Absolutely! Try our free tools first</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
