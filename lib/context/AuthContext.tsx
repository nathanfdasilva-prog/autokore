'use client'
import {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { buscarPerfil } from '../firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { Usuario, Oficina } from '../types'

interface AuthContextType {
  user:       User | null
  perfil:     Usuario | null
  oficina:    Oficina | null
  loading:    boolean
  isAdmin:    boolean
  isMecanico: boolean
}

const AuthContext = createContext<AuthContextType>({
  user:       null,
  perfil:     null,
  oficina:    null,
  loading:    true,
  isAdmin:    false,
  isMecanico: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [perfil,  setPerfil]  = useState<Usuario | null>(null)
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const dados = await buscarPerfil(firebaseUser)
        setPerfil(dados)
        if (dados?.oficina_id) {
          const snap = await getDoc(doc(db, 'oficinas', dados.oficina_id))
          if (snap.exists()) {
            setOficina({ id: snap.id, ...snap.data() } as Oficina)
          }
        }
      } else {
        setUser(null)
        setPerfil(null)
        setOficina(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const isAdmin    = perfil?.role === 'admin'
  const isMecanico = perfil?.role === 'mecanico' || isAdmin

  return (
    <AuthContext.Provider value={{ user, perfil, oficina, loading, isAdmin, isMecanico }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}