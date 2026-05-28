'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, db } from '../firebase/firestore'
import { docToData } from '../firebase/firestore'
import type { OrdemServico, Agendamento, ItemEstoque } from '../types'
import { useAuth } from '../context/AuthContext'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format, eachDayOfInterval, subDays } from 'date-fns'

export interface KPIDashboard {
  os_ativas: number
  os_hoje: number
  os_concluidas_hoje: number
  faturamento_hoje: number
  faturamento_mes: number
  ticket_medio: number
  agendamentos_hoje: number
  itens_criticos: number
  faturamento_7dias: { data: string; valor: number }[]
}

export function useDashboard() {
  const { perfil } = useAuth()
  const [kpis, setKpis] = useState<KPIDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil?.oficina_id) {
      setLoading(false)
      return
    }
    const oid = perfil.oficina_id
    const hoje = new Date()
    let osAtivas: OrdemServico[] = []
    let osTodas: OrdemServico[] = []
    let agTodas: Agendamento[] = []
    let estTodos: ItemEstoque[] = []
    let ready = { os: false, osTodas: false, ag: false, est: false }

    function recalcular() {
      if (!ready.os || !ready.osTodas || !ready.ag || !ready.est) return
      try {
        const inicioMes = startOfMonth(hoje)
        const fimMes = endOfMonth(hoje)
        const inicioHoje = startOfDay(hoje)
        const fimHoje = endOfDay(hoje)
        const osMes = osTodas.filter(os => { try { return os.createdAt >= inicioMes && os.createdAt <= fimMes } catch { return false } })
        const osHoje = osTodas.filter(os => { try { return os.createdAt >= inicioHoje && os.createdAt <= fimHoje } catch { return false } })
        const osConcHoje = osHoje.filter(os => os.status === 'concluida')
        const fatHoje = osConcHoje.reduce((s, os) => s + (os.valor_total || 0), 0)
        const fatMes = osMes.filter(os => os.status === 'concluida').reduce((s, os) => s + (os.valor_total || 0), 0)
        const concMes = osMes.filter(os => os.status === 'concluida')
        const ticketMedio = concMes.length > 0 ? fatMes / concMes.length : 0
        const agHoje = agTodas.filter(ag => { try { return ag.data_hora >= inicioHoje && ag.data_hora <= fimHoje } catch { return false } })
        const estCriticos = estTodos.filter(i => i.quantidade <= i.quantidade_minima)
        const dias = eachDayOfInterval({ start: subDays(hoje, 6), end: hoje })
        const faturamento_7dias = dias.map(dia => ({
          data: format(dia, 'dd/MM'),
          valor: osTodas.filter(os => { try { return os.status === 'concluida' && os.finalizadaAt && os.finalizadaAt >= startOfDay(dia) && os.finalizadaAt <= endOfDay(dia) } catch { return false } }).reduce((s, os) => s + (os.valor_total || 0), 0),
        }))
        setKpis({ os_ativas: osAtivas.length, os_hoje: osHoje.length, os_concluidas_hoje: osConcHoje.length, faturamento_hoje: fatHoje, faturamento_mes: fatMes, ticket_medio: ticketMedio, agendamentos_hoje: agHoje.length, itens_criticos: estCriticos.length, faturamento_7dias })
        setLoading(false)
      } catch (e) { console.error('recalcular error:', e) }
    }

    const q1 = query(collection(db, 'ordens_servico'), where('oficina_id', '==', oid), where('status', 'in', ['aberta', 'em_andamento', 'aguardando_pecas']), orderBy('createdAt', 'desc'))
    const u1 = onSnapshot(q1, snap => { try { osAtivas = snap.docs.map(d => docToData<OrdemServico>(d)) } catch { osAtivas = [] }; ready.os = true; recalcular() }, () => { ready.os = true; recalcular() })
    const q2 = query(collection(db, 'ordens_servico'), where('oficina_id', '==', oid), orderBy('createdAt', 'desc'))
    const u2 = onSnapshot(q2, snap => { try { osTodas = snap.docs.map(d => docToData<OrdemServico>(d)) } catch { osTodas = [] }; ready.osTodas = true; recalcular() }, () => { ready.osTodas = true; recalcular() })
    const q3 = query(collection(db, 'agendamentos'), where('oficina_id', '==', oid), orderBy('data_hora', 'asc'))
    const u3 = onSnapshot(q3, snap => { try { agTodas = snap.docs.map(d => docToData<Agendamento>(d)) } catch { agTodas = [] }; ready.ag = true; recalcular() }, () => { ready.ag = true; recalcular() })
    const q4 = query(collection(db, 'estoque'), where('oficina_id', '==', oid), orderBy('nome', 'asc'))
    const u4 = onSnapshot(q4, snap => { try { estTodos = snap.docs.map(d => docToData<ItemEstoque>(d)) } catch { estTodos = [] }; ready.est = true; recalcular() }, () => { ready.est = true; recalcular() })

    return () => { u1(); u2(); u3(); u4() }
  }, [perfil?.oficina_id])

  return { kpis, loading }
}