'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, Activity, TrendingUp, Download } from 'lucide-react'
import Link from 'next/link'

interface WaitlistEntry {
  email: string
  timestamp: string
  position: number
}

interface HealthCheckSubmission {
  company_name: string
  contact_email: string
  submitted_at: string
  score: number
  status: string
}

export default function AdminDashboard() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [submissions, setSubmissions] = useState<HealthCheckSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from API
    // Mock data for now
    setWaitlist([
      { email: 'user1@example.com', timestamp: '2025-01-15T10:30:00', position: 1 },
      { email: 'user2@example.com', timestamp: '2025-01-15T11:45:00', position: 2 },
      { email: 'user3@example.com', timestamp: '2025-01-15T14:20:00', position: 3 },
    ])

    setSubmissions([
      {
        company_name: 'Example Corp',
        contact_email: 'contact@example.com',
        submitted_at: '2025-01-15T09:00:00',
        score: 45,
        status: 'completed'
      },
      {
        company_name: 'Tech Startup',
        contact_email: 'hello@techstartup.io',
        submitted_at: '2025-01-15T12:30:00',
        score: 67,
        status: 'completed'
      }
    ])

    setLoading(false)
  }, [])

  const downloadCSV = (type: 'waitlist' | 'submissions') => {
    let csv = ''
    let filename = ''

    if (type === 'waitlist') {
      csv = 'Email,Timestamp,Position\n'
      waitlist.forEach(entry => {
        csv += `${entry.email},${entry.timestamp},${entry.position}\n`
      })
      filename = 'waitlist.csv'
    } else {
      csv = 'Company,Email,Submitted,Score,Status\n'
      submissions.forEach(sub => {
        csv += `${sub.company_name},${sub.contact_email},${sub.submitted_at},${sub.score},${sub.status}\n`
      })
      filename = 'submissions.csv'
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Creed Admin
            </h1>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Waitlist</span>
            </div>
            <div className="text-3xl font-bold">{waitlist.length}</div>
            <div className="text-sm text-gray-600">Total signups</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-cyan-600" />
              <span className="text-sm text-gray-500">Health Checks</span>
            </div>
            <div className="text-3xl font-bold">{submissions.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Avg Score</span>
            </div>
            <div className="text-3xl font-bold">
              {submissions.length > 0
                ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length)
                : 0}
            </div>
            <div className="text-sm text-gray-600">Out of 100</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500">Conversions</span>
            </div>
            <div className="text-3xl font-bold">
              {waitlist.length > 0
                ? Math.round((submissions.length / waitlist.length) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Trial to contact</div>
          </div>
        </div>

        {/* Waitlist Table */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Waitlist Signups</h2>
            <button
              onClick={() => downloadCSV('waitlist')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {waitlist.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{entry.position}</td>
                    <td className="px-6 py-4 text-sm font-medium">{entry.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Check Submissions */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Health Check Submissions</h2>
            <button
              onClick={() => downloadCSV('submissions')}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{sub.company_name}</td>
                    <td className="px-6 py-4 text-sm">{sub.contact_email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sub.score >= 70 ? 'bg-green-100 text-green-800' :
                        sub.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sub.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
