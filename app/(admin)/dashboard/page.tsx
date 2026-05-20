'use client'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ClipboardList, DollarSign, Calendar,
  Package, TrendingUp, AlertTriangle,
  ArrowRight, CheckCircle,
} from 'lucide-react'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { useMinhasOS } from '@/lib/hooks/useOS'
import { useAgendamentosHoje } from '@/lib/hooks/useAgendamentos'
import { useEstoque } from '@/lib/hooks/useEstoque'
import { useAuth } from '@/lib/context/AuthContext'
import KPICard from '@/components/dashboard/KPICard'
import FaturamentoChart from '@/components/dashboard/FaturamentoChart'
import type { StatusOS } from '@/lib/types'

const STATUS_LABEL: Record<StatusOS, string> = {
  aberta:           'Aberta',
  em_andamento:     'Em andamento',
  aguardando_pecas: 'Aguard. pecas',
  concluida:        'Concluida',
  cancelada:        'Cancelada',
}
const STATUS_CLS: Record<StatusOS, string> = {
  aberta:           'badge badge-blue',
  em_andamento:     'badge badge-orange',
  aguardando_pecas: 'badge badge-gray',
  concluida:        'badge badge-green',
  cancelada:        'badge badge-red',
}

export default function DashboardPage() {
  const { perfil }         = useAuth()
  const { kpis, loading }  = useDashboard()
  const { ordens }         = useMinhasOS()
  const { agendamentos }   = useAgendamentosHoje()
  const { itensCriticos }  = useEstoque()

  const osAtivas = ordens.filter(os =>
    ['aberta', 'em_andamento', 'aguardando_pecas'].includes(os.status)
  ).slice(0, 5)

  const hoje = new Date()

  if (loading || !kpis) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {format(hoje, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          {' · '}{perfil?.nome}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="OS ativas agora" value={kpis.os_ativas} icon={<ClipboardList size={20} />} cor="orange" detalhe={`${kpis.os_hoje} abertas hoje`} />
        <KPICard label="Faturamento hoje" value={`R$${kpis.faturamento_hoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign size={20} />} cor="green" tendencia="up" detalhe={`${kpis.os_concluidas_hoje} OS concluidas`} />
        <KPICard label="Agendamentos hoje" value={kpis.agendamentos_hoje} icon={<Calendar size={20} />} cor="blue" detalhe="Ver calendario →" />
        <KPICard label="Itens em estoque critico" value={kpis.itens_criticos} icon={<Package size={20} />} cor={kpis.itens_criticos > 0 ? 'red' : 'gray'} tendencia={kpis.itens_criticos > 0 ? 'down' : 'neutral'} detalhe={kpis.itens_criticos > 0 ? 'Repor urgente' : 'Estoque OK'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard label="Faturamento do mes" value={`R$${kpis.faturamento_mes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<TrendingUp size={20} />} cor="green" tendencia="up" />
        <KPICard label="Ticket medio" value={`R$${kpis.ticket_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign size={20} />} cor="orange" />
        <KPICard label="OS concluidas hoje" value={kpis.os_concluidas_hoje} icon={<CheckCircle size={20} />} cor="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Faturamento — ultimos 7 dias
            </h2>
            <Link href="/faturamento" className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              Ver completo <ArrowRight size={12} />
            </Link>
          </div>
          <FaturamentoChart dados={kpis.faturamento_7dias} />
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Total 7 dias:</span>
            <span className="font-semibold text-gray-700 dark:text-white">
              R${kpis.faturamento_7dias.reduce((s, d) => s + d.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Agenda de hoje</h2>
            <Link href="/agendamentos" className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              Ver tudo <ArrowRight size={12} />
            </Link>
          </div>
          {agendamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum agendamento hoje</p>
              <Link href="/agendamentos" className="text-xs text-orange-500 hover:underline mt-2">Criar agendamento</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {agendamentos.slice(0, 5).map(ag => (
                <div key={ag.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                  <div className="flex-shrink-0 text-center w-12">
                    <p className="text-sm font-bold text-orange-500">{format(ag.data_hora, 'HH:mm')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{ag.cliente_nome}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{ag.veiculo} — {ag.placa}</p>
                  </div>
                  <span className={`badge ${
                    ag.status === 'confirmado'   ? 'badge-green'  :
                    ag.status === 'em_andamento' ? 'badge-orange' :
                    ag.status === 'cancelado'    ? 'badge-red'    : 'badge-gray'
                  }`}>{ag.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">OS ativas ({kpis.os_ativas})</h2>
          <Link href="/os" className="text-xs text-orange-500 hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        {osAtivas.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Nenhuma OS ativa no momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800">
                  <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2 pr-4">#OS</th>
                  <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2 pr-4">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2 pr-4">Veiculo</th>
                  <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2 pr-4">Mecanico</th>
                  <th className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2 pr-4">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-400 dark:text-gray-500 pb-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {osAtivas.map(os => (
                  <tr key={os.id} className="border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500 dark:text-gray-400">#{String(os.numero).padStart(4, '0')}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-white">{os.cliente_nome}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{os.veiculo}<span className="text-gray-400 dark:text-gray-500 ml-1 font-mono text-xs">{os.placa}</span></td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{os.mecanico_nome}</td>
                    <td className="py-2.5 pr-4"><span className={STATUS_CLS[os.status]}>{STATUS_LABEL[os.status]}</span></td>
                    <td className="py-2.5 text-right font-semibold text-orange-600 dark:text-orange-400">{os.valor_total > 0 ? `R$${os.valor_total.toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {itensCriticos.length > 0 && (
        <div className="card border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle size={16} />
              Estoque critico — {itensCriticos.length} {itensCriticos.length === 1 ? 'item' : 'itens'}
            </h2>
            <Link href="/estoque" className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
              Gerenciar <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1.5">
            {itensCriticos.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm bg-white dark:bg-neutral-900 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900">
                <span className="font-medium text-gray-800 dark:text-white">{item.nome}</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">{item.quantidade}/{item.quantidade_minima} min.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}