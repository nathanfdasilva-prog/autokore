'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, addDoc, updateDoc, getDoc,
  serverTimestamp, db,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import { baixarEstoque } from './useEstoque'
import type { OrdemServico, StatusOS, ItemOS } from '../types'
import { useAuth } from '../context/AuthContext'

export function useMinhasOS() {
  const { perfil, isAdmin } = useAuth()
  const [ordens,  setOrdens]  = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState<string | null>(null)

  useEffect(() => {
    if (!perfil?.oficina_id) { setLoading(false); return }

    const constraints = [
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('createdAt', 'desc'),
    ]

    if (!isAdmin) {
      constraints.splice(1, 0, where('mecanico_id', '==', perfil.uid))
    }

    const q = query(collection(db, 'ordens_servico'), ...constraints)

    const unsub = onSnapshot(q,
      snap => { setOrdens(snap.docs.map(d => docToData<OrdemServico>(d))); setLoading(false) },
      err  => { setErro(err.message); setLoading(false) },
    )

    return () => unsub()
  }, [perfil?.uid, perfil?.oficina_id, isAdmin])

  return { ordens, loading, erro }
}

export function useOS(id: string) {
  const [os,      setOS]      = useState<OrdemServico | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    const unsub = onSnapshot(doc(db, 'ordens_servico', id), snap => {
      setOS(snap.exists() ? docToData<OrdemServico>(snap) : null)
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [id])

  return { os, loading }
}

async function proximoNumeroOS(oficina_id: string): Promise<number> {
  const q = query(
    collection(db, 'ordens_servico'),
    where('oficina_id', '==', oficina_id),
    orderBy('numero', 'desc'),
  )
  const snap = await import('firebase/firestore').then(({ getDocs }) => getDocs(q))
  if (snap.empty) return 1
  const ultimo = snap.docs[0].data().numero ?? 0
  return ultimo + 1
}

export async function criarOS(dados: {
  oficina_id:          string
  cliente_nome:        string
  cliente_whatsapp:    string
  veiculo:             string
  placa:               string
  tipo_veiculo:        'carro' | 'moto'
  km_entrada?:         number
  descricao_problema:  string
  mecanico_id:         string
  mecanico_nome:       string
  agendamento_id?:     string
}): Promise<string> {
  const numero = await proximoNumeroOS(dados.oficina_id)

  const payload: Record<string, any> = {
    oficina_id:          dados.oficina_id,
    cliente_nome:        dados.cliente_nome,
    cliente_whatsapp:    dados.cliente_whatsapp,
    veiculo:             dados.veiculo,
    placa:               dados.placa,
    tipo_veiculo:        dados.tipo_veiculo,
    descricao_problema:  dados.descricao_problema,
    mecanico_id:         dados.mecanico_id,
    mecanico_nome:       dados.mecanico_nome,
    numero,
    status:              'aberta' as StatusOS,
    itens:               [],
    valor_pecas:         0,
    valor_mao_obra:      0,
    valor_total:         0,
    observacoes_internas: '',
    createdAt:           serverTimestamp(),
    updatedAt:           serverTimestamp(),
  }

  if (dados.km_entrada !== undefined) payload.km_entrada = dados.km_entrada
  if (dados.agendamento_id !== undefined) payload.agendamento_id = dados.agendamento_id

  const ref = await addDoc(collection(db, 'ordens_servico'), payload)
  return ref.id
}

export async function atualizarStatusOS(os_id: string, status: StatusOS) {
  await updateDoc(doc(db, 'ordens_servico', os_id), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function atualizarOS(os_id: string, dados: Record<string, any>) {
  await updateDoc(doc(db, 'ordens_servico', os_id), {
    ...dados,
    updatedAt: serverTimestamp(),
  })
}

export async function salvarItensOS(os_id: string, itens: ItemOS[], valor_mao_obra: number) {
  const valor_pecas = itens.reduce((s, i) => s + i.subtotal, 0)
  const valor_total = valor_pecas + valor_mao_obra
  await updateDoc(doc(db, 'ordens_servico', os_id), {
    itens, valor_pecas, valor_mao_obra, valor_total,
    updatedAt: serverTimestamp(),
  })
}

export async function finalizarOS(params: {
  os_id:           string
  oficina_id:      string
  usuario_id:      string
  usuario_nome:    string
  itens:           ItemOS[]
  valor_mao_obra:  number
  forma_pagamento: OrdemServico['forma_pagamento']
  observacoes?:    string
}): Promise<void> {
  const { os_id, oficina_id, usuario_id, usuario_nome, itens, valor_mao_obra, forma_pagamento, observacoes } = params

  if (itens.length > 0) {
    await baixarEstoque({
      oficina_id, usuario_id, usuario_nome, os_id,
      itens: itens.map(i => ({ produto_id: i.produto_id, quantidade: i.quantidade, nome: i.nome })),
    })
  }

  const valor_pecas = itens.reduce((s, i) => s + i.subtotal, 0)
  const valor_total = valor_pecas + valor_mao_obra

  await updateDoc(doc(db, 'ordens_servico', os_id), {
    status:               'concluida' as StatusOS,
    itens, valor_pecas, valor_mao_obra, valor_total,
    forma_pagamento,
    observacoes_internas: observacoes ?? '',
    finalizadaAt:         serverTimestamp(),
    updatedAt:            serverTimestamp(),
  })
}