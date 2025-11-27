'use client'

import { useState } from 'react'
import { ArrowLeft, Download, Printer, CheckCircle, AlertCircle, TrendingUp, Target, Zap, Search } from 'lucide-react'
import Link from 'next/link'

// Template data with placeholders
const templateData = {
  company: {
    name: "{{COMPANY_NAME}}",
    website: "{{WEBSITE_URL}}",
    date: "{{ANALYSIS_DATE}}",
    preparedFor: "{{CLIENT_NAME}}",
    preparedBy: "Dwight AI Visibility Team"
  },
  scores: {
    overall: "{{OVERALL_SCORE}}",
    grade: "{{GRADE}}",
    structure: "{{STRUCTURE_SCORE}}",
    schema: "{{SCHEMA_SCORE}}",
    citability: "{{CITABILITY_SCORE}}",
    authority: "{{AUTHORITY_SCORE}}",
    freshness: "{{FRESHNESS_SCORE}}",
    accessibility: "{{ACCESSIBILITY_SCORE}}"
  },
  findings: {
    hasSchema: "{{HAS_SCHEMA}}",
    hasFaq: "{{HAS_FAQ}}",
    hasMetaDesc: "{{HAS_META_DESC}}",
    h1Count: "{{H1_COUNT}}",
    wordCount: "{{WORD_COUNT}}",
    readabilityScore: "{{READABILITY_SCORE}}"
  },
  issues: [
    "{{ISSUE_1}}",
    "{{ISSUE_2}}",
    "{{ISSUE_3}}",
    "{{ISSUE_4}}",
    "{{ISSUE_5}}"
  ],
  strengths: [
    "{{STRENGTH_1}}",
    "{{STRENGTH_2}}",
    "{{STRENGTH_3}}"
  ],
  recommendations: [
    { priority: "High", action: "{{REC_1}}" },
    { priority: "High", action: "{{REC_2}}" },
    { priority: "Medium", action: "{{REC_3}}" },
    { priority: "Medium", action: "{{REC_4}}" },
    { priority: "Low", action: "{{REC_5}}" }
  ],
  competitors: {
    ranking: "{{YOUR_RANKING}}",
    totalAnalyzed: "{{TOTAL_ANALYZED}}",
    avgCompetitorScore: "{{AVG_COMPETITOR_SCORE}}",
    list: [
      { name: "{{COMPETITOR_1_NAME}}", url: "{{COMPETITOR_1_URL}}", score: "{{COMPETITOR_1_SCORE}}", status: "{{COMPETITOR_1_STATUS}}", hasSchema: "{{COMPETITOR_1_SCHEMA}}", hasFaq: "{{COMPETITOR_1_FAQ}}" },
      { name: "{{COMPETITOR_2_NAME}}", url: "{{COMPETITOR_2_URL}}", score: "{{COMPETITOR_2_SCORE}}", status: "{{COMPETITOR_2_STATUS}}", hasSchema: "{{COMPETITOR_2_SCHEMA}}", hasFaq: "{{COMPETITOR_2_FAQ}}" },
      { name: "{{COMPETITOR_3_NAME}}", url: "{{COMPETITOR_3_URL}}", score: "{{COMPETITOR_3_SCORE}}", status: "{{COMPETITOR_3_STATUS}}", hasSchema: "{{COMPETITOR_3_SCHEMA}}", hasFaq: "{{COMPETITOR_3_FAQ}}" }
    ],
    insights: [
      "{{INSIGHT_1}}",
      "{{INSIGHT_2}}"
    ],
    opportunities: [
      "{{OPPORTUNITY_1}}",
      "{{OPPORTUNITY_2}}",
      "{{OPPORTUNITY_3}}"
    ]
  }
}

export default function ReportTemplate() {
  const [showPlaceholders, setShowPlaceholders] = useState(true)
  
  // Example filled data
  const filledData = {
    company: {
      name: "Tache Diamonds",
      website: "https://groupetache.com/the-tache-brand/",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      preparedFor: "Samuel Saleh",
      preparedBy: "Dwight AI Visibility Team"
    },
    scores: {
      overall: "40",
      grade: "F",
      structure: "15",
      schema: "0",
      citability: "12",
      authority: "8",
      freshness: "3",
      accessibility: "2"
    },
    findings: {
      hasSchema: "No",
      hasFaq: "No",
      hasMetaDesc: "No",
      h1Count: "6",
      wordCount: "921",
      readabilityScore: "94%"
    },
    issues: [
      "No structured data (schema.org) detected",
      "No FAQ section found - important for AI snippets",
      "Missing meta description",
      "Multiple H1 tags (6) - should have exactly 1",
      "No FAQ schema markup"
    ],
    strengths: [
      "Content is clear and readable (94% readability)",
      "Good content depth (921 words)",
      "Good internal linking structure"
    ],
    recommendations: [
      { priority: "High", action: "Add Organization and Product schema markup" },
      { priority: "High", action: "Add FAQ sections with FAQPage schema" },
      { priority: "Medium", action: "Write compelling meta descriptions (150-160 chars)" },
      { priority: "Medium", action: "Consolidate to single H1 tag per page" },
      { priority: "Low", action: "Add article publish dates for freshness signals" }
    ],
    competitors: {
      ranking: "3",
      totalAnalyzed: "4",
      avgCompetitorScore: "58",
      list: [
        { name: "Baunat Diamonds", url: "baunat.com", score: "72", status: "behind", hasSchema: "Yes", hasFaq: "Yes" },
        { name: "Diamonds Factory", url: "diamondsfactory.com", score: "65", status: "behind", hasSchema: "Yes", hasFaq: "No" },
        { name: "Leibish & Co", url: "leibish.com", score: "38", status: "ahead", hasSchema: "No", hasFaq: "No" }
      ],
      insights: [
        "You're 18 points below the competitor average (58)",
        "You rank #3 of 4 sites analyzed"
      ],
      opportunities: [
        "Add schema markup - Baunat and Diamonds Factory use it",
        "Add FAQ sections - Baunat has comprehensive FAQs",
        "Learn from Baunat: Clean product pages with rich descriptions"
      ]
    }
  }

  const data = showPlaceholders ? templateData : filledData

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'bg-green-500'
    if (grade === 'B') return 'bg-blue-500'
    if (grade === 'C') return 'bg-yellow-500'
    if (grade === 'D') return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'bg-red-100 text-red-700'
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Controls - Not printed */}
      <div className="print:hidden bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/tools/health-check" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Tool
          </Link>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPlaceholders}
                onChange={(e) => setShowPlaceholders(e.target.checked)}
                className="rounded"
              />
              Show Placeholders
            </label>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-claude-500 text-white px-4 py-2 rounded-lg hover:bg-claude-600"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 print:py-0 print:px-0 print:max-w-none">
        <div className="bg-white shadow-lg print:shadow-none">
          
          {/* Cover Page */}
          <div className="p-12 border-b-4 border-claude-500 print:break-after-page">
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-claude-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-claude-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Visibility</h1>
              <h2 className="text-4xl font-bold text-claude-500 mb-8">Health Check Report</h2>
            </div>
            
            <div className="max-w-md mx-auto space-y-4 text-lg">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Prepared For:</span>
                <span className="font-semibold text-gray-900">{data.company.preparedFor}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Company:</span>
                <span className="font-semibold text-gray-900">{data.company.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Website:</span>
                <span className="font-semibold text-claude-600 text-sm">{data.company.website}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold text-gray-900">{data.company.date}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-500">Prepared By:</span>
                <span className="font-semibold text-gray-900">{data.company.preparedBy}</span>
              </div>
            </div>

            <div className="mt-16 text-center text-gray-400 text-sm">
              Powered by Dwight • AI Search Visibility Platform
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-12 print:break-after-page">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Target className="w-7 h-7 text-claude-500" />
              Executive Summary
            </h2>

            {/* Score Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-7xl font-bold text-gray-900">{data.scores.overall}</div>
                  <div className="text-gray-500 mt-2">Overall Score</div>
                </div>
                <div className={`w-24 h-24 ${getGradeColor(data.scores.grade)} rounded-2xl flex items-center justify-center`}>
                  <span className="text-4xl font-bold text-white">{data.scores.grade}</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gray-900">{data.findings.wordCount}</div>
                <div className="text-sm text-gray-500">Word Count</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gray-900">{data.findings.readabilityScore}</div>
                <div className="text-sm text-gray-500">Readability</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gray-900">{data.findings.h1Count}</div>
                <div className="text-sm text-gray-500">H1 Tags</div>
              </div>
            </div>

            {/* Quick Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`rounded-xl p-4 text-center ${data.findings.hasSchema === 'Yes' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-lg font-bold ${data.findings.hasSchema === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.findings.hasSchema === 'Yes' ? '✓' : '✗'} Schema
                </div>
              </div>
              <div className={`rounded-xl p-4 text-center ${data.findings.hasFaq === 'Yes' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-lg font-bold ${data.findings.hasFaq === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.findings.hasFaq === 'Yes' ? '✓' : '✗'} FAQ
                </div>
              </div>
              <div className={`rounded-xl p-4 text-center ${data.findings.hasMetaDesc === 'Yes' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-lg font-bold ${data.findings.hasMetaDesc === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.findings.hasMetaDesc === 'Yes' ? '✓' : '✗'} Meta Desc
                </div>
              </div>
            </div>
          </div>

          {/* What These Terms Mean - Educational Section */}
          <div className="p-12 border-t-4 border-claude-200 print:break-after-page">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 What Do These Terms Mean?</h2>
            <p className="text-gray-500 mb-8">A simple guide to understanding your AI visibility report</p>

            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-claude-50 to-white rounded-xl p-6 border-l-4 border-claude-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Overall Score (0-100)</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> A grade showing how likely AI assistants (like ChatGPT, Bing Chat, or Perplexity) 
                  will find and recommend your website when users ask questions.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> Higher scores mean more visibility. When someone asks &quot;Where can I buy diamonds in Antwerp?&quot;, 
                  AI assistants are more likely to mention and link to websites with high scores.
                </p>
              </div>

              {/* Schema */}
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🏷️ Schema Markup</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> Hidden labels on your website that help AI understand your content. 
                  Think of it like putting name tags on everything - &quot;This is a product&quot;, &quot;This is the price&quot;, &quot;This is a review&quot;.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Example:</strong> Without schema, AI sees text. With schema, AI knows &quot;This is a diamond ring that costs €5,000 with 4.5 star reviews&quot;.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> AI can give much more accurate and detailed answers about your products/services.
                </p>
              </div>

              {/* Meta Description */}
              <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-6 border-l-4 border-purple-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📝 Meta Description</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> A short summary (about 150 characters) that describes what your page is about. 
                  It&apos;s the text that appears under your website name in Google search results.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Example:</strong> &quot;Tache Diamonds - Antwerp&apos;s finest diamond jewelry since 1985. Engagement rings, wedding bands, and bespoke designs.&quot;
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> AI uses this to quickly understand what your page offers and whether to recommend it.
                </p>
              </div>

              {/* FAQ */}
              <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">❓ FAQ Section</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> A &quot;Frequently Asked Questions&quot; section on your website where you answer common customer questions.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Example:</strong> &quot;How do I choose the right diamond?&quot;, &quot;Do you offer custom designs?&quot;, &quot;What is your return policy?&quot;
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> AI LOVES FAQ content! When someone asks a question, AI can directly quote your answer. 
                  This is one of the easiest ways to get mentioned by ChatGPT and other AI assistants.
                </p>
              </div>

              {/* H1 Tags */}
              <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-6 border-l-4 border-orange-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📰 H1 Tags (Headlines)</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> The main headline of your page - like the title of a newspaper article. 
                  Each page should have exactly ONE main headline (H1).
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>The problem:</strong> Having 6 H1 tags is like a newspaper with 6 different front-page headlines - 
                  it confuses readers (and AI) about what the page is really about.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> AI uses headlines to understand your content structure. Clear structure = better understanding = more recommendations.
                </p>
              </div>

              {/* Readability */}
              <div className="bg-gradient-to-r from-teal-50 to-white rounded-xl p-6 border-l-4 border-teal-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📖 Readability Score</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> How easy your content is to read. Higher percentage = easier to read.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>94% is excellent!</strong> Your content uses clear, simple language that both humans and AI can easily understand.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> AI prefers content that&apos;s clear and well-written. Complex jargon can confuse AI and reduce your visibility.
                </p>
              </div>

              {/* Word Count */}
              <div className="bg-gradient-to-r from-pink-50 to-white rounded-xl p-6 border-l-4 border-pink-500">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📊 Word Count</h3>
                <p className="text-gray-600">
                  <strong>What it is:</strong> The total number of words on your page.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>921 words is good!</strong> You have enough content for AI to understand your business. 
                  Pages with less than 300 words often don&apos;t provide enough information for AI to work with.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Why it matters:</strong> More quality content = more opportunities for AI to find relevant information to share with users.
                </p>
              </div>
            </div>
          </div>

          {/* Issues & Strengths */}
          <div className="p-12 bg-gray-50 print:break-after-page">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Issues */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  Issues Found
                </h3>
                <ul className="space-y-3">
                  {data.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white rounded-lg p-3">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span className="text-gray-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Strengths
                </h3>
                <ul className="space-y-3">
                  {data.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white rounded-lg p-3">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-12 print:break-after-page">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Zap className="w-7 h-7 text-claude-500" />
              Recommendations
            </h2>

            <div className="space-y-4">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-claude-500 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-700">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="p-12 bg-gray-50 print:break-after-page">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-claude-500" />
              Score Breakdown
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Structure', score: data.scores.structure, max: 25 },
                { name: 'Schema', score: data.scores.schema, max: 20 },
                { name: 'Citability', score: data.scores.citability, max: 20 },
                { name: 'Authority', score: data.scores.authority, max: 15 },
                { name: 'Freshness', score: data.scores.freshness, max: 10 },
                { name: 'Accessibility', score: data.scores.accessibility, max: 10 },
              ].map((category, i) => (
                <div key={i} className="bg-white rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">{category.name}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {category.score} <span className="text-sm font-normal text-gray-400">/ {category.max}</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-claude-500 rounded-full"
                      style={{ width: `${(parseInt(category.score.toString()) / category.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="p-12 print:break-after-page">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              🏆 Competitor Analysis
            </h2>
            <p className="text-gray-500 mb-8">How you compare against your competitors in AI visibility</p>

            {/* Ranking Overview */}
            <div className="bg-gradient-to-br from-claude-500 to-claude-600 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-bold">#{data.competitors.ranking}</div>
                  <div className="text-claude-100 mt-1">Your Ranking</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{data.competitors.totalAnalyzed}</div>
                  <div className="text-claude-100">Sites Analyzed</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{data.competitors.avgCompetitorScore}</div>
                  <div className="text-claude-100">Avg. Competitor Score</div>
                </div>
              </div>
            </div>

            {/* Competitor Cards */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Competitor Breakdown</h3>
              {data.competitors.list.map((comp, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{comp.name}</div>
                    <div className="text-sm text-gray-500">{comp.url}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${comp.hasSchema === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {comp.hasSchema === 'Yes' ? '✓' : '✗'}
                      </span>
                      <span className="text-sm text-gray-500">Schema</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${comp.hasFaq === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {comp.hasFaq === 'Yes' ? '✓' : '✗'}
                      </span>
                      <span className="text-sm text-gray-500">FAQ</span>
                    </div>
                    <div className="text-right w-20">
                      <div className="text-2xl font-bold text-gray-900">{comp.score}</div>
                      <div className={`text-xs font-semibold ${comp.status === 'ahead' ? 'text-green-600' : 'text-red-600'}`}>
                        {comp.status === 'ahead' ? '↓ You beat them' : '↑ They beat you'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  💡 Key Insights
                </h4>
                <ul className="space-y-2">
                  {data.competitors.insights.map((insight, i) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🎯 Opportunities from Competitors
                </h4>
                <ul className="space-y-2">
                  {data.competitors.opportunities.map((opp, i) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-500">→</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* What is Competitor Analysis - Educational */}
          <div className="p-12 bg-amber-50 border-t-4 border-amber-400">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🤔 Why Compare with Competitors?</h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <p className="mb-3">
                  <strong>AI assistants compare websites</strong> when deciding which ones to recommend. 
                  If a user asks &quot;Where can I buy diamond jewelry?&quot;, AI looks at multiple sites and picks the ones 
                  that seem most trustworthy and informative.
                </p>
                <p>
                  <strong>Your competitors with higher scores</strong> are more likely to be recommended instead of you. 
                  By understanding what they do well, you can improve and outrank them.
                </p>
              </div>
              <div>
                <p className="mb-3">
                  <strong>What to look for:</strong>
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• Competitors with Schema = AI understands their products better</li>
                  <li>• Competitors with FAQ = AI can quote their answers directly</li>
                  <li>• Higher scores = More likely to be recommended</li>
                </ul>
                <p className="mt-3 text-sm bg-white rounded-lg p-3">
                  <strong>💡 Tip:</strong> Focus on matching what your top competitors do, then go beyond!
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t text-center text-gray-400 text-sm">
            <p>This report was generated by Dwight AI Visibility Platform</p>
            <p className="mt-1">© {new Date().getFullYear()} Dwight • dwight.app</p>
          </div>

        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:break-after-page { break-after: page; }
        }
      `}</style>
    </div>
  )
}

