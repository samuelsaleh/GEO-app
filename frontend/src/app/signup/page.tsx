'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Mail, Lock, User, Building, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      // Register user
      await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
        company: formData.company || undefined
      })

      // Auto-login after registration
      const loginResponse = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      })

      // Store JWT token
      localStorage.setItem('auth_token', loginResponse.data.access_token)

      // Redirect to admin dashboard
      router.push('/admin')
    } catch (err: any) {
      console.error('Signup error:', err)
      if (err.response?.status === 400) {
        if (err.response.data.detail === 'Email already registered') {
          setError('An account with this email already exists')
        } else {
          setError(err.response.data.detail || 'Invalid input')
        }
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
              <Link href="/about" className="nav-link text-cream-200 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/pricing" className="nav-link text-cream-200 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/tools" className="nav-link text-cream-200 hover:text-white transition-colors">
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 border border-claude-200 flex items-center justify-center mx-auto mb-8">
            <UserPlus className="w-7 h-7 text-claude-500" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-light mb-6 text-ink-900 tracking-wide">
            Sign Up
          </h1>
          <p className="text-lg text-ink-500 font-light leading-relaxed">
            Create your admin account
          </p>
        </div>

        {/* Signup Form */}
        <div className="card-elevated p-10">
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-5 py-4 font-light flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light focus:outline-none transition-colors"
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Company
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-12 pr-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light focus:outline-none transition-colors"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-ink-400 mt-2 font-light">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 hover:bg-ink-800 text-white py-4 px-8 font-light tracking-widest uppercase text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-ink-500 font-light">
              Already have an account?{' '}
              <Link href="/login" className="text-claude-500 hover:text-claude-600 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
