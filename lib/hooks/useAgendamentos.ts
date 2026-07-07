'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, db, Timestamp,
} from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { Agendamento, StatusAgendamento } from '../types'
import { useAuth } from '../context/AuthContext'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'

export function useAgendamentos(de: Date, ate: Date) {
  const { perfil } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  const deTime = de.getTime()
  const ateTime = ate.getTime()

  useEffect(() => {
    if (!perfil?.oficina_id) return
    const q = query(
      collection(db, 'agendamentos'),
      where('oficina_id', '==', perfil.oficina_id),
      where('data_hora', '>=', Timestamp.fromDate(startOfDay(de))),
      where('data_hora', '<=', Timestamp.fromDate(endOfDay(ate))),
      orderBy('data_hora', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      setAgendamentos(snap.docs.map(d => docToData<Agendamento>(d)))
      setLoading(false)
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.oficina_id, deTime, ateTime])

  return { agendamentos, loading }
}

export function useAgendamentosHoje() {
  const hoje = useMemo(() => new Date(), [])
  return useAgendamentos(hoje, hoje)
}

export function useAgendamentosSemana(referencia: Date) {
  const refTime = referencia.getTime()
  const inicio = useMemo(() => startOfWeek(referencia, { weekStartsOn: 1 }), [refTime])
  const fim = useMemo(() => endOfWeek(referencia, { weekStartsOn: 1 }), [refTime])
  return useAgendamentos(inicio, fim)
}

export async function criarAgendamento(dados: any): Promise<string> {
  const ref = await addDoc(collection(db, 'agendamentos'), {
    ...dados,
    data_hora: Timestamp.fromDate(dados.data_hora),
    status: 'agendado' as StatusAgendamento,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function atualizarStatusAgendamento(id: string, status: StatusAgendamento, os_id?: string) {
  await updateDoc(doc(db, 'agendamentos', id), {
    status, ...(os_id ? { os_id } : {}), updatedAt: serverTimestamp(),
  })
}

export async function editarAgendamento(id: string, dados: any) {
  const payload: any = { ...dados, updatedAt: serverTimestamp() }
  if (dados.data_hora) payload.data_hora = Timestamp.fromDate(new Date(dados.data_hora))
  await updateDoc(doc(db, 'agendamentos', id), payload)
}