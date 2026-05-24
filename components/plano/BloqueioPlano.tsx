'use client'
import Link from 'next/link'
import { Lock, Star } from 'lucide-react'

interface BloqueioPlanoProps {
  recurso:  string
  planoMin: 'pro' | 'premium'
}

export default function BloqueioPlano({ recurso, planoMin }: BloqueioPlanoProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center mb-4">
        <Lock size={28} className="text-orange-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        Recurso bloqueado
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 max-w-sm">
        O módulo de <strong>{recurso}</strong> está disponível no plano{' '}
        <strong className="text-orange-500 capitalize">{planoMin}</strong> ou superior.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        Faça upgrade para desbloquear este e outros recursos.
      </p>
      <Link href="/assinar"
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition">
        <Star size={16} />
        Ver planos
      </Link>
    </div>
  )
}