'use client'
import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label:      string
  value:      string | number
  icon:       ReactNode
  cor?:       'orange' | 'green' | 'blue' | 'red' | 'gray'
  tendencia?: 'up' | 'down' | 'neutral'
  detalhe?:   string
}

const COR_MAP = {
  orange: { bg: 'bg-orange-50 dark:bg-orange-950', icon: 'text-orange-500', border: 'border-orange-100 dark:border-orange-900' },
  green:  { bg: 'bg-green-50 dark:bg-green-950',   icon: 'text-green-500',  border: 'border-green-100 dark:border-green-900'   },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950',     icon: 'text-blue-500',   border: 'border-blue-100 dark:border-blue-900'     },
  red:    { bg: 'bg-red-50 dark:bg-red-950',       icon: 'text-red-500',    border: 'border-red-100 dark:border-red-900'       },
  gray:   { bg: 'bg-gray-50 dark:bg-neutral-800',  icon: 'text-gray-500 dark:text-gray-400',   border: 'border-gray-100 dark:border-neutral-700' },
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
            tendencia === 'up'      ? 'text-green-600 dark:text-green-400' :
            tendencia === 'down'    ? 'text-red-500 dark:text-red-400'     : 'text-gray-400'
          }`}>
            {tendencia === 'up'      && <TrendingUp   size={13} />}
            {tendencia === 'down'    && <TrendingDown  size={13} />}
            {tendencia === 'neutral' && <Minus         size={13} />}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        {detalhe && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{detalhe}</p>
        )}
      </div>
    </div>
  )
}