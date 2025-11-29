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
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 text-ink-400" />
              <span className="font-display text-3xl font-light tracking-wide text-ink-900">
                dwight
              </span>
            </Link>
            <div className="flex gap-10">
              <Link href="/about" className="nav-link text-ink-600 hover:text-claude-500 transition-colors">
                About
              </Link>
              <Link href="/pricing" className="nav-link text-ink-600 hover:text-claude-500 transition-colors">
                Pricing
              </Link>
              <Link href="/tools" className="nav-link text-ink-600 hover:text-claude-500 transition-colors">
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="w-16 h-16 border border-claude-200 flex items-center justify-center mx-auto mb-8">
            <MessageSquare className="w-7 h-7 text-claude-500" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-light mb-6 text-ink-900 tracking-wide">Get in Touch</h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto font-light leading-relaxed">
            Ready to boost your AI search visibility? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="card-elevated p-10">
            <h2 className="font-display text-2xl font-light mb-8 text-ink-900 tracking-wide">Send us a Message</h2>

            {submitted && (
              <div className="mb-8 bg-green-50 border border-green-200 text-green-800 px-5 py-4 font-light">
                ✅ Thank you! We'll get back to you within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">Service Interested In</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
                >
                  <option value="health-check">AI Visibility Health-Check</option>
                  <option value="schema">Schema & Labels Fix-Up</option>
                  <option value="alerts">24/7 AI Mention Alerts</option>
                  <option value="custom">Custom/Enterprise Solution</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-claude-500 text-white px-6 py-4 hover:bg-claude-600 transition-all duration-300 text-xs tracking-widest uppercase font-light flex items-center justify-center gap-3"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-10">
            {/* Email */}
            <div className="bg-cream-100 p-10">
              <div className="w-14 h-14 bg-claude-500 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-light mb-3 text-ink-900 tracking-wide">Email Us</h3>
              <p className="text-ink-500 mb-4 font-light">
                For general inquiries and support
              </p>
              <a
                href="mailto:hello@dwight.app"
                className="text-claude-500 font-light hover:text-claude-600"
              >
                hello@dwight.app
              </a>
            </div>

            {/* Quick Links */}
            <div className="card-elevated p-10">
              <h3 className="font-display text-xl font-light mb-6 text-ink-900 tracking-wide">Quick Start</h3>
              <div className="space-y-4">
                <Link
                  href="/tools/health-check"
                  className="block p-5 border border-claude-100 hover:border-claude-300 transition"
                >
                  <div className="font-light text-ink-900">Try Free Health Check</div>
                  <div className="text-sm text-ink-400 font-light mt-1">Get your AI visibility score</div>
                </Link>
                <Link
                  href="/tools/schema-generator"
                  className="block p-5 border border-cream-200 hover:border-cream-400 transition"
                >
                  <div className="font-light text-ink-900">Use Schema Generator</div>
                  <div className="text-sm text-ink-400 font-light mt-1">Create schema markup instantly</div>
                </Link>
                <Link
                  href="/pricing"
                  className="block p-5 border border-cream-200 hover:border-cream-400 transition"
                >
                  <div className="font-light text-ink-900">View Pricing</div>
                  <div className="text-sm text-ink-400 font-light mt-1">See all our services</div>
                </Link>
              </div>
            </div>

            {/* FAQ */}
            <div className="card-elevated p-10">
              <h3 className="font-display text-xl font-light mb-6 text-ink-900 tracking-wide">Common Questions</h3>
              <div className="space-y-6 text-sm">
                <div>
                  <strong className="text-ink-900 font-normal">How quickly will I get a response?</strong>
                  <p className="text-ink-500 mt-2 font-light">Within 24 hours on business days</p>
                </div>
                <div>
                  <strong className="text-ink-900 font-normal">Do you offer custom packages?</strong>
                  <p className="text-ink-500 mt-2 font-light">Yes! Contact us for enterprise solutions</p>
                </div>
                <div>
                  <strong className="text-ink-900 font-normal">Can I try before buying?</strong>
                  <p className="text-ink-500 mt-2 font-light">Absolutely! Try our free tools first</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
