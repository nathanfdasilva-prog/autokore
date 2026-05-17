'use client'
// ============================================================
// KPI CARD — components/dashboard/KPICard.tsx
// ============================================================

import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label:     string
  value:     string | number
  icon:      ReactNode
  cor?:      'orange' | 'green' | 'blue' | 'red' | 'gray'
  tendencia?: 'up' | 'down' | 'neutral'
  detalhe?:  string
}

const COR_MAP = {
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-100' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-500',  border: 'border-green-100'  },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'border-blue-100'   },
  red:    { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-100'    },
  gray:   { bg: 'bg-gray-50',   icon: 'text-gray-500',   border: 'border-gray-100'   },
}

export default function KPICard({
  label, value, icon, cor = 'orange', tendencia, detalhe,
}: KPICardProps) {
  const c = COR_MAP[cor]

  return (
    <div className={`card border ${c.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={c.icon}>{icon}</span>
        </div>
        {tendencia && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            tendencia === 'up'      ? 'text-green-600' :
            tendencia === 'down'    ? 'text-red-500'   : 'text-gray-400'
          }`}>
            {tendencia === 'up'   && <TrendingUp  size={13} />}
            {tendencia === 'down' && <TrendingDown size={13} />}
            {tendencia === 'neutral' && <Minus    size={13} />}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
        {detalhe && (
          <p className="text-xs text-gray-400 mt-0.5">{detalhe}</p>
        )}
      </div>
    </div>
  )
}
