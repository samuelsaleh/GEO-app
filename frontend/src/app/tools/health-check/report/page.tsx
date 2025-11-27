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
  ]
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
    ]
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
          <div className="p-12 bg-gray-50">
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

