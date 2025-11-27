import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Health Check API
export const healthCheckAPI = {
  analyze: async (data: {
    company_name: string
    contact_email: string
    page_urls: string[]
    questions: string[]
  }) => {
    const response = await api.post('/api/health-check/analyze', data)
    return response.data
  },
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

export default api
