'use client'

import { useState } from 'react'
import { Search, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Link from 'next/link'

interface PageURL {
  url: string
  id: number
}

interface Question {
  question: string
  id: number
}

interface AnalysisResult {
  score: number
  issues: string[]
  strengths: string[]
  recommendations: string[]
}

export default function HealthCheck() {
  const [step, setStep] = useState(1)
  const [pageUrls, setPageUrls] = useState<PageURL[]>([{ url: '', id: 1 }])
  const [questions, setQuestions] = useState<Question[]>([{ question: '', id: 1 }])
  const [contactEmail, setContactEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

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

  const handleSubmit = async () => {
    setAnalyzing(true)

    // Simulate analysis (TODO: Connect to backend)
    setTimeout(() => {
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
      setAnalyzing(false)
      setStep(3)
    }, 3000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Good'
    if (score >= 40) return 'Needs Work'
    return 'Critical'
  }

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
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Visibility Health-Check</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how visible your content is to AI engines like ChatGPT and Bing Chat
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-semibold">Pages</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-semibold">Questions</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-semibold">Results</span>
            </div>
          </div>
        </div>

        {/* Step 1: Page URLs */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Step 1: Your Important Pages</h2>
            <p className="text-gray-600 mb-6">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {pageUrls.length > 1 && (
                    <button
                      onClick={() => removePageUrl(page.id)}
                      className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition"
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
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition mb-6"
              >
                + Add Another Page
              </button>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company or Website Name"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Your Email (for receiving the report)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={pageUrls.filter(p => p.url).length === 0 || !contactEmail}
              className="w-full mt-6 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue to Questions →
            </button>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Step 2: Customer Questions</h2>
            <p className="text-gray-600 mb-6">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition"
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
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition mb-6"
              >
                + Add Another Question
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-300 transition font-semibold text-lg"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={questions.filter(q => q.question).length === 0}
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Run Analysis →
              </button>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {analyzing && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Analyzing Your Content...</h2>
            <p className="text-gray-600 mb-6">
              We're checking your pages for AI visibility, structure, and optimization
            </p>
            <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Scanning page structure...</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Checking schema markup...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                  <span>Testing AI visibility...</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
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
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-6">Your AI Visibility Score</h2>
              <div className={`text-8xl font-bold mb-4 ${getScoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className={`text-2xl font-semibold mb-6 ${getScoreColor(result.score)}`}>
                {getScoreLabel(result.score)}
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your content has significant room for improvement. The recommendations below will help
                AI engines better understand and cite your pages.
              </p>
            </div>

            {/* Issues */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-2xl font-bold">Issues Found</h3>
              </div>
              <ul className="space-y-3">
                {result.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-2xl font-bold">What You're Doing Right</h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-6">🎯 Top 5 Recommendations</h3>
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
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <h3 className="text-2xl font-bold mb-4">Want the Full Report?</h3>
              <p className="text-gray-600 mb-6">
                Get a comprehensive 15-slide PDF report with screenshots, detailed analysis,
                and a 1-hour video walkthrough with our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#services"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  View Full Service →
                </Link>
                <Link
                  href="/tools/schema-generator"
                  className="bg-cyan-600 text-white px-8 py-4 rounded-lg hover:bg-cyan-700 transition font-semibold"
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
