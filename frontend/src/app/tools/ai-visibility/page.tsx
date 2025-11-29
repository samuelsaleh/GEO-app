'use client'

import { useState } from 'react'
import { 
  ArrowLeft, ArrowRight, Loader, CheckCircle, XCircle, 
  Sparkles, TrendingUp, Plus, Trash2, Eye, Globe, 
  Building2, Target, Edit2, Check, RefreshCw, Lock,
  Lightbulb, AlertTriangle, Award, BarChart3, Mail, Users
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

// =============================================================================
// FIXED CATEGORIES (5 required + 2 custom)
// =============================================================================

const FIXED_CATEGORIES = [
  {
    id: 'recommendation',
    label: '🎯 Recommendation',
    shortLabel: 'Recommend',
    description: 'When users ask AI for advice',
  },
  {
    id: 'best_of',
    label: '🏆 Best Of',
    shortLabel: 'Best Of',
    description: 'When users search for the best option',
  },
  {
    id: 'comparison',
    label: '⚖️ Comparison',
    shortLabel: 'Compare',
    description: 'When users compare options',
  },
  {
    id: 'problem_solution',
    label: '🔧 Problem/Solution',
    shortLabel: 'Solution',
    description: 'When users need to solve a problem',
  },
  {
    id: 'reputation',
    label: '⭐ Reputation',
    shortLabel: 'Reputation',
    description: 'When users check reviews/quality',
  }
]

// Generate SMART prompts based on business profile
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
  const topCompetitor = competitors?.[0]?.name || 'competitors'
  
  // For LOCAL businesses (restaurants, hotels, stores, etc.)
  if (is_local_business && city) {
    const localType = business_type || industry
    
    return {
      recommendation: `What ${style} ${localType} do you recommend in ${city}?`,
      best_of: `What is the best ${style} ${localType} in ${city}${country ? `, ${country}` : ''}?`,
      comparison: `Compare ${style} ${localType}s in ${city}. Which are the top options?`,
      problem_solution: `I'm looking for a great ${style} experience in ${city}. Where should I go?`,
      reputation: `Is ${brand_name} in ${city} worth visiting? What are people saying about it?`
    }
  }
  
  // For SAAS / Software businesses
  if (industry?.toLowerCase().includes('software') || 
      industry?.toLowerCase().includes('saas') ||
      industry?.toLowerCase().includes('technology')) {
    return {
      recommendation: `What ${mainProduct} do you recommend for ${target_audience || 'businesses'}?`,
      best_of: `What is the best ${mainProduct} solution in ${new Date().getFullYear()}?`,
      comparison: `Compare ${brand_name} vs ${topCompetitor}. Which is better for ${target_audience || 'my needs'}?`,
      problem_solution: `I need ${mainProduct} for my team. What should I consider and which tools are best?`,
      reputation: `Is ${brand_name} reliable? What do users think about their ${mainProduct}?`
    }
  }
  
  // For E-COMMERCE / Retail
  if (industry?.toLowerCase().includes('retail') || 
      industry?.toLowerCase().includes('commerce') ||
      industry?.toLowerCase().includes('fashion')) {
    return {
      recommendation: `What ${style} brands do you recommend for ${target_audience || 'quality products'}?`,
      best_of: `What are the best ${mainProduct} brands to buy from?`,
      comparison: `How does ${brand_name} compare to ${topCompetitor}? Which offers better value?`,
      problem_solution: `I'm looking for high-quality ${mainProduct}. What brands should I consider?`,
      reputation: `Is ${brand_name} a reputable brand? How is their quality and service?`
    }
  }
  
  // For SERVICES (consulting, agencies, etc.)
  if (industry?.toLowerCase().includes('service') || 
      industry?.toLowerCase().includes('consulting') ||
      industry?.toLowerCase().includes('agency')) {
    return {
      recommendation: `What ${mainProduct} provider do you recommend for ${target_audience || 'businesses'}?`,
      best_of: `Who are the best ${mainProduct} companies to work with?`,
      comparison: `Compare ${brand_name} with other ${mainProduct} providers. What are the pros and cons?`,
      problem_solution: `I need help with ${mainProduct}. Which companies are known for excellent results?`,
      reputation: `What's the reputation of ${brand_name}? Do they deliver good results?`
    }
  }
  
  // DEFAULT - Generic but still personalized
  return {
    recommendation: `What ${segment || industry || 'options'} do you recommend? I'm looking for something like ${brand_name}.`,
    best_of: `What is the best ${mainProduct} in the market? How does ${brand_name} compare?`,
    comparison: `Compare different ${industry || 'options'} in this space. Where does ${brand_name} fit?`,
    problem_solution: `I'm looking for ${mainProduct}. What should I know and what are the best options?`,
    reputation: `Is ${brand_name} a good choice? What do people say about them?`
  }
}

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
// COLORS FOR CHART
// =============================================================================

const BRAND_COLORS = {
  user: '#7c3aed',      // Purple for user
  competitors: [
    '#f97316',     // Orange
    '#06b6d4',     // Cyan
    '#10b981',     // Green
    '#f43f5e',     // Rose
    '#8b5cf6',     // Violet
  ]
}

const getCompetitorColor = (index: number): string => {
  return BRAND_COLORS.competitors[index % BRAND_COLORS.competitors.length]
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
  const [testProgress, setTestProgress] = useState({ current: 0, total: 5, phase: 'user' as 'user' | 'competitors' })
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([])
  const [competitorScores, setCompetitorScores] = useState<CompetitorScore[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

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
    // Use the smart prompt generator to create context-aware prompts
    const smartPrompts = generateSmartPrompts(profile)
    setCategoryPrompts(smartPrompts)
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
      // Add user-added competitors at the BEGINNING so they're used for comparison
      setProfile({
        ...profile,
        competitors: [{
          name: name.trim(),
          reason: 'Added manually',
          auto_detected: false
        }, ...profile.competitors]
      })
    }
  }

  // =============================================================================
  // STEP 4: Run Tests (User + 2 Competitors)
  // =============================================================================
  
  const runTests = async () => {
    if (!profile) return
    
    setTesting(true)
    setTestProgress({ current: 0, total: 5, phase: 'user' })
    setCategoryResults([])
    setCompetitorScores([])
    setStep('testing')
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    // Test against up to 5 competitors (free tier: 2, paid: up to 5)
    const maxCompetitors = 5 // Can be changed based on tier
    const competitorNames = profile.competitors.slice(0, maxCompetitors).map(c => c.name)
    const results: CategoryResult[] = []
    
    // Initialize competitor score tracking
    const compScoreTracking: Record<string, { scores: number[], name: string }> = {}
    competitorNames.forEach(name => {
      compScoreTracking[name] = { scores: [], name }
    })
    
    // Test each of the 5 fixed categories for USER
    for (let i = 0; i < FIXED_CATEGORIES.length; i++) {
      const category = FIXED_CATEGORIES[i]
      const prompt = categoryPrompts[category.id] || category.template
      
      setTestProgress({ current: i + 1, total: 5, phase: 'user' })
      
      try {
        const response = await fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            brand: profile.brand_name,
            competitors: competitorNames,
            models: ['gpt-4o', 'claude-sonnet-4'] // Only 2 models for free tier
          })
        })
        
        const data: MultiModelResponse = await response.json()
        
        // Calculate score for this category
        const score = Math.round(data.mention_rate)
        const status = score >= 70 ? 'strong' : score >= 40 ? 'moderate' : 'weak'
        const insight = generateCategoryInsight(category.id, score, profile.brand_name)
        
        // Also check competitor mentions in the responses
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
    
    // Now test competitors directly for more accurate scores
    setTestProgress({ current: 0, total: competitorNames.length, phase: 'competitors' })
    
    for (let c = 0; c < competitorNames.length; c++) {
      const compName = competitorNames[c]
      setTestProgress({ current: c + 1, total: competitorNames.length, phase: 'competitors' })
      
      // Test one prompt for each competitor to get accurate score
      try {
        const response = await fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `What ${profile.industry || 'product'} do you recommend?`,
            brand: compName,
            competitors: [profile.brand_name],
            models: ['gpt-4o', 'claude-sonnet-4']
          })
        })
        
        const data: MultiModelResponse = await response.json()
        
        // Update competitor's recommendation score with accurate data
        compScoreTracking[compName].scores[0] = Math.round(data.mention_rate)
      } catch (error) {
        console.error(`Error testing competitor ${compName}:`, error)
      }
    }
    
    // Calculate final competitor scores
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
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 40) return { grade: 'C', label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score >= 20) return { grade: 'D', label: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { grade: 'F', label: 'Invisible', color: 'text-red-600', bg: 'bg-red-100' }
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
  
  const getRanking = () => {
    const userScore = getOverallScore()
    const allScores = [
      { name: profile?.brand_name || 'You', score: userScore, isUser: true },
      ...competitorScores.map(c => ({ name: c.name, score: c.overallScore, isUser: false }))
    ].sort((a, b) => b.score - a.score)
    
    return allScores
  }
  
  // =============================================================================
  // EMAIL REPORT
  // =============================================================================
  
  const sendEmailReport = async () => {
    if (!email || !profile || categoryResults.length === 0) {
      alert('Please enter your email address in step 1')
      return
    }
    
    setSendingEmail(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      
      const response = await fetch(`${apiUrl}/api/visibility/email-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          brand_name: profile.brand_name,
          overall_score: getOverallScore(),
          grade: getGrade(getOverallScore()).grade,
          category_results: categoryResults.map(r => ({
            category: r.category,
            categoryLabel: r.categoryLabel,
            score: r.score,
            status: r.status,
            insight: r.insight
          })),
          strengths: getStrengths().map(s => ({
            category: s.category,
            categoryLabel: s.categoryLabel,
            score: s.score
          })),
          weaknesses: getWeaknesses().map(w => ({
            category: w.category,
            categoryLabel: w.categoryLabel,
            score: w.score
          })),
          recommendations: getRecommendations()
        })
      })
      
      if (response.ok) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 5000) // Reset after 5 seconds
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
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
                    <p className="text-xs text-slate-600">{cat.shortLabel}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                We test your brand + 2 competitors across 5 key query types
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
                  Competitors to Compare
                  <span className="font-normal text-slate-400 ml-2">(select up to 5 - top ones will be tested)</span>
                </label>
                
                {/* Add competitor input - at the top so user-added appear first */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add your own competitor..."
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
                      const input = (e.currentTarget.previousSibling as HTMLInputElement)
                      if (input.value) {
                        addCompetitor(input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Show local vs international breakdown */}
                {profile.is_local_business && profile.location?.city && (
                  <div className="flex gap-2 mb-3 text-xs">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      🏠 Local ({profile.location.city})
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      🌍 International
                    </span>
                  </div>
                )}
                
                {/* Competitor list - click to select for comparison */}
                <div className="space-y-2 mb-3">
                  {profile.competitors.map((comp, i) => {
                    const isLocal = comp.reason?.includes('🏠 Local') || comp.reason?.includes('local')
                    const isInternational = comp.reason?.includes('🌍 International') || comp.reason?.includes('international')
                    const isSelected = i < Math.min(profile.competitors.length, 5)
                    
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition
                          ${isSelected 
                            ? 'bg-purple-100 border-2 border-purple-400' 
                            : 'bg-slate-50 border border-slate-200 hover:border-purple-300'}`}
                        onClick={() => {
                          if (!isSelected) {
                            // Move this competitor to position 0 (top)
                            const newCompetitors = [...profile.competitors]
                            const [moved] = newCompetitors.splice(i, 1)
                            newCompetitors.unshift(moved)
                            setProfile({ ...profile, competitors: newCompetitors })
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-xs">
                              +
                            </div>
                          )}
                          <div>
                            <span className={`font-medium ${isSelected ? 'text-purple-900' : 'text-slate-700'}`}>
                              {comp.name}
                            </span>
                            <div className="flex gap-1 mt-0.5">
                              {!comp.auto_detected && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">Your pick</span>
                              )}
                              {comp.auto_detected && isLocal && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">🏠 Local</span>
                              )}
                              {comp.auto_detected && isInternational && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">🌍 International</span>
                              )}
                              {comp.auto_detected && !isLocal && !isInternational && (
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">AI found</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isSelected && (
                            <span className="text-xs text-slate-400">Click to add</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeCompetitor(i)
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-slate-500 bg-purple-50 p-2 rounded-lg">
                  💡 <strong>How it works:</strong> We find 3 local competitors (same city/region) + 2 international competitors (global players). 
                  Add your own to prioritize them! Click any competitor to move it up for comparison.
                </p>
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

            {/* Test Info & Button */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-purple-900">Ready to test</p>
                  <p className="text-sm text-purple-700">
                    Testing <strong>{profile.brand_name}</strong> + 2 competitors across 5 categories
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Testing Visibility</h2>
                <p className="text-slate-500">
                  {testProgress.phase === 'user' 
                    ? `Testing your brand: category ${testProgress.current} of ${testProgress.total}...`
                    : `Testing competitors: ${testProgress.current} of ${testProgress.total}...`
                  }
                </p>
              </div>
              
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: testProgress.phase === 'user'
                      ? `${(testProgress.current / testProgress.total) * 70}%`
                      : `${70 + (testProgress.current / testProgress.total) * 30}%`
                  }}
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
                <p className="text-slate-500">{profile.brand_name} vs {competitorScores.length} competitors</p>
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

            {/* COMPETITIVE COMPARISON CHART */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Competitive Comparison
              </h3>
              
              {/* Bar Chart Comparison */}
              <div className="space-y-6">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: BRAND_COLORS.user }} />
                    <span className="text-sm font-medium">{profile.brand_name} (You)</span>
                  </div>
                  {competitorScores.map((comp, i) => (
                    <div key={comp.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getCompetitorColor(i) }} />
                      <span className="text-sm font-medium">{comp.name}</span>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="space-y-4">
                  {FIXED_CATEGORIES.map((cat) => {
                    const userScore = categoryResults.find(r => r.category === cat.id)?.score || 0
                    
                    return (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700">{cat.shortLabel}</span>
                        </div>
                        <div className="space-y-1">
                          {/* User bar */}
                          <div className="flex items-center gap-2">
                            <div className="w-24 text-xs text-slate-500 truncate">{profile.brand_name}</div>
                            <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(userScore, 5)}%`, backgroundColor: BRAND_COLORS.user }}
                              >
                                <span className="text-xs font-bold text-white">{userScore}%</span>
                              </div>
                            </div>
                          </div>
                          {/* Dynamic competitor bars */}
                          {competitorScores.map((comp, i) => {
                            const compScore = comp.categoryScores[cat.id] || 0
                            return (
                              <div key={comp.name} className="flex items-center gap-2">
                                <div className="w-24 text-xs text-slate-500 truncate">{comp.name}</div>
                                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                    style={{ width: `${Math.max(compScore, 5)}%`, backgroundColor: getCompetitorColor(i) }}
                                  >
                                    <span className="text-xs font-bold text-white">{compScore}%</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RANKING TABLE */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Overall Ranking
              </h3>
              <div className="space-y-2">
                {getRanking().map((item, idx) => (
                  <div 
                    key={item.name}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      item.isUser 
                        ? 'bg-purple-50 border-purple-300' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                        idx === 1 ? 'bg-slate-300 text-slate-700' :
                        idx === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.name}
                          {item.isUser && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">YOU</span>}
                        </p>
                        <p className="text-sm text-slate-500">Grade {getGrade(item.score).grade}</p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getGrade(item.score).color}`}>
                      {item.score}%
                    </div>
                  </div>
                ))}
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
                      <span>Full competitor ranking with 10 competitors</span>
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
                    <button 
                      onClick={sendEmailReport}
                      disabled={sendingEmail || emailSent}
                      className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : emailSent ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Email Sent!
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Email Me This Report
                        </>
                      )}
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
                  setCompetitorScores([])
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
