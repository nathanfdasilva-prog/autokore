'use client'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ClipboardList, DollarSign, Calendar,
  Package, TrendingUp, AlertTriangle,
  ArrowRight, CheckCircle, Users, Plus,
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
  aberta: 'Aberta', em_andamento: 'Em andamento',
  aguardando_pecas: 'Aguard. pecas', concluida: 'Concluida', cancelada: 'Cancelada',
}
const STATUS_CLS: Record<StatusOS, string> = {
  aberta: 'badge badge-blue', em_andamento: 'badge badge-orange',
  aguardando_pecas: 'badge badge-gray', concluida: 'badge badge-green', cancelada: 'badge badge-red',
}

export default function DashboardPage() {
  const { perfil }        = useAuth()
  const { kpis, loading } = useDashboard()
  const { ordens }        = useMinhasOS()
  const { agendamentos }  = useAgendamentosHoje()
  const { itensCriticos } = useEstoque()

  const osAtivas = ordens.filter(os =>
    ['aberta', 'em_andamento', 'aguardando_pecas'].includes(os.status)
  ).slice(0, 5)

  const hoje = new Date()
  const isNovo = kpis && kpis.os_ativas === 0 && kpis.faturamento_mes === 0

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

      {/* ONBOARDING — aparece apenas quando o sistema está vazio */}
      {isNovo && (
        <div className="card border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🚀</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">
                Bem-vindo ao AutoKore, {perfil?.nome?.split(' ')[0]}!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Siga os passos abaixo para configurar sua oficina e começar a usar o sistema.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '👥', label: 'Cadastrar mecânicos', desc: 'Adicione sua equipe', href: '/equipe', btn: 'Ir para Equipe' },
              { icon: '📦', label: 'Adicionar peças ao estoque', desc: 'Controle suas peças', href: '/estoque', btn: 'Ir para Estoque' },
              { icon: '📅', label: 'Criar primeiro agendamento', desc: 'Organize sua agenda', href: '/agendamentos', btn: 'Ir para Agenda' },
              { icon: '🔧', label: 'Abrir primeira OS', desc: 'Comece a atender', href: '/os/nova', btn: 'Nova OS' },
            ].map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-xl p-3 border border-orange-200 dark:border-orange-900 hover:border-orange-400 transition group">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ArrowRight size={14} className="text-orange-400 group-hover:text-orange-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

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
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Faturamento — ultimos 7 dias</h2>
            <Link href="/faturamento" className="text-xs text-orange-500 hover:underline flex items-center gap-1">Ver completo <ArrowRight size={12} /></Link>
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
            <Link href="/agendamentos" className="text-xs text-orange-500 hover:underline flex items-center gap-1">Ver tudo <ArrowRight size={12} /></Link>
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
                    ag.status === 'confirmado' ? 'badge-green' :
                    ag.status === 'em_andamento' ? 'badge-orange' :
                    ag.status === 'cancelado' ? 'badge-red' : 'badge-gray'
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
          <div className="flex items-center gap-3">
            <Link href="/os/nova" className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-orange-600 transition">
              <Plus size={12} />Nova OS
            </Link>
            <Link href="/os" className="text-xs text-orange-500 hover:underline flex items-center gap-1">Ver todas <ArrowRight size={12} /></Link>
          </div>
        </div>
        {osAtivas.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Nenhuma OS ativa no momento.</p>
            <Link href="/os/nova" className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus size={14} />Abrir primeira OS
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800">
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">#OS</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Veiculo</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Mecanico</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-400 pb-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {osAtivas.map(os => (
                  <tr key={os.id} className="border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">#{String(os.numero).padStart(4, '0')}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-white">{os.cliente_nome}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{os.veiculo}<span className="text-gray-400 ml-1 font-mono text-xs">{os.placa}</span></td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{os.mecanico_nome}</td>
                    <td className="py-2.5 pr-4"><span className={STATUS_CLS[os.status]}>{STATUS_LABEL[os.status]}</span></td>
                    <td className="py-2.5 text-right font-semibold text-orange-600">{os.valor_total > 0 ? `R$${os.valor_total.toFixed(2)}` : '—'}</td>
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
              <AlertTriangle size={16} />Estoque critico — {itensCriticos.length} {itensCriticos.length === 1 ? 'item' : 'itens'}
            </h2>
            <Link href="/estoque" className="text-xs text-red-600 hover:underline flex items-center gap-1">Gerenciar <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-1.5">
            {itensCriticos.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm bg-white dark:bg-neutral-900 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900">
                <span className="font-medium text-gray-800 dark:text-white">{item.nome}</span>
                <span className="text-red-600 font-semibold">{item.quantidade}/{item.quantidade_minima} min.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}