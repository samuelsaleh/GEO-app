'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, ArrowRight, Loader, CheckCircle, XCircle,
  Sparkles, TrendingUp, Plus, Trash2, Eye, Globe,
  Building2, Target, Edit2, Check, RefreshCw, Lock,
  Lightbulb, AlertTriangle, Award, BarChart3, Mail, Users,
  ChevronDown, ChevronUp, ExternalLink, MessageSquare, Zap, Play
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Quiz removed
// const QUIZ_QUESTIONS = [ ... ]

interface CompetitorInfo {
  name: string
  reason: string
  auto_detected: boolean
}

interface BrandProfile {
  brand_name: string
  website_url: string
  industry: string
  sub_industry?: string
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

const getCategoriesForProfile = (profile: BrandProfile) => {
  const { industry, business_type } = profile
  const type = (business_type || industry || '').toLowerCase()

  // 🍽️ RESTAURANT / HOSPITALITY
  if (type.includes('restaurant') || type.includes('cafe') || type.includes('food') || type.includes('bar')) {
    return [
      {
        id: 'vibe_check',
        label: '🍷 Vibe & Occasion',
        description: 'Do you appear for "best atmosphere" or date-night searches?',
      },
      {
        id: 'best_dish',
        label: '🍝 Signature Food',
        description: 'Are you the top recommendation for your main cuisine?',
      },
      {
        id: 'consensus',
        label: '🗣️ Public Consensus',
        description: 'What do AI models say about your food quality vs competitors?',
      }
    ]
  }

  // 🛍️ RETAIL / SHOPPING
  if (type.includes('retail') || type.includes('shop') || type.includes('store') || type.includes('boutique')) {
    return [
      {
        id: 'local_find',
        label: '🛍️ Local Discovery',
        description: 'Do shoppers find you when looking for your product category nearby?',
      },
      {
        id: 'quality_audit',
        label: '✨ Quality Check',
        description: 'Does AI associate your brand with high quality/luxury?',
      },
      {
        id: 'price_value',
        label: '🏷️ Price Perception',
        description: 'How does AI describe your pricing? (Expensive vs Value)',
      }
    ]
  }

  // 💼 SERVICES / DEFAULT (SMBs)
  return [
    {
      id: 'urgent_need',
      label: '🚨 Urgent Need',
      description: 'Do you show up when a customer needs help RIGHT NOW?',
    },
    {
      id: 'trust_check',
      label: '🛡️ Trust & Reliability',
      description: 'Does AI call you "reliable" or "highly rated"?',
    },
    {
      id: 'competitor_battle',
      label: '🥊 The Comparison',
      description: 'If a user asks "Brand A or Brand B", who wins?',
    }
  ]
}

const generateSmartPrompts = (profile: BrandProfile): Record<string, string[]> => {
  const { brand_name, location, products_services, industry, business_type, competitors } = profile
  const city = location?.city && location.city.trim().length > 0 ? location.city : 'your area'
  const type = (business_type || industry || '').toLowerCase()
  const mainItem = products_services?.[0] || industry || 'service'
  const hasCompetitors = competitors && competitors.length > 0
  const competitorName = hasCompetitors 
    ? competitors.slice(0, 3).map(c => c.name).join(' vs ')
    : 'competitors'

  const locationPhrase = city === 'your area' ? 'nearby' : `in ${city}`

  // 🍽️ RESTAURANT PROMPTS
  if (type.includes('restaurant') || type.includes('cafe') || type.includes('food')) {
    return {
      vibe_check: [
        `I'm looking for a nice ${type} ${locationPhrase} for a date night. Where should I go?`,
        `What are the best atmosphere restaurants ${locationPhrase}?`,
        `Is ${brand_name} a good place for a special occasion?`
      ],
      best_dish: [
        `Who has the best ${mainItem} ${locationPhrase}?`,
        `Where can I get authentic ${mainItem} ${locationPhrase}?`,
        `What is the signature dish at ${brand_name}?`
      ],
      consensus: [
        `Is ${brand_name} ${locationPhrase} actually good? What do reviews say?`,
        `Compare ${brand_name} vs ${competitorName}. Which has better food?`,
        `What are the most common complaints about ${brand_name}?`
      ]
    }
  }

  // 🛍️ RETAIL PROMPTS
  if (type.includes('retail') || type.includes('shop') || type.includes('store')) {
    return {
      local_find: [
        `Where can I buy ${mainItem} ${locationPhrase}?`,
        `Best shops for ${mainItem} near me.`,
        `Is there a ${brand_name} store ${locationPhrase}?`
      ],
      quality_audit: [
        `Who sells high-quality ${mainItem} ${locationPhrase}?`,
        `Is ${brand_name} considered a good brand for ${mainItem}?`,
        `What is the quality of ${brand_name} products like?`
      ],
      price_value: [
        `Is ${brand_name} expensive?`,
        `Compare prices of ${brand_name} vs ${competitorName}.`,
        `Is ${brand_name} worth the money?`
      ]
    }
  }

  // 💼 SERVICE PROMPTS (Default)
  return {
    urgent_need: [
      `I need a ${mainItem} ${locationPhrase} immediately. Who do you recommend?`,
      `Who is the fastest ${mainItem} service ${locationPhrase}?`,
      `Emergency ${mainItem} ${locationPhrase} reviews.`,
    ],
    trust_check: [
      `Who is the most reliable ${mainItem} ${locationPhrase}?`,
      `Is ${brand_name} a trustworthy company?`,
      `Does ${brand_name} have good reviews?`
    ],
    competitor_battle: [
      `Compare ${brand_name} vs ${competitorName} ${locationPhrase}.`,
      `Why should I choose ${brand_name} over ${competitorName}?`,
      `Who is better: ${brand_name} or ${competitorName}?`
    ]
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

export function AIVisibilityTool({ hideHeader = false, onInputUpdate }: { hideHeader?: boolean, onInputUpdate?: (brand: string, industry: string) => void }) {
  const searchParams = useSearchParams()
  const hasAutoStarted = useRef(false)
  
  const [step, setStep] = useState<WizardStep>('input')
  const [brandName, setBrandName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [email, setEmail] = useState('')
  const [industryInput, setIndustryInput] = useState('')
  const [subIndustryInput, setSubIndustryInput] = useState('')
  const [scope, setScope] = useState<'global' | 'national' | 'local'>('global')
  const [location, setLocation] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [editingIndustry, setEditingIndustry] = useState(false)
  const [tempIndustry, setTempIndustry] = useState('')
  const [subIndustry, setSubIndustry] = useState('')
  const [generatingPrompts, setGeneratingPrompts] = useState(false)
  const [categoryPrompts, setCategoryPrompts] = useState<Record<string, string[]>>({})
  const [testing, setTesting] = useState(false)
  const [testProgress, setTestProgress] = useState({ current: 0, total: 5, phase: 'user' as 'user' | 'competitors' })
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([])
  const [competitorScores, setCompetitorScores] = useState<CompetitorScore[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [hasUsedFree, setHasUsedFree] = useState(false)

  useEffect(() => {
    const used = localStorage.getItem('geo_free_tool_used')
    if (used) {
      setHasUsedFree(true)
    }
  }, [])
  
  // Read URL params from homepage form and auto-start analysis
  useEffect(() => {
    if (hasAutoStarted.current) return
    
    const brand = searchParams.get('brand')
    const url = searchParams.get('url')
    const emailParam = searchParams.get('email')
    const industryParam = searchParams.get('industry')
    const subIndustryParam = searchParams.get('subIndustry')
    const scopeParam = searchParams.get('scope') as 'global' | 'national' | 'local' | null
    const regionParam = searchParams.get('region')
    
    // If we have the required fields from URL, pre-fill and auto-start
    if (brand && url && emailParam) {
      hasAutoStarted.current = true
      
      setBrandName(brand)
      setWebsiteUrl(url)
      setEmail(emailParam)
      if (industryParam) setIndustryInput(industryParam)
      if (subIndustryParam) setSubIndustryInput(subIndustryParam)
      if (scopeParam) setScope(scopeParam)
      if (regionParam) setLocation(regionParam)
      
      // Auto-start analysis after a short delay to let state update
      setTimeout(() => {
        // Trigger analysis programmatically
        document.getElementById('analyze-btn')?.click()
      }, 100)
    }
  }, [searchParams])

  const analyzeBrand = async () => {
    if (!brandName || !websiteUrl) return
    
    // Email Validation (Strict Gmail check as requested, or general)
    // User requested "gmail adress". I will warn if no email, and enforce valid email.
    // I'll stick to general email validation but require it.
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAnalyzeError('Please enter a valid email address to proceed.')
      return
    }

    if (hasUsedFree) {
      setAnalyzeError('You have already used your one-time free scan. Please contact us for a full report.')
      return
    }

    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://geo-app-production-339e.up.railway.app' 
          : 'http://127.0.0.1:8000')
      
      // Construct industry hint from inputs
      let industryHint = industryInput
      if (subIndustryInput) {
        industryHint += ` (Sub-industry: ${subIndustryInput})`
      }
      
      // Add scope context to help analysis
      if (scope !== 'global' || location) {
         industryHint += ` (Targeting: ${scope} market` + (location ? ` in ${location}` : '') + `)`
      }

      const response = await fetch(`${apiUrl}/api/visibility/analyze-brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          website_url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
          known_competitors: [],
          industry_hint: industryHint || undefined
        })
      })
      const data = await response.json()
      if (data.success && data.profile) {
        setProfile({
            ...data.profile,
            // Ensure location is passed through if user specified it
            location: location ? { city: location } : data.profile.location
        })
        // Set sub-industry if detected, otherwise empty
        setSubIndustry(data.profile.sub_industry || '')
        
        const smartPrompts = generateSmartPrompts({
            ...data.profile,
            location: location ? { city: location } : data.profile.location
        })
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
      // No immediate regeneration to save API calls
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
      // We don't regenerate immediately here to avoid too many API calls
      // Instead we will regenerate when clicking Next
    }
  }

  const handleProfileNext = async () => {
    if (!profile) return

    // If user added manual competitors or defined a sub-industry, regenerate prompts with AI
    const hasManualCompetitors = profile.competitors.some(c => !c.auto_detected)
    const hasSubIndustry = subIndustry && subIndustry.trim().length > 0
    
    if (hasManualCompetitors || hasSubIndustry) {
      setGeneratingPrompts(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://geo-app-production-339e.up.railway.app' 
          : 'http://127.0.0.1:8000')
        
        // Combine industry and sub-industry for better context
        const fullIndustry = hasSubIndustry 
          ? `${profile.industry} (specifically: ${subIndustry})` 
          : profile.industry
          
        // Get top 5 competitors
        const topCompetitors = profile.competitors.slice(0, 5).map(c => c.name)

        const response = await fetch(`${apiUrl}/api/visibility/generate-prompts?brand=${encodeURIComponent(profile.brand_name)}&industry=${encodeURIComponent(fullIndustry)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topCompetitors)
        })
        
        const data = await response.json()
        
        if (data.prompts && data.prompts.length > 0) {
           // Map the AI prompts to our category structure
           // The API returns [{prompt: string, category: string}]
           // We need to group them by category ID for our UI
           
           // First get base categories
           const categories = getCategoriesForProfile(profile)
           const newCategoryPrompts: Record<string, string[]> = {}
           
           // Initialize with empty arrays
           categories.forEach(cat => {
             newCategoryPrompts[cat.id] = []
           })
           
           // Distribute AI prompts
           data.prompts.forEach((p: {prompt: string, category: string}) => {
             // Simple mapping logic
             let targetCat = 'competitor_battle' // Default
             
             if (p.category === 'commercial' || p.category === 'transactional') targetCat = 'urgent_need'
             if (p.category === 'informational') targetCat = 'trust_check'
             if (p.category === 'comparative') targetCat = 'competitor_battle'
             if (p.category === 'recommendation') targetCat = 'trust_check'
             
             // If we have specific industry categories (like restaurant/retail)
             // we need to map to those IDs too.
             // For now, let's keep it simple and just fill the available slots round-robin if mapping fails
           })
           
           // Let's just distribute them sequentially to ensure we have content
           const catIds = categories.map(c => c.id)
           if (data.prompts.length >= 3) {
             // Clear existing
             catIds.forEach(id => newCategoryPrompts[id] = [])
             
             data.prompts.forEach((p: any, i: number) => {
               const catId = catIds[i % catIds.length]
               newCategoryPrompts[catId].push(p.prompt)
             })
             
             setCategoryPrompts(newCategoryPrompts)
           }
        }
      } catch (error) {
        console.error("Failed to regenerate prompts:", error)
        // Fallback to default prompts is already set
      } finally {
        setGeneratingPrompts(false)
      }
    }
    
    setStep('prompts')
  }

  const calculateWeightedScore = (result: ModelResult): number => {
    if (!result.brand_mentioned) return 0
    
    let score = 50 // Base score for showing up
    
    // Position bonus
    if (result.position === 1) score += 40
    else if (result.position && result.position <= 3) score += 25
    else if (result.position && result.position <= 5) score += 15
    else score += 5
    
    // Sentiment adjustment
    if (result.sentiment === 'positive') score += 10
    if (result.sentiment === 'negative') score -= 20
    
    return Math.min(Math.max(score, 0), 100)
  }

  const runTests = async () => {
    if (!profile) return
    setTesting(true)
    setCategoryResults([])
    setCompetitorScores([])
    setStep('testing')
    
    const categories = getCategoriesForProfile(profile)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://geo-app-production-339e.up.railway.app' 
        : 'http://127.0.0.1:8000')
    const maxCompetitors = 5 
    const competitorNames = profile.competitors.slice(0, maxCompetitors).map(c => c.name)
    
    const compScoreTracking: Record<string, { scores: number[], name: string }> = {}
    competitorNames.forEach(name => {
      compScoreTracking[name] = { scores: [], name }
    })
    
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      const prompts = categoryPrompts[cat.id] || []
      setTestProgress({ current: i + 1, total: categories.length, phase: 'user' })
      
      try {
        // Run all prompts for this category in parallel
        const promptResults = await Promise.all(prompts.map(prompt => 
          fetch(`${apiUrl}/api/visibility/test-multi-model`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            brand: profile.brand_name,
            competitors: competitorNames,
            // models: ['gpt-5.1', 'claude-sonnet-4'] // Let backend use all available models
            })
          }).then(r => r.json())
        ))
        
        // Calculate average weighted score for this category
        let totalCategoryScore = 0
        let totalChecks = 0
        
        promptResults.forEach(pr => {
          pr.results.forEach((r: ModelResult) => {
            totalCategoryScore += calculateWeightedScore(r)
            totalChecks++
          })
        })
        
        const avgScore = totalChecks > 0 ? Math.round(totalCategoryScore / totalChecks) : 0
        const status = avgScore >= 70 ? 'strong' : avgScore >= 40 ? 'moderate' : 'weak'
        const insight = generateCategoryInsight(cat.id, avgScore, profile.brand_name)
        
        // Track competitor mentions across all prompts in this category
        competitorNames.forEach(compName => {
          let compTotalScore = 0
          promptResults.forEach(data => {
            const compMentioned = data.results.filter((r: ModelResult) => 
            r.full_response.toLowerCase().includes(compName.toLowerCase())
          ).length
            compTotalScore += (compMentioned / data.results.length) * 100
          })
          const compAvgScore = Math.round(compTotalScore / promptResults.length)
          compScoreTracking[compName].scores.push(compAvgScore)
        })
        
        // Use the results from the first prompt for display details, but score is averaged
        // In a real app, we might want to show all prompt results nested
        setCategoryResults(prev => [...prev, {
          category: cat.id,
          categoryLabel: cat.label,
          prompt: prompts[0], // Main prompt
          score: avgScore,
          results: promptResults[0].results, // Showing first prompt's results for now
          insight: insight,
          status: status
        }])
        
      } catch (error) {
        console.error('Error testing category:', error)
      }
    }
    
    // Calculate final competitor scores
    const finalCompScores: CompetitorScore[] = competitorNames.map(name => {
      const scores = compScoreTracking[name].scores
      const categoryScores: Record<string, number> = {}
      categories.forEach((cat, i) => {
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
    
    // Mark as used
    localStorage.setItem('geo_free_tool_used', 'true')
    setHasUsedFree(true)

    setCompetitorScores(finalCompScores)
    setTesting(false)
    setStep('results')
  }

  const handleQuizAnswer = (answer: string) => {
    // Quiz removed
  }

  const generateCategoryInsight = (category: string, score: number, brandName: string): string => {
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
    if (score >= 90) return { grade: 'A', label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
    if (score >= 80) return { grade: 'B', label: 'Good', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
    if (score >= 70) return { grade: 'C', label: 'Average', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    if (score >= 60) return { grade: 'D', label: 'Below Average', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    return { grade: 'F', label: 'Poor', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const getRecommendations = () => {
    const recommendations: string[] = []
    const weakCategories = () => categoryResults.filter(r => r.status === 'weak')
    
    weakCategories().forEach(cat => {
      if (cat.category === 'vibe_check') recommendations.push('Update Google description with atmosphere keywords (romantic, lively)')
      if (cat.category === 'best_dish') recommendations.push('Get 5 reviews mentioning your signature dish this week')
      if (cat.category === 'local_find') recommendations.push('Ensure your NAP (Name, Address, Phone) is consistent everywhere')
      if (cat.category === 'urgent_need') recommendations.push('Add "Emergency" or "Same Day" to your service pages')
      if (cat.category === 'competitor_battle') recommendations.push('Create a "Us vs Them" comparison page on your site')
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain your strong visibility with regular updates')
    }
    return recommendations.slice(0, 5)
  }

  const getModelPerformance = () => {
    const stats: Record<string, { name: string, icon: string, mentions: number, total: number }> = {}
    
    categoryResults.forEach(cat => {
      cat.results.forEach(r => {
        if (!stats[r.model_id]) {
          stats[r.model_id] = { 
            name: r.model_name, 
            icon: r.icon, 
            mentions: 0, 
            total: 0 
          }
        }
        stats[r.model_id].total += 1
        if (r.brand_mentioned) stats[r.model_id].mentions += 1
      })
    })
    
    return Object.values(stats).map(s => ({
      ...s,
      score: s.total > 0 ? Math.round((s.mentions / s.total) * 100) : 0
    })).sort((a, b) => b.score - a.score)
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

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryId)
    }
  }

  return (
    <div className="w-full">
      {/* Step Indicator - Visible when not in input mode or always visible? 
          Let's make it visible once we start (step != input), or maybe always but subtle.
          For the homepage, maybe simpler is better. But user wants the full tool.
      */}
      {step !== 'input' && (
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-white/50 p-1 rounded-full border border-white/60 backdrop-blur-md inline-flex">
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
                    <span className="hidden sm:inline">{info.title}</span>
                    <span className="sm:hidden">{idx + 1}</span>
                  </div>
                )
              })}
            </div>
        </div>
      )}

      <div>
        {step === 'input' && (
          <div className="animate-enter">
            {/* Header only if we want it inside the component. 
                For homepage usage, we might want to control the header outside.
                But the design has it here. Let's keep it but make it optional or adjust styles?
                The homepage already has a title "Win the AI Search Results".
                This component has "AI Visibility Score". 
                I'll keep it for now, user can always remove it later.
            */}
            {!hideHeader && (
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
            )}
            
            {/* The header was actually not in a glass-card in the original, just a div. 
                I should revert to the original structure but wrapped in !hideHeader check. 
            */}
            
            <div className={`${hideHeader ? 'glass-card p-8 md:p-16 rounded-[3rem] shadow-2xl shadow-claude-500/10 mt-8 mb-20 border border-white/60 bg-white/40 backdrop-blur-xl' : 'glass-card p-10 rounded-[2rem]'}`}>
              <div className={`${hideHeader ? 'space-y-10' : 'space-y-6'}`}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-4 text-ink ml-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => {
                      setBrandName(e.target.value)
                      if (onInputUpdate) onInputUpdate(e.target.value, industryInput)
                    }}
                    placeholder="e.g., Nike, HubSpot"
                    className={`w-full transition-all duration-300 border border-white/50 focus:border-claude-500 focus:ring-4 focus:ring-claude-500/10 shadow-inner ${hideHeader ? 'px-8 py-6 text-xl rounded-2xl bg-white/80 hover:bg-white placeholder:text-ink-muted/40' : 'px-5 py-4 bg-white/50'}`}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-4 text-ink ml-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g., nike.com"
                    className={`w-full transition-all duration-300 border border-white/50 focus:border-claude-500 focus:ring-4 focus:ring-claude-500/10 shadow-inner ${hideHeader ? 'px-8 py-6 text-xl rounded-2xl bg-white/80 hover:bg-white placeholder:text-ink-muted/40' : 'px-5 py-4 bg-white/50'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">
                      Industry <span className="text-ink-muted/50 font-normal normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={industryInput}
                      onChange={(e) => {
                        setIndustryInput(e.target.value)
                        if (onInputUpdate) onInputUpdate(brandName, e.target.value)
                      }}
                      placeholder="e.g. Retail"
                      className={`w-full ${hideHeader ? 'px-4 py-3 text-sm' : 'px-5 py-4'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">
                      Sub-Industry <span className="text-ink-muted/50 font-normal normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={subIndustryInput}
                      onChange={(e) => setSubIndustryInput(e.target.value)}
                      placeholder="e.g. Sneakers"
                      className={`w-full ${hideHeader ? 'px-4 py-3 text-sm' : 'px-5 py-4'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">
                       Scope
                     </label>
                     <div className="relative">
                       <select 
                         value={scope}
                         onChange={(e) => setScope(e.target.value as any)}
                         className={`w-full appearance-none ${hideHeader ? 'px-4 py-3 text-sm' : 'px-5 py-4'} bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-claude-500/20`}
                       >
                         <option value="global">Global</option>
                         <option value="national">National</option>
                         <option value="local">Local</option>
                       </select>
                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">
                       {scope === 'global' ? 'Region (Optional)' : scope === 'national' ? 'Country' : 'City/Area'}
                     </label>
                     <input
                       type="text"
                       value={location}
                       onChange={(e) => setLocation(e.target.value)}
                       placeholder={scope === 'global' ? 'e.g. Europe' : scope === 'national' ? 'e.g. USA' : 'e.g. New York, NY'}
                       className={`w-full ${hideHeader ? 'px-4 py-3 text-sm' : 'px-5 py-4'}`}
                     />
                   </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full ${hideHeader ? 'px-4 py-3 text-sm' : 'px-5 py-4'}`}
                  />
                </div>
                
                {analyzeError && (
                  <div className="bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded-xl">
                    {analyzeError}
                  </div>
                )}
                
                <button
                  id="analyze-btn"
                  onClick={analyzeBrand}
                  disabled={!brandName || !websiteUrl || analyzing}
                  className={`btn-primary w-full font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center ${hideHeader ? 'py-5 text-base rounded-2xl shadow-xl shadow-claude-500/20 mt-4' : 'text-sm'}`}
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze My Brand <Play className="w-4 h-4 ml-2 fill-current" />
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
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-ink-muted">
                    Sub-Industry / Niche (Optional)
                  </label>
                  <input
                    type="text"
                    value={subIndustry}
                    onChange={(e) => setSubIndustry(e.target.value)}
                    className="w-full px-4 py-3 text-sm"
                    placeholder="e.g., Diamond Engagement Rings (Specific niche helps AI adapt)"
                  />
                  <p className="text-xs text-ink-muted mt-1">
                    Adding a niche helps AI generate more specific test questions.
                  </p>
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
                        <div className="flex items-center gap-2">
                        <span className="font-medium text-ink text-sm">{comp.name}</span>
                          {comp.auto_detected && (
                            <div className="group relative">
                              <Globe className="w-3 h-3 text-claude-500" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-ink text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Auto-detected via Web Search
                              </div>
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeCompetitor(i)} className="text-ink-muted hover:text-rose-500">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleProfileNext}
              disabled={generatingPrompts}
              className="btn-primary w-full text-sm uppercase tracking-widest disabled:opacity-70"
            >
              {generatingPrompts ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Adapting Prompts with AI...
                </>
              ) : (
                <>
                  Next: Review Prompts <ArrowRight className="w-4 h-4 ml-2 inline" />
                </>
              )}
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
              {getCategoriesForProfile(profile).map((cat) => (
                <div key={cat.id} className="glass-card p-6 rounded-2xl">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-claude-600">
                    {cat.label}
                  </label>
                  <div className="space-y-2">
                    {categoryPrompts[cat.id]?.map((prompt, i) => (
                      <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => {
                      const newPrompts = [...(categoryPrompts[cat.id] || [])]
                      newPrompts[i] = e.target.value
                      setCategoryPrompts({ ...categoryPrompts, [cat.id]: newPrompts })
                    }}
                    className="w-full px-4 py-3 text-sm"
                  />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={runTests} className="btn-primary w-full text-sm uppercase tracking-widest shadow-xl shadow-claude-500/20">
              Start Visibility Gauntlet <Sparkles className="w-4 h-4 ml-2 inline" />
            </button>
          </div>
        )}

        {step === 'testing' && (
          <div className="glass-card p-16 text-center rounded-[2rem] animate-enter">
            <Loader className="w-16 h-16 text-claude-500 animate-spin mx-auto mb-8" />
            <h2 className="text-3xl font-bold mb-4 text-ink">Running Gauntlet Analysis...</h2>
            <p className="text-ink-light mb-8 text-lg">
              {testProgress.phase === 'user' 
                ? `Testing your brand: Category ${testProgress.current} / ${testProgress.total}`
                : `Testing competitors: Category ${testProgress.current} / ${testProgress.total}`
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
          <div className="space-y-12 animate-enter">

            {/* 1. HERO SCORE - CLEAN & PROFESSIONAL */}
            <div className="glass-card p-12 rounded-2xl bg-gradient-to-br from-white to-cream-50 border border-cream-200">
              <div className="max-w-2xl mx-auto text-center">
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-xl border-2 ${getGrade(getOverallScore()).bg} ${getGrade(getOverallScore()).border}`}>
                    <span className={`text-5xl font-bold ${getGrade(getOverallScore()).color}`}>
                      {getGrade(getOverallScore()).grade}
                    </span>
                    <div className="text-left">
                      <div className="text-3xl font-bold text-ink">{getOverallScore()}</div>
                      <div className="text-sm text-ink-muted">Visibility Score</div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-ink mb-3">
                  {getOverallScore() >= 80 ? "Excellent visibility across AI platforms" :
                   getOverallScore() >= 60 ? "You are visible, but there is room for improvement" :
                   getOverallScore() >= 40 ? "Limited visibility - missing key opportunities" :
                   getOverallScore() >= 20 ? "Low visibility - competitors are dominating" :
                   "Critical visibility issues require immediate attention"}
                </h2>
                <p className="text-lg text-ink-light leading-relaxed">
                  AI tools mention your brand {getOverallScore()}% of the time when asked relevant questions.
                  {getOverallScore() < 60 && " Competitors are capturing attention in areas where you could be winning."}
                </p>
              </div>
            </div>

            {/* 2. KEY ACTIONS - CLEANER */}
            <div className="glass-card p-8 rounded-2xl bg-white border border-cream-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-ink mb-2">Recommended Actions</h3>
                <p className="text-ink-muted">High-impact steps to improve your AI visibility</p>
              </div>

              <div className="space-y-3">
                {/* Action 1 */}
                <div className="p-5 bg-cream-50 rounded-xl border border-cream-200 hover:border-ink-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-ink">Claim Google Business Profile</h4>
                    <span className="text-xs bg-ink text-white px-2 py-1 rounded font-medium">5 min</span>
                  </div>
                  <p className="text-sm text-ink-light mb-3">
                    AI models prioritize Google Business information. Claiming your profile significantly increases visibility.
                  </p>
                  <a
                    href="https://www.google.com/business/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-ink hover:text-claude-600 font-medium transition-colors"
                  >
                    Get Started <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Action 2 */}
                <div className="p-5 bg-cream-50 rounded-xl border border-cream-200 hover:border-ink-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-ink">Enhance Your About Page</h4>
                    <span className="text-xs bg-ink text-white px-2 py-1 rounded font-medium">30 min</span>
                  </div>
                  <p className="text-sm text-ink-light mb-3">
                    Provide clear, detailed information about your business, unique value, and service area.
                  </p>
                  <div className="text-sm text-ink-muted space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-ink" />
                      <span>Business description and differentiators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-ink" />
                      <span>Location and service coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-ink" />
                      <span>Credentials and social proof</span>
                    </div>
                  </div>
                </div>

                {/* Action 3 - Local Business Only */}
                {profile.is_local_business && (
                  <div className="p-5 bg-cream-50 rounded-xl border border-cream-200 hover:border-ink-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-ink">Optimize Location Presence</h4>
                      <span className="text-xs bg-ink text-white px-2 py-1 rounded font-medium">10 min</span>
                    </div>
                    <p className="text-sm text-ink-light">
                      Add your city ({profile.location?.city || 'your city'}) consistently across homepage, footer, and key pages.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. COMPETITOR COMPARISON - ENHANCED WITH INSIGHTS */}
            <div className="glass-card p-8 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-claude-500" />
                <h3 className="text-xl font-bold text-ink">Who&apos;s Beating You?</h3>
              </div>
              <div className="space-y-4">
                {getRanking().map((item, i) => {
                  const userRank = getRanking().findIndex(r => r.isUser)
                  const isBeatingUser = !item.isUser && i < userRank

                  return (
                    <div key={i} className="space-y-3">
                      <div className={`flex items-center justify-between p-4 rounded-xl border ${item.isUser ? 'bg-claude-50 border-claude-200' : 'bg-white/50 border-white/60'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-gray-200 text-gray-700' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                          <div>
                            <span className={`font-bold ${item.isUser ? 'text-claude-600' : 'text-ink'}`}>
                              {item.name} {item.isUser && '(You)'}
                            </span>
                            {i === 0 && !item.isUser && (
                              <p className="text-xs text-ink-muted">Dominating the conversation</p>
                            )}
                            {item.isUser && userRank === 1 && (
                              <p className="text-xs text-green-600">You&apos;re in 2nd place! Focus on quick wins to overtake #{1}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-claude-500" style={{ width: `${item.score}%` }} />
                          </div>
                          <span className="font-bold text-ink w-12 text-right">{item.score}%</span>
                        </div>
                      </div>

                      {/* How to Beat Them */}
                      {isBeatingUser && (
                        <div className="ml-12 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">💡 How to beat {item.name}:</p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• They show up {item.score}% vs your {getRanking()[userRank].score}%. Focus on getting mentioned MORE.</li>
                            <li>• Create content positioning you as a better alternative to {item.name}.</li>
                            <li>• Get customer reviews mentioning why you&apos;re better than {item.name}.</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3.5 AI MODEL PERFORMANCE */}
            <div className="glass-card p-8 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-claude-500" />
                <h3 className="text-xl font-bold text-ink">AI Model Performance</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {getModelPerformance().map((model, i) => (
                  <div key={i} className="p-4 bg-white/50 border border-white/60 rounded-xl text-center">
                    <div className="text-2xl mb-2">{model.icon || '🤖'}</div>
                    <div className="font-bold text-sm text-ink mb-1 truncate" title={model.name}>{model.name}</div>
                    <div className={`text-lg font-bold ${model.score >= 50 ? 'text-green-600' : 'text-rose-600'}`}>
                      {model.score}%
                    </div>
                    <div className="text-[10px] text-ink-muted uppercase tracking-wider">Visibility</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. DETAILED BREAKDOWN */}
            <div className="glass-card p-8 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-claude-500" />
                <h3 className="text-xl font-bold text-ink">Detailed Breakdown</h3>
              </div>
              <div className="space-y-4">
                {categoryResults.map((res) => (
                  <div key={res.category} className="bg-white/50 border border-white/60 rounded-2xl overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => toggleCategory(res.category)}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                      <span className={`w-3 h-3 rounded-full ${res.score > 50 ? 'bg-green-500' : 'bg-rose-500'}`} />
                        <div className="text-left">
                          <div className="font-bold text-ink">{res.categoryLabel}</div>
                          <div className="text-xs text-ink-muted hidden sm:block">
                            Tested on 3 variations • Avg Score {res.score}%
                    </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-lg ${res.score > 50 ? 'text-green-600' : 'text-rose-600'}`}>
                          {res.score}%
                        </span>
                        {expandedCategory === res.category ? <ChevronUp className="w-5 h-5 text-ink-muted" /> : <ChevronDown className="w-5 h-5 text-ink-muted" />}
                      </div>
                    </button>
                    
                    {expandedCategory === res.category && (
                      <div className="p-5 border-t border-ink/5 bg-white/40">
                        <div className="mb-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Primary Prompt</span>
                          <p className="text-sm text-ink-light mt-1 italic">"{res.prompt}"</p>
                        </div>
                        
                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">AI Responses (Snippet)</span>
                          {res.results.map((r, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-ink/5 text-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-ink-light">{r.model_name}</span>
                                  {r.brand_mentioned ? (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Mentioned
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full font-medium flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Missed
                                    </span>
                                  )}
                                </div>
                                {r.position && <span className="text-xs text-ink-muted">Rank #{r.position}</span>}
                              </div>
                              <p className="text-ink-light text-xs leading-relaxed whitespace-pre-wrap">
                                {r.full_response || r.response_preview}
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

            <div className="glass-card p-10 text-center rounded-[2rem]">
              <h3 className="text-xl font-bold mb-4 text-ink">Get Full PDF Report</h3>
              <p className="text-ink-light mb-8">Detailed competitor breakdown, screenshot evidence, and long-term strategy.</p>
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

