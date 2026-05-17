'use client'
// ============================================================
// LISTAGEM DE OS — app/(mecanico)/os/page.tsx
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ClipboardList } from 'lucide-react'
import { useMinhasOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import OSCard from '@/components/os/OSCard'
import type { StatusOS } from '@/lib/types'

const FILTROS: { label: string; value: StatusOS | 'todas' }[] = [
  { label: 'Todas',        value: 'todas' },
  { label: 'Abertas',      value: 'aberta' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Concluídas',   value: 'concluida' },
  { label: 'Canceladas',   value: 'cancelada' },
]

export default function OSPage() {
  const { isAdmin, perfil } = useAuth()
  const { ordens, loading } = useMinhasOS()

  const [busca,   setBusca]   = useState('')
  const [filtro,  setFiltro]  = useState<StatusOS | 'todas'>('todas')

  const ordensFiltradas = ordens
    .filter(os => filtro === 'todas' || os.status === filtro)
    .filter(os => {
      if (!busca) return true
      const q = busca.toLowerCase()
      return (
        os.cliente_nome.toLowerCase().includes(q) ||
        os.veiculo.toLowerCase().includes(q) ||
        os.placa.toLowerCase().includes(q) ||
        String(os.numero).includes(q)
      )
    })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'Todas as Ordens de Serviço' : 'Minhas OS'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? 'Visão completa da oficina' : `Olá, ${perfil?.nome?.split(' ')[0]}!`}
          </p>
        </div>
        <Link href="/os/nova" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nova OS
        </Link>
      </div>

      {/* Filtros + Busca */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Busca */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Cliente, veículo ou placa..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                filtro === f.value
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ordensFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardList size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            {busca || filtro !== 'todas'
              ? 'Nenhuma OS encontrada com esses filtros.'
              : 'Nenhuma OS criada ainda. Que tal começar uma?'}
          </p>
          {!busca && filtro === 'todas' && (
            <Link href="/os/nova" className="btn-primary mt-4 text-sm">
              <Plus size={15} className="mr-1" />
              Criar primeira OS
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ordensFiltradas.map(os => (
            <OSCard key={os.id} os={os} />
          ))}
        </div>
      )}
    </div>
  )
}
