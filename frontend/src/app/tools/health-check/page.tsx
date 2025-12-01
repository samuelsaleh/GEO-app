'use client'

import { useState, FormEvent } from 'react'
import { Search, ArrowLeft, CheckCircle, AlertCircle, Loader, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { healthCheckAPI, HealthCheckResult } from '@/lib/api'

export default function HealthCheck() {
  // Form state
  const [url, setUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  
  // Analysis state
  const [step, setStep] = useState<'form' | 'analyzing' | 'results'>('form')
  const [analyzingStep, setAnalyzingStep] = useState('')
  const [result, setResult] = useState<HealthCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isFormValid = url.trim() !== '' && email.trim() !== ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    
    setStep('analyzing')
    setError(null)
    setAnalyzingStep('Connecting to server...')
    
    try {
      setAnalyzingStep('Fetching your page...')
      
      const response = await healthCheckAPI.analyze({
        company_name: companyName || url,
        contact_email: email,
        page_urls: [url],
        questions: question ? [question] : ['How can I find this product?'],
        auto_discover_competitors: false
      })
      
      setAnalyzingStep('Analysis complete!')
      setResult(response)
      setStep('results')
      
    } catch (err: any) {
      console.error('Analysis error:', err)
      // Handle different error formats
      let errorMessage = 'Analysis failed. Please try again.'
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          // Pydantic validation errors
          errorMessage = detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ')
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || detail.message || JSON.stringify(detail)
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setStep('form')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-claude-500'
    return 'text-red-500'
  }

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-600'
    if (grade === 'B') return 'bg-blue-100 text-blue-600'
    if (grade === 'C') return 'bg-yellow-100 text-yellow-600'
    if (grade === 'D') return 'bg-orange-100 text-orange-600'
    return 'bg-red-100 text-red-600'
  }

  const getIssueDetails = (issue: string) => {
    const pageUrl = result?.pages_analyzed[0]?.url || url
    const brand = companyName || 'your site'

    const lower = issue.toLowerCase()

    if (lower.includes('structured data') || lower.includes('schema.org')) {
      return {
        why: `${brand} is much harder for AI assistants and search engines to understand without schema markup ON THIS SPECIFIC PAGE. Even if you have schema elsewhere, AI models often land directly here. Right now, they see raw text without a clear signal that ${pageUrl} is a brand, product, or service page. Schema is a core input into GEO schema and authority scores.`,
        how: 'Add JSON-LD schema (Organization, Product, or Article) into the <head> of THIS page. Include your brand name, URL, and description. Then validate it with Google\'s Rich Results Test. This ensures AI models get structured data no matter which entry point they find.'
      }
    }

    if (lower.includes('faq section')) {
      return {
        why: 'FAQ content is the easiest format for AI to quote. When users ask questions, models look for clean Q&A structures on the landing page itself. Without a visible FAQ section HERE, this specific page loses "citability" points, even if you have a separate FAQ page elsewhere.',
        how: `Add a dedicated FAQ block to ${pageUrl} with 5–10 specific questions relevant to this page's topic. Mark it up with FAQPage schema so AI treats each Q&A as a structured answer. Don't rely on a separate /faq page alone.`
      }
    }

    if (lower.includes('missing h1')) {
      return {
        why: 'Without a single, clear H1, AI and search engines have to infer the main topic of the page from context. That weakens both GEO structure score and classic SEO signals, and makes it easier for competitors with clearer headlines to win those queries. The H1 is effectively the “billboard” for the page – it should tell humans and AI what this URL is really about.',
        how: 'Pick one concise but descriptive H1 that matches the core intent of this page (for example: “Diamond engagement rings in Antwerp” or “How to choose the right [product] for [audience]”). Implement it as the only <h1> on the page, then demote any other headline-sized text to <h2> or <h3> so your structure is clean and easy to parse.'
      }
    }

    if (lower.includes('multiple h1')) {
      return {
        why: 'Multiple H1s are like putting several front-page headlines on a single article; AI and search engines can get confused about what the page is really about. This weakens your structure score and can dilute relevance for the main query you care about, because the model has to guess which heading is primary.',
        how: 'Audit the page headings and decide which single line should be the true main topic (H1). Convert all other H1 elements into H2/H3 subheadings, grouped by topic. Aim for a simple outline: one H1, a handful of H2 sections, and optional H3s under each – this is the structure AI models handle best.'
      }
    }

    if (lower.includes('meta description')) {
      return {
        why: 'The meta description is often the first, compact summary AI systems and search engines read to understand a page. If it is missing, duplicated, or too short, models have to work harder to infer what the page offers and when to show it. That can reduce click‑through in classic search and make AI less confident about recommending your URL as an answer source.',
        how: 'Write a unique 150–160 character description for this page that clearly states what you offer, who it is for, and one key differentiator. For example: “[Brand] helps [audience] get [outcome] with [product/service] in [location].” Implement it as a <meta name="description" ...> tag and mirror the same promise in your on-page H1 so the story is consistent.'
      }
    }

    if (lower.includes('read') || lower.includes('readability')) {
      return {
        why: 'Complex sentences, jargon, and dense paragraphs make it harder for AI to extract clean, quotable statements from your content. Even if users can eventually understand the page, models tend to favor sources where key ideas are stated simply and directly. Readability also feeds into the citability dimension of the GEO score, which measures how easily your content can be reused as an answer.',
        how: 'Rewrite heavy paragraphs into shorter sentences (10–20 words where possible), use subheadings to separate ideas, and add bullet lists for steps or benefits. Try to answer core questions in one or two plain-language sentences that could stand alone when quoted by an AI assistant.'
      }
    }

    if (lower.includes('internal links')) {
      return {
        why: 'Internal links help AI and users understand how your content is connected, which topics cluster together, and which URLs are most important. A strong internal link graph tells models that you cover a topic in depth, which supports both authority and citability. Thin or random linking makes your site feel like isolated pages instead of a coherent knowledge hub.',
        how: `From this page, add 3–5 contextual links to your most important supporting URLs (guides, products, FAQs), using descriptive anchor text like “diamond engagement rings guide” instead of generic “learn more” links. Make sure each key commercial or informational page is linked from multiple relevant places.`
      }
    }

    return {
      why: 'This issue reduces how clearly AI systems can interpret, trust, or quote your content.',
      how: 'Address this on your key landing pages first, then roll the same fix out across other important URLs.'
    }
  }

  const getStrengthDetails = (strength: string) => {
    const pageUrl = result?.pages_analyzed[0]?.url || url
    const lower = strength.toLowerCase()

    if (lower.includes('internal linking')) {
      return {
        why: 'Your internal links make it easier for AI to map how topics connect across your site and to identify your most important URLs. This is exactly the kind of structure that supports higher authority and better chances of being chosen as a cited source versus “thin” sites.',
        keepDoing: `Keep adding contextual links from ${pageUrl} into your highest‑value pages (evergreen guides, key services, high‑margin products, and future FAQ hubs). Whenever you publish a new page, link it from at least 2–3 related URLs so AI always has multiple paths into that content.`
      }
    }

    if (lower.includes('meta description')) {
      return {
        why: 'A strong meta description gives AI systems and search engines a clean one‑sentence summary that matches what users are looking for. This improves both classic search click‑through and AI confidence when deciding whether your URL is a good match for a given question.',
        keepDoing: 'Use the same pattern on your other priority pages: a unique 150–160 character line that states the offer, the audience, and the benefit in natural language. Avoid stuffing keywords; instead, write something a human would actually want to click.'
      }
    }

    if (lower.includes('content depth') || lower.includes('words')) {
      return {
        why: 'Deeper content gives AI much more context and “surface area” to pull from when answering user questions. Pages with real substance tend to perform better in GEO structure and citability than thin, generic landing pages.',
        keepDoing: 'Continue publishing and expanding in‑depth pages (700+ words or more) that fully answer one topic, and pair them with clear headings, FAQs, and schema. Use this page as a model for how detailed you want all of your key commercial and educational pages to be.'
      }
    }

    if (lower.includes('readable') || lower.includes('readability')) {
      return {
        why: 'High readability means both humans and AI can understand your content quickly without getting stuck on jargon or overly complex sentences. This increases the odds that an AI model will lift your sentences as direct answers instead of looking for simpler sources.',
        keepDoing: 'Keep writing in clear, conversational language, and continue using headings and bullet points to call out your strongest claims, benefits, and answers. When you create new pages, aim for the same readability score or better so your whole site feels equally easy to parse.'
      }
    }

    return {
      why: 'This is a genuine strength for your site in the context of AI visibility.',
      keepDoing: 'Use this as a pattern when you create or update other important pages.'
    }
  }

  const resetForm = () => {
    setStep('form')
    setResult(null)
    setError(null)
    setUrl('')
    setCompanyName('')
    setEmail('')
    setQuestion('')
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
                Miageru
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-16 animate-enter">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 backdrop-blur-sm mb-6">
            <Search className="w-4 h-4 text-claude-500" />
            <span className="text-sm font-medium text-ink-light uppercase tracking-wider">GEO Audit Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ink tracking-tight">
            Page Health Check
          </h1>
          <p className="text-lg text-ink-light max-w-2xl mx-auto leading-relaxed">
            Discover how visible your content is to AI engines with our proprietary GEO scoring.
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="glass-card p-10 space-y-8 rounded-[2rem] animate-enter delay-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
                <strong className="font-bold">Error:</strong> {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                Website URL to analyze *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-5 py-4"
              />
              <p className="text-sm text-ink-muted mt-2">
                Enter the main page you want to analyze
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                  Company/Brand Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc"
                  className="w-full px-5 py-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-5 py-4"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-ink-muted">
                What question would customers ask? (Optional)
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Where can I buy sustainable sneakers?"
                className="w-full px-5 py-4"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="btn-primary w-full text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze My Page
            </button>
          </form>
        )}

        {step === 'analyzing' && (
          <div className="glass-card p-14 text-center rounded-[2rem] animate-enter">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-claude-500/20 blur-xl rounded-full animate-pulse-slow" />
              <Loader className="w-14 h-14 text-claude-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-ink">
              Analyzing Your Content...
            </h2>
            <p className="text-ink-light mb-8">{analyzingStep}</p>
            <div className="max-w-md mx-auto bg-white/50 border border-white/60 rounded-xl p-6 text-left backdrop-blur-sm">
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-ink">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Connecting to server...</span>
                </div>
                <div className="flex items-center gap-3 text-ink">
                  <Loader className="w-4 h-4 text-claude-500 animate-spin" />
                  <span>Scanning page structure...</span>
                </div>
                <div className="flex items-center gap-3 text-ink-muted">
                  <div className="w-4 h-4" />
                  <span>Checking schema markup...</span>
                </div>
                <div className="flex items-center gap-3 text-ink-muted">
                  <div className="w-4 h-4" />
                  <span>Testing AI visibility...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && result && (
          <div className="space-y-10 animate-enter">
            <div className="glass-card p-12 text-center rounded-[2rem]">
              <h2 className="text-2xl font-bold mb-8 text-ink">
                Your AI Visibility Score
              </h2>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className={`text-8xl font-bold tracking-tighter ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}
                </div>
                <div className={`text-5xl font-bold px-6 py-2 rounded-2xl ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </div>
              </div>
              <p className="text-ink-light max-w-2xl mx-auto leading-relaxed">
                {result.overall_score >= 70 
                  ? "Great job! Your content is well-optimized for AI visibility."
                  : result.overall_score >= 50 
                    ? "Your content has room for improvement. Follow the recommendations below."
                    : "Your content needs significant work. AI assistants may struggle to find your pages."}
              </p>
            </div>

            {result.pages_analyzed.length > 0 && (
              <div className="glass-card p-10 rounded-[2rem]">
                <h3 className="text-xl font-bold mb-6 text-ink flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-claude-500" />
                  Page Analysis
                </h3>
                {result.pages_analyzed.map((page, index) => (
                  <div key={index} className="bg-white/50 border border-ink/5 rounded-xl p-5 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="truncate flex-1 mr-4">
                        <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-claude-600 hover:underline font-medium">
                          {page.url}
                        </a>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(page.score)}`}>
                        {page.score}/100
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                      <span className={page.has_schema ? 'text-green-600' : 'text-red-500'}>
                        {page.has_schema ? '✓' : '✗'} Schema
                      </span>
                      <span className={page.has_faq ? 'text-green-600' : 'text-red-500'}>
                        {page.has_faq ? '✓' : '✗'} FAQ
                      </span>
                      <span className="text-ink-light">
                        Readability: {Math.round(page.readability_score)}%
                      </span>
                    </div>
                    {page.issues.length > 0 && (
                      <div className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg inline-block">
                        {page.issues[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {result.top_issues.length > 0 && (
                <div className="glass-card p-8 rounded-[2rem] bg-rose-50/30 border-rose-100">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-xl font-bold text-ink">Issues Found</h3>
                  </div>
                  <ul className="space-y-4">
                    {result.top_issues.map((issue, index) => {
                      const details = getIssueDetails(issue)
                      return (
                        <li key={index} className="flex items-start gap-3 text-ink-light text-sm">
                          <span className="text-rose-500 mt-0.5 font-bold">✗</span>
                          <div>
                            <div className="font-medium text-ink">{issue}</div>
                            {details && (
                              <div className="mt-2 text-xs text-ink-muted space-y-1 bg-white/50 p-3 rounded-lg">
                                <p><span className="font-bold text-rose-600">Why:</span> {details.why}</p>
                                <p><span className="font-bold text-green-600">Fix:</span> {details.how}</p>
                              </div>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {result.top_strengths.length > 0 && (
                <div className="glass-card p-8 rounded-[2rem] bg-green-50/30 border-green-100">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="text-xl font-bold text-ink">Strengths</h3>
                  </div>
                  <ul className="space-y-4">
                    {result.top_strengths.map((strength, index) => {
                      return (
                        <li key={index} className="flex items-start gap-3 text-ink-light text-sm">
                          <span className="text-green-500 mt-0.5 font-bold">✓</span>
                          <div className="font-medium text-ink">{strength}</div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="glass-card p-10 space-y-8 rounded-[2rem]">
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-claude-500" />
                Action Plan
              </h3>
              
              {/* Example Fixes */}
              {result.pages_analyzed[0] && !result.pages_analyzed[0].has_faq && (
                <div className="border border-ink/5 rounded-xl p-6 bg-white/50">
                  <h4 className="font-bold text-ink mb-2">1. Add an FAQ Section</h4>
                  <p className="text-sm text-ink-light mb-4">
                    Copy-paste this HTML block near the bottom of your page.
                  </p>
                  <div className="bg-ink-900 rounded-lg p-4 text-xs font-mono text-cream-100 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
{`<section class="faq">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>${question && question.length > 10 ? question : 'How do I choose the right option?'}</h3>
    <p>Short, direct answer here.</p>
  </div>
</section>`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Schema Starter */}
              {result.pages_analyzed[0] && !result.pages_analyzed[0].has_schema && (
                <div className="border border-ink/5 rounded-xl p-6 bg-white/50">
                  <h4 className="font-bold text-ink mb-2">2. Add Schema Markup</h4>
                  <p className="text-sm text-ink-light mb-4">
                    Add this JSON-LD to your &lt;head&gt; tag.
                  </p>
                  <div className="bg-ink-900 rounded-lg p-4 text-xs font-mono text-cream-100 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${companyName || 'Your Brand'}",
  "url": "${result.pages_analyzed[0].url || url}"
}
</script>`}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card p-10 text-center rounded-[2rem] bg-gradient-to-br from-white/80 to-claude-50/50">
              <h3 className="text-xl font-bold mb-4 text-ink">
                Want to fix these issues automatically?
              </h3>
              <p className="text-ink-light mb-8">
                Use our free Schema Generator to create the perfect code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="btn-secondary text-sm"
                >
                  Analyze Another Page
                </button>
                <Link
                  href="/tools/schema-generator"
                  className="btn-primary text-sm"
                >
                  Open Schema Generator
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
