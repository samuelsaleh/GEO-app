'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not logged in, redirect to login
        router.push('/login')
      } else if (requireAdmin && !isAdmin) {
        // Logged in but not admin, redirect to home
        router.push('/')
      }
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-50 to-cream-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-claude-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-500 font-light">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated/authorized
  if (!isAuthenticated) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}
