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
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Please try again.')
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
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-ink-500" />
              <span className="text-2xl font-display font-bold text-gradient-claude">
                Dwight
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-claude-500" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 text-ink-900">
            AI Visibility Health-Check
          </h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto">
            Discover how visible your content is to AI engines like ChatGPT and Bing Chat
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div>
              <div className="block text-sm font-medium text-ink-700 mb-2">
                Website URL to analyze *
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
              />
              <p className="text-sm text-ink-400 mt-1">
                Enter the main page you want to analyze
              </p>
            </div>

            <div>
              <div className="block text-sm font-medium text-ink-700 mb-2">
                Company/Brand Name
              </div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc"
                className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <div className="block text-sm font-medium text-ink-700 mb-2">
                Your Email *
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
              />
              <p className="text-sm text-ink-400 mt-1">
                We&apos;ll send you the full report
              </p>
            </div>

            <div>
              <div className="block text-sm font-medium text-ink-700 mb-2">
                What question would customers ask? (Optional)
              </div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Where can I buy sustainable sneakers?"
                className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full btn-claude text-white px-6 py-4 rounded-lg font-semibold text-lg disabled:bg-cream-400 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              Analyze My Page →
            </button>
          </form>
        )}

        {step === 'analyzing' && (
          <div className="card-elevated p-12 text-center">
            <Loader className="w-16 h-16 text-claude-500 animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold mb-4 text-ink-900">
              Analyzing Your Content...
            </h2>
            <p className="text-ink-500 mb-6">{analyzingStep}</p>
            <div className="max-w-md mx-auto bg-cream-100 rounded-lg p-4 text-left">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-ink-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Connecting to server...</span>
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <Loader className="w-4 h-4 text-claude-500 animate-spin" />
                  <span>Scanning page structure...</span>
                </div>
                <div className="flex items-center gap-2 text-ink-300">
                  <div className="w-4 h-4" />
                  <span>Checking schema markup...</span>
                </div>
                <div className="flex items-center gap-2 text-ink-300">
                  <div className="w-4 h-4" />
                  <span>Testing AI visibility...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && result && (
          <div className="space-y-8">
            <div className="card-elevated p-10 text-center">
              <h2 className="font-display text-2xl font-bold mb-6 text-ink-900">
                Your AI Visibility Score
              </h2>
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className={`font-display text-8xl font-bold ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}
                </div>
                <div className={`font-display text-6xl font-bold px-6 py-2 rounded-2xl ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </div>
              </div>
              <p className="text-ink-500 max-w-2xl mx-auto">
                {result.overall_score >= 70 
                  ? "Great job! Your content is well-optimized for AI visibility."
                  : result.overall_score >= 50 
                    ? "Your content has room for improvement. Follow the recommendations below."
                    : "Your content needs significant work. AI assistants may struggle to find your pages."}
              </p>
            </div>

            {result.pages_analyzed.length > 0 && (
              <div className="card-elevated p-8">
                <h3 className="font-display text-xl font-bold mb-4 text-ink-900 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-claude-500" />
                  Page Analysis
                </h3>
                {result.pages_analyzed.map((page, index) => (
                  <div key={index} className="border border-cream-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="truncate flex-1">
                        <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-claude-600 hover:underline">
                          {page.url}
                        </a>
                      </div>
                      <div className={`font-bold text-xl ${getScoreColor(page.score)}`}>
                        {page.score}/100
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
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
                      <div className="mt-3 text-sm text-red-600">
                        {page.issues[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {result.top_issues.length > 0 && (
              <div className="card-elevated p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <h3 className="font-display text-xl font-bold text-ink-900">Issues Found</h3>
                </div>
                <ul className="space-y-3">
                  {result.top_issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-3 text-ink-600">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.top_strengths.length > 0 && (
              <div className="card-elevated p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="font-display text-xl font-bold text-ink-900">What You&apos;re Doing Right</h3>
                </div>
                <ul className="space-y-3">
                  {result.top_strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3 text-ink-600">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-br from-claude-500 to-claude-600 rounded-2xl p-8 shadow-xl text-white">
              <h3 className="font-display text-2xl font-bold mb-6">🎯 Top Recommendations</h3>
              <ol className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="pt-1">{rec}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-elevated p-8 text-center">
              <h3 className="font-display text-xl font-bold mb-4 text-ink-900">
                Want to improve your score?
              </h3>
              <p className="text-ink-500 mb-6">
                Use our Schema Generator to add structured data to your pages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-claude-500 text-claude-600 rounded-lg font-semibold hover:bg-claude-50 transition"
                >
                  Analyze Another Page
                </button>
                <Link
                  href="/tools/schema-generator"
                  className="btn-claude text-white px-6 py-3 rounded-lg font-semibold"
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
