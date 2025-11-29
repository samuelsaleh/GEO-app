'use client'

import { useState, useEffect } from 'react'
import { 
  Search, ArrowLeft, ArrowRight, Loader, CheckCircle, XCircle, 
  Sparkles, TrendingUp, Users, Plus, Trash2, Eye, Globe, 
  Building2, Target, Edit2, Check, RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// =============================================================================
// TYPES
// =============================================================================

interface CompetitorInfo {
  name: string
  reason: string
  auto_detected: boolean
}

interface PromptWithCategory {
  prompt: string
  category: string
  topic_cluster?: string
  selected: boolean
}

interface TopicCluster {
  name: string
  category: string
  prompts: PromptWithCategory[]
}

interface BrandProfile {
  brand_name: string
  website_url: string
  industry: string
  products_services: string[]
  value_proposition: string
  target_audience: string
  competitors: CompetitorInfo[]
  suggested_prompts: PromptWithCategory[]
  topic_clusters: TopicCluster[]
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
}

interface TestResult {
  prompt: string
  category: string
  results: MultiModelResponse
}

// =============================================================================
// WIZARD STEPS
// =============================================================================

type WizardStep = 'input' | 'profile' | 'prompts' | 'results'

const STEP_INFO = {
  input: { number: 1, title: 'Brand Info', icon: Globe },
  profile: { number: 2, title: 'Review Profile', icon: Building2 },
  prompts: { number: 3, title: 'Select Prompts', icon: Target },
  results: { number: 4, title: 'Results', icon: TrendingUp }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AIVisibilityTool() {
  // Wizard state
  const [step, setStep] = useState<WizardStep>('input')
  
  // Step 1: Input
  const [brandName, setBrandName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  
  // Step 2: Profile
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [editingIndustry, setEditingIndustry] = useState(false)
  const [tempIndustry, setTempIndustry] = useState('')
  
  // Step 3: Prompts
  const [selectedPrompts, setSelectedPrompts] = useState<PromptWithCategory[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  
  // Step 4: Results
  const [testing, setTesting] = useState(false)
  const [testProgress, setTestProgress] = useState({ current: 0, total: 0 })
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [expandedModel, setExpandedModel] = useState<string | null>(null)

  // =============================================================================
  // STEP 1: Analyze Brand
  // =============================================================================
  
  const analyzeBrand = async () => {
    if (!brandName || !websiteUrl) return
    
    setAnalyzing(true)
    setAnalyzeError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${apiUrl}/api/visibility/analyze-brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          website_url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
          known_competitors: []
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.profile) {
        setProfile(data.profile)
        setSelectedPrompts(data.profile.suggested_prompts.map((p: PromptWithCategory) => ({
          ...p,
          selected: true
        })))
        setStep('profile')
      } else {
        setAnalyzeError(data.error || 'Failed to analyze website')
      }
    } catch (error) {
      console.error('Error analyzing brand:', error)
      setAnalyzeError('Failed to connect to server. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  // =============================================================================
  // STEP 2: Profile Editing
  // =============================================================================
  
  const updateIndustry = () => {
    if (profile && tempIndustry) {
      setProfile({ ...profile, industry: tempIndustry })
    }
    setEditingIndustry(false)
  }
  
  const removeCompetitor = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        competitors: profile.competitors.filter((_, i) => i !== index)
      })
    }
  }
  
  const addCompetitor = (name: string) => {
    if (profile && name.trim()) {
      setProfile({
        ...profile,
        competitors: [...profile.competitors, {
          name: name.trim(),
          reason: 'Added manually',
          auto_detected: false
        }]
      })
    }
  }

  // =============================================================================
  // STEP 3: Prompt Selection
  // =============================================================================
  
  const togglePrompt = (index: number) => {
    setSelectedPrompts(prev => prev.map((p, i) => 
      i === index ? { ...p, selected: !p.selected } : p
    ))
  }
  
  const addCustomPrompt = () => {
    if (customPrompt.trim()) {
      setSelectedPrompts(prev => [...prev, {
        prompt: customPrompt.trim(),
        category: 'custom',
        selected: true
      }])
      setCustomPrompt('')
    }
  }
  
  const removePrompt = (index: number) => {
    setSelectedPrompts(prev => prev.filter((_, i) => i !== index))
  }

  // =============================================================================
  // STEP 4: Run Tests
  // =============================================================================
  
  const runTests = async () => {
    if (!profile) return
    
    const promptsToTest = selectedPrompts.filter(p => p.selected)
    if (promptsToTest.length === 0) return
    
    setTesting(true)
    setTestProgress({ current: 0, total: promptsToTest.length })
    setTestResults([])
    setStep('results')
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const competitorNames = profile.competitors.map(c => c.name)
    
    for (let i = 0; i < promptsToTest.length; i++) {
      const prompt = promptsToTest[i]
      setTestProgress({ current: i + 1, total: promptsToTest.length })
      
      try {
        const response = await fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.prompt,
            brand: profile.brand_name,
            competitors: competitorNames
          })
        })
        
        const data = await response.json()
        
        setTestResults(prev => [...prev, {
          prompt: prompt.prompt,
          category: prompt.category,
          results: data
        }])
      } catch (error) {
        console.error('Error testing prompt:', error)
      }
    }
    
    setTesting(false)
  }

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================
  
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-500'
      case 'anthropic': return 'bg-orange-500'
      case 'google': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recommendation': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'comparison': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'purchase': return 'bg-green-100 text-green-700 border-green-200'
      case 'reputation': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'feature': return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'custom': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      recommendation: '🎯 Recommendations',
      comparison: '⚖️ Comparisons',
      purchase: '🛒 Purchase Intent',
      reputation: '⭐ Reputation',
      feature: '✨ Features',
      custom: '📝 Custom'
    }
    return labels[category] || category
  }
  
  const getOverallScore = () => {
    if (testResults.length === 0) return 0
    const totalMentions = testResults.reduce((acc, r) => acc + r.results.models_mentioning, 0)
    const totalTests = testResults.reduce((acc, r) => acc + r.results.models_tested, 0)
    return totalTests > 0 ? Math.round((totalMentions / totalTests) * 100) : 0
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/tools" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
              <h1 className="text-xl font-bold text-purple-600">Dwight</h1>
            </Link>
            
            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {Object.entries(STEP_INFO).map(([key, info], idx) => {
                const Icon = info.icon
                const isActive = step === key
                const isPast = Object.keys(STEP_INFO).indexOf(step) > idx
                
                return (
                  <div key={key} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition
                      ${isActive ? 'bg-purple-100 text-purple-700' : 
                        isPast ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                      {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      <span className="hidden lg:inline">{info.title}</span>
                    </div>
                    {idx < 3 && <ArrowRight className="w-4 h-4 text-slate-300 mx-1" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* ================================================================= */}
        {/* STEP 1: BRAND INPUT */}
        {/* ================================================================= */}
        {step === 'input' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                AI Visibility Checker
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Enter your brand and website - we'll analyze it and generate smart prompts to test your AI visibility
              </p>
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g., Love Lab, Nike, HubSpot"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g., love-lab.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                
                {analyzeError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    {analyzeError}
                  </div>
                )}
                
                <button
                  onClick={analyzeBrand}
                  disabled={!brandName || !websiteUrl || analyzing}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg transition-all"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing your website...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze My Brand
                    </>
                  )}
                </button>
              </div>
              
              {/* Progress indicator during analysis */}
              {analyzing && (
                <div className="mt-6 space-y-3">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-sm text-slate-500 text-center">
                    Crawling website, extracting business context, generating smart prompts...
                  </p>
                </div>
              )}
            </div>
            
            {/* How it works */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">How it works</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">1. We analyze your website</p>
                    <p className="text-sm text-slate-500">Extract industry, products, competitors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">2. Generate smart prompts</p>
                    <p className="text-sm text-slate-500">Questions customers ask AI</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">3. Test across AI models</p>
                    <p className="text-sm text-slate-500">ChatGPT, Claude, Gemini</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: PROFILE REVIEW */}
        {/* ================================================================= */}
        {step === 'profile' && profile && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review Your Profile</h2>
                <p className="text-slate-500">We analyzed your website. Adjust if needed.</p>
              </div>
              <button
                onClick={() => setStep('input')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
              {/* Brand Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {profile.brand_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{profile.brand_name}</h3>
                  <p className="text-slate-500 text-sm">{profile.website_url}</p>
                </div>
              </div>
              
              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
                {editingIndustry ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempIndustry}
                      onChange={(e) => setTempIndustry(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., luxury jewelry"
                    />
                    <button
                      onClick={updateIndustry}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                      {profile.industry}
                    </span>
                    <button
                      onClick={() => {
                        setTempIndustry(profile.industry)
                        setEditingIndustry(true)
                      }}
                      className="p-2 text-slate-400 hover:text-purple-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Products/Services */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Products & Services</label>
                <div className="flex flex-wrap gap-2">
                  {profile.products_services.map((product, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Value Proposition */}
              {profile.value_proposition && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Value Proposition</label>
                  <p className="text-slate-600 bg-slate-50 rounded-lg p-3 text-sm">
                    {profile.value_proposition}
                  </p>
                </div>
              )}
              
              {/* Competitors */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Competitors to Track
                  <span className="font-normal text-slate-400 ml-2">({profile.competitors.length})</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.competitors.map((comp, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                        ${comp.auto_detected 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
                    >
                      <span>{comp.name}</span>
                      {comp.auto_detected && (
                        <span className="text-xs opacity-60">AI</span>
                      )}
                      <button
                        onClick={() => removeCompetitor(i)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add competitor..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCompetitor((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousSibling as HTMLInputElement
                      addCompetitor(input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => setStep('prompts')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-3 shadow-lg"
            >
              Looks Good, Show Prompts
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: PROMPT SELECTION */}
        {/* ================================================================= */}
        {step === 'prompts' && profile && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Select Prompts to Test</h2>
                <p className="text-slate-500">
                  {selectedPrompts.filter(p => p.selected).length} of {selectedPrompts.length} prompts selected
                </p>
              </div>
              <button
                onClick={() => setStep('profile')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Prompts by Category */}
            {['recommendation', 'comparison', 'purchase', 'reputation', 'feature', 'custom'].map(category => {
              const categoryPrompts = selectedPrompts.filter(p => p.category === category)
              if (categoryPrompts.length === 0) return null
              
              return (
                <div key={category} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-sm font-normal text-slate-400">
                      ({categoryPrompts.filter(p => p.selected).length}/{categoryPrompts.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {categoryPrompts.map((prompt, idx) => {
                      const globalIdx = selectedPrompts.findIndex(p => p.prompt === prompt.prompt)
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer
                            ${prompt.selected 
                              ? 'bg-purple-50 border-purple-200' 
                              : 'bg-slate-50 border-slate-200 opacity-60'}`}
                          onClick={() => togglePrompt(globalIdx)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                            ${prompt.selected 
                              ? 'bg-purple-600 border-purple-600' 
                              : 'border-slate-300'}`}>
                            {prompt.selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="flex-1 text-slate-700">{prompt.prompt}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removePrompt(globalIdx)
                            }}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Add Custom Prompt */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Add Custom Prompt</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter a custom question to test..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomPrompt()}
                />
                <button
                  onClick={addCustomPrompt}
                  disabled={!customPrompt.trim()}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Test Info & Button */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-purple-900">Ready to test</p>
                  <p className="text-sm text-purple-700">
                    {selectedPrompts.filter(p => p.selected).length} prompts × 6 AI models = {' '}
                    <strong>{selectedPrompts.filter(p => p.selected).length * 6} tests</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <span className="text-2xl">🧠</span>
                  <span className="text-2xl">💎</span>
                </div>
              </div>
              <button
                onClick={runTests}
                disabled={selectedPrompts.filter(p => p.selected).length === 0}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-400 flex items-center justify-center gap-3 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Run Visibility Test
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: RESULTS */}
        {/* ================================================================= */}
        {step === 'results' && profile && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Visibility Results</h2>
                <p className="text-slate-500">
                  {testing 
                    ? `Testing prompt ${testProgress.current} of ${testProgress.total}...`
                    : `${testResults.length} prompts tested across 6 AI models`
                  }
                </p>
              </div>
              {!testing && (
                <button
                  onClick={() => setStep('prompts')}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Test Again
                </button>
              )}
            </div>

            {/* Progress during testing */}
            {testing && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                  <div>
                    <p className="font-semibold text-slate-900">Testing your visibility...</p>
                    <p className="text-sm text-slate-500">
                      Prompt {testProgress.current} of {testProgress.total}
                    </p>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Overall Score */}
            {!testing && testResults.length > 0 && (
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <p className="text-purple-200 mb-2">Overall Visibility Score</p>
                  <div className={`text-6xl font-bold mb-2 ${
                    getOverallScore() >= 50 ? 'text-green-300' :
                    getOverallScore() >= 20 ? 'text-yellow-300' : 'text-red-300'
                  }`}>
                    {getOverallScore()}%
                  </div>
                  <p className="text-purple-200">
                    {profile.brand_name} mentioned in {' '}
                    {testResults.reduce((acc, r) => acc + r.results.models_mentioning, 0)} of {' '}
                    {testResults.reduce((acc, r) => acc + r.results.models_tested, 0)} AI responses
                  </p>
                </div>
              </div>
            )}

            {/* Results by Prompt */}
            {testResults.map((result, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(result.category)}`}>
                        {result.category}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">{result.prompt}</p>
                  </div>
                  <div className={`text-2xl font-bold ${
                    result.results.mention_rate >= 50 ? 'text-green-600' :
                    result.results.mention_rate >= 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.results.mention_rate.toFixed(0)}%
                  </div>
                </div>
                
                {/* Model Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {result.results.results.map((modelResult, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-3 rounded-xl border cursor-pointer transition
                        ${modelResult.brand_mentioned 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'}
                        ${expandedModel === `${idx}-${mIdx}` ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setExpandedModel(
                        expandedModel === `${idx}-${mIdx}` ? null : `${idx}-${mIdx}`
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{modelResult.icon}</span>
                          <span className="font-medium text-sm text-slate-700">
                            {modelResult.model_name}
                          </span>
                        </div>
                        {modelResult.brand_mentioned ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className={`text-xs ${
                        modelResult.brand_mentioned ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {modelResult.brand_mentioned 
                          ? `Mentioned${modelResult.position ? ` #${modelResult.position}` : ''}`
                          : 'Not mentioned'
                        }
                      </p>
                      
                      {/* Expanded Response */}
                      {expandedModel === `${idx}-${mIdx}` && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {modelResult.response_preview}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
