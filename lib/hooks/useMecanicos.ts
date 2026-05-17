'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, db, Timestamp,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { Usuario, OrdemServico } from '../types'
import { useAuth } from '../context/AuthContext'
import { startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns'

export interface MetricasMecanico {
  uid: string
  nome: string
  email: string
  ativo: boolean
  os_mes: number
  os_concluidas: number
  os_canceladas: number
  taxa_conclusao: number
  faturamento_gerado: number
  ticket_medio: number
  tempo_medio_min: number
  total_pecas_usadas: number
}

export function useDesempenhoMecanicos(mesRef?: Date) {
  const { perfil } = useAuth()
  const mes = mesRef ?? new Date()
  const [mecanicos, setMecanicos] = useState<Usuario[]>([])
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(collection(db, 'users'), where('oficina_id', '==', perfil.oficina_id))
    const unsub = onSnapshot(q, snap => setMecanicos(snap.docs.map(d => docToData<Usuario>(d))))
    return () => unsub()
  }, [perfil?.oficina_id])

  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'ordens_servico'),
      where('oficina_id', '==', perfil.oficina_id),
      where('createdAt', '>=', Timestamp.fromDate(startOfMonth(mes))),
      where('createdAt', '<=', Timestamp.fromDate(endOfMonth(mes))),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setOrdens(snap.docs.map(d => docToData<OrdemServico>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [perfil?.oficina_id, mes.getMonth(), mes.getFullYear()])

  const metricas: MetricasMecanico[] = mecanicos
    .filter(m => m.role === 'mecanico' || m.role === 'admin')
    .map(mec => {
      const osMec = ordens.filter(os => os.mecanico_id === mec.uid)
      const concluidas = osMec.filter(os => os.status === 'concluida')
      const canceladas = osMec.filter(os => os.status === 'cancelada')
      const faturamento = concluidas.reduce((s, os) => s + os.valor_total, 0)
      const ticketMedio = concluidas.length > 0 ? faturamento / concluidas.length : 0
      const osComTempo = concluidas.filter(os => os.finalizadaAt)
      const tempoMedio = osComTempo.length > 0
        ? osComTempo.reduce((s, os) => s + differenceInMinutes(os.finalizadaAt!, os.createdAt), 0) / osComTempo.length
        : 0
      const totalPecas = concluidas.reduce((s, os) => s + os.itens.reduce((si, i) => si + i.quantidade, 0), 0)
      return {
        uid: mec.uid, nome: mec.nome, email: mec.email, ativo: mec.ativo,
        os_mes: osMec.length, os_concluidas: concluidas.length, os_canceladas: canceladas.length,
        taxa_conclusao: osMec.length > 0 ? Math.round((concluidas.length / osMec.length) * 100) : 0,
        faturamento_gerado: faturamento, ticket_medio: ticketMedio,
        tempo_medio_min: Math.round(tempoMedio), total_pecas_usadas: totalPecas,
      }
    })
    .sort((a, b) => b.faturamento_gerado - a.faturamento_gerado)

  return { metricas, loading, mes }
}