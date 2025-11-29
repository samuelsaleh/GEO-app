'use client'

import { useState, FormEvent } from 'react'
import { Search, ArrowLeft, CheckCircle, AlertCircle, Loader, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { healthCheckAPI, HealthCheckResult } from '@/lib/api'

export default function HealthCheck() {
  // Form state
  const [url, setUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  
  // Analysis state
  const [step, setStep] = useState<'form' | 'analyzing' | 'results'>('form')
  const [analyzingStep, setAnalyzingStep] = useState('')
  const [result, setResult] = useState<HealthCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isFormValid = url.trim() !== '' && email.trim() !== ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    
    setStep('analyzing')
    setError(null)
    setAnalyzingStep('Connecting to server...')
    
    try {
      setAnalyzingStep('Fetching your page...')
      
      const response = await healthCheckAPI.analyze({
        company_name: companyName || url,
        contact_email: email,
        page_urls: [url],
        questions: question ? [question] : ['How can I find this product?'],
        auto_discover_competitors: false
      })
      
      setAnalyzingStep('Analysis complete!')
      setResult(response)
      setStep('results')
      
    } catch (err: any) {
      console.error('Analysis error:', err)
      // Handle different error formats
      let errorMessage = 'Analysis failed. Please try again.'
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          // Pydantic validation errors
          errorMessage = detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ')
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail)
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setStep('form')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-claude-500'
    return 'text-red-500'
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-600'
    if (grade === 'B') return 'bg-blue-100 text-blue-600'
    if (grade === 'C') return 'bg-yellow-100 text-yellow-600'
    if (grade === 'D') return 'bg-orange-100 text-orange-600'
    return 'bg-red-100 text-red-600'
  }

  const resetForm = () => {
    setStep('form')
    setResult(null)
    setError(null)
    setUrl('')
    setCompanyName('')
    setEmail('')
    setQuestion('')
  }

  return (
    <div className="min-h-screen hero-gradient">
      <nav className="glass-nav border-b border-cream-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 text-ink-400" />
              <span className="font-display text-3xl font-light tracking-wide text-ink-900">
                dwight
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 border border-claude-200 flex items-center justify-center mx-auto mb-8">
            <Search className="w-7 h-7 text-claude-500" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-6 text-ink-900 tracking-wide">
            AI Visibility Health-Check
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto font-light leading-relaxed">
            Discover how visible your content is to AI engines like ChatGPT and Bing Chat
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="card-elevated p-10 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 font-light">
                <strong className="font-normal">Error:</strong> {error}
              </div>
            )}
            
            <div>
              <div className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Website URL to analyze *
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
              />
              <p className="text-sm text-ink-400 mt-2 font-light">
                Enter the main page you want to analyze
              </p>
            </div>

            <div>
              <div className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Company/Brand Name
              </div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc"
                className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
              />
            </div>

            <div>
              <div className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                Your Email *
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
              />
              <p className="text-sm text-ink-400 mt-2 font-light">
                We&apos;ll send you the full report
              </p>
            </div>

            <div>
              <div className="block text-xs tracking-widest uppercase mb-3 text-ink-500 font-light">
                What question would customers ask? (Optional)
              </div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Where can I buy sustainable sneakers?"
                className="w-full px-5 py-4 border border-cream-300 focus:border-claude-500 bg-white font-light"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-claude-500 text-white px-6 py-4 hover:bg-claude-600 transition-all duration-300 text-xs tracking-widest uppercase font-light disabled:bg-cream-400 disabled:cursor-not-allowed"
            >
              Analyze My Page →
            </button>
          </form>
        )}

        {step === 'analyzing' && (
          <div className="card-elevated p-14 text-center">
            <Loader className="w-14 h-14 text-claude-500 animate-spin mx-auto mb-8" />
            <h2 className="font-display text-2xl font-light mb-6 text-ink-900 tracking-wide">
              Analyzing Your Content...
            </h2>
            <p className="text-ink-500 mb-8 font-light">{analyzingStep}</p>
            <div className="max-w-md mx-auto bg-cream-50 p-6 text-left">
              <div className="space-y-4 text-sm font-light">
                <div className="flex items-center gap-3 text-ink-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Connecting to server...</span>
                </div>
                <div className="flex items-center gap-3 text-ink-600">
                  <Loader className="w-4 h-4 text-claude-500 animate-spin" />
                  <span>Scanning page structure...</span>
                </div>
                <div className="flex items-center gap-3 text-ink-300">
                  <div className="w-4 h-4" />
                  <span>Checking schema markup...</span>
                </div>
                <div className="flex items-center gap-3 text-ink-300">
                  <div className="w-4 h-4" />
                  <span>Testing AI visibility...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && result && (
          <div className="space-y-10">
            <div className="card-elevated p-12 text-center">
              <h2 className="font-display text-2xl font-light mb-8 text-ink-900 tracking-wide">
                Your AI Visibility Score
              </h2>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className={`font-display text-8xl font-light tracking-wide ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}
                </div>
                <div className={`font-display text-5xl font-light px-8 py-3 ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </div>
              </div>
              <p className="text-ink-500 max-w-2xl mx-auto font-light leading-relaxed">
                {result.overall_score >= 70 
                  ? "Great job! Your content is well-optimized for AI visibility."
                  : result.overall_score >= 50 
                    ? "Your content has room for improvement. Follow the recommendations below."
                    : "Your content needs significant work. AI assistants may struggle to find your pages."}
              </p>
            </div>

            {result.pages_analyzed.length > 0 && (
              <div className="card-elevated p-10">
                <h3 className="font-display text-xl font-light mb-6 text-ink-900 flex items-center gap-3 tracking-wide">
                  <ExternalLink className="w-5 h-5 text-claude-500" />
                  Page Analysis
                </h3>
                {result.pages_analyzed.map((page, index) => (
                  <div key={index} className="border border-cream-200 p-5 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="truncate flex-1">
                        <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-claude-600 hover:underline font-light">
                          {page.url}
                        </a>
                      </div>
                      <div className={`font-display text-xl font-light ${getScoreColor(page.score)}`}>
                        {page.score}/100
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm font-light">
                      <span className={page.has_schema ? 'text-green-600' : 'text-red-500'}>
                        {page.has_schema ? '✓' : '✗'} Schema
                      </span>
                      <span className={page.has_faq ? 'text-green-600' : 'text-red-500'}>
                        {page.has_faq ? '✓' : '✗'} FAQ
                      </span>
                      <span className="text-ink-500">
                        Readability: {Math.round(page.readability_score)}%
                      </span>
                    </div>
                    {page.issues.length > 0 && (
                      <div className="mt-4 text-sm text-red-600 font-light">
                        {page.issues[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {result.top_issues.length > 0 && (
              <div className="card-elevated p-10">
                <div className="flex items-center gap-3 mb-8">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-display text-xl font-light text-ink-900 tracking-wide">Issues Found</h3>
                </div>
                <ul className="space-y-4">
                  {result.top_issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-4 text-ink-600 font-light">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.top_strengths.length > 0 && (
              <div className="card-elevated p-10">
                <div className="flex items-center gap-3 mb-8">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-display text-xl font-light text-ink-900 tracking-wide">What You&apos;re Doing Right</h3>
                </div>
                <ul className="space-y-4">
                  {result.top_strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-4 text-ink-600 font-light">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-claude-500 p-10 text-white">
              <h3 className="font-display text-2xl font-light mb-8 tracking-wide">🎯 Top Recommendations</h3>
              <ol className="space-y-5">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-5">
                    <span className="flex-shrink-0 w-8 h-8 bg-white/20 flex items-center justify-center font-light">
                      {index + 1}
                    </span>
                    <span className="pt-1 font-light">{rec}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-elevated p-10 text-center">
              <h3 className="font-display text-xl font-light mb-4 text-ink-900 tracking-wide">
                Want to improve your score?
              </h3>
              <p className="text-ink-500 mb-8 font-light">
                Use our Schema Generator to add structured data to your pages.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button
                  onClick={resetForm}
                  className="px-8 py-4 border border-claude-500 text-claude-500 hover:bg-claude-500 hover:text-white transition-all duration-300 text-xs tracking-widest uppercase font-light"
                >
                  Analyze Another Page
                </button>
                <Link
                  href="/tools/schema-generator"
                  className="bg-claude-500 text-white px-8 py-4 hover:bg-claude-600 transition-all duration-300 text-xs tracking-widest uppercase font-light"
                >
                  Try Schema Generator →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
