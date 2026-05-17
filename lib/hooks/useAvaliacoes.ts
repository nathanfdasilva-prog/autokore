'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, db, Timestamp,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { startOfMonth, endOfMonth } from 'date-fns'

export interface Avaliacao {
  id: string
  oficina_id: string
  os_id: string
  cliente_nome: string
  veiculo: string
  nota: number
  nps: number
  comentario: string
  mecanico_id: string
  mecanico_nome: string
  respondido: boolean
  resposta?: string
  createdAt: Date
}

export interface ResumoAvaliacoes {
  total: number
  media_estrelas: number
  nps_score: number
  promotores: number
  neutros: number
  detratores: number
  distribuicao: Record<1|2|3|4|5, number>
}

export function useAvaliacoes(qtd = 50) {
  const { perfil } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'avaliacoes'),
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('createdAt', 'desc'),
      limit(qtd),
    )
    const unsub = onSnapshot(q, snap => {
      setAvaliacoes(snap.docs.map(d => docToData<Avaliacao>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [perfil?.oficina_id, qtd])
  return { avaliacoes, loading }
}

export function useResumoAvaliacoes(mesRef?: Date) {
  const { perfil } = useAuth()
  const mes = mesRef ?? new Date()
  const [resumo, setResumo] = useState<ResumoAvaliacoes | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'avaliacoes'),
      where('oficina_id', '==', perfil.oficina_id),
      where('createdAt', '>=', Timestamp.fromDate(startOfMonth(mes))),
      where('createdAt', '<=', Timestamp.fromDate(endOfMonth(mes))),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      const avs = snap.docs.map(d => docToData<Avaliacao>(d))
      if (avs.length === 0) {
        setResumo({ total: 0, media_estrelas: 0, nps_score: 0, promotores: 0, neutros: 0, detratores: 0, distribuicao: {1:0,2:0,3:0,4:0,5:0} })
        setLoading(false)
        return
      }
      const dist = {1:0,2:0,3:0,4:0,5:0} as Record<1|2|3|4|5,number>
      avs.forEach(a => { dist[a.nota as 1|2|3|4|5]++ })
      const mediaEst = avs.reduce((s,a) => s + a.nota, 0) / avs.length
      const promotores = avs.filter(a => a.nps >= 9).length
      const neutros = avs.filter(a => a.nps >= 7 && a.nps <= 8).length
      const detratores = avs.filter(a => a.nps <= 6).length
      const nps = Math.round(((promotores - detratores) / avs.length) * 100)
      setResumo({ total: avs.length, media_estrelas: Math.round(mediaEst * 10) / 10, nps_score: nps, promotores, neutros, detratores, distribuicao: dist })
      setLoading(false)
    })
    return () => unsub()
  }, [perfil?.oficina_id, mes.getMonth(), mes.getFullYear()])
  return { resumo, loading }
}

export async function osJaAvaliada(os_id: string): Promise<boolean> {
  const { getDocs } = await import('../firebase/firestore')
  const q = query(collection(db, 'avaliacoes'), where('os_id', '==', os_id), limit(1))
  const snap = await getDocs(q)
  return !snap.empty
}

export async function registrarAvaliacao(dados: any): Promise<string> {
  const ref = await addDoc(collection(db, 'avaliacoes'), { ...dados, respondido: false, createdAt: serverTimestamp() })
  await updateDoc(doc(db, 'ordens_servico', dados.os_id), { avaliada: true, updatedAt: serverTimestamp() })
  return ref.id
}

export async function responderAvaliacao(id: string, resposta: string) {
  await updateDoc(doc(db, 'avaliacoes', id), { respondido: true, resposta, updatedAt: serverTimestamp() })
}