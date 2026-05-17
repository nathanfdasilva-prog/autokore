'use client'
// ============================================================
// OS CARD — components/os/OSCard.tsx
// Card individual de OS na listagem.
// ============================================================

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Car, Bike, Clock, DollarSign, ChevronRight, Package } from 'lucide-react'
import type { OrdemServico, StatusOS } from '@/lib/types'

const STATUS_CONFIG: Record<StatusOS, { label: string; className: string }> = {
  aberta:          { label: 'Aberta',          className: 'badge badge-blue' },
  em_andamento:    { label: 'Em andamento',    className: 'badge badge-orange' },
  aguardando_pecas:{ label: 'Aguard. peças',   className: 'badge badge-gray' },
  concluida:       { label: 'Concluída',        className: 'badge badge-green' },
  cancelada:       { label: 'Cancelada',        className: 'badge badge-red' },
}

interface OSCardProps {
  os: OrdemServico
}

export default function OSCard({ os }: OSCardProps) {
  const statusCfg = STATUS_CONFIG[os.status]

  return (
    <Link href={`/os/${os.id}`} className="block">
      <div className="card hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-3">
          {/* Número + status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              {os.tipo_veiculo === 'moto'
                ? <Bike size={18} className="text-orange-500" />
                : <Car  size={18} className="text-orange-500" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">
                  OS #{String(os.numero).padStart(4, '0')}
                </span>
                <span className={statusCfg.className}>{statusCfg.label}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {os.cliente_nome}
              </p>
              <p className="text-xs text-gray-500">
                {os.veiculo} — {os.placa}
              </p>
            </div>
          </div>

          {/* Seta */}
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1"
          />
        </div>

        {/* Descrição */}
        <p className="text-xs text-gray-500 mt-3 line-clamp-2">
          {os.descricao_problema}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            {formatDistanceToNow(os.createdAt, { locale: ptBR, addSuffix: true })}
          </span>

          {os.itens.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Package size={12} />
              {os.itens.length} {os.itens.length === 1 ? 'peça' : 'peças'}
            </span>
          )}

          {os.valor_total > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 ml-auto">
              <DollarSign size={12} />
              R${os.valor_total.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
