'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, addDoc, getDocs,
  serverTimestamp, increment, db,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { ItemEstoque, MovimentacaoEstoque } from '../types'
import { useAuth } from '../context/AuthContext'

export function useEstoque() {
  const { perfil } = useAuth()
  const [itens,   setItens]   = useState<ItemEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState<string | null>(null)

  useEffect(() => {
    if (!perfil?.oficina_id) { setLoading(false); return }
    const q = query(
      collection(db, 'estoque'),
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('nome', 'asc'),
    )
    const unsub = onSnapshot(q,
      snap => { setItens(snap.docs.map(d => docToData<ItemEstoque>(d))); setLoading(false) },
      err => { console.error('useEstoque:', err); setErro(err.message); setLoading(false) },
    )
    return () => unsub()
  }, [perfil?.oficina_id])

  const itensCriticos = itens.filter(i => i.quantidade <= i.quantidade_minima)
  return { itens, itensCriticos, loading, erro }
}

export function useBuscaPecas(termo: string) {
  const { perfil } = useAuth()
  const [resultados, setResultados] = useState<ItemEstoque[]>([])
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (!perfil?.oficina_id) return
    if (termo.trim().length < 2) { setResultados([]); return }
    setLoading(true)
    const termoUpper = termo.toLowerCase()
    const q = query(
      collection(db, 'estoque'),
      where('oficina_id', '==', perfil.oficina_id),
      where('nome_lower', '>=', termoUpper),
      where('nome_lower', '<=', termoUpper + '\uf8ff'),
      orderBy('nome_lower'),
    )
    const unsub = onSnapshot(q, snap => {
      const todos = snap.docs.map(d => docToData<ItemEstoque>(d))
      setResultados(todos.filter(i => i.quantidade > 0))
      setLoading(false)
    })
    return () => unsub()
  }, [termo, perfil?.oficina_id])

  return { resultados, loading }
}

export async function baixarEstoque(params: {
  oficina_id:   string
  usuario_id:   string
  usuario_nome: string
  os_id:        string
  itens: Array<{ produto_id: string; quantidade: number; nome: string }>
}): Promise<void> {
  const { oficina_id, usuario_id, usuario_nome, os_id, itens } = params
  const { runTransaction, db } = await import('../firebase/firestore')

  await runTransaction(db, async (transaction) => {
    // 1. TODAS as leituras primeiro
    const refs = itens.map(item => doc(db, 'estoque', item.produto_id))
    const snaps = await Promise.all(refs.map(ref => transaction.get(ref)))

    // 2. Valida tudo antes de escrever
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i]
      const snap = snaps[i]
      if (!snap.exists()) throw new Error(`Peça "${item.nome}" não encontrada no estoque.`)
      const estoque = snap.data() as ItemEstoque
      if (estoque.quantidade < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${item.nome}". Disponível: ${estoque.quantidade}, necessário: ${item.quantidade}.`)
      }
    }

    // 3. TODAS as escritas depois
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i]
      const ref  = refs[i]

      transaction.update(ref, {
        quantidade: increment(-item.quantidade),
        updatedAt:  serverTimestamp(),
      })

      const movRef = doc(collection(db, 'movimentacoes_estoque'))
      transaction.set(movRef, {
        item_id:      item.produto_id,
        oficina_id,
        tipo:         'saida',
        quantidade:   item.quantidade,
        os_id,
        usuario_id,
        usuario_nome,
        createdAt:    serverTimestamp(),
      } satisfies Omit<MovimentacaoEstoque, 'id'>)
    }
  })
}