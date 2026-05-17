'use client'
// ============================================================
// AUTH CONTEXT — lib/context/AuthContext.tsx
// Estado global de autenticação acessível em todo o app.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../firebase/config'
import { buscarPerfil } from '../firebase/auth'
import type { Usuario } from '../types'

// ---------- Tipos do contexto ----------
interface AuthContextType {
  user:       User | null          // objeto Firebase Auth
  perfil:     Usuario | null       // dados do Firestore
  loading:    boolean
  isAdmin:    boolean
  isMecanico: boolean
}

// ---------- Contexto ----------
const AuthContext = createContext<AuthContextType>({
  user:       null,
  perfil:     null,
  loading:    true,
  isAdmin:    false,
  isMecanico: false,
})

// ---------- Provider ----------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [perfil,  setPerfil]  = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const dados = await buscarPerfil(firebaseUser)
        setPerfil(dados)
      } else {
        setUser(null)
        setPerfil(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isAdmin    = perfil?.role === 'admin'
  const isMecanico = perfil?.role === 'mecanico' || isAdmin

  return (
    <AuthContext.Provider value={{ user, perfil, loading, isAdmin, isMecanico }}>
      {children}
    </AuthContext.Provider>
  )
}

// ---------- Hook ----------
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
