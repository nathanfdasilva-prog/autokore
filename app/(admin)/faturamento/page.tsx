'use client'
import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, eachDayOfInterval, isSameDay, subDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DollarSign, TrendingUp, FileText } from 'lucide-react'
import {
  collection, query, where, orderBy,
  onSnapshot, db, Timestamp,
} from '@/lib/firebase/firestore'
import { docToData } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/context/AuthContext'
import KPICard from '@/components/dashboard/KPICard'
import GraficoFaturamento from '@/components/dashboard/GraficoFaturamento'
import GraficoPagamentos from '@/components/dashboard/GraficoPagamentos'
import BloqueioPlano from '@/components/plano/BloqueioPlano'
import type { OrdemServico } from '@/lib/types'

type Periodo = 'hoje' | '7dias' | 'mes' | 'mes_anterior' | 'personalizado'
type Agrupar = 'dia' | 'semana'

export default function FaturamentoPage() {
  const { perfil, temAcesso } = useAuth()

  if (!temAcesso('faturamento')) return <BloqueioPlano recurso="Faturamento" planoMin="pro" />

  const [periodo,    setPeriodo]    = useState<Periodo>('mes')
  const [agrupar,    setAgrupar]    = useState<Agrupar>('dia')
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [dataFim,    setDataFim]    = useState(format(endOfMonth(new Date()),   'yyyy-MM-dd'))
  const [ordens,     setOrdens]     = useState<OrdemServico[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const hoje = new Date()
    if (periodo === 'hoje') {
      setDataInicio(format(hoje, 'yyyy-MM-dd'))
      setDataFim(format(hoje,    'yyyy-MM-dd'))
    } else if (periodo === '7dias') {
      setDataInicio(format(subDays(hoje, 6), 'yyyy-MM-dd'))
      setDataFim(format(hoje,               'yyyy-MM-dd'))
    } else if (periodo === 'mes') {
      setDataInicio(format(startOfMonth(hoje), 'yyyy-MM-dd'))
      setDataFim(format(endOfMonth(hoje),      'yyyy-MM-dd'))
    } else if (periodo === 'mes_anterior') {
      const mesAnt = subMonths(hoje, 1)
      setDataInicio(format(startOfMonth(mesAnt), 'yyyy-MM-dd'))
      setDataFim(format(endOfMonth(mesAnt),      'yyyy-MM-dd'))
    }
  }, [periodo])

  useEffect(() => {
    if (!perfil?.oficina_id) {
      setLoading(false)
      return
    }
    setLoading(true)

    const de  = startOfDay(new Date(dataInicio + 'T00:00:00'))
    const ate = endOfDay(new Date(dataFim     + 'T00:00:00'))

    const q = query(
      collection(db, 'ordens_servico'),
      where('oficina_id',   '==', perfil.oficina_id),
      where('status',       '==', 'concluida'),
      where('finalizadaAt', '>=', Timestamp.fromDate(de)),
      where('finalizadaAt', '<=', Timestamp.fromDate(ate)),
      orderBy('finalizadaAt', 'desc'),
    )

    const unsub = onSnapshot(q, snap => {
      setOrdens(snap.docs.map(d => docToData<OrdemServico>(d)))
      setLoading(false)
    }, () => setLoading(false))

    return () => unsub()
  }, [perfil?.oficina_id, dataInicio, dataFim])

  const totalFaturado = ordens.reduce((s, os) => s + os.valor_total, 0)
  const totalPecas    = ordens.reduce((s, os) => s + os.valor_pecas, 0)
  const totalMaoObra  = ordens.reduce((s, os) => s + os.valor_mao_obra, 0)
  const ticketMedio   = ordens.length > 0 ? totalFaturado / ordens.length : 0

  const de  = new Date(dataInicio + 'T00:00:00')
  const ate = new Date(dataFim    + 'T00:00:00')

  // Monta os dados do gráfico agrupando por dia OU por semana
  let dadosGrafico: { data: string; valor: number }[]
  if (agrupar === 'semana') {
    const mapaSemanas = new Map<string, { rotulo: string; valor: number; ordem: number }>()
    ordens.forEach(os => {
      if (!os.finalizadaAt) return
      const ini = startOfWeek(os.finalizadaAt, { weekStartsOn: 1 })
      const chave = format(ini, 'yyyy-MM-dd')
      const rotulo = format(ini, "dd/MM")
      const atual = mapaSemanas.get(chave)
      if (atual) atual.valor += os.valor_total
      else mapaSemanas.set(chave, { rotulo, valor: os.valor_total, ordem: ini.getTime() })
    })
    dadosGrafico = Array.from(mapaSemanas.values())
      .sort((a, b) => a.ordem - b.ordem)
      .map(s => ({ data: `Sem ${s.rotulo}`, valor: s.valor }))
  } else {
    const diasIntervalo = eachDayOfInterval({ start: de, end: ate }).slice(-31)
    dadosGrafico = diasIntervalo.map(dia => ({
      data:  format(dia, 'dd/MM'),
      valor: ordens.filter(os => os.finalizadaAt && isSameDay(os.finalizadaAt, dia)).reduce((s, os) => s + os.valor_total, 0),
    }))
  }

  const pagamentos = ordens.reduce((acc, os) => {
    const forma = os.forma_pagamento ?? 'outros'
    acc[forma] = (acc[forma] ?? 0) + os.valor_total
    return acc
  }, {} as Record<string, number>)

  const FORMA_LABELS: Record<string, string> = {
    pix: 'PIX', dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão crédito', cartao_debito: 'Cartão débito', outros: 'Outros',
  }

  const dadosPagamento = Object.entries(pagamentos).map(([forma, valor]) => ({
    nome:  FORMA_LABELS[forma] ?? forma,
    valor,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Faturamento</h1>
          <p className="text-sm text-gray-500 mt-0.5">Relatório financeiro de OS concluídas</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {([
          { val: 'hoje',          label: 'Hoje' },
          { val: '7dias',         label: 'Últimos 7 dias' },
          { val: 'mes',           label: 'Este mês' },
          { val: 'mes_anterior',  label: 'Mês anterior' },
          { val: 'personalizado', label: 'Personalizado' },
        ] as const).map(p => (
          <button key={p.val} onClick={() => setPeriodo(p.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              periodo === p.val ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {p.label}
          </button>
        ))}
        {periodo === 'personalizado' && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input-base py-1.5 text-xs max-w-[140px]" />
            <span className="text-gray-400 text-xs">até</span>
            <input type="date" value={dataFim} min={dataInicio} onChange={e => setDataFim(e.target.value)} className="input-base py-1.5 text-xs max-w-[140px]" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <KPICard label="Total faturado" value={`R$${totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign size={20} />} cor="green" />
            <KPICard label="OS concluídas" value={ordens.length} icon={<FileText size={20} />} cor="orange" />
            <KPICard label="Ticket médio" value={`R$${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingUp size={20} />} cor="blue" />
            <KPICard label="Mão de obra" value={`R$${totalMaoObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign size={20} />} cor="gray" detalhe={`Peças: R$${totalPecas.toFixed(2)}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Faturamento</h2>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  {([
                    { val: 'dia',    label: 'Por dia' },
                    { val: 'semana', label: 'Por semana' },
                  ] as const).map(a => (
                    <button key={a.val} onClick={() => setAgrupar(a.val)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                        agrupar === a.val ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <GraficoFaturamento dados={dadosGrafico} altura={240} />
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Formas de pagamento</h2>
              <GraficoPagamentos dados={dadosPagamento} altura={200} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">OS concluídas — {ordens.length} registros</h2>
            {ordens.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhuma OS concluída neste período.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">#OS</th>
                      <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">Data</th>
                      <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">Cliente</th>
                      <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">Veículo</th>
                      <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">Mecânico</th>
                      <th className="text-right text-xs font-semibold text-gray-400 pb-2 pr-3">Peças</th>
                      <th className="text-right text-xs font-semibold text-gray-400 pb-2 pr-3">M.Obra</th>
                      <th className="text-right text-xs font-semibold text-gray-400 pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordens.map(os => (
                      <tr key={os.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-3 font-mono text-xs text-gray-500">#{String(os.numero).padStart(4, '0')}</td>
                        <td className="py-2.5 pr-3 text-gray-600 text-xs">{os.finalizadaAt ? format(os.finalizadaAt, 'dd/MM HH:mm') : '—'}</td>
                        <td className="py-2.5 pr-3 font-medium text-gray-800">{os.cliente_nome}</td>
                        <td className="py-2.5 pr-3 text-gray-600">{os.veiculo} <span className="text-gray-400 ml-1 font-mono text-xs">{os.placa}</span></td>
                        <td className="py-2.5 pr-3 text-gray-600">{os.mecanico_nome}</td>
                        <td className="py-2.5 pr-3 text-right text-gray-600">R${os.valor_pecas.toFixed(2)}</td>
                        <td className="py-2.5 pr-3 text-right text-gray-600">R${os.valor_mao_obra.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-bold text-orange-600">R${os.valor_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={5} className="pt-3 text-xs font-semibold text-gray-500">TOTAL ({ordens.length} OS)</td>
                      <td className="pt-3 text-right font-semibold text-gray-700">R${totalPecas.toFixed(2)}</td>
                      <td className="pt-3 text-right font-semibold text-gray-700">R${totalMaoObra.toFixed(2)}</td>
                      <td className="pt-3 text-right font-bold text-orange-600 text-base">R${totalFaturado.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}