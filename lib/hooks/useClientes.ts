'use client'
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, db, getDocs,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { Cliente, Veiculo, OrdemServico } from '../types'
import { useAuth } from '../context/AuthContext'

export function useClientes() {
  const { perfil } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'clientes'),
      where('oficina_id', '==', perfil.oficina_id),
      orderBy('nome', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      setClientes(snap.docs.map(d => docToData<Cliente>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [perfil?.oficina_id])

  return { clientes, loading }
}

export function useVeiculosCliente(cliente_id: string) {
  const { perfil } = useAuth()
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id || !cliente_id) return
    const q = query(
      collection(db, 'veiculos'),
      where('cliente_id',  '==', cliente_id),
      where('oficina_id',  '==', perfil.oficina_id),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setVeiculos(snap.docs.map(d => docToData<Veiculo>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [cliente_id, perfil?.oficina_id])

  return { veiculos, loading }
}

export function useOSCliente(cliente_nome: string) {
  const { perfil } = useAuth()
  const [ordens,  setOrdens]  = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id || !cliente_nome) return
    const q = query(
      collection(db, 'ordens_servico'),
      where('oficina_id',   '==', perfil.oficina_id),
      where('cliente_nome', '==', cliente_nome),
      orderBy('createdAt',  'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setOrdens(snap.docs.map(d => docToData<OrdemServico>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [cliente_nome, perfil?.oficina_id])

  return { ordens, loading }
}

export function useHistoricoVeiculo(placa: string) {
  const { perfil } = useAuth()
  const [ordens,  setOrdens]  = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id || !placa) return
    const q = query(
      collection(db, 'ordens_servico'),
      where('oficina_id', '==', perfil.oficina_id),
      where('placa',      '==', placa.toUpperCase()),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setOrdens(snap.docs.map(d => docToData<OrdemServico>(d)))
      setLoading(false)
    })
    return () => unsub()
  }, [placa, perfil?.oficina_id])

  return { ordens, loading }
}

export async function criarCliente(dados: {
  oficina_id: string
  nome:       string
  whatsapp:   string
  email?:     string
  cpf?:       string
}): Promise<string> {
  const ref = await addDoc(collection(db, 'clientes'), {
    ...dados,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function criarVeiculo(dados: {
  oficina_id:  string
  cliente_id:  string
  marca:       string
  modelo:      string
  ano:         number
  placa:       string
  cor?:        string
  km?:         number
  tipo:        'carro' | 'moto'
}): Promise<string> {
  const ref = await addDoc(collection(db, 'veiculos'), {
    ...dados,
    placa:     dados.placa.toUpperCase(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function atualizarKmVeiculo(veiculo_id: string, km: number) {
  await updateDoc(doc(db, 'veiculos', veiculo_id), {
    km,
    updatedAt: serverTimestamp(),
  })
}