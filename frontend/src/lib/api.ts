import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geo-app-production-339e.up.railway.app'

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

export default api
