'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, doc, updateDoc,
  serverTimestamp, db, Timestamp,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { startOfMonth, endOfMonth } from 'date-fns'

export function useOficinasRede() {
  const { perfil, isAdmin } = useAuth()
  const [oficinas, setOficinas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.uid || !isAdmin) {
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'oficinas'),
      where('rede_dono_uid', '==', perfil.uid),
      where('ativo', '==', true),
      orderBy('nome', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      setOficinas(snap.docs.map(d => docToData<any>(d)))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [perfil?.uid, isAdmin])
  return { oficinas, loading }
}

export function useKPIRede(oficina_ids: string[]) {
  const [kpis, setKpis] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!oficina_ids.length) { setLoading(false); return }
    const hoje = new Date()
    const inicio = startOfMonth(hoje)
    const fim = endOfMonth(hoje)
    const chunks: string[][] = []
    for (let i = 0; i < oficina_ids.length; i += 10) chunks.push(oficina_ids.slice(i, i + 10))
    let todasOS: any[] = []
    let pendente = chunks.length
    chunks.forEach(async chunk => {
      const { getDocs } = await import('../firebase/firestore')
      const q = query(
        collection(db, 'ordens_servico'),
        where('oficina_id', 'in', chunk),
        where('createdAt', '>=', Timestamp.fromDate(inicio)),
        where('createdAt', '<=', Timestamp.fromDate(fim)),
        orderBy('createdAt', 'desc'),
      )
      const snap = await getDocs(q)
      todasOS = [...todasOS, ...snap.docs.map(d => d.data())]
      pendente--
      if (pendente === 0) {
        const ativas = todasOS.filter(o => ['aberta','em_andamento','aguardando_pecas'].includes(o.status))
        const concluidas = todasOS.filter(o => o.status === 'concluida')
        const fatMes = concluidas.reduce((s: number, o: any) => s + (o.valor_total ?? 0), 0)
        const ticket = concluidas.length > 0 ? fatMes / concluidas.length : 0
        setKpis({ total_oficinas: oficina_ids.length, oficinas_ativas: oficina_ids.length, total_mecanicos: 0, os_ativas: ativas.length, faturamento_mes: fatMes, os_mes: todasOS.length, ticket_medio: ticket })
        setLoading(false)
      }
    })
  }, [oficina_ids.join(',')])

  return { kpis, loading }
}

export async function adicionarOficinaARede(oficina_id: string, rede_dono_uid: string) {
  await updateDoc(doc(db, 'oficinas', oficina_id), { rede_dono_uid, updatedAt: serverTimestamp() })
}

export async function removerOficinaRede(oficina_id: string) {
  await updateDoc(doc(db, 'oficinas', oficina_id), { rede_dono_uid: null, updatedAt: serverTimestamp() })
}