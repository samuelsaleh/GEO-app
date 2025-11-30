'use client'

import { useState } from 'react'
import { 
  ArrowLeft, ArrowRight, Loader, CheckCircle, XCircle, 
  Sparkles, TrendingUp, Plus, Trash2, Eye, Globe, 
  Building2, Target, Edit2, Check, RefreshCw, Lock,
  Lightbulb, AlertTriangle, Award, BarChart3, Mail, Users
} from 'lucide-react'
import Link from 'next/link'

// ... existing interfaces ...
// (I'll keep the logic identical but wrap the UI in the new design system)

interface CompetitorInfo {
  name: string
  reason: string
  auto_detected: boolean
}

interface BrandProfile {
  brand_name: string
  website_url: string
  industry: string
  business_type?: string
  is_local_business?: boolean
  location?: {
    city?: string
    region?: string
    country?: string
  }
  segment?: string
  cuisine_or_style?: string
  positioning?: string
  products_services: string[]
  value_proposition: string
  target_audience: string
  competitors: CompetitorInfo[]
  suggested_prompts?: Array<{
    prompt: string
    category: string
    selected: boolean
  }>
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

interface CompetitorScore {
  name: string
  overallScore: number
  categoryScores: Record<string, number>
  grade: string
}

const FIXED_CATEGORIES = [
  {
    id: 'recommendation',
    label: '🎯 Recommendation',
    shortLabel: 'Recommend',
    description: 'When users ask AI for advice',
    geoStrategy: 'Strategy #1: Turn Questions Into Content',
    geoTip: 'Create FAQ content that mirrors real user questions',
  },
  {
    id: 'best_of',
    label: '🏆 Best Of',
    shortLabel: 'Best Of',
    description: 'When users search for the best option',
    geoStrategy: 'Strategy #3: Topical Authority',
    geoTip: 'Build content clusters to establish expertise',
  },
  {
    id: 'comparison',
    label: '⚖️ Comparison',
    shortLabel: 'Compare',
    description: 'Direct comparison with competitors (includes your brand)',
    geoStrategy: 'Strategy #2: AI-Friendly Structure',
    geoTip: 'Add comparison tables and structured data',
  },
  {
    id: 'alternatives',
    label: '🔄 Alternatives',
    shortLabel: 'Alternatives',
    description: 'Does AI suggest you when comparing competitors?',
    geoStrategy: 'Strategy #4: Brand Mentions AI Trusts',
    geoTip: 'Get cited on authoritative industry sites',
  },
  {
    id: 'problem_solution',
    label: '🔧 Problem/Solution',
    shortLabel: 'Solution',
    description: 'When users need to solve a problem',
    geoStrategy: 'Strategy #1: Turn Questions Into Content',
    geoTip: 'Publish how-to guides with step-by-step solutions',
  },
  {
    id: 'reputation',
    label: '⭐ Reputation',
    shortLabel: 'Reputation',
    description: 'When users check reviews/quality',
    geoStrategy: 'Strategy #4: Brand Mentions AI Trusts',
    geoTip: 'Build reviews across trusted platforms',
  }
]

const generateSmartPrompts = (profile: BrandProfile): Record<string, string> => {
  const { 
    brand_name,
    industry, 
    business_type,
    is_local_business, 
    location, 
    segment, 
    cuisine_or_style,
    products_services,
    target_audience,
    competitors
  } = profile
  
  const city = location?.city || ''
  const country = location?.country || ''
  const style = cuisine_or_style || segment || industry
  const mainProduct = products_services?.[0] || industry
  const year = new Date().getFullYear()
  
  const competitorNames = competitors?.slice(0, 3).map(c => c.name).filter(Boolean) || []
  const competitorList = competitorNames.length > 0 
    ? competitorNames.join(', ') 
    : `leading ${industry || 'options'}`
  
  const allBrands = brand_name 
    ? [brand_name, ...competitorNames].slice(0, 4).join(', ')
    : competitorList
  
  if (is_local_business && city) {
    const localType = business_type || industry
    return {
      recommendation: `What ${style} ${localType} do you recommend in ${city}?`,
      best_of: `What is the best ${style} ${localType} in ${city}${country ? `, ${country}` : ''}?`,
      comparison: `Compare ${allBrands} for ${style} in ${city}. What are the pros and cons of each?`,
      alternatives: `I've heard of ${competitorList} in ${city}. Are there other ${style} ${localType}s I should consider?`,
      problem_solution: `I'm visiting ${city} and want a great ${style} experience. Where should I go?`,
      reputation: `Which ${style} ${localType}s in ${city} have the best reputation and reviews?`
    }
  }
  
  if (industry?.toLowerCase().includes('software') || 
      industry?.toLowerCase().includes('saas') ||
      industry?.toLowerCase().includes('technology')) {
    return {
      recommendation: `What ${mainProduct} do you recommend for ${target_audience || 'businesses'}?`,
      best_of: `What is the best ${mainProduct} solution in ${year}?`,
      comparison: `Compare ${allBrands}. Which ${mainProduct} tool is best and why?`,
      alternatives: `I'm considering ${competitorList}. Are there better ${mainProduct} alternatives I should know about?`,
      problem_solution: `I need ${mainProduct} for my team. What are the top options and what should I consider?`,
      reputation: `Which ${mainProduct} tools have the best reputation for reliability and support?`
    }
  }
  
  if (industry?.toLowerCase().includes('retail') || 
      industry?.toLowerCase().includes('commerce') ||
      industry?.toLowerCase().includes('fashion')) {
    return {
      recommendation: `What ${style} brands do you recommend for ${target_audience || 'quality products'}?`,
      best_of: `What are the best ${mainProduct} brands to buy from in ${year}?`,
      comparison: `Compare ${allBrands}. Which offers the best value for ${mainProduct}?`,
      alternatives: `I like ${competitorList}. What similar ${style} brands should I also check out?`,
      problem_solution: `I'm looking for high-quality ${mainProduct}. What brands should I consider?`,
      reputation: `Which ${style} brands have the best reputation for quality and customer service?`
    }
  }
  
  if (industry?.toLowerCase().includes('service') || 
      industry?.toLowerCase().includes('consulting') ||
      industry?.toLowerCase().includes('agency')) {
    return {
      recommendation: `What ${mainProduct} provider do you recommend for ${target_audience || 'businesses'}?`,
      best_of: `Who are the best ${mainProduct} companies to work with in ${year}?`,
      comparison: `Compare ${allBrands}. What are the pros and cons of each ${mainProduct} provider?`,
      alternatives: `I know about ${competitorList}. Are there other ${mainProduct} providers worth considering?`,
      problem_solution: `I need help with ${mainProduct}. Which companies deliver the best results?`,
      reputation: `Which ${mainProduct} providers have the strongest reputation and client reviews?`
    }
  }
  
  return {
    recommendation: `What ${segment || industry || 'options'} do you recommend?`,
    best_of: `What is the best ${mainProduct} in the market right now?`,
    comparison: `Compare ${allBrands}. What are the key differences and which is best?`,
    alternatives: `I'm looking at ${competitorList}. Are there better alternatives I should consider?`,
    problem_solution: `I'm looking for ${mainProduct}. What are my best options and what should I consider?`,
    reputation: `Which ${industry || mainProduct} brands have the best reputation?`
  }
}

type WizardStep = 'input' | 'profile' | 'prompts' | 'testing' | 'results'

const STEP_INFO = {
  input: { number: 1, title: 'Brand Info', icon: Globe },
  profile: { number: 2, title: 'Review Profile', icon: Building2 },
  prompts: { number: 3, title: 'Select Prompts', icon: Target },
  testing: { number: 4, title: 'Testing', icon: Loader },
  results: { number: 4, title: 'Results', icon: TrendingUp }
}

const BRAND_COLORS = {
  user: '#E97424', // claude-500
  competitors: [
    '#F3A536', // claude-light
    '#5B3A29', // ink
    '#7A5135', // ink-light
    '#A06E4A', // ink-muted
    '#D4C4B0', // cream-500
  ]
}

const getCompetitorColor = (index: number): string => {
  return BRAND_COLORS.competitors[index % BRAND_COLORS.competitors.length]
}

export default function AIVisibilityTool() {
  const [step, setStep] = useState<WizardStep>('input')
  const [brandName, setBrandName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [email, setEmail] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [editingIndustry, setEditingIndustry] = useState(false)
  const [tempIndustry, setTempIndustry] = useState('')
  const [categoryPrompts, setCategoryPrompts] = useState<Record<string, string>>({})
  const [testing, setTesting] = useState(false)
  const [testProgress, setTestProgress] = useState({ current: 0, total: 5, phase: 'user' as 'user' | 'competitors' })
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([])
  const [competitorScores, setCompetitorScores] = useState<CompetitorScore[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // ... Existing API methods (analyzeBrand, runTests, etc.) ...
  // I'll inline them briefly to keep the file complete but focus on the UI update

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
        const smartPrompts = generateSmartPrompts(data.profile)
        setCategoryPrompts(smartPrompts)
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
    const smartPrompts = generateSmartPrompts(profile)
    setCategoryPrompts(smartPrompts)
  }

  const updateIndustry = () => {
    if (profile && tempIndustry) {
      setProfile({ ...profile, industry: tempIndustry })
      generateDefaultPrompts({ ...profile, industry: tempIndustry })
    }
    setEditingIndustry(false)
  }
  
  const removeCompetitor = (index: number) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        competitors: profile.competitors.filter((_, i) => i !== index)
      }
      setProfile(updatedProfile)
      generateDefaultPrompts(updatedProfile)
    }
  }
  
  const addCompetitor = (name: string) => {
    if (profile && name.trim()) {
      const updatedProfile = {
        ...profile,
        competitors: [{
          name: name.trim(),
          reason: 'Added manually',
          auto_detected: false
        }, ...profile.competitors]
      }
      setProfile(updatedProfile)
      generateDefaultPrompts(updatedProfile)
    }
  }

  const runTests = async () => {
    if (!profile) return
    setTesting(true)
    setTestProgress({ current: 0, total: 5, phase: 'user' })
    setCategoryResults([])
    setCompetitorScores([])
    setStep('testing')
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const maxCompetitors = 5 
    const competitorNames = profile.competitors.slice(0, maxCompetitors).map(c => c.name)
    const results: CategoryResult[] = []
    
    const compScoreTracking: Record<string, { scores: number[], name: string }> = {}
    competitorNames.forEach(name => {
      compScoreTracking[name] = { scores: [], name }
    })
    
    for (let i = 0; i < FIXED_CATEGORIES.length; i++) {
      const category = FIXED_CATEGORIES[i]
      const prompt = categoryPrompts[category.id] || ''
      setTestProgress({ current: i + 1, total: 5, phase: 'user' })
      
      try {
        const response = await fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            brand: profile.brand_name,
            competitors: competitorNames,
            models: ['gpt-5.1', 'claude-sonnet-4']
          })
        })
        
        const data: MultiModelResponse = await response.json()
        const score = Math.round(data.mention_rate)
        const status = score >= 70 ? 'strong' : score >= 40 ? 'moderate' : 'weak'
        const insight = generateCategoryInsight(category.id, score, profile.brand_name)
        
        competitorNames.forEach(compName => {
          const compMentioned = data.results.filter(r => 
            r.full_response.toLowerCase().includes(compName.toLowerCase())
          ).length
          const compScore = Math.round((compMentioned / data.results.length) * 100)
          compScoreTracking[compName].scores.push(compScore)
        })
        
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
    
    setTestProgress({ current: 0, total: competitorNames.length, phase: 'competitors' })
    
    for (let c = 0; c < competitorNames.length; c++) {
      const compName = competitorNames[c]
      setTestProgress({ current: c + 1, total: competitorNames.length, phase: 'competitors' })
      try {
        const response = await fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `What ${profile.industry || 'product'} do you recommend?`,
            brand: compName,
            competitors: [profile.brand_name],
            models: ['gpt-5.1', 'claude-sonnet-4']
          })
        })
        const data: MultiModelResponse = await response.json()
        compScoreTracking[compName].scores[0] = Math.round(data.mention_rate)
      } catch (error) {
        console.error(`Error testing competitor ${compName}:`, error)
      }
    }
    
    const finalCompScores: CompetitorScore[] = competitorNames.map(name => {
      const scores = compScoreTracking[name].scores
      const categoryScores: Record<string, number> = {}
      FIXED_CATEGORIES.forEach((cat, i) => {
        categoryScores[cat.id] = scores[i] || 0
      })
      const overall = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0
      
      return {
        name,
        overallScore: overall,
        categoryScores,
        grade: getGrade(overall).grade
      }
    })
    
    setCompetitorScores(finalCompScores)
    setTesting(false)
    setStep('results')
  }

  const generateCategoryInsight = (category: string, score: number, brandName: string): string => {
    // Simple logic for now
    return score >= 70 
      ? `${brandName} is performing strongly in ${category}.`
      : `${brandName} has low visibility in ${category}.`
  }

  const getOverallScore = () => {
    if (categoryResults.length === 0) return 0
    const total = categoryResults.reduce((acc, r) => acc + r.score, 0)
    return Math.round(total / categoryResults.length)
  }
  
  const getGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 40) return { grade: 'C', label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score >= 20) return { grade: 'D', label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { grade: 'F', label: 'Invisible', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const getStrengths = () => categoryResults.filter(r => r.status === 'strong')
  const getWeaknesses = () => categoryResults.filter(r => r.status === 'weak')
  
  const getRecommendations = () => {
    const recommendations: string[] = []
    const weakCategories = getWeaknesses()
    
    weakCategories.forEach(cat => {
      if (cat.category === 'recommendation') recommendations.push('Create expert guides to boost recommendations')
      if (cat.category === 'comparison') recommendations.push('Create detailed vs-competitor comparison pages')
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain your strong visibility with regular updates')
    }
    return recommendations.slice(0, 3)
  }

  const getRanking = () => {
    const userScore = getOverallScore()
    const allScores = [
      { name: profile?.brand_name || 'You', score: userScore, isUser: true },
      ...competitorScores.map(c => ({ name: c.name, score: c.overallScore, isUser: false }))
    ].sort((a, b) => b.score - a.score)
    return allScores
  }

  const sendEmailReport = async () => {
    // Dummy implementation for UI demo
    setSendingEmail(true)
    setTimeout(() => {
      setSendingEmail(false)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen hero-gradient relative">
      <div className="bg-grain" />
      
      <nav className="fixed top-0 w-full z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/tools" className="flex items-center gap-3 text-ink hover:text-claude-500 transition-colors group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-ink/5 group-hover:border-claude-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold">
                dwight
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2 bg-white/50 p-1 rounded-full border border-white/60 backdrop-blur-md">
              {['input', 'profile', 'prompts', 'results'].map((key, idx) => {
                const info = STEP_INFO[key as keyof typeof STEP_INFO]
                const isActive = step === key || (step === 'testing' && key === 'results')
                const isPast = ['input', 'profile', 'prompts', 'testing', 'results'].indexOf(step) > idx
                
                return (
                  <div 
                    key={key} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive ? 'bg-claude-500 text-white shadow-md' : 
                      isPast ? 'text-claude-600 bg-claude-50' : 'text-ink-muted'
                    }`}
                  >
                    {info.title}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 relative z-10">
        
        {step === 'input' && (
          <div className="animate-enter">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm mb-6">
                <Eye className="w-4 h-4 text-claude-500" />
                <span className="text-sm font-medium text-ink-light uppercase tracking-wider">Share of Voice Analysis</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ink tracking-tight">
                AI Visibility Score
              </h1>
              <p className="text-lg text-ink-light max-w-xl mx-auto leading-relaxed">
                See how visible your brand is when people ask AI for recommendations.
              </p>
            </div>

            <div className="glass-card p-10 rounded-[2rem]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g., Nike, HubSpot"
                    className="w-full px-5 py-4"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g., nike.com"
                    className="w-full px-5 py-4"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-5 py-4"
                  />
                </div>
                
                {analyzeError && (
                  <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded-xl">
                    {analyzeError}
                  </div>
                )}
                
                <button
                  onClick={analyzeBrand}
                  disabled={!brandName || !websiteUrl || analyzing}
                  className="btn-primary w-full text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze My Brand <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'profile' && profile && (
          <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink">Review Profile</h2>
              <button
                onClick={() => setStep('input')}
                className="text-sm text-claude-500 hover:underline font-medium"
              >
                Back to Input
              </button>
            </div>

            <div className="glass-card p-8 rounded-[2rem]">
              <div className="flex items-center gap-4 mb-8 border-b border-ink/5 pb-8">
                <div className="w-16 h-16 bg-claude-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {profile.brand_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink">{profile.brand_name}</h3>
                  <p className="text-ink-light text-sm">{profile.website_url}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">Industry</label>
                  {editingIndustry ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempIndustry}
                        onChange={(e) => setTempIndustry(e.target.value)}
                        className="flex-1 px-4 py-2 text-sm"
                        placeholder="e.g., SaaS"
                      />
                      <button onClick={updateIndustry} className="btn-primary py-2 px-4">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-cream-100 rounded-lg text-ink font-medium">
                        {profile.industry}
                      </span>
                      <button onClick={() => { setTempIndustry(profile.industry); setEditingIndustry(true) }} className="text-ink-muted hover:text-claude-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-4 text-ink-muted">
                    Competitors (Top 5)
                  </label>
                  
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add custom competitor..."
                      className="flex-1 px-4 py-3 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') { addCompetitor((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' } }}
                    />
                    <button className="btn-secondary px-4 py-2">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {profile.competitors.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/50 border border-white/60 rounded-xl">
                        <span className="font-medium text-ink text-sm">{comp.name}</span>
                        <button onClick={() => removeCompetitor(i)} className="text-ink-muted hover:text-rose-500">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={() => setStep('prompts')} className="btn-primary w-full text-sm uppercase tracking-widest">
              Next: Review Prompts <ArrowRight className="w-4 h-4 ml-2 inline" />
            </button>
          </div>
        )}

        {step === 'prompts' && profile && (
          <div className="space-y-6 animate-enter">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-ink">Test Prompts</h2>
              <button onClick={() => setStep('profile')} className="text-sm text-claude-500 hover:underline font-medium">Back</button>
            </div>

            <div className="space-y-4">
              {FIXED_CATEGORIES.map((cat) => (
                <div key={cat.id} className="glass-card p-6 rounded-2xl">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-claude-600">
                    {cat.label}
                  </label>
                  <input
                    type="text"
                    value={categoryPrompts[cat.id] || ''}
                    onChange={(e) => setCategoryPrompts({ ...categoryPrompts, [cat.id]: e.target.value })}
                    className="w-full px-4 py-3 text-sm"
                  />
                </div>
              ))}
            </div>

            <button onClick={runTests} className="btn-primary w-full text-sm uppercase tracking-widest shadow-xl shadow-claude-500/20">
              Start Visibility Test <Sparkles className="w-4 h-4 ml-2 inline" />
            </button>
          </div>
        )}

        {step === 'testing' && (
          <div className="glass-card p-16 text-center rounded-[2rem] animate-enter">
            <Loader className="w-16 h-16 text-claude-500 animate-spin mx-auto mb-8" />
            <h2 className="text-3xl font-bold mb-4 text-ink">Running Analysis...</h2>
            <p className="text-ink-light mb-8 text-lg">
              {testProgress.phase === 'user' 
                ? `Testing your brand: Query ${testProgress.current} / ${testProgress.total}`
                : `Testing competitors: Brand ${testProgress.current} / ${testProgress.total}`
              }
            </p>
            <div className="h-2 bg-cream-200 rounded-full overflow-hidden max-w-md mx-auto">
              <div 
                className="h-full bg-claude-500 transition-all duration-500"
                style={{ 
                  width: testProgress.phase === 'user'
                    ? `${(testProgress.current / testProgress.total) * 50}%`
                    : `${50 + (testProgress.current / testProgress.total) * 50}%`
                }}
              />
            </div>
          </div>
        )}

        {step === 'results' && profile && (
          <div className="space-y-8 animate-enter">
            <div className="glass-card p-12 text-center rounded-[2rem] bg-gradient-to-br from-white/80 to-claude-50/30">
              <h2 className="text-2xl font-bold mb-8 text-ink">Overall Visibility Score</h2>
              <div className="flex items-center justify-center gap-6 mb-6">
                <span className="text-8xl font-bold text-claude-600">{getOverallScore()}</span>
                <div className={`text-4xl font-bold px-6 py-2 rounded-xl ${getGrade(getOverallScore()).bg} ${getGrade(getOverallScore()).color}`}>
                  {getGrade(getOverallScore()).grade}
                </div>
              </div>
              <p className="text-ink-light max-w-lg mx-auto">
                {getOverallScore() > 60 ? "Strong visibility! AI models recommend you frequently." : "Visibility is low. Competitors are dominating the AI conversation."}
              </p>
            </div>

            <div className="glass-card p-8 rounded-[2rem]">
              <h3 className="text-xl font-bold mb-6 text-ink">Category Breakdown</h3>
              <div className="space-y-4">
                {categoryResults.map((res) => (
                  <div key={res.category} className="flex items-center justify-between p-4 bg-white/50 border border-white/60 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${res.score > 50 ? 'bg-green-500' : 'bg-rose-500'}`} />
                      <span className="font-medium text-ink">{res.categoryLabel}</span>
                    </div>
                    <span className="font-bold text-ink">{res.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-10 text-center rounded-[2rem]">
              <h3 className="text-xl font-bold mb-4 text-ink">Get Full Report</h3>
              <p className="text-ink-light mb-8">Detailed competitor breakdown and action plan.</p>
              <div className="flex justify-center gap-4">
                <button onClick={sendEmailReport} className="btn-primary text-sm">
                  {sendingEmail ? 'Sending...' : emailSent ? 'Sent!' : 'Email Report'}
                </button>
                <button onClick={() => { setStep('input'); setBrandName('') }} className="btn-secondary text-sm">
                  Test Another Brand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
