'use client'
import Link from 'next/link'
import { Clock } from 'lucide-react'

interface TrialExpiradoProps {
  nomeOficina?: string
}

export default function TrialExpirado({ nomeOficina }: TrialExpiradoProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center mb-4">
        <Clock size={28} className="text-orange-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        Seu teste grátis acabou
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 max-w-sm">
        Os 14 dias grátis {nomeOficina ? <>de <strong>{nomeOficina}</strong></> : 'da sua oficina'} chegaram ao fim.
        Assine o plano Profissional pra continuar usando o AutoKore sem interrupção.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        Seus dados continuam salvos e seguros — nada foi perdido.
      </p>
      <Link href="/assinar"
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition">
        Assinar por R$97/mês →
      </Link>
    </div>
  )
}