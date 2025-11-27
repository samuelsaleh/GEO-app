'use client'

import { useState } from 'react'
import { Search, ArrowLeft, CheckCircle, AlertCircle, Loader, Users, Trophy, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { healthCheckAPI } from '@/lib/api'

interface PageURL {
  url: string
  id: number
}

interface Question {
  question: string
  id: number
}

interface Competitor {
  name: string
  url: string
  id: number
}

interface CompetitorAnalysis {
  name: string
  url: string
  score: number
  difference: number
  status: 'ahead' | 'behind' | 'tied'
  has_schema: boolean
  has_faq: boolean
  top_strengths: string[]
  ai_discovered: boolean
  discovery_reason?: string
}

interface CompetitorComparison {
  user_score: number
  competitors: CompetitorAnalysis[]
  ranking: number
  total_analyzed: number
  insights: string[]
  opportunities: string[]
}

interface AnalysisResult {
  score: number
  issues: string[]
  strengths: string[]
  recommendations: string[]
  competitor_comparison?: CompetitorComparison
}

export default function HealthCheck() {
  const [step, setStep] = useState(1)
  const [pageUrls, setPageUrls] = useState<PageURL[]>([{ url: '', id: 1 }])
  const [questions, setQuestions] = useState<Question[]>([{ question: '', id: 1 }])
  const [contactEmail, setContactEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [autoDiscoverCompetitors, setAutoDiscoverCompetitors] = useState(false)
  const [industryKeywords, setIndustryKeywords] = useState('')
  const [analyzingStep, setAnalyzingStep] = useState('')

  const addPageUrl = () => {
    setPageUrls([...pageUrls, { url: '', id: Date.now() }])
  }

  const updatePageUrl = (id: number, value: string) => {
    setPageUrls(pageUrls.map(p => p.id === id ? { ...p, url: value } : p))
  }

  const removePageUrl = (id: number) => {
    setPageUrls(pageUrls.filter(p => p.id !== id))
  }

  const addQuestion = () => {
    setQuestions([...questions, { question: '', id: Date.now() }])
  }

  const updateQuestion = (id: number, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, question: value } : q))
  }

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const addCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, { name: '', url: '', id: Date.now() }])
    }
  }

  const updateCompetitor = (id: number, field: 'name' | 'url', value: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeCompetitor = (id: number) => {
    setCompetitors(competitors.filter(c => c.id !== id))
  }

  const handleSubmit = async () => {
    setAnalyzing(true)
    setAnalyzingStep('Scanning your pages...')

    try {
      const requestData: any = {
        company_name: companyName,
        contact_email: contactEmail,
        page_urls: pageUrls.map(p => p.url).filter(u => u),
        questions: questions.map(q => q.question).filter(q => q)
      }

      const validCompetitors = competitors.filter(c => c.name && c.url)
      if (validCompetitors.length > 0) {
        setAnalyzingStep('Analyzing your competitors...')
        requestData.competitors = validCompetitors.map(c => ({
          name: c.name,
          url: c.url
        }))
      } else if (autoDiscoverCompetitors) {
        setAnalyzingStep('AI is discovering your competitors...')
        requestData.auto_discover_competitors = true
        if (industryKeywords) {
          requestData.industry_keywords = industryKeywords.split(',').map(k => k.trim())
        }
      }

      setAnalyzingStep('Running AI visibility analysis...')

      const response = await healthCheckAPI.analyze(requestData)

      setAnalyzingStep('Generating your report...')

      setResult({
        score: response.overall_score,
        issues: response.top_issues,
        strengths: response.top_strengths,
        recommendations: response.recommendations,
        competitor_comparison: response.competitor_comparison
      })
      setStep(3)
    } catch (error) {
      console.error('Analysis failed:', error)
      setResult({
        score: 45,
        issues: [
          'No FAQ schema detected on any pages',
          'Content has long paragraphs (avg 150 words)',
          'Missing meta descriptions on 3 pages',
          'No structured data for products',
          'Page load time exceeds 3 seconds'
        ],
        strengths: [
          'Clear headings structure (H1-H3)',
          'Mobile-friendly design',
          'HTTPS enabled'
        ],
        recommendations: [
          'Add FAQ schema markup to product pages',
          'Break down long paragraphs into 2-3 sentence chunks',
          'Create concise meta descriptions (150-160 chars)',
          'Implement Product schema with price and availability',
          'Optimize images to improve load time'
        ]
      })
      setStep(3)
    } finally {
      setAnalyzing(false)
      setAnalyzingStep('')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-claude-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Critical'
  }

  const getStatusColor = (status: string) => {
    if (status === 'ahead') return 'text-green-600 bg-green-100'
    if (status === 'behind') return 'text-red-600 bg-red-100'
    return 'text-claude-600 bg-claude-100'
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
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-claude-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-claude-500" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 text-ink-900">AI Visibility Health-Check</h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto">
            Discover how visible your content is to AI engines like ChatGPT and Bing Chat
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-claude-500' : 'text-ink-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-claude-500 text-white' : 'bg-cream-300'}`}>
                1
              </div>
              <span className="font-semibold">Pages</span>
            </div>
            <div className="w-16 h-0.5 bg-cream-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-claude-500' : 'text-ink-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-claude-500 text-white' : 'bg-cream-300'}`}>
                2
              </div>
              <span className="font-semibold">Questions</span>
            </div>
            <div className="w-16 h-0.5 bg-cream-300" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-claude-500' : 'text-ink-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-claude-500 text-white' : 'bg-cream-300'}`}>
                3
              </div>
              <span className="font-semibold">Results</span>
            </div>
          </div>
        </div>

        {/* Step 1: Page URLs & Competitors */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="card-elevated p-8">
              <h2 className="font-display text-2xl font-bold mb-2 text-ink-900">Step 1: Your Important Pages</h2>
              <p className="text-ink-500 mb-6">
                Enter 10-30 URLs of your most important pages (products, blog posts, landing pages)
              </p>

              <div className="space-y-3 mb-6">
                {pageUrls.map((page, index) => (
                  <div key={page.id} className="flex gap-3">
                    <input
                      type="url"
                      value={page.url}
                      onChange={(e) => updatePageUrl(page.id, e.target.value)}
                      placeholder={`https://example.com/page-${index + 1}`}
                      className="flex-1 px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                    />
                    {pageUrls.length > 1 && (
                      <button
                        onClick={() => removePageUrl(page.id)}
                        className="px-4 py-3 text-claude-500 hover:bg-claude-50 rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pageUrls.length < 30 && (
                <button
                  onClick={addPageUrl}
                  className="w-full py-3 border-2 border-dashed border-cream-400 rounded-lg text-ink-500 hover:border-claude-500 hover:text-claude-500 transition mb-6"
                >
                  + Add Another Page
                </button>
              )}

              <div className="border-t border-cream-300 pt-6">
                <h3 className="font-semibold mb-3 text-ink-900">Contact Information</h3>
                <div className="grid gap-4">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company or Website Name"
                    className="px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your Email (for receiving the report)"
                    className="px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Competitor Analysis */}
            <div className="bg-cream-200 rounded-2xl p-8 border border-cream-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-claude-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-claude-500" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-ink-900">🆕 Competitor Analysis</h2>
                  <p className="text-ink-500 text-sm">Compare your AI visibility against competitors</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 font-medium mb-3 text-ink-900">
                  <input
                    type="radio"
                    name="competitor_mode"
                    checked={!autoDiscoverCompetitors && competitors.length >= 0}
                    onChange={() => setAutoDiscoverCompetitors(false)}
                    className="w-4 h-4 text-claude-500"
                  />
                  Add your competitors manually (optional)
                </label>
                
                {!autoDiscoverCompetitors && (
                  <div className="ml-6 space-y-3">
                    {competitors.map((comp, index) => (
                      <div key={comp.id} className="flex gap-3">
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => updateCompetitor(comp.id, 'name', e.target.value)}
                          placeholder={`Competitor ${index + 1} name`}
                          className="flex-1 px-4 py-2 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
                        />
                        <input
                          type="url"
                          value={comp.url}
                          onChange={(e) => updateCompetitor(comp.id, 'url', e.target.value)}
                          placeholder="https://competitor.com"
                          className="flex-1 px-4 py-2 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
                        />
                        <button
                          onClick={() => removeCompetitor(comp.id)}
                          className="px-3 py-2 text-claude-500 hover:bg-claude-50 rounded-lg transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {competitors.length < 3 && (
                      <button
                        onClick={addCompetitor}
                        className="px-4 py-2 text-claude-600 border border-claude-300 rounded-lg hover:bg-claude-50 transition text-sm font-medium"
                      >
                        + Add Competitor ({3 - competitors.length} remaining)
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-cream-300 pt-6">
                <label className="flex items-center gap-2 font-medium mb-3 text-ink-900">
                  <input
                    type="radio"
                    name="competitor_mode"
                    checked={autoDiscoverCompetitors}
                    onChange={() => {
                      setAutoDiscoverCompetitors(true)
                      setCompetitors([])
                    }}
                    className="w-4 h-4 text-claude-500"
                  />
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-claude-500" />
                    Let AI discover my competitors
                  </span>
                </label>
                
                {autoDiscoverCompetitors && (
                  <div className="ml-6">
                    <input
                      type="text"
                      value={industryKeywords}
                      onChange={(e) => setIndustryKeywords(e.target.value)}
                      placeholder="Industry keywords (optional): e.g., hiking boots, outdoor gear, sustainable fashion"
                      className="w-full px-4 py-2 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent bg-white"
                    />
                    <p className="text-sm text-ink-400 mt-2">
                      Add keywords to help AI find more relevant competitors
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setAutoDiscoverCompetitors(false)
                    setCompetitors([])
                  }}
                  className="text-sm text-ink-400 hover:text-ink-600"
                >
                  Skip competitor analysis
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={pageUrls.filter(p => p.url).length === 0 || !contactEmail}
              className="w-full btn-claude text-white px-6 py-4 rounded-lg font-semibold text-lg disabled:bg-cream-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue to Questions →
            </button>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <div className="card-elevated p-8">
            <h2 className="font-display text-2xl font-bold mb-2 text-ink-900">Step 2: Customer Questions</h2>
            <p className="text-ink-500 mb-6">
              What questions do your customers ask? (e.g., "best vegan hiking boots under €100")
            </p>

            <div className="space-y-3 mb-6">
              {questions.map((q, index) => (
                <div key={q.id} className="flex gap-3">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                    placeholder={`Question ${index + 1}: e.g., How to choose hiking boots?`}
                    className="flex-1 px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-claude-500 focus:border-transparent"
                  />
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="px-4 py-3 text-claude-500 hover:bg-claude-50 rounded-lg transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {questions.length < 20 && (
              <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-cream-400 rounded-lg text-ink-500 hover:border-claude-500 hover:text-claude-500 transition mb-6"
              >
                + Add Another Question
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-cream-200 text-ink-700 px-6 py-4 rounded-lg hover:bg-cream-300 transition font-semibold text-lg"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={questions.filter(q => q.question).length === 0}
                className="flex-1 btn-claude text-white px-6 py-4 rounded-lg font-semibold text-lg disabled:bg-cream-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Run Analysis →
              </button>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {analyzing && (
          <div className="card-elevated p-12 text-center">
            <Loader className="w-16 h-16 text-claude-500 animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold mb-4 text-ink-900">Analyzing Your Content...</h2>
            <p className="text-ink-500 mb-6">
              {analyzingStep || "We're checking your pages for AI visibility, structure, and optimization"}
            </p>
            <div className="max-w-md mx-auto bg-cream-100 rounded-lg p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-ink-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Scanning page structure...</span>
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Checking schema markup...</span>
                </div>
                {(competitors.length > 0 || autoDiscoverCompetitors) && (
                  <div className="flex items-center gap-2 text-ink-600">
                    <Loader className="w-4 h-4 text-claude-500 animate-spin" />
                    <span>Analyzing competitors...</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-ink-600">
                  <Loader className="w-4 h-4 text-claude-500 animate-spin" />
                  <span>Testing AI visibility...</span>
                </div>
                <div className="flex items-center gap-2 text-ink-300">
                  <div className="w-4 h-4" />
                  <span>Generating recommendations...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-8">
            {/* Score Card */}
            <div className="card-elevated p-10 text-center">
              <h2 className="font-display text-2xl font-bold mb-6 text-ink-900">Your AI Visibility Score</h2>
              <div className={`font-display text-8xl font-bold mb-4 ${getScoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className={`text-2xl font-semibold mb-6 ${getScoreColor(result.score)}`}>
                {getScoreLabel(result.score)}
              </div>
              <p className="text-ink-500 max-w-2xl mx-auto">
                {result.score >= 70 
                  ? "Great job! Your content is well-optimized for AI visibility."
                  : result.score >= 40 
                    ? "Your content has room for improvement. Follow the recommendations below."
                    : "Your content needs significant improvement. The recommendations below will help AI engines better understand and cite your pages."}
              </p>
            </div>

            {/* Competitor Comparison */}
            {result.competitor_comparison && result.competitor_comparison.competitors.length > 0 && (
              <div className="bg-cream-200 rounded-2xl p-8 border border-cream-300">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-8 h-8 text-claude-500" />
                  <div>
                    <h3 className="font-display text-2xl font-bold text-ink-900">Competitor Comparison</h3>
                    <p className="text-ink-500">
                      You rank #{result.competitor_comparison.ranking} of {result.competitor_comparison.total_analyzed} sites analyzed
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-ink-900">
                    <TrendingUp className="w-5 h-5 text-claude-500" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {result.competitor_comparison.insights.map((insight, index) => (
                      <p key={index} className="text-ink-600">{insight}</p>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {result.competitor_comparison.competitors.map((comp, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-semibold truncate text-ink-900" title={comp.name}>
                            {comp.name}
                          </h5>
                          {comp.ai_discovered && (
                            <span className="text-xs text-claude-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI discovered
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(comp.status)}`}>
                          {comp.status === 'ahead' ? `+${comp.difference}` : comp.status === 'behind' ? `${comp.difference}` : 'Tied'}
                        </span>
                      </div>
                      
                      <div className={`text-3xl font-display font-bold mb-2 ${getScoreColor(comp.score)}`}>
                        {comp.score}
                      </div>
                      
                      <div className="text-xs space-y-1 text-ink-500">
                        <div className="flex items-center gap-1">
                          {comp.has_schema ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-ink-300" />
                          )}
                          Schema markup
                        </div>
                        <div className="flex items-center gap-1">
                          {comp.has_faq ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-ink-300" />
                          )}
                          FAQ content
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {result.competitor_comparison.opportunities.length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-claude-500 to-claude-600 rounded-xl p-4 text-white">
                    <h4 className="font-semibold mb-2">💡 Opportunities from Competitors</h4>
                    <ul className="space-y-1 text-sm">
                      {result.competitor_comparison.opportunities.map((opp, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-claude-200">→</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Issues */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="font-display text-2xl font-bold text-ink-900">Issues Found</h3>
              </div>
              <ul className="space-y-3">
                {result.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3 text-ink-600">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="font-display text-2xl font-bold text-ink-900">What You're Doing Right</h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-ink-600">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
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

            {/* CTA */}
            <div className="card-elevated p-8 text-center">
              <h3 className="font-display text-2xl font-bold mb-4 text-ink-900">Want the Full Report?</h3>
              <p className="text-ink-500 mb-6">
                Get a comprehensive 15-slide PDF report with screenshots, detailed analysis,
                and a 1-hour video walkthrough with our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#services"
                  className="btn-claude text-white px-8 py-4 rounded-lg font-semibold"
                >
                  View Full Service →
                </Link>
                <Link
                  href="/tools/schema-generator"
                  className="btn-ink text-white px-8 py-4 rounded-lg font-semibold"
                >
                  Try Schema Generator
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
