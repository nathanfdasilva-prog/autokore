'use client'
// ============================================================
// ROOT PAGE — app/page.tsx
// Redireciona automaticamente conforme o estado de auth.
// ============================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

export default function RootPage() {
  const { user, perfil, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
    } else if (perfil?.role === 'admin') {
      router.replace('/dashboard')
    } else {
      router.replace('/os')
    }
  }, [user, perfil, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
