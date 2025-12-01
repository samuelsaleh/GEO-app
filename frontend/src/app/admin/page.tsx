'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, Activity, TrendingUp, Download, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

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

interface User {
  id: number
  email: string
  full_name: string | null
  company: string | null
  subscription_tier: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  last_login: string | null
}

interface UserAnalytics {
  total_users: number
  active_users: number
  new_signups_7d: number
  users_by_tier: Record<string, number>
  daily_signups: Array<{ date: string; count: number }>
}

function AdminDashboardContent() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [submissions, setSubmissions] = useState<HealthCheckSubmission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
          (process.env.NODE_ENV === 'production' 
            ? 'https://geo-app-production-339e.up.railway.app' 
            : 'http://localhost:8000')
        const token = localStorage.getItem('auth_token')

        if (!token) {
          throw new Error('No auth token found')
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Fetch waitlist
        const waitlistRes = await fetch(`${apiUrl}/api/admin/waitlist`, { headers })

        if (!waitlistRes.ok) {
          throw new Error(`Waitlist API failed: ${waitlistRes.status}`)
        }

        const waitlistData = await waitlistRes.json()
        setWaitlist(waitlistData.entries || [])

        // Fetch visibility tests
        const testsRes = await fetch(`${apiUrl}/api/admin/visibility-tests`, { headers })

        if (!testsRes.ok) {
          throw new Error(`Tests API failed: ${testsRes.status}`)
        }

        const testsData = await testsRes.json()

        // Transform visibility tests to match submission format
        const transformedTests = testsData.tests?.map((test: any) => ({
          company_name: test.brand_name,
          contact_email: 'N/A',
          submitted_at: test.created_at,
          score: test.overall_score,
          status: 'completed'
        })) || []

        console.log('Transformed tests:', transformedTests.length, 'items')
        setSubmissions(transformedTests)

        // Fetch users
        const usersRes = await fetch(`${apiUrl}/api/admin/users`, { headers })
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }

        // Fetch user analytics
        const analyticsRes = await fetch(`${apiUrl}/api/admin/user-analytics`, { headers })
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setUserAnalytics(analyticsData)
        }

        setLoading(false)
        console.log('Loading complete!')
      } catch (error) {
        console.error('Error fetching admin data:', error)
        alert('Failed to load dashboard data. Check console for details.')
        setLoading(false)
      }
    }

    fetchData()
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
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Miageru Admin
              </h1>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  Logged in as {user.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Registered Users</span>
            </div>
            <div className="text-3xl font-bold">{userAnalytics?.total_users || 0}</div>
            <div className="text-sm text-gray-600">Total accounts</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-cyan-600" />
              <span className="text-sm text-gray-500">Active Users</span>
            </div>
            <div className="text-3xl font-bold">{userAnalytics?.active_users || 0}</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">New Signups</span>
            </div>
            <div className="text-3xl font-bold">{userAnalytics?.new_signups_7d || 0}</div>
            <div className="text-sm text-gray-600">Last 7 days</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500">Waitlist</span>
            </div>
            <div className="text-3xl font-bold">{waitlist.length}</div>
            <div className="text-sm text-gray-600">Total signups</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Registered Users</h2>
            <button
              onClick={() => {
                let csv = 'Email,Name,Company,Tier,Admin,Active,Created,LastLogin\n'
                users.forEach(u => {
                  csv += `${u.email},${u.full_name || ''},${u.company || ''},${u.subscription_tier},${u.is_admin},${u.is_active},${u.created_at},${u.last_login || ''}\n`
                })
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'users.csv'
                a.click()
              }}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {u.email}
                      {u.is_admin && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{u.full_name || '-'}</td>
                    <td className="px-6 py-4 text-sm">{u.company || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.subscription_tier === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                        u.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.subscription_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
