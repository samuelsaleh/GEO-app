import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for analysis
})

// Types for Health Check
export interface CompetitorInput {
  name: string
  url: string
}

export interface HealthCheckRequest {
  company_name: string
  contact_email: string
  page_urls: string[]
  questions: string[]
  competitors?: CompetitorInput[]
  auto_discover_competitors?: boolean
  industry_keywords?: string[]
}

export interface CategoryScore {
  structure: number
  schema: number
  citability: number
  authority: number
  freshness: number
  accessibility: number
}

export interface PageAnalysis {
  url: string
  score: number
  grade: string
  has_schema: boolean
  has_faq: boolean
  readability_score: number
  page_speed: number
  issues: string[]
  strengths: string[]
  category_scores?: CategoryScore
}

export interface CompetitorAnalysis {
  name: string
  url: string
  score: number
  grade: string
  difference: number
  status: 'ahead' | 'behind' | 'tied'
  has_schema: boolean
  has_faq: boolean
  top_strengths: string[]
  ai_discovered: boolean
  discovery_reason?: string
}

export interface CompetitorComparison {
  user_score: number
  user_grade: string
  avg_competitor_score: number
  competitors: CompetitorAnalysis[]
  ranking: number
  total_analyzed: number
  insights: string[]
  opportunities: string[]
  winning_categories: string[]
  losing_categories: string[]
}

export interface HealthCheckResult {
  overall_score: number
  grade: string
  total_pages: number
  pages_analyzed: PageAnalysis[]
  top_issues: string[]
  top_strengths: string[]
  recommendations: string[]
  ai_visibility: Record<string, boolean>
  category_scores?: CategoryScore
  competitor_comparison?: CompetitorComparison
}

// Health Check API
export const healthCheckAPI = {
  analyze: async (data: HealthCheckRequest): Promise<HealthCheckResult> => {
    const response = await api.post('/api/health-check/analyze', data)
    return response.data
  },
  
  discoverCompetitors: async (
    company_name: string,
    website_url: string,
    industry_keywords?: string[]
  ) => {
    const response = await api.post('/api/health-check/discover-competitors', null, {
      params: { company_name, website_url, industry_keywords }
    })
    return response.data
  },
  
  test: async () => {
    const response = await api.get('/api/health-check/test')
    return response.data
  }
}

// Schema Generator API
export const schemaAPI = {
  generate: async (data: {
    schema_type: string
    data: Record<string, any>
  }) => {
    const response = await api.post('/api/schema/generate', data)
    return response.data
  },
}

// Waitlist API
export const waitlistAPI = {
  join: async (email: string) => {
    const response = await api.post('/api/waitlist/join', { email })
    return response.data
  },
}

// Contact API
export const contactAPI = {
  submit: async (data: {
    name: string
    email: string
    company?: string
    service: string
    message: string
  }) => {
    const response = await api.post('/api/contact/submit', data)
    return response.data
  },
}

// =============================================================================
// AI VISIBILITY SCORE API - THE KILLER FEATURE
// =============================================================================

export interface ScoreRequest {
  brand: string
  category: string
  website_url?: string
  location?: string
  custom_questions?: string[]
}

export interface ModelResult {
  model_id: string
  model_name: string
  provider: string
  mentioned: boolean
  position: number | null
  sentiment: string
  competitors_found: string[]
  killer_quote: string | null
  full_response: string
  response_time_ms: number
  prompt: string
  error: string | null
}

export interface PromptResult {
  prompt: string
  category: string
  models: ModelResult[]
  mention_rate: number
  best_position: number | null
}

export interface CompetitorInfo {
  name: string
  mentions: number
  rate: number
}

export interface ModelBreakdown {
  model_id: string
  model_name: string
  provider: string
  mentions: number
  total: number
  rate: number
}

export interface ScoreResponse {
  // Core score
  score: number
  verdict: string
  verdict_emoji: string
  grade: string
  
  // Brand info
  brand: string
  category: string
  location: string | null
  
  // Test summary
  total_tests: number
  total_mentions: number
  mention_rate: number
  
  // Detailed results
  prompt_results: PromptResult[]
  model_breakdown: ModelBreakdown[]
  
  // Competitor analysis
  competitors: CompetitorInfo[]
  you_vs_top: {
    competitor: string
    their_rate: number
    your_rate: number
    gap: number
  } | null
  
  // The "aha" moment
  worst_prompt: {
    prompt: string
    category: string
    mention_rate: number
    models_mentioning: number
    total_models: number
  } | null
  killer_quote: string | null
  
  // Example AI response
  example_response: {
    prompt: string
    response: string
    model: string
    mentioned: boolean
  } | null
  
  // Sharing
  share_text: string
  share_url: string | null
  
  // Metadata
  tested_at: string
  test_duration_ms: number
  
  // Questions that were tested
  questions_tested: string[]
}

// =============================================================================
// WEBSITE ANALYSIS TYPES
// =============================================================================

export interface BrandContext {
  brand_name: string
  website_url: string | null
  product_category: string
  product_types: string[]
  brand_description: string
  unique_selling_points: string[]
  target_audience: string
  price_range: string
  known_competitors: string[]
  location: string | null
  suggested_questions: string[]
}

export interface AnalyzeSiteRequest {
  brand_name: string
  website_url: string
  additional_context?: string
}

export interface AnalyzeSiteResponse {
  success: boolean
  brand_context: BrandContext | null
  suggested_questions: string[]
  detected_category: string
  detected_competitors: string[]
  error: string | null
}

// =============================================================================
// AI VISIBILITY SCORE API
// =============================================================================

export const scoreAPI = {
  /**
   * Analyze website to extract brand context and suggest questions
   */
  analyzeSite: async (data: AnalyzeSiteRequest): Promise<AnalyzeSiteResponse> => {
    const response = await api.post('/api/visibility/analyze-site', data)
    return response.data
  },
  
  /**
   * Run AI Visibility Score test
   * 
   * Tests your brand across 3 AI models with 4 different prompts.
   * Returns a 0-100 score with detailed breakdown.
   */
  check: async (data: ScoreRequest): Promise<ScoreResponse> => {
    const response = await api.post('/api/visibility/score', data)
    return response.data
  },
}

export default api
