'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, limit,
  onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, db, Timestamp, getDocs,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export type StatusOrcamento =
  | 'rascunho' | 'enviado' | 'aprovado'
  | 'reprovado' | 'expirado' | 'convertido'

export interface ItemOrcamento {
  descricao: string
  tipo: 'peca' | 'servico'
  produto_id?: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

export interface Orcamento {
  id: string
  numero: number
  oficina_id: string
  cliente_nome: string
  cliente_whatsapp: string
  veiculo: string
  placa: string
  tipo_veiculo: 'carro' | 'moto'
  km?: number
  descricao: string
  observacoes?: string
  itens: ItemOrcamento[]
  valor_pecas: number
  valor_servicos: number
  valor_total: number
  desconto: number
  valor_final: number
  status: StatusOrcamento
  validade_dias: number
  validade_ate: Date
  criado_por: string
  criado_por_nome: string
  os_id?: string
  aprovado_em?: Date
  reprovado_motivo?: string
  createdAt: Date
  updatedAt: Date
}

export function useOrcamentos(status?: StatusOrcamento) {
  const { perfil } = useAuth()
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!perfil?.oficina_id) {
      setLoading(false)
      return
    }
    const constraints: any[] = [
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('createdAt', 'desc'),
    ]
    if (status) constraints.splice(1, 0, where('status', '==', status))
    const q = query(collection(db, 'orcamentos'), ...constraints)
    const unsub = onSnapshot(q, snap => {
      setOrcamentos(snap.docs.map(d => docToData<Orcamento>(d)))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [perfil?.oficina_id, status])
  return { orcamentos, loading }
}

async function proximoNumeroOrcamento(oficina_id: string): Promise<number> {
  const q = query(collection(db, 'orcamentos'), where('oficina_id', '==', oficina_id), orderBy('numero', 'desc'), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return 1
  return (snap.docs[0].data().numero ?? 0) + 1
}

export async function criarOrcamento(dados: any): Promise<string> {
  const numero = await proximoNumeroOrcamento(dados.oficina_id)
  const valor_pecas = dados.itens.filter((i: any) => i.tipo === 'peca').reduce((s: number, i: any) => s + i.subtotal, 0)
  const valor_servicos = dados.itens.filter((i: any) => i.tipo === 'servico').reduce((s: number, i: any) => s + i.subtotal, 0)
  const valor_total = valor_pecas + valor_servicos
  const valor_final = Math.max(0, valor_total - dados.desconto)
  const validade = new Date()
  validade.setDate(validade.getDate() + dados.validade_dias)
  const ref = await addDoc(collection(db, 'orcamentos'), {
    ...dados, numero, valor_pecas, valor_servicos, valor_total, valor_final,
    status: 'rascunho' as StatusOrcamento,
    validade_ate: Timestamp.fromDate(validade),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function atualizarStatusOrcamento(id: string, status: StatusOrcamento, extras?: any) {
  await updateDoc(doc(db, 'orcamentos', id), {
    status,
    ...(extras?.os_id ? { os_id: extras.os_id } : {}),
    ...(extras?.reprovado_motivo ? { reprovado_motivo: extras.reprovado_motivo } : {}),
    ...(extras?.aprovado_em ? { aprovado_em: Timestamp.fromDate(extras.aprovado_em) } : {}),
    updatedAt: serverTimestamp(),
  })
}

export async function enviarOrcamento(id: string) {
  await updateDoc(doc(db, 'orcamentos', id), {
    status: 'enviado' as StatusOrcamento,
    updatedAt: serverTimestamp(),
  })
}