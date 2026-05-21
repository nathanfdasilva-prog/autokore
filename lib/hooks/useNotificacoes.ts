import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  updateDoc, doc, writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/lib/context/AuthContext'

export interface Notificacao {
  id:         string
  titulo:     string
  mensagem:   string
  tipo:       'os' | 'agendamento' | 'estoque' | 'avaliacao' | 'sistema'
  lida:       boolean
  href?:      string
  createdAt:  Date
}

export function useNotificacoes() {
  const { perfil } = useAuth()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id) return

    const q = query(
      collection(db, 'oficinas', perfil.oficina_id, 'notificacoes'),
      where('para_uid', 'in', [perfil.uid, 'todos']),
      orderBy('createdAt', 'desc'),
    )

    const unsub = onSnapshot(q, snap => {
      setNotificacoes(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      })) as Notificacao[])
      setLoading(false)
    })

    return unsub
  }, [perfil?.oficina_id, perfil?.uid])

  const naoLidas = notificacoes.filter(n => !n.lida).length

  async function marcarLida(id: string) {
    if (!perfil?.oficina_id) return
    await updateDoc(
      doc(db, 'oficinas', perfil.oficina_id, 'notificacoes', id),
      { lida: true }
    )
  }

  async function marcarTodasLidas() {
    if (!perfil?.oficina_id || naoLidas === 0) return
    const batch = writeBatch(db)
    notificacoes
      .filter(n => !n.lida)
      .forEach(n => {
        batch.update(
          doc(db, 'oficinas', perfil.oficina_id!, 'notificacoes', n.id),
          { lida: true }
        )
      })
    await batch.commit()
  }

  return { notificacoes, naoLidas, loading, marcarLida, marcarTodasLidas }
}