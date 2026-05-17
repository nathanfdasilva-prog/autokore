'use client'
// ============================================================
// HISTÓRICO DE ESTOQUE — app/(admin)/estoque/historico/page.tsx
// Relatório de todas as movimentações com filtros.
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft, ArrowDown, ArrowUp,
  Package, FileText, Search,
} from 'lucide-react'
import { useMovimentacoesPeriodo } from '@/lib/hooks/useMovimentacoes'
import { useEstoque } from '@/lib/hooks/useEstoque'

type Periodo = 'hoje' | '7dias' | 'mes' | 'personalizado'

export default function HistoricoEstoquePage() {
  const [periodo,    setPeriodo]    = useState<Periodo>('7dias')
  const [dataInicio, setDataInicio] = useState(
    format(subDays(new Date(), 6), 'yyyy-MM-dd'),
  )
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  )
  const [filtroTipo,  setFiltroTipo]  = useState<'todos' | 'entrada' | 'saida'>('todos')
  const [busca,       setBusca]       = useState('')

  const { itens } = useEstoque()

  const de  = new Date(dataInicio + 'T00:00:00')
  const ate = new Date(dataFim    + 'T00:00:00')

  const { movimentacoes, loading } = useMovimentacoesPeriodo(de, ate)

  // Aplica período rápido
  function aplicarPeriodo(p: Periodo) {
    setPeriodo(p)
    const hoje = new Date()
    if (p === 'hoje') {
      setDataInicio(format(hoje, 'yyyy-MM-dd'))
      setDataFim(format(hoje, 'yyyy-MM-dd'))
    } else if (p === '7dias') {
      setDataInicio(format(subDays(hoje, 6), 'yyyy-MM-dd'))
      setDataFim(format(hoje, 'yyyy-MM-dd'))
    } else if (p === 'mes') {
      setDataInicio(format(startOfMonth(hoje), 'yyyy-MM-dd'))
      setDataFim(format(endOfMonth(hoje), 'yyyy-MM-dd'))
    }
  }

  // Enriquece movimentação com nome do item
  function nomeItem(item_id: string) {
    return itens.find(i => i.id === item_id)?.nome ?? item_id
  }

  // Filtros
  const movsFiltradas = movimentacoes
    .filter(m => filtroTipo === 'todos' || m.tipo === filtroTipo)
    .filter(m => {
      if (!busca) return true
      return nomeItem(m.item_id).toLowerCase().includes(busca.toLowerCase())
    })

  // Totais
  const totalEntradas = movsFiltradas
    .filter(m => m.tipo === 'entrada')
    .reduce((s, m) => s + m.quantidade, 0)
  const totalSaidas = movsFiltradas
    .filter(m => m.tipo === 'saida')
    .reduce((s, m) => s + m.quantidade, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/estoque"
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Histórico de Estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Todas as entradas e saídas de peças
          </p>
        </div>
      </div>

      {/* Filtros de período */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          { val: 'hoje',         label: 'Hoje' },
          { val: '7dias',        label: 'Últimos 7 dias' },
          { val: 'mes',          label: 'Este mês' },
          { val: 'personalizado',label: 'Personalizado' },
        ] as const).map(p => (
          <button
            key={p.val}
            onClick={() => aplicarPeriodo(p.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              periodo === p.val
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}

        {periodo === 'personalizado' && (
          <div className="flex items-center gap-2 ml-1">
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="input-base py-1.5 text-xs max-w-[140px]"
            />
            <span className="text-gray-400 text-xs">até</span>
            <input
              type="date"
              value={dataFim}
              min={dataInicio}
              onChange={e => setDataFim(e.target.value)}
              className="input-base py-1.5 text-xs max-w-[140px]"
            />
          </div>
        )}
      </div>

      {/* Filtros de tipo + busca */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {([
            { val: 'todos',   label: 'Todos' },
            { val: 'entrada', label: '↓ Entradas' },
            { val: 'saida',   label: '↑ Saídas' },
          ] as const).map(f => (
            <button
              key={f.val}
              onClick={() => setFiltroTipo(f.val)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filtroTipo === f.val
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar peça..."
            className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition w-48"
          />
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card text-center">
          <div className="text-xl font-bold text-gray-800">{movsFiltradas.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Movimentações</div>
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
            <ArrowDown size={16} />{totalEntradas}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Unidades entradas</div>
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1">
            <ArrowUp size={16} />{totalSaidas}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Unidades saídas</div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          {movsFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Package size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Nenhuma movimentação encontrada neste período.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Data / Hora</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Tipo</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Peça</th>
                  <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Qtd</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">OS vinculada</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {movsFiltradas.map(mov => (
                  <tr
                    key={mov.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-gray-600 text-xs whitespace-nowrap">
                      {format(mov.createdAt, "dd/MM/yy HH:mm")}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        mov.tipo === 'entrada'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {mov.tipo === 'entrada'
                          ? <><ArrowDown size={11} /> Entrada</>
                          : <><ArrowUp   size={11} /> Saída</>
                        }
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {nomeItem(mov.item_id)}
                    </td>
                    <td className="py-3 pr-4 text-center font-bold">
                      <span className={
                        mov.tipo === 'entrada' ? 'text-green-600' : 'text-orange-600'
                      }>
                        {mov.tipo === 'entrada' ? '+' : '−'}{mov.quantidade}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {mov.os_id ? (
                        <Link
                          href={`/os/${mov.os_id}`}
                          className="text-xs text-orange-500 hover:underline font-mono"
                        >
                          Ver OS →
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {mov.motivo ?? 'Ajuste manual'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-600 text-xs">
                      {mov.usuario_nome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
