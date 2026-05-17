'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, db, Timestamp,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { MovimentacaoEstoque } from '../types'
import { useAuth } from '../context/AuthContext'
import { startOfDay, endOfDay } from 'date-fns'

export function useMovimentacoes(limite = 50) {
  const { perfil } = useAuth()
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'movimentacoes_estoque'),
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('createdAt', 'desc'),
      limit(limite),
    )
    const unsub = onSnapshot(q, snap => {
      setMovimentacoes(snap.docs.map(d => docToData<MovimentacaoEstoque>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [perfil?.oficina_id, limite])
  return { movimentacoes, loading }
}

export function useMovimentacoesItem(item_id: string) {
  const { perfil } = useAuth()
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.oficina_id || !item_id) return
    const q = query(
      collection(db, 'movimentacoes_estoque'),
      where('item_id', '==', item_id),
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('createdAt', 'desc'),
      limit(30),
    )
    const unsub = onSnapshot(q, snap => {
      setMovimentacoes(snap.docs.map(d => docToData<MovimentacaoEstoque>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [item_id, perfil?.oficina_id])
  return { movimentacoes, loading }
}

export function useMovimentacoesPeriodo(de: Date, ate: Date) {
  const { perfil } = useAuth()
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'movimentacoes_estoque'),
      where('oficina_id', '==', perfil.oficina_id),
      where('createdAt', '>=', Timestamp.fromDate(startOfDay(de))),
      where('createdAt', '<=', Timestamp.fromDate(endOfDay(ate))),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setMovimentacoes(snap.docs.map(d => docToData<MovimentacaoEstoque>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [perfil?.oficina_id, de.toISOString(), ate.toISOString()])
  return { movimentacoes, loading }
}