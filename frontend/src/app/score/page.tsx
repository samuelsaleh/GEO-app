'use client'

import { useState, useEffect } from 'react'
import { Loader, ArrowRight, CheckCircle, XCircle, AlertTriangle, Trophy, Eye, ExternalLink, Copy, Linkedin, MessageSquare, X, Mail, Globe, Edit3, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { scoreAPI, ScoreResponse, AnalyzeSiteResponse, waitlistAPI } from '@/lib/api'

// Page states
type PageState = 'input' | 'analyzing' | 'questions' | 'loading' | 'results' | 'error'

// Loading steps for dramatic effect
const LOADING_STEPS = [
  { id: 'chatgpt', label: 'Asking ChatGPT...', icon: '🤖' },
  { id: 'claude', label: 'Querying Claude...', icon: '🧠' },
  { id: 'gemini', label: 'Checking Gemini...', icon: '💎' },
  { id: 'analyze', label: 'Finding competitors...', icon: '🔍' },
  { id: 'score', label: 'Calculating score...', icon: '📊' },
]

export default function ScorePage() {
  // Form state
  const [brand, setBrand] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  
  // Analysis state
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSiteResponse | null>(null)
  const [questions, setQuestions] = useState<string[]>([])
  const [editingQuestions, setEditingQuestions] = useState(false)
  
  // UI state
  const [state, setState] = useState<PageState>('input')
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState<ScoreResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  // Email gate state
  const [emailGated, setEmailGated] = useState(true)
  const [email, setEmail] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const isFormValid = brand.trim() !== '' && productDescription.trim() !== ''
  const hasWebsite = websiteUrl.trim() !== ''

  // Step 1: Analyze website (if URL provided) or generate default questions
  const analyzeOrContinue = async () => {
    if (!isFormValid) return
    
    if (hasWebsite) {
      // Analyze website first
      setState('analyzing')
      setError(null)
      
      try {
        const response = await scoreAPI.analyzeSite({
          brand_name: brand.trim(),
          website_url: websiteUrl.trim(),
          additional_context: productDescription.trim()
        })
        
        setAnalysisResult(response)
        
        if (response.success && response.suggested_questions.length > 0) {
          setQuestions(response.suggested_questions)
        } else {
          // Fallback to default questions
          setQuestions(generateDefaultQuestions(brand, productDescription))
        }
        
        setState('questions')
        
      } catch (err: any) {
        console.error('Analysis error:', err)
        // Don't fail - just use default questions
        setQuestions(generateDefaultQuestions(brand, productDescription))
        setState('questions')
      }
    } else {
      // No website - use product description directly
      setQuestions(generateDefaultQuestions(brand, productDescription))
      setState('questions')
    }
  }

  // Generate default questions based on product description
  const generateDefaultQuestions = (brandName: string, category: string): string[] => {
    return [
      `What are the best ${category}?`,
      `Top ${category} brands in 2025`,
      `Is ${brandName} good for ${category}? What are alternatives?`,
      `Where should I buy ${category}? What brands do you recommend?`,
    ]
  }

  // Step 2: Run the actual test
  const runTest = async () => {
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
      const category = analysisResult?.detected_category || productDescription.trim()
      
      const response = await scoreAPI.check({
        brand: brand.trim(),
        category: category,
        website_url: websiteUrl.trim() || undefined,
        custom_questions: questions,
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

  // Submit email to unlock full report
  const submitEmail = async () => {
    if (!email || emailSubmitting) return
    
    setEmailSubmitting(true)
    try {
      await waitlistAPI.join(email)
      setEmailSubmitted(true)
      setEmailGated(false)
    } catch (err) {
      console.error('Email submission failed:', err)
      // Still unlock on error - we got the email
      setEmailGated(false)
    } finally {
      setEmailSubmitting(false)
    }
  }

  const resetForm = () => {
    setState('input')
    setResult(null)
    setAnalysisResult(null)
    setQuestions([])
    setError(null)
    setBrand('')
    setProductDescription('')
    setWebsiteUrl('')
    setEmailGated(true)
    setEmailSubmitted(false)
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
            <Link href="/tools" className="text-sm text-slate-400 hover:text-white transition">
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
                Find out in 30 seconds. We'll test ChatGPT, Claude, and Gemini with questions your customers actually ask.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 space-y-6">
              {/* Brand name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Brand Name *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Nike, HubSpot, Dinh Van"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
                />
              </div>

              {/* Product description - FREE TEXT */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What do you sell? * <span className="text-slate-500">(be specific!)</span>
                </label>
                <input
                  type="text"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="e.g., luxury French jewelry, CRM software for small businesses"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
                />
                <p className="mt-2 text-sm text-slate-500">
                  💡 The more specific, the better. "luxury French jewelry" beats "jewelry"
                </p>
              </div>

              {/* Website URL - OPTIONAL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Website URL <span className="text-slate-500">(optional - helps us ask better questions)</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={analyzeOrContinue}
                disabled={!isFormValid}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
              >
                {hasWebsite ? 'Analyze & Generate Questions' : 'Generate Questions'}
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
                  No signup required
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  ~30 seconds
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== ANALYZING STATE ===== */}
        {state === 'analyzing' && (
          <div className="space-y-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Loader className="w-10 h-10 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Analyzing {websiteUrl}...
            </h2>
            <p className="text-slate-400">
              We're reading your website to understand what you sell and generate relevant questions.
            </p>
          </div>
        )}

        {/* ===== QUESTIONS PREVIEW STATE ===== */}
        {state === 'questions' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {analysisResult?.success ? 'We analyzed your website!' : 'Ready to test!'}
              </h2>
              
              {analysisResult?.success && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-slate-400 text-sm mb-2">Detected category:</p>
                  <p className="text-white font-medium">{analysisResult.detected_category}</p>
                  {analysisResult.detected_competitors.length > 0 && (
                    <>
                      <p className="text-slate-400 text-sm mt-3 mb-2">Known competitors:</p>
                      <p className="text-slate-300 text-sm">{analysisResult.detected_competitors.slice(0, 5).join(', ')}</p>
                    </>
                  )}
                </div>
              )}
              
              <p className="text-slate-400">
                Here are the questions we'll ask ChatGPT, Claude, and Gemini about <strong className="text-white">{brand}</strong>:
              </p>
            </div>

            {/* Questions list */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Questions to test:</h3>
                <button
                  onClick={() => setEditingQuestions(!editingQuestions)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  {editingQuestions ? 'Done editing' : 'Edit questions'}
                </button>
              </div>
              
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-indigo-400 font-mono text-sm mt-1">{i + 1}.</span>
                  {editingQuestions ? (
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => {
                        const newQuestions = [...questions]
                        newQuestions[i] = e.target.value
                        setQuestions(newQuestions)
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-slate-300">"{q}"</p>
                  )}
                </div>
              ))}
            </div>

            {/* Run test button */}
            <button
              onClick={runTest}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              Run AI Visibility Test
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setState('input')}
              className="w-full text-slate-400 hover:text-white text-sm transition"
            >
              ← Go back and edit
            </button>
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
                Running {questions.length * 3} tests across 3 AI models...
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
            
            {/* Score Card - THE MAIN EVENT (Always visible) */}
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

            {/* Share Buttons (Always visible) */}
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

            {/* Killer Quote (Always visible) */}
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

            {/* EMAIL GATE - Blur everything below unless email provided */}
            {emailGated && (
              <div className="relative">
                {/* Blurred preview */}
                <div className="blur-sm pointer-events-none opacity-50 space-y-6">
                  {/* Fake competitor section */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-slate-500">Competitor analysis...</p>
                    </div>
                  </div>
                  
                  {/* Fake model breakdown */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="h-24 flex items-center justify-center">
                      <p className="text-slate-500">Model breakdown...</p>
                    </div>
                  </div>
                </div>
                
                {/* Email capture overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl mx-4">
                    <div className="text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-indigo-400" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white">
                        Get Your Full Report
                      </h3>
                      
                      <p className="text-slate-400 text-sm">
                        Enter your email to see:
                      </p>
                      
                      <ul className="text-left text-slate-300 text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full competitor breakdown
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          All AI responses
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Model-by-model analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Recommendations to improve
                        </li>
                      </ul>
                      
                      <div className="pt-2 space-y-3">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
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
                              Unlock Full Report
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
              </div>
            )}

            {/* FULL REPORT - Only visible after email */}
            {!emailGated && (
              <>
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
                      <p className="text-white">"{result.example_response.prompt}"</p>
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

                {/* Questions Tested */}
                {result.questions_tested && result.questions_tested.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-white font-medium mb-4">Questions We Tested</p>
                    <ul className="space-y-2">
                      {result.questions_tested.map((q, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-indigo-400">•</span>
                          "{q}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Want to fix your AI visibility?
              </h3>
              <p className="text-slate-300 mb-6">
                Get a detailed audit with specific recommendations to improve your score.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tools/health-check"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition"
                >
                  Run Full GEO Audit
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
    </div>
  )
}
