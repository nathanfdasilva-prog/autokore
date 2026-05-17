'use client'
// ============================================================
// AUTH GUARD — components/auth/AuthGuard.tsx
// Protege rotas verificando autenticação e role do usuário.
// ============================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import type { Role } from '@/lib/types'

interface AuthGuardProps {
  children:     React.ReactNode
  requiredRole?: Role   // undefined = qualquer usuário logado
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, perfil, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Não logado → redireciona para login
    if (!user) {
      router.replace('/login')
      return
    }

    // Logado mas sem perfil ainda (primeiro login Google)
    if (!perfil) return

    // Verificação de role
    if (requiredRole === 'admin' && perfil.role !== 'admin') {
      router.replace('/os')   // mecânicos vão para a área deles
      return
    }
  }, [user, perfil, loading, requiredRole, router])

  // Tela de carregamento
  if (loading || !user || (requiredRole && !perfil)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Role admin requerida mas usuário não é admin
  if (requiredRole === 'admin' && perfil?.role !== 'admin') {
    return null // router.replace já cuida do redirect
  }

  return <>{children}</>
}
