'use client'
// ============================================================
// HOOK useEstoque — lib/hooks/useEstoque.ts
// Queries em tempo real no estoque do Firestore.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, addDoc, getDocs,
  serverTimestamp, increment, db,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { ItemEstoque, MovimentacaoEstoque } from '../types'
import { useAuth } from '../context/AuthContext'

// ----------------------------------------------------------
// Hook principal — lista todos os itens em tempo real
// ----------------------------------------------------------
export function useEstoque() {
  const { perfil } = useAuth()
  const [itens,   setItens]   = useState<ItemEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState<string | null>(null)

  useEffect(() => {
    if (!perfil?.oficina_id) return

    const q = query(
      collection(db, 'estoque'),
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('nome', 'asc'),
    )

    const unsub = onSnapshot(q,
      snap => {
        setItens(snap.docs.map(d => docToData<ItemEstoque>(d)))
        setLoading(false)
      },
      err => {
        console.error('useEstoque:', err)
        setErro(err.message)
        setLoading(false)
      },
    )

    return () => unsub()
  }, [perfil?.oficina_id])

  // Itens abaixo do mínimo
  const itensCriticos = itens.filter(i => i.quantidade <= i.quantidade_minima)

  return { itens, itensCriticos, loading, erro }
}

// ----------------------------------------------------------
// Busca de peças em tempo real (para o formulário de OS)
// Filtra pelo texto digitado — busca por nome e categoria
// ----------------------------------------------------------
export function useBuscaPecas(termo: string) {
  const { perfil } = useAuth()
  const [resultados, setResultados] = useState<ItemEstoque[]>([])
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (!perfil?.oficina_id) return
    if (termo.trim().length < 2) {
      setResultados([])
      return
    }

    setLoading(true)

    // Firestore não tem full-text search nativo.
    // Usamos prefix query: busca onde nome >= termo e nome < termo + '\uf8ff'
    // Para busca avançada futura, integrar Algolia ou Typesense.
    const termoUpper = termo.toLowerCase()

    const q = query(
      collection(db, 'estoque'),
      where('oficina_id', '==', perfil.oficina_id),
      where('nome_lower', '>=', termoUpper),
      where('nome_lower', '<=', termoUpper + '\uf8ff'),
      orderBy('nome_lower'),
      // limit removido para exibir todos os matches dentro do escopo
    )

    const unsub = onSnapshot(q, snap => {
      const todos = snap.docs.map(d => docToData<ItemEstoque>(d))
      // filtra adicionalmente no cliente para maior precisão
      setResultados(todos.filter(i => i.quantidade > 0))
      setLoading(false)
    })

    return () => unsub()
  }, [termo, perfil?.oficina_id])

  return { resultados, loading }
}

// ----------------------------------------------------------
// Função de baixa de estoque (chamada internamente pela OS)
// Usa runTransaction para garantir atomicidade
// ----------------------------------------------------------
export async function baixarEstoque(params: {
  oficina_id:   string
  usuario_id:   string
  usuario_nome: string
  os_id:        string
  itens: Array<{ produto_id: string; quantidade: number; nome: string }>
}): Promise<void> {
  const { oficina_id, usuario_id, usuario_nome, os_id, itens } = params

  // Importa runTransaction aqui para evitar importação circular
  const { runTransaction, db } = await import('../firebase/firestore')

  await runTransaction(db, async (transaction) => {
    for (const item of itens) {
      const itemRef = doc(db, 'estoque', item.produto_id)
      const snap    = await transaction.get(itemRef)

      if (!snap.exists()) {
        throw new Error(`Peça "${item.nome}" não encontrada no estoque.`)
      }

      const estoque = snap.data() as ItemEstoque

      if (estoque.quantidade < item.quantidade) {
        throw new Error(
          `Estoque insuficiente para "${item.nome}". ` +
          `Disponível: ${estoque.quantidade}, necessário: ${item.quantidade}.`
        )
      }

      // Decrementa quantidade
      transaction.update(itemRef, {
        quantidade: increment(-item.quantidade),
        updatedAt:  serverTimestamp(),
      })

      // Registra movimentação (append-only)
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
