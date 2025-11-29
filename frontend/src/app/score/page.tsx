'use client'

import { useState, useEffect } from 'react'
import { Loader, Share2, Mail, ArrowRight, CheckCircle, XCircle, AlertTriangle, Trophy, Eye, ChevronDown, ExternalLink, Copy, Linkedin, MessageSquare, X } from 'lucide-react'
import Link from 'next/link'
import { scoreAPI, ScoreResponse, waitlistAPI } from '@/lib/api'

// Category options for dropdown
const CATEGORIES = [
  { value: 'running shoes', label: 'Running Shoes' },
  { value: 'crm software', label: 'CRM Software' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'marketing agency', label: 'Marketing Agency' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'fitness', label: 'Fitness / Gym' },
  { value: 'real estate', label: 'Real Estate' },
  { value: 'legal services', label: 'Legal Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel' },
  { value: 'food delivery', label: 'Food Delivery' },
  { value: 'other', label: 'Other' },
]

// Loading steps for dramatic effect
const LOADING_STEPS = [
  { id: 'chatgpt', label: 'Asking ChatGPT...', icon: '🤖' },
  { id: 'claude', label: 'Querying Claude...', icon: '🧠' },
  { id: 'gemini', label: 'Checking Gemini...', icon: '💎' },
  { id: 'analyze', label: 'Finding competitors...', icon: '🔍' },
  { id: 'score', label: 'Calculating score...', icon: '📊' },
]

type PageState = 'input' | 'loading' | 'results' | 'error'

export default function ScorePage() {
  // Form state
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  
  // UI state
  const [state, setState] = useState<PageState>('input')
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<ScoreResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAllResponses, setShowAllResponses] = useState(false)
  
  // Email capture modal state
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  
  // Show email modal after 3 seconds of viewing results
  useEffect(() => {
    if (state === 'results' && !emailSubmitted) {
      const timer = setTimeout(() => {
        setShowEmailModal(true)
      }, 5000) // Show after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [state, emailSubmitted])
  
  const submitEmail = async () => {
    if (!email || emailSubmitting) return
    
    setEmailSubmitting(true)
    try {
      await waitlistAPI.join(email)
      setEmailSubmitted(true)
      setShowEmailModal(false)
    } catch (err) {
      console.error('Email submission failed:', err)
    } finally {
      setEmailSubmitting(false)
    }
  }

  const effectiveCategory = category === 'other' ? customCategory : category
  const isFormValid = brand.trim() !== '' && effectiveCategory.trim() !== ''

  const runTest = async () => {
    if (!isFormValid) return
    
    setState('loading')
    setCurrentStep(0)
    setError(null)
    
    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1
        return prev
      })
    }, 2000)
    
    try {
      const response = await scoreAPI.check({
        brand: brand.trim(),
        category: effectiveCategory.trim(),
      })
      
      clearInterval(stepInterval)
      setResult(response)
      setState('results')
      
    } catch (err: any) {
      clearInterval(stepInterval)
      console.error('Score test error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to run test')
      setState('error')
    }
  }

  const resetForm = () => {
    setState('input')
    setResult(null)
    setError(null)
    setBrand('')
    setCategory('')
    setCustomCategory('')
  }

  const copyShareText = () => {
    if (result?.share_text) {
      navigator.clipboard.writeText(result.share_text + '\nhttps://dwight.ai/score')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareToLinkedIn = () => {
    if (result?.share_text) {
      const text = encodeURIComponent(result.share_text + '\nhttps://dwight.ai/score')
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://dwight.ai/score')}&text=${text}`, '_blank')
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 20) return 'text-red-500'
    if (score < 40) return 'text-orange-500'
    if (score < 60) return 'text-yellow-500'
    if (score < 80) return 'text-green-500'
    return 'text-emerald-500'
  }

  const getScoreBg = (score: number) => {
    if (score < 20) return 'bg-red-500/10 border-red-500/30'
    if (score < 40) return 'bg-orange-500/10 border-orange-500/30'
    if (score < 60) return 'bg-yellow-500/10 border-yellow-500/30'
    if (score < 80) return 'bg-green-500/10 border-green-500/30'
    return 'bg-emerald-500/10 border-emerald-500/30'
  }

  const getVerdictBg = (verdict: string) => {
    switch (verdict) {
      case 'invisible': return 'bg-red-500'
      case 'ghost': return 'bg-orange-500'
      case 'contender': return 'bg-yellow-500'
      case 'visible': return 'bg-green-500'
      case 'authority': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              dwight
            </Link>
            <Link 
              href="/tools" 
              className="text-sm text-slate-400 hover:text-white transition"
            >
              All Tools →
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        
        {/* ===== INPUT STATE ===== */}
        {state === 'input' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm">
                <Eye className="w-4 h-4" />
                Free AI Visibility Test
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Is AI recommending your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  competitor instead of you?
                </span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Find out in 30 seconds. We'll test ChatGPT, Claude, and Gemini to see if they mention your brand.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 space-y-6">
              {/* Brand input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Brand Name
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Nike, HubSpot, Stripe"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
                />
              </div>

              {/* Category dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What do you sell?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select a category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-slate-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom category input */}
              {category === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Describe your product/service
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g., organic skincare, AI writing tools"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
                  />
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={runTest}
                disabled={!isFormValid}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                Check My AI Visibility
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 pt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  100% Free
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No signup
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  30 seconds
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== LOADING STATE ===== */}
        {state === 'loading' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Loader className="w-10 h-10 text-indigo-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Testing AI Visibility for {brand}
              </h2>
              <p className="text-slate-400">
                Running {LOADING_STEPS.length * 4} tests across 3 AI models...
              </p>
            </div>

            {/* Progress steps */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
              {LOADING_STEPS.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-4 transition-all ${
                    index <= currentStep ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    index < currentStep 
                      ? 'bg-green-500/20 text-green-400' 
                      : index === currentStep
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-white/5 text-slate-500'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : index === currentStep ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className={`font-medium ${
                    index <= currentStep ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < currentStep && (
                    <span className="text-green-400 text-sm ml-auto">Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ERROR STATE ===== */}
        {state === 'error' && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-slate-400">{error}</p>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ===== RESULTS STATE ===== */}
        {state === 'results' && result && (
          <div className="space-y-8">
            
            {/* Score Card - THE MAIN EVENT */}
            <div className={`rounded-2xl border-2 p-8 text-center ${getScoreBg(result.score)}`}>
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                Your AI Visibility Score
              </p>
              
              <div className={`text-8xl font-bold ${getScoreColor(result.score)} mb-2`}>
                {result.score}
              </div>
              
              <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold uppercase tracking-wider text-sm ${getVerdictBg(result.verdict)}`}>
                {result.verdict_emoji} {result.verdict}
              </div>
              
              <div className="mt-4 text-slate-300">
                <strong className="text-white">{result.brand}</strong> • {result.category}
              </div>
              
              <p className="text-slate-400 mt-2">
                Mentioned in {result.total_mentions} of {result.total_tests} AI tests
              </p>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={shareToLinkedIn}
                className="flex items-center gap-2 px-5 py-3 bg-[#0077b5] hover:bg-[#006396] text-white font-medium rounded-xl transition"
              >
                <Linkedin className="w-5 h-5" />
                Share on LinkedIn
              </button>
              <button
                onClick={copyShareText}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Share Text
                  </>
                )}
              </button>
            </div>

            {/* Killer Quote - THE AHA MOMENT */}
            {result.killer_quote && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium mb-2">The Problem</p>
                    <p className="text-slate-300">{result.killer_quote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Example AI Response */}
            {result.example_response && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-medium flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    What {result.example_response.model} Said
                  </p>
                  {result.example_response.mentioned ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      You're mentioned
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Not mentioned
                    </span>
                  )}
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
                  <p className="text-slate-400 text-sm mb-2">Question asked:</p>
                  <p className="text-white">&ldquo;{result.example_response.prompt}&rdquo;</p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-2">AI response:</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {result.example_response.response}
                  </p>
                </div>
              </div>
            )}

            {/* Competitor Comparison */}
            {result.competitors.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <p className="text-white font-medium">Who's Beating You</p>
                </div>
                
                <div className="space-y-3">
                  {result.competitors.map((comp, index) => (
                    <div key={comp.name} className="flex items-center gap-4">
                      <span className="text-slate-500 w-6">#{index + 1}</span>
                      <span className="text-white flex-1">{comp.name}</span>
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${comp.rate}%` }}
                        />
                      </div>
                      <span className="text-slate-400 w-12 text-right">{comp.rate}%</span>
                    </div>
                  ))}
                  
                  {/* Your brand */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                    <span className="text-slate-500 w-6">—</span>
                    <span className="text-indigo-400 flex-1 font-medium">{result.brand} (You)</span>
                    <div className="w-32 bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getScoreColor(result.score).replace('text-', 'bg-')}`}
                        style={{ width: `${Math.round(result.mention_rate * 100)}%` }}
                      />
                    </div>
                    <span className={`w-12 text-right font-medium ${getScoreColor(result.score)}`}>
                      {Math.round(result.mention_rate * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Model Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white font-medium mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                Results by AI Model
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {result.model_breakdown.map(model => (
                  <div 
                    key={model.model_id}
                    className={`p-4 rounded-xl text-center ${
                      model.rate > 50 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : model.rate > 0
                          ? 'bg-yellow-500/10 border border-yellow-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    <p className="text-white font-medium">{model.model_name}</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      model.rate > 50 ? 'text-green-400' : model.rate > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {model.mentions}/{model.total}
                    </p>
                    <p className="text-slate-400 text-sm">mentions</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Want to fix your AI visibility?
              </h3>
              <p className="text-slate-300 mb-6">
                Get a detailed health check with specific recommendations to improve your score.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/health-check"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition"
                >
                  Run Full Health Check
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/tools/schema-generator"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
                >
                  Generate Schema Markup
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Test another brand */}
            <div className="text-center">
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white transition underline"
              >
                Test another brand →
              </button>
            </div>

            {/* Test metadata */}
            <div className="text-center text-slate-500 text-sm">
              Test completed in {(result.test_duration_ms / 1000).toFixed(1)}s • {result.total_tests} AI queries
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2025 Dwight. Free AI Visibility Tools for Everyone.</p>
        </div>
      </footer>

      {/* Email Capture Modal */}
      {showEmailModal && !emailSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-indigo-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white">
                Get Your Detailed Report
              </h3>
              
              <p className="text-slate-400">
                Enter your email to receive a detailed PDF report with specific recommendations to improve your AI visibility score.
              </p>
              
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
                />
                
                <button
                  onClick={submitEmail}
                  disabled={!email || emailSubmitting}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {emailSubmitting ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send My Report
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-slate-500 text-xs">
                No spam. Just your report + occasional GEO tips.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

