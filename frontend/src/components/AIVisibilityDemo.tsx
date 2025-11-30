'use client'

import {
  Target, CheckCircle, BarChart3, TrendingUp,
  ChevronDown, ChevronUp, ExternalLink, Mail, ArrowRight, Lock
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

// Dummy data for La Piazza restaurant in Antwerp
const DEMO_PROFILE = {
  brand_name: 'La Piazza',
  website_url: 'https://lapiazza.be',
  industry: 'restaurant',
  business_type: 'Italian Restaurant',
  is_local_business: true,
  location: { city: 'Antwerp', region: 'Flanders', country: 'Belgium' },
}

const DEMO_CATEGORY_RESULTS = [
  {
    category: 'vibe_check',
    categoryLabel: 'Vibe & Occasion',
    prompt: "I'm looking for a nice Italian restaurant in Antwerp for a date night. Where should I go?",
    score: 67,
    status: 'moderate',
    insight: 'Mentioned in 2 out of 3 models',
    results: [
      {
        model_id: 'gpt-5.1',
        model_name: 'GPT-5.1',
        brand_mentioned: true,
        position: 2,
        sentiment: 'positive',
        response_preview: 'For a romantic date night in Antwerp, I recommend La Piazza and Ristorante Bella Vita.',
        full_response: 'For a romantic date night in Antwerp, I recommend La Piazza and Ristorante Bella Vita. Both offer authentic Italian ambiance with candlelit tables.'
      },
      {
        model_id: 'claude-3.7',
        model_name: 'Claude 3.7',
        brand_mentioned: true,
        position: 1,
        sentiment: 'positive',
        response_preview: 'La Piazza is perfect for date night! Their cozy atmosphere and wood-fired pizzas make it special.',
        full_response: 'La Piazza is perfect for date night! Their cozy atmosphere and wood-fired pizzas make it special.'
      },
      {
        model_id: 'gemini-3',
        model_name: 'Gemini 3 Pro',
        brand_mentioned: false,
        position: null,
        sentiment: 'neutral',
        response_preview: 'For Italian dining in Antwerp, try Ristorante Bella Vita or Trattoria Roma.',
        full_response: 'For Italian dining in Antwerp, try Ristorante Bella Vita or Trattoria Roma. Both are highly rated.'
      }
    ]
  },
  {
    category: 'best_dish',
    categoryLabel: 'Signature Food',
    prompt: 'Who has the best pizza in Antwerp?',
    score: 100,
    status: 'strong',
    insight: 'Mentioned in all 3 models',
    results: [
      {
        model_id: 'gpt-5.1',
        model_name: 'GPT-5.1',
        brand_mentioned: true,
        position: 1,
        sentiment: 'positive',
        response_preview: 'La Piazza has the best wood-fired pizza in Antwerp. Their dough is made fresh daily.',
        full_response: 'La Piazza has the best wood-fired pizza in Antwerp. Their dough is made fresh daily and imported toppings.'
      },
      {
        model_id: 'claude-3.7',
        model_name: 'Claude 3.7',
        brand_mentioned: true,
        position: 1,
        sentiment: 'positive',
        response_preview: 'La Piazza is known for authentic Neapolitan pizza. Highly recommended!',
        full_response: 'La Piazza is known for authentic Neapolitan pizza with a perfectly charred crust. Highly recommended!'
      },
      {
        model_id: 'gemini-3',
        model_name: 'Gemini 3 Pro',
        brand_mentioned: true,
        position: 1,
        sentiment: 'positive',
        response_preview: 'La Piazza serves excellent pizza. Try their Margherita.',
        full_response: 'La Piazza serves excellent pizza. Try their Margherita. Wood-fired oven gives perfect results.'
      }
    ]
  },
  {
    category: 'consensus',
    categoryLabel: 'Public Consensus',
    prompt: 'Is La Piazza in Antwerp actually good? What do reviews say?',
    score: 33,
    status: 'weak',
    insight: 'Only mentioned once',
    results: [
      {
        model_id: 'gpt-5.1',
        model_name: 'GPT-5.1',
        brand_mentioned: false,
        position: null,
        sentiment: 'neutral',
        response_preview: 'I do not have access to current reviews. Check Google or TripAdvisor for recent feedback.',
        full_response: 'I do not have access to current reviews. Check Google or TripAdvisor for recent feedback.'
      },
      {
        model_id: 'claude-3.7',
        model_name: 'Claude 3.7',
        brand_mentioned: true,
        position: null,
        sentiment: 'positive',
        response_preview: 'La Piazza has good reviews for authentic Italian food and friendly service.',
        full_response: 'La Piazza has good reviews for authentic Italian food and friendly service. Customers praise the pizza quality.'
      },
      {
        model_id: 'gemini-3',
        model_name: 'Gemini 3 Pro',
        brand_mentioned: false,
        position: null,
        sentiment: 'neutral',
        response_preview: 'For restaurant reviews in Antwerp, I recommend checking recent Google reviews.',
        full_response: 'For restaurant reviews in Antwerp, I recommend checking recent Google reviews and TripAdvisor ratings.'
      }
    ]
  }
]

const DEMO_COMPETITOR_SCORES = [
  { name: 'Ristorante Bella Vita', score: 78, mentions: 7 },
  { name: 'La Piazza', score: 67, mentions: 6, isUser: true },
  { name: 'Pizzeria Napoli', score: 56, mentions: 5 },
  { name: 'Trattoria Roma', score: 44, mentions: 4 }
]

const DEMO_MODEL_PERFORMANCE = [
  { model_id: 'gpt-5.1', name: 'GPT-5.1', score: 67 },
  { model_id: 'claude-3.7', name: 'Claude 3.7', score: 100 },
  { model_id: 'gemini-3', name: 'Gemini 3 Pro', score: 33 }
]

function getGrade(score: number) {
  if (score >= 90) return { grade: 'A', bg: 'bg-green-50', color: 'text-green-700', border: 'border-green-200' }
  if (score >= 80) return { grade: 'B', bg: 'bg-blue-50', color: 'text-blue-700', border: 'border-blue-200' }
  if (score >= 70) return { grade: 'C', bg: 'bg-yellow-50', color: 'text-yellow-700', border: 'border-yellow-200' }
  if (score >= 60) return { grade: 'D', bg: 'bg-orange-50', color: 'text-orange-700', border: 'border-orange-200' }
  return { grade: 'F', bg: 'bg-red-50', color: 'text-red-700', border: 'border-red-200' }
}

export function AIVisibilityDemo() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const overallScore = 67

  return (
    <div className="space-y-12 animate-enter">

      {/* DEMO BANNER */}
      <div className="glass-card p-4 rounded-xl bg-ink-50 border border-ink-200 text-center">
        <p className="text-ink font-medium">
          Demo Preview - Sample results for illustration purposes
        </p>
      </div>

      {/* 1. HERO SCORE - CLEAN & MINIMAL */}
      <div className="glass-card p-12 rounded-2xl bg-gradient-to-br from-white to-cream-50 border border-cream-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-xl border-2 ${getGrade(overallScore).bg} ${getGrade(overallScore).border}`}>
              <span className={`text-5xl font-bold ${getGrade(overallScore).color}`}>
                {getGrade(overallScore).grade}
              </span>
              <div className="text-left">
                <div className="text-3xl font-bold text-ink">{overallScore}</div>
                <div className="text-sm text-ink-muted">Visibility Score</div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-3">
            You are visible, but there is room for improvement
          </h2>
          <p className="text-lg text-ink-light leading-relaxed">
            AI tools mention your brand {overallScore}% of the time when asked relevant questions.
            Competitors are capturing attention in areas where you could be winning.
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

            {/* MONETIZATION: Service Upsell */}
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-cream-200">
              <span className="text-xs font-medium text-ink-muted hidden sm:inline">Too busy?</span>
              <Link 
                href="/contact?service=schema" 
                className="ml-auto text-xs sm:text-sm bg-ink text-white px-4 py-2 rounded-lg hover:bg-claude-600 font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                Fix it for me (€150) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {DEMO_PROFILE.is_local_business && (
            <div className="p-5 bg-cream-50 rounded-xl border border-cream-200 hover:border-ink-200 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-ink">Optimize Location Presence</h4>
                <span className="text-xs bg-ink text-white px-2 py-1 rounded font-medium">10 min</span>
              </div>
              <p className="text-sm text-ink-light">
                Add your city ({DEMO_PROFILE.location?.city}) consistently across homepage, footer, and key pages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODEL PERFORMANCE - WITH VISUAL BAR CHART */}
      <div className="glass-card p-8 rounded-2xl bg-white border border-cream-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-2">AI Model Performance</h3>
          <p className="text-ink-muted">How often each model mentions your brand</p>
        </div>

        <div className="space-y-4">
          {DEMO_MODEL_PERFORMANCE.map((model) => (
            <div key={model.model_id}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink text-sm">{model.name}</span>
                <span className={`font-bold text-sm ${model.score >= 70 ? 'text-green-700' : model.score >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>
                  {model.score}%
                </span>
              </div>
              <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    model.score >= 70 ? 'bg-green-500' :
                    model.score >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${model.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. COMPETITIVE LANDSCAPE */}
      <div className="glass-card p-8 rounded-2xl bg-white border border-cream-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-2">Competitive Landscape</h3>
          <p className="text-ink-muted">Your position relative to competitors</p>
        </div>

        <div className="space-y-3">
          {DEMO_COMPETITOR_SCORES.map((item, i) => {
            const userRank = DEMO_COMPETITOR_SCORES.findIndex(r => r.isUser)
            const isBeatingUser = !item.isUser && i < userRank

            return (
              <div key={i}>
                <div className={`p-4 rounded-xl border transition-colors ${
                  item.isUser
                    ? 'bg-claude-50 border-claude-200'
                    : 'bg-cream-50 border-cream-200 hover:border-ink-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-ink-200 font-bold text-sm text-ink">
                        #{i + 1}
                      </span>
                      <span className={`font-semibold ${item.isUser ? 'text-claude-600' : 'text-ink'}`}>
                        {item.name}
                        {item.isUser && <span className="ml-2 text-xs text-claude-500">(Your Business)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-32 h-1.5 bg-cream-100 rounded-full overflow-hidden">
                        <div className="h-full bg-ink" style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="font-bold text-ink w-12 text-right">{item.score}%</span>
                    </div>
                  </div>
                </div>

                {isBeatingUser && (
                  <div className="ml-11 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg relative overflow-hidden group">
                    <p className="text-xs font-medium text-blue-900 mb-1">Strategy to outperform:</p>
                    {/* Blurred Content */}
                    <p className="text-xs text-blue-800 blur-sm select-none">
                      Focus on content that positions you as a superior alternative. {item.name} appears {item.score - DEMO_COMPETITOR_SCORES[userRank].score}% more often due to high authority backlinks and schema.
                    </p>
                    
                    {/* Lock Overlay - Monetization Teaser */}
                    <Link 
                      href="/pricing"
                      className="absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-100 hover:scale-105 transition-transform">
                        <Lock className="w-3 h-3" />
                        Unlock Full Report (€97)
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. DETAILED RESULTS - EXPANDABLE */}
      <div className="glass-card p-8 rounded-2xl bg-white border border-cream-200">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-2">Question-by-Question Analysis</h3>
          <p className="text-ink-muted">See exactly what AI models say about your brand</p>
        </div>

        <div className="space-y-3">
          {DEMO_CATEGORY_RESULTS.map((res) => (
            <div key={res.category} className="border border-cream-200 rounded-xl overflow-hidden bg-cream-50">
              <button
                onClick={() => setExpandedCategory(expandedCategory === res.category ? null : res.category)}
                className="w-full p-5 flex items-center justify-between hover:bg-white transition-colors"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-ink">{res.categoryLabel}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      res.status === 'strong' ? 'bg-green-100 text-green-700' :
                      res.status === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {res.score}%
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted">{res.prompt}</p>
                </div>
                {expandedCategory === res.category ? (
                  <ChevronUp className="w-5 h-5 text-ink-muted ml-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ink-muted ml-4 flex-shrink-0" />
                )}
              </button>

              {expandedCategory === res.category && (
                <div className="px-5 pb-5 space-y-3 bg-white">
                  {res.results.map((result, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${
                      result.brand_mentioned
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-ink">{result.model_name}</span>
                        <div className="flex items-center gap-2">
                          {result.brand_mentioned && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">
                              Mentioned
                            </span>
                          )}
                          {result.position && (
                            <span className="text-xs bg-ink text-white px-2 py-0.5 rounded-full font-medium">
                              Position {result.position}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-ink-light leading-relaxed">
                        &quot;{result.full_response}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. CTA - WORK WITH US */}
      <div className="glass-card p-10 rounded-2xl bg-gradient-to-br from-ink to-ink-dark text-white border border-ink-light">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to Improve Your AI Visibility?</h3>
          <p className="text-white/90 mb-6 leading-relaxed">
            Our team can help you implement these strategies and improve your AI visibility score.
            Let us handle the technical details while you focus on your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="mailto:hello@miageru.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-ink px-6 py-3 rounded-lg font-semibold hover:bg-cream-50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Get Expert Help
            </a>
            <a
              href="/tools/ai-visibility"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 hover:border-white/60 transition-all"
            >
              Test Your Brand
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Private Audit Section */}
          <div className="pt-6 border-t border-white/20">
            <p className="text-white/70 text-sm mb-3">
              Want a comprehensive private audit with personalized strategy?
            </p>
            <a
              href="mailto:sales@miageru.com?subject=Private AI Visibility Audit"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm transition-colors underline decoration-white/40 hover:decoration-white"
            >
              Contact Sales for Private Audit
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
