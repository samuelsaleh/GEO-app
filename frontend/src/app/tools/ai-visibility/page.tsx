'use client'

import { useState } from 'react'
import { 
  ArrowLeft, ArrowRight, Loader, CheckCircle, XCircle, 
  Sparkles, TrendingUp, Plus, Trash2, Eye, Globe, 
  Building2, Target, Edit2, Check, RefreshCw, Lock,
  Lightbulb, AlertTriangle, Award, BarChart3, Mail
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

interface BrandProfile {
  brand_name: string
  website_url: string
  industry: string
  products_services: string[]
  value_proposition: string
  target_audience: string
  competitors: CompetitorInfo[]
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

interface CategoryResult {
  category: string
  categoryLabel: string
  prompt: string
  score: number
  results: ModelResult[]
  insight: string
  status: 'strong' | 'moderate' | 'weak'
}

// =============================================================================
// FIXED CATEGORIES (5 required + 2 custom)
// =============================================================================

const FIXED_CATEGORIES = [
  {
    id: 'recommendation',
    label: '🎯 Recommendation',
    description: 'When users ask AI for advice',
    template: 'What {category} do you recommend?',
    example: 'What ticket resale platform do you recommend?'
  },
  {
    id: 'best_of',
    label: '🏆 Best Of',
    description: 'When users search for the best option',
    template: 'What is the best {category} for {use_case}?',
    example: 'What is the best site to buy concert tickets?'
  },
  {
    id: 'comparison',
    label: '⚖️ Comparison',
    description: 'When users compare options',
    template: 'Compare different {category} options',
    example: 'Compare ticket resale websites'
  },
  {
    id: 'problem_solution',
    label: '🔧 Problem/Solution',
    description: 'When users need to solve a problem',
    template: 'How can I {solve_problem}?',
    example: 'How can I find last-minute concert tickets?'
  },
  {
    id: 'alternative',
    label: '🔄 Alternative',
    description: 'When users look for alternatives',
    template: 'What are alternatives to {competitor}?',
    example: 'What are alternatives to StubHub?'
  }
]

// =============================================================================
// WIZARD STEPS
// =============================================================================

type WizardStep = 'input' | 'profile' | 'prompts' | 'testing' | 'results'

const STEP_INFO = {
  input: { number: 1, title: 'Brand Info', icon: Globe },
  profile: { number: 2, title: 'Review Profile', icon: Building2 },
  prompts: { number: 3, title: 'Select Prompts', icon: Target },
  testing: { number: 4, title: 'Testing', icon: Loader },
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
  const [email, setEmail] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  
  // Step 2: Profile
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [editingIndustry, setEditingIndustry] = useState(false)
  const [tempIndustry, setTempIndustry] = useState('')
  
  // Step 3: Prompts (5 fixed + 2 custom)
  const [categoryPrompts, setCategoryPrompts] = useState<Record<string, string>>({})
  const [customPrompt1, setCustomPrompt1] = useState('')
  const [customPrompt2, setCustomPrompt2] = useState('')
  
  // Step 4: Results
  const [testing, setTesting] = useState(false)
  const [testProgress, setTestProgress] = useState({ current: 0, total: 5 })
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

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
        // Generate default prompts based on profile
        generateDefaultPrompts(data.profile)
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
  
  const generateDefaultPrompts = (profile: BrandProfile) => {
    const category = profile.industry || 'this product'
    const competitor = profile.competitors?.[0]?.name || 'the market leader'
    
    setCategoryPrompts({
      recommendation: `What ${category} do you recommend?`,
      best_of: `What is the best ${category}?`,
      comparison: `Compare different ${category} options`,
      problem_solution: `How do I find the best ${category}?`,
      alternative: `What are alternatives to ${competitor}?`
    })
  }

  // =============================================================================
  // STEP 2: Profile Editing
  // =============================================================================
  
  const updateIndustry = () => {
    if (profile && tempIndustry) {
      setProfile({ ...profile, industry: tempIndustry })
      // Regenerate prompts with new industry
      generateDefaultPrompts({ ...profile, industry: tempIndustry })
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
  // STEP 4: Run Tests (2 models only for free tier)
  // =============================================================================
  
  const runTests = async () => {
    if (!profile) return
    
    setTesting(true)
    setTestProgress({ current: 0, total: 5 })
    setCategoryResults([])
    setStep('testing')
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const competitorNames = profile.competitors.map(c => c.name)
    const results: CategoryResult[] = []
    
    // Test each of the 5 fixed categories
    for (let i = 0; i < FIXED_CATEGORIES.length; i++) {
      const category = FIXED_CATEGORIES[i]
      const prompt = categoryPrompts[category.id] || category.template
      
      setTestProgress({ current: i + 1, total: 5 })
      
      try {
        const response = await fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            brand: profile.brand_name,
            competitors: competitorNames,
            models: ['gpt-4o', 'claude-sonnet'] // Only 2 models for free tier
          })
        })
        
        const data: MultiModelResponse = await response.json()
        
        // Calculate score for this category
        const score = Math.round(data.mention_rate)
        const status = score >= 70 ? 'strong' : score >= 40 ? 'moderate' : 'weak'
        const insight = generateCategoryInsight(category.id, score, profile.brand_name)
        
        results.push({
          category: category.id,
          categoryLabel: category.label,
          prompt: prompt,
          score: score,
          results: data.results,
          insight: insight,
          status: status
        })
        
        setCategoryResults([...results])
      } catch (error) {
        console.error('Error testing category:', error)
      }
    }
    
    setTesting(false)
    setStep('results')
  }
  
  const generateCategoryInsight = (category: string, score: number, brandName: string): string => {
    const insights: Record<string, Record<string, string>> = {
      recommendation: {
        strong: `Great! AI actively recommends ${brandName} when users ask for advice.`,
        moderate: `${brandName} is sometimes recommended, but competitors appear more often.`,
        weak: `AI rarely recommends ${brandName}. You need more authoritative content.`
      },
      best_of: {
        strong: `Excellent! ${brandName} is recognized as a top option in "best of" searches.`,
        moderate: `${brandName} appears in some "best of" results but not consistently.`,
        weak: `${brandName} is missing from "best of" queries. Add comparison content.`
      },
      comparison: {
        strong: `${brandName} is well-represented in comparison queries.`,
        moderate: `${brandName} appears in some comparisons. Add more vs-competitor content.`,
        weak: `${brandName} is absent from comparisons. Create detailed comparison pages.`
      },
      problem_solution: {
        strong: `AI connects ${brandName} with solving user problems effectively.`,
        moderate: `${brandName} is sometimes suggested as a solution.`,
        weak: `${brandName} isn't associated with problem-solving. Add how-to guides.`
      },
      alternative: {
        strong: `${brandName} is recommended as an alternative to competitors.`,
        moderate: `${brandName} sometimes appears as an alternative option.`,
        weak: `${brandName} is not suggested as an alternative. Improve competitive positioning.`
      }
    }
    
    const statusKey = score >= 70 ? 'strong' : score >= 40 ? 'moderate' : 'weak'
    return insights[category]?.[statusKey] || `Score: ${score}%`
  }

  // =============================================================================
  // ANALYSIS HELPERS
  // =============================================================================
  
  const getOverallScore = () => {
    if (categoryResults.length === 0) return 0
    const total = categoryResults.reduce((acc, r) => acc + r.score, 0)
    return Math.round(total / categoryResults.length)
  }
  
  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-600' }
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'text-blue-600' }
    if (score >= 40) return { grade: 'C', label: 'Average', color: 'text-yellow-600' }
    if (score >= 20) return { grade: 'D', label: 'Poor', color: 'text-orange-600' }
    return { grade: 'F', label: 'Invisible', color: 'text-red-600' }
  }
  
  const getStrengths = () => {
    return categoryResults.filter(r => r.status === 'strong')
  }
  
  const getWeaknesses = () => {
    return categoryResults.filter(r => r.status === 'weak')
  }
  
  const getRecommendations = () => {
    const recommendations: string[] = []
    const weakCategories = getWeaknesses()
    
    weakCategories.forEach(cat => {
      switch (cat.category) {
        case 'recommendation':
          recommendations.push('Create expert guides and authoritative content to boost recommendations')
          break
        case 'best_of':
          recommendations.push('Add "Best of" comparison articles and customer testimonials')
          break
        case 'comparison':
          recommendations.push('Create detailed vs-competitor comparison pages')
          break
        case 'problem_solution':
          recommendations.push('Publish how-to guides and problem-solving content')
          break
        case 'alternative':
          recommendations.push('Position yourself explicitly as an alternative in your content')
          break
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain your strong visibility with regular content updates')
      recommendations.push('Monitor competitor mentions to stay ahead')
    }
    
    return recommendations.slice(0, 3)
  }
  
  const getScoreInterpretation = (score: number) => {
    if (score >= 80) {
      return "AI actively recommends your brand. You have strong visibility across most query types."
    }
    if (score >= 60) {
      return "Your brand has good visibility but there are gaps. Focus on weak categories to improve."
    }
    if (score >= 40) {
      return "Your brand is moderately visible. AI mentions you sometimes but competitors may appear more often."
    }
    if (score >= 20) {
      return "Your brand has low visibility. AI rarely mentions you. Significant content improvements needed."
    }
    return "Your brand is nearly invisible to AI. Urgent action required to build AI presence."
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const getCategoryColor = (status: string) => {
    switch (status) {
      case 'strong': return 'bg-green-100 border-green-300 text-green-800'
      case 'moderate': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'weak': return 'bg-red-100 border-red-300 text-red-800'
      default: return 'bg-slate-100 border-slate-300 text-slate-800'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'strong': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'weak': return <XCircle className="w-5 h-5 text-red-600" />
      default: return null
    }
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
              <h1 className="text-xl font-bold text-purple-600">Creed</h1>
            </Link>
            
            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-2">
              {['input', 'profile', 'prompts', 'results'].map((key, idx) => {
                const info = STEP_INFO[key as keyof typeof STEP_INFO]
                const Icon = info.icon
                const isActive = step === key || (step === 'testing' && key === 'results')
                const isPast = ['input', 'profile', 'prompts', 'testing', 'results'].indexOf(step) > idx
                
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
                AI Visibility Score
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                See how visible your brand is when people ask AI for recommendations
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
                    placeholder="e.g., viagogo, Nike, HubSpot"
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
                    placeholder="e.g., viagogo.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-slate-400 font-normal">(to receive your report)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
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
                    Crawling website, extracting business context...
                  </p>
                </div>
              )}
            </div>
            
            {/* How it works */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">How we score your visibility</h3>
              <div className="grid md:grid-cols-5 gap-4">
                {FIXED_CATEGORIES.map((cat, i) => (
                  <div key={cat.id} className="text-center">
                    <div className="text-2xl mb-2">{cat.label.split(' ')[0]}</div>
                    <p className="text-xs text-slate-600">{cat.label.split(' ').slice(1).join(' ')}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                We test your brand across 5 key query types to give you a consistent, comparable score
              </p>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry / Category</label>
                {editingIndustry ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempIndustry}
                      onChange={(e) => setTempIndustry(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., ticket resale platform"
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
                <p className="text-xs text-slate-500 mt-1">This will be used in the test prompts</p>
              </div>
              
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
                </div>
              </div>
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => setStep('prompts')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-3 shadow-lg"
            >
              Looks Good, Review Prompts
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: PROMPT REVIEW (5 Fixed Categories) */}
        {/* ================================================================= */}
        {step === 'prompts' && profile && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review Test Prompts</h2>
                <p className="text-slate-500">5 categories for consistent scoring</p>
              </div>
              <button
                onClick={() => setStep('profile')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Fixed Categories */}
            <div className="space-y-4">
              {FIXED_CATEGORIES.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{category.label}</h3>
                      <p className="text-sm text-slate-500">{category.description}</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={categoryPrompts[category.id] || ''}
                    onChange={(e) => setCategoryPrompts({
                      ...categoryPrompts,
                      [category.id]: e.target.value
                    })}
                    placeholder={category.example}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Custom Prompts (Optional) */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-1">Custom Prompts (Optional)</h3>
              <p className="text-sm text-slate-500 mb-4">Add up to 2 custom prompts. These won't affect your main score.</p>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={customPrompt1}
                  onChange={(e) => setCustomPrompt1(e.target.value)}
                  placeholder="Custom prompt 1 (optional)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                />
                <input
                  type="text"
                  value={customPrompt2}
                  onChange={(e) => setCustomPrompt2(e.target.value)}
                  placeholder="Custom prompt 2 (optional)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            {/* Test Info & Button */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-purple-900">Ready to test</p>
                  <p className="text-sm text-purple-700">
                    5 categories × 2 AI models = <strong>10 tests</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-2xl">
                  <span title="GPT-4o">🤖</span>
                  <span title="Claude">🧠</span>
                </div>
              </div>
              <button
                onClick={runTests}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-3 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Run Visibility Test
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: TESTING IN PROGRESS */}
        {/* ================================================================= */}
        {step === 'testing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="text-center mb-8">
                <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Testing Your Visibility</h2>
                <p className="text-slate-500">
                  Testing category {testProgress.current} of {testProgress.total}...
                </p>
              </div>
              
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(testProgress.current / testProgress.total) * 100}%` }}
                />
              </div>
              
              {/* Show results as they come in */}
              <div className="space-y-3">
                {categoryResults.map((result, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${getCategoryColor(result.status)}`}>
                    <span className="font-medium">{result.categoryLabel}</span>
                    <span className="font-bold">{result.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 5: RESULTS & ANALYSIS */}
        {/* ================================================================= */}
        {step === 'results' && profile && categoryResults.length > 0 && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your AI Visibility Report</h2>
                <p className="text-slate-500">{profile.brand_name} • Tested on GPT-4o & Claude</p>
              </div>
              <button
                onClick={() => setStep('prompts')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Test Again
              </button>
            </div>

            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Overall Visibility Score</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-bold">{getOverallScore()}%</span>
                    <span className={`text-3xl font-bold px-3 py-1 rounded-lg bg-white/20`}>
                      {getGrade(getOverallScore()).grade}
                    </span>
                  </div>
                  <p className="text-purple-200 mt-2">{getGrade(getOverallScore()).label}</p>
                </div>
                <div className="text-right">
                  <Award className="w-16 h-16 text-purple-300" />
                </div>
              </div>
            </div>

            {/* Score Interpretation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">What This Means</h3>
                  <p className="text-slate-600">{getScoreInterpretation(getOverallScore())}</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Category Breakdown
              </h3>
              
              <div className="space-y-3">
                {categoryResults.map((result) => (
                  <div 
                    key={result.category}
                    className={`border rounded-xl overflow-hidden cursor-pointer transition ${
                      expandedCategory === result.category ? 'border-purple-300' : 'border-slate-200'
                    }`}
                    onClick={() => setExpandedCategory(
                      expandedCategory === result.category ? null : result.category
                    )}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium text-slate-900">{result.categoryLabel}</p>
                          <p className="text-sm text-slate-500">{result.prompt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(result.status)}`}>
                          {result.score}%
                        </div>
                        <ArrowRight className={`w-4 h-4 text-slate-400 transition ${
                          expandedCategory === result.category ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedCategory === result.category && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                        <p className="text-sm text-slate-600 mb-3">{result.insight}</p>
                        
                        {/* Model Results */}
                        <div className="grid grid-cols-2 gap-2">
                          {result.results.map((modelResult, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-lg text-sm ${
                                modelResult.brand_mentioned 
                                  ? 'bg-green-50 border border-green-200' 
                                  : 'bg-red-50 border border-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{modelResult.icon} {modelResult.model_name}</span>
                                {modelResult.brand_mentioned ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {modelResult.response_preview}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Your Strengths
                </h3>
                {getStrengths().length > 0 ? (
                  <ul className="space-y-2">
                    {getStrengths().map(s => (
                      <li key={s.category} className="text-sm text-green-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {s.categoryLabel} ({s.score}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-700">No strong categories yet. Focus on improving visibility across all areas.</p>
                )}
              </div>
              
              {/* Weaknesses */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Areas to Improve
                </h3>
                {getWeaknesses().length > 0 ? (
                  <ul className="space-y-2">
                    {getWeaknesses().map(w => (
                      <li key={w.category} className="text-sm text-red-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        {w.categoryLabel} ({w.score}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-700">Great job! No critical weaknesses detected.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {getRecommendations().map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Want the Full Picture?</h3>
                  <p className="text-purple-100 mb-4">
                    This free report tested 2 AI models. Upgrade to see:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>All 6 AI models (GPT-4, GPT-4o, Claude, Gemini Pro & Flash, Perplexity)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Competitor ranking - see where you stand vs 10 competitors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Detailed action plan to improve your score</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>PDF report for your team</span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition"
                    >
                      Get Full Report - €97
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <button className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition">
                      <Mail className="w-4 h-4" />
                      Email Me This Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Another Brand */}
            <div className="text-center">
              <button
                onClick={() => {
                  setStep('input')
                  setBrandName('')
                  setWebsiteUrl('')
                  setProfile(null)
                  setCategoryResults([])
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Test Another Brand
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
