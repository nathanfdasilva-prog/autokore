'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, db, Timestamp,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { OrdemServico } from '../types'
import { useAuth } from '../context/AuthContext'

export interface ResumoComissao {
  os_concluidas:    number
  total_mao_obra:   number
  total_pecas:      number
  total_geral:      number
  comissao_mao_obra: number
  comissao_peca:     number
  comissao_total:    number
}

// Calcula a producao e a comissao do mecanico logado num periodo.
// A comissao conta pela data de finalizacao da OS (finalizadaAt).
export function useMinhaComissao(de: Date, ate: Date) {
  const { perfil } = useAuth()
  const [ordens,  setOrdens]  = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)

  const pctMaoObra = perfil?.comissao_mao_obra ?? 0
  const pctPeca    = perfil?.comissao_peca ?? 0

  useEffect(() => {
    if (!perfil?.oficina_id || !perfil?.uid) { setLoading(false); return }
    setLoading(true)
    const q = query(
      collection(db, 'ordens_servico'),
      where('oficina_id',   '==', perfil.oficina_id),
      where('mecanico_id',  '==', perfil.uid),
      where('status',       '==', 'concluida'),
      where('finalizadaAt', '>=', Timestamp.fromDate(de)),
      where('finalizadaAt', '<=', Timestamp.fromDate(ate)),
      orderBy('finalizadaAt', 'desc'),
    )
    const unsub = onSnapshot(q,
      snap => { setOrdens(snap.docs.map(d => docToData<OrdemServico>(d))); setLoading(false) },
      ()   => setLoading(false),
    )
    return () => unsub()
  }, [perfil?.oficina_id, perfil?.uid, de.getTime(), ate.getTime()])

  const total_mao_obra = ordens.reduce((s, os) => s + (os.valor_mao_obra || 0), 0)
  const total_pecas    = ordens.reduce((s, os) => s + (os.valor_pecas || 0), 0)
  const total_geral    = ordens.reduce((s, os) => s + (os.valor_total || 0), 0)

  const comissao_mao_obra = total_mao_obra * (pctMaoObra / 100)
  const comissao_peca     = total_pecas    * (pctPeca / 100)
  const comissao_total    = comissao_mao_obra + comissao_peca

  const resumo: ResumoComissao = {
    os_concluidas:     ordens.length,
    total_mao_obra,
    total_pecas,
    total_geral,
    comissao_mao_obra,
    comissao_peca,
    comissao_total,
  }

  return { ordens, resumo, loading, pctMaoObra, pctPeca }
}
