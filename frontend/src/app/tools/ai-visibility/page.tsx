'use client'

import { useState } from 'react'
import { Search, ArrowLeft, Loader, CheckCircle, XCircle, Sparkles, TrendingUp, Users, Plus, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface PromptResult {
  prompt: string
  response: string
  brand_mentioned: boolean
  position: number | null
  sentiment: string
  competitors_mentioned: string[]
}

interface ModelResult {
  model_id: string
  model_name: string
  provider: string
  brand_mentioned: boolean
  position: number | null
  sentiment: string
  competitors_mentioned: string[]
  response_preview: string
  full_response: string
  icon: string
}

interface MultiModelResponse {
  prompt: string
  brand: string
  models_tested: number
  models_mentioning: number
  mention_rate: number
  results: ModelResult[]
  summary: any
  chart_data: {
    labels: string[]
    mentioned: number[]
    providers: string[]
  }
}

interface VisibilityReport {
  brand: string
  visibility_score: string
  average_position: string | number
  prompts_tested: number
  times_mentioned: number
  sentiment: string
  top_competitor: string | null
  recommendations: string[]
  full_report: {
    top_competitors: Array<{name: string, mentions: number, rate: number}>
  }
}

export default function AIVisibilityTool() {
  const [brand, setBrand] = useState('')
  const [competitors, setCompetitors] = useState<string[]>([''])
  const [prompts, setPrompts] = useState<string[]>([''])
  const [industry, setIndustry] = useState('jewelry')
  const [loading, setLoading] = useState(false)
  const [loadingPrompt, setLoadingPrompt] = useState<number | null>(null)
  const [results, setResults] = useState<PromptResult[]>([])
  const [report, setReport] = useState<VisibilityReport | null>(null)
  const [mode, setMode] = useState<'single' | 'multi' | 'bulk'>('multi')
  const [singlePrompt, setSinglePrompt] = useState('')
  const [singleResult, setSingleResult] = useState<PromptResult | null>(null)
  const [multiModelResult, setMultiModelResult] = useState<MultiModelResponse | null>(null)
  const [expandedModel, setExpandedModel] = useState<string | null>(null)

  const addPrompt = () => {
    setPrompts([...prompts, ''])
  }

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts]
    newPrompts[index] = value
    setPrompts(newPrompts)
  }

  const removePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index))
  }

  const addCompetitor = () => {
    setCompetitors([...competitors, ''])
  }

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors]
    newCompetitors[index] = value
    setCompetitors(newCompetitors)
  }

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index))
  }

  // Test a single prompt
  const testSinglePrompt = async () => {
    if (!brand || !singlePrompt) return
    
    setLoading(true)
    setSingleResult(null)
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/visibility/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: singlePrompt,
          brand: brand,
          competitors: competitors.filter(c => c.trim()),
          model: 'auto'
        })
      })
      
      const data = await response.json()
      setSingleResult(data)
    } catch (error) {
      console.error('Error testing prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  // Test across all AI models
  const testMultiModel = async () => {
    if (!brand || !singlePrompt) return
    
    setLoading(true)
    setMultiModelResult(null)
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/visibility/test-multi-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: singlePrompt,
          brand: brand,
          competitors: competitors.filter(c => c.trim())
        })
      })
      
      const data = await response.json()
      setMultiModelResult(data)
    } catch (error) {
      console.error('Error testing across models:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-500'
      case 'anthropic': return 'bg-orange-500'
      case 'google': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getProviderBgColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-50 border-green-200'
      case 'anthropic': return 'bg-orange-50 border-orange-200'
      case 'google': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  // Run full visibility check
  const runFullCheck = async () => {
    if (!brand) return
    
    setLoading(true)
    setReport(null)
    setResults([])
    
    try {
      const validPrompts = prompts.filter(p => p.trim())
      const validCompetitors = competitors.filter(c => c.trim())
      
      const response = await fetch('http://127.0.0.1:8000/api/visibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand,
          prompts: validPrompts.length > 0 ? validPrompts : null,
          competitors: validCompetitors,
          industry: industry,
          models: ['auto']
        })
      })
      
      const data = await response.json()
      setReport({
        brand: data.brand,
        visibility_score: `${data.mention_rate.toFixed(0)}%`,
        average_position: data.avg_position > 0 ? data.avg_position : 'Not ranked',
        prompts_tested: data.total_prompts,
        times_mentioned: data.mentions,
        sentiment: Object.entries(data.sentiment_breakdown).reduce((a, b) => 
          (b[1] as number) > (a[1] as number) ? b : a
        )[0],
        top_competitor: data.top_competitors[0]?.name || null,
        recommendations: data.recommendations,
        full_report: data
      })
    } catch (error) {
      console.error('Error running check:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: string) => {
    const num = parseInt(score)
    if (num >= 50) return 'text-green-600'
    if (num >= 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'text-green-600 bg-green-100'
    if (sentiment === 'negative') return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-white to-cream-200">
      {/* Navigation */}
      <nav className="border-b border-cream-300 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/tools" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-ink-500" />
              <h1 className="text-2xl font-display font-bold text-claude-600">
                Dwight
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 text-ink-900">
            AI Visibility Checker
          </h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto">
            Test if your brand appears when people ask AI for recommendations
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-cream-200 rounded-full p-1 flex gap-1">
            <button
              onClick={() => setMode('multi')}
              className={`px-5 py-2 rounded-full font-medium transition text-sm ${
                mode === 'multi' 
                  ? 'bg-white shadow text-ink-900' 
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              🤖 All AI Models
            </button>
            <button
              onClick={() => setMode('single')}
              className={`px-5 py-2 rounded-full font-medium transition text-sm ${
                mode === 'single' 
                  ? 'bg-white shadow text-ink-900' 
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              Single Model
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-5 py-2 rounded-full font-medium transition text-sm ${
                mode === 'bulk' 
                  ? 'bg-white shadow text-ink-900' 
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              Full Report
            </button>
          </div>
        </div>

        {/* Brand Input (shared) */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-ink-900">
            Your Brand
          </h2>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Love Lab, Nike, HubSpot"
            className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Multi-Model Mode */}
        {mode === 'multi' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="font-display text-xl font-bold mb-4 text-ink-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Test Across 6 AI Models
            </h2>
            <p className="text-ink-500 mb-4">
              See how ChatGPT, Claude, and Gemini respond to the same question
            </p>
            
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={singlePrompt}
                onChange={(e) => setSinglePrompt(e.target.value)}
                placeholder="e.g., What are the best jewelry brands for engagement rings?"
                className="flex-1 px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={testMultiModel}
                disabled={!brand || !singlePrompt || loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Test All Models
              </button>
            </div>

            {/* Competitors */}
            <div className="border-t border-cream-200 pt-4">
              <h3 className="font-semibold text-ink-700 mb-3">Track Competitors (optional)</h3>
              <div className="flex flex-wrap gap-2">
                {competitors.map((comp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={comp}
                      onChange={(e) => updateCompetitor(i, e.target.value)}
                      placeholder="Competitor name"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm w-40"
                    />
                    {competitors.length > 1 && (
                      <button onClick={() => removeCompetitor(i)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCompetitor}
                  className="px-3 py-2 border border-dashed border-cream-400 rounded-lg text-ink-500 hover:border-purple-500 hover:text-purple-500 text-sm"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Multi-Model Results */}
            {multiModelResult && (
              <div className="mt-8 border-t border-cream-200 pt-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-bold text-ink-900">
                      Results: "{multiModelResult.prompt}"
                    </h3>
                    <div className={`text-3xl font-bold ${
                      multiModelResult.mention_rate >= 50 ? 'text-green-600' :
                      multiModelResult.mention_rate >= 20 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {multiModelResult.mention_rate.toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-ink-600">
                    <strong>{multiModelResult.brand}</strong> mentioned in{' '}
                    <strong>{multiModelResult.models_mentioning}</strong> of{' '}
                    <strong>{multiModelResult.models_tested}</strong> AI models
                  </p>
                </div>

                {/* Model Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {multiModelResult.results.map((result, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border-2 p-4 transition cursor-pointer ${
                        result.brand_mentioned 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      } ${expandedModel === result.model_id ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setExpandedModel(
                        expandedModel === result.model_id ? null : result.model_id
                      )}
                    >
                      {/* Model Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{result.icon}</span>
                          <div>
                            <div className="font-semibold text-ink-900">{result.model_name}</div>
                            <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getProviderColor(result.provider)} text-white`}>
                              {result.provider}
                            </div>
                          </div>
                        </div>
                        {result.brand_mentioned ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>

                      {/* Status */}
                      <div className={`text-sm font-medium mb-2 ${
                        result.brand_mentioned ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {result.brand_mentioned 
                          ? `✓ Mentioned${result.position ? ` (Position #${result.position})` : ''}`
                          : '✗ Not mentioned'
                        }
                      </div>

                      {/* Competitors */}
                      {result.competitors_mentioned.length > 0 && (
                        <div className="text-xs text-ink-500">
                          Competitors: {result.competitors_mentioned.join(', ')}
                        </div>
                      )}

                      {/* Expanded Response */}
                      {expandedModel === result.model_id && (
                        <div className="mt-3 pt-3 border-t border-cream-300">
                          <div className="text-xs text-ink-400 mb-1">AI Response:</div>
                          <p className="text-sm text-ink-600 leading-relaxed">
                            {result.response_preview}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Provider Summary */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {Object.entries(multiModelResult.summary.by_provider || {}).map(([provider, stats]: [string, any]) => (
                    <div key={provider} className={`rounded-xl p-4 border ${getProviderBgColor(provider)}`}>
                      <div className="font-semibold text-ink-900 capitalize mb-1">{provider}</div>
                      <div className="text-2xl font-bold">
                        {stats.mentioned}/{stats.tested}
                      </div>
                      <div className="text-xs text-ink-500">models mention you</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single Prompt Mode */}
        {mode === 'single' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="font-display text-xl font-bold mb-4 text-ink-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-500" />
              Test a Prompt
            </h2>
            <p className="text-ink-500 mb-4">
              Enter a question your customers might ask AI - we'll check if your brand appears
            </p>
            
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={singlePrompt}
                onChange={(e) => setSinglePrompt(e.target.value)}
                placeholder="e.g., What are the best jewelry brands for engagement rings?"
                className="flex-1 px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={testSinglePrompt}
                disabled={!brand || !singlePrompt || loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Test
              </button>
            </div>

            {/* Competitors for single test */}
            <div className="border-t border-cream-200 pt-4">
              <h3 className="font-semibold text-ink-700 mb-3">Track Competitors (optional)</h3>
              <div className="flex flex-wrap gap-2">
                {competitors.map((comp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={comp}
                      onChange={(e) => updateCompetitor(i, e.target.value)}
                      placeholder="Competitor name"
                      className="px-3 py-2 border border-cream-300 rounded-lg text-sm w-40"
                    />
                    {competitors.length > 1 && (
                      <button onClick={() => removeCompetitor(i)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCompetitor}
                  className="px-3 py-2 border border-dashed border-cream-400 rounded-lg text-ink-500 hover:border-purple-500 hover:text-purple-500 text-sm"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Single Result */}
            {singleResult && (
              <div className="mt-8 border-t border-cream-200 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  {singleResult.brand_mentioned ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-full">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">You're mentioned!</span>
                      {singleResult.position && (
                        <span className="text-sm">Position #{singleResult.position}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100 px-4 py-2 rounded-full">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Not mentioned</span>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(singleResult.sentiment)}`}>
                    {singleResult.sentiment}
                  </span>
                </div>

                {singleResult.competitors_mentioned.length > 0 && (
                  <div className="mb-4">
                    <span className="text-ink-500 text-sm">Competitors mentioned: </span>
                    <span className="font-medium">
                      {singleResult.competitors_mentioned.join(', ')}
                    </span>
                  </div>
                )}

                <div className="bg-cream-50 rounded-xl p-4">
                  <h4 className="font-semibold text-ink-700 mb-2">AI Response:</h4>
                  <p className="text-ink-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {singleResult.response}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk Mode */}
        {mode === 'bulk' && (
          <>
            {/* Industry Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="font-display text-xl font-bold mb-4 text-ink-900">
                Industry
              </h2>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="jewelry">Jewelry</option>
                <option value="saas">SaaS / Software</option>
                <option value="ecommerce">E-commerce</option>
                <option value="default">Other</option>
              </select>
              <p className="text-ink-400 text-sm mt-2">
                We'll use industry-specific prompts if you don't add your own
              </p>
            </div>

            {/* Custom Prompts */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="font-display text-xl font-bold mb-4 text-ink-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-500" />
                Custom Prompts (optional)
              </h2>
              <p className="text-ink-500 mb-4">
                Add questions your customers ask AI. Leave empty to use industry defaults.
              </p>
              
              <div className="space-y-3">
                {prompts.map((prompt, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => updatePrompt(i, e.target.value)}
                      placeholder={`e.g., Best ${industry} brands for beginners`}
                      className="flex-1 px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {prompts.length > 1 && (
                      <button
                        onClick={() => removePrompt(i)}
                        className="px-3 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={addPrompt}
                className="mt-4 w-full py-3 border-2 border-dashed border-cream-400 rounded-lg text-ink-500 hover:border-purple-500 hover:text-purple-500 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Prompt
              </button>
            </div>

            {/* Competitors */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="font-display text-xl font-bold mb-4 text-ink-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Competitors to Track
              </h2>
              
              <div className="space-y-3">
                {competitors.map((comp, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="text"
                      value={comp}
                      onChange={(e) => updateCompetitor(i, e.target.value)}
                      placeholder="Competitor brand name"
                      className="flex-1 px-4 py-3 border border-cream-400 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {competitors.length > 1 && (
                      <button
                        onClick={() => removeCompetitor(i)}
                        className="px-3 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={addCompetitor}
                className="mt-4 w-full py-3 border-2 border-dashed border-cream-400 rounded-lg text-ink-500 hover:border-purple-500 hover:text-purple-500 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Competitor
              </button>
            </div>

            {/* Run Button */}
            <button
              onClick={runFullCheck}
              disabled={!brand || loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Analyzing AI Responses...
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6" />
                  Run Visibility Check
                </>
              )}
            </button>

            {/* Report Results */}
            {report && (
              <div className="mt-12 space-y-8">
                {/* Score Card */}
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                  <h2 className="font-display text-2xl font-bold mb-6 text-ink-900">
                    Your AI Visibility Score
                  </h2>
                  <div className={`font-display text-8xl font-bold mb-4 ${getScoreColor(report.visibility_score)}`}>
                    {report.visibility_score}
                  </div>
                  <p className="text-ink-500 mb-4">
                    You appeared in {report.times_mentioned} of {report.prompts_tested} prompts tested
                  </p>
                  {report.average_position !== 'Not ranked' && (
                    <p className="text-ink-600">
                      Average position when mentioned: <strong>#{report.average_position}</strong>
                    </p>
                  )}
                </div>

                {/* Competitor Comparison */}
                {report.full_report.top_competitors.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="font-display text-xl font-bold mb-6 text-ink-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Competitor Visibility
                    </h3>
                    <div className="space-y-4">
                      {/* Your brand */}
                      <div className="flex items-center gap-4">
                        <div className="w-32 font-semibold text-ink-900">{report.brand}</div>
                        <div className="flex-1 bg-cream-100 rounded-full h-8 overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full flex items-center justify-end pr-3"
                            style={{ width: report.visibility_score }}
                          >
                            <span className="text-white text-sm font-semibold">{report.visibility_score}</span>
                          </div>
                        </div>
                      </div>
                      {/* Competitors */}
                      {report.full_report.top_competitors.map((comp, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-32 font-medium text-ink-600">{comp.name}</div>
                          <div className="flex-1 bg-cream-100 rounded-full h-8 overflow-hidden">
                            <div 
                              className="h-full bg-gray-400 rounded-full flex items-center justify-end pr-3"
                              style={{ width: `${comp.rate}%` }}
                            >
                              <span className="text-white text-sm font-semibold">{comp.rate.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {report.recommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
                    <h3 className="font-display text-xl font-bold mb-4">
                      💡 Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-purple-200">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Example Prompts */}
        <div className="mt-12 bg-cream-100 rounded-2xl p-8">
          <h3 className="font-display text-lg font-bold mb-4 text-ink-900">
            💡 Example Prompts to Test
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "What are the best jewelry brands?",
              "Best engagement ring brands 2025",
              "Where to buy lab-grown diamonds?",
              "Top sustainable jewelry brands",
              "Best jewelry for gifts under €500",
              "Luxury jewelry brands in Europe"
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => {
                  setMode('single')
                  setSinglePrompt(example)
                }}
                className="text-left px-4 py-3 bg-white rounded-lg text-ink-600 hover:bg-purple-50 hover:text-purple-700 transition border border-cream-200"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

