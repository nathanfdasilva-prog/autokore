'use client'
import { useState } from 'react'
import Link from 'next/link'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, endOfDay } from 'date-fns'
import { Wrench, DollarSign, Percent, TrendingUp, ChevronRight, ClipboardList } from 'lucide-react'
import { useMinhaComissao } from '@/lib/hooks/useComissao'
import { useAuth } from '@/lib/context/AuthContext'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

type Periodo = 'semana' | 'quinzena' | 'mes'

export default function MeuPainelPage() {
  const { perfil } = useAuth()
  const [periodo, setPeriodo] = useState<Periodo>('semana')

  const hoje = new Date()
  let de: Date, ate: Date
  if (periodo === 'semana') {
    de = startOfWeek(hoje, { weekStartsOn: 1 }); ate = endOfWeek(hoje, { weekStartsOn: 1 })
  } else if (periodo === 'quinzena') {
    de = subDays(hoje, 14); ate = endOfDay(hoje)
  } else {
    de = startOfMonth(hoje); ate = endOfMonth(hoje)
  }

  const { ordens, resumo, loading, pctMaoObra, pctPeca } = useMinhaComissao(de, ate)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meu Painel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Sua produção e comissão, {perfil?.nome?.split(' ')[0]}</p>
      </div>

      <div className="card bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Percent size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Você trabalha com {pctMaoObra}% de comissão sobre a mão de obra
            </p>
            {pctPeca > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">+ {pctPeca}% sobre as peças</p>
            )}
            {pctMaoObra === 0 && pctPeca === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Comissão ainda não configurada — peça pro dono ajustar na Equipe.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {([
          { val: 'semana',   label: 'Esta semana' },
          { val: 'quinzena', label: 'Últimos 15 dias' },
          { val: 'mes',      label: 'Este mês' },
        ] as const).map(p => (
          <button key={p.val} onClick={() => setPeriodo(p.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              periodo === p.val ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="card">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center mb-3">
                <Wrench size={18} className="text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{resumo.os_concluidas}</p>
              <p className="text-xs text-gray-400 mt-0.5">OS concluídas</p>
            </div>
            <div className="card">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-3">
                <DollarSign size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{brl(resumo.total_mao_obra)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Mão de obra gerada</p>
            </div>
            <div className="card bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
              <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{brl(resumo.comissao_total)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sua comissão no período</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              OS concluídas no período ({ordens.length})
            </h2>
            {ordens.length === 0 ? (
              <div className="text-center py-10">
                <ClipboardList size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhuma OS concluída neste período.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ordens.map(os => {
                  const minhaParte = (os.valor_mao_obra || 0) * (pctMaoObra / 100) + (os.valor_pecas || 0) * (pctPeca / 100)
                  return (
                    <Link key={os.id} href={`/os/${os.id}`}
                      className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg px-2 -mx-2 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                          #{String(os.numero).padStart(4, '0')} · {os.cliente_nome}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {os.veiculo} — {os.placa}
                          {os.finalizadaAt && ` · ${format(os.finalizadaAt, "dd/MM")}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">M.O.: {brl(os.valor_mao_obra || 0)}</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{brl(minhaParte)}</p>
                      </div>
                      <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}