'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { usePWA } from '@/lib/hooks/usePWA'

export default function InstallBanner() {
  const { instalavel, instalado, instalar } = usePWA()
  const [dispensado, setDispensado] = useState(false)

  if (!instalavel || instalado || dispensado) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-4 sm:left-auto sm:right-4 sm:w-80">
      {/* Mobile — bottom sheet */}
      <div className="sm:hidden bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-100 dark:border-gray-800 p-5">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xl">A</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-base">AutoKore</p>
            <p className="text-xs text-gray-400">autokore.vercel.app</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Instale o app para acessar mais rápido, sem precisar abrir o navegador.
        </p>
        <button
          onClick={instalar}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition text-sm"
        >
          Adicionar à tela inicial
        </button>
        <button
          onClick={() => setDispensado(true)}
          className="w-full py-2.5 text-gray-400 text-sm mt-1"
        >
          Agora não
        </button>
      </div>

      {/* Desktop — banner compacto */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Instalar AutoKore</p>
            <p className="text-xs text-gray-400 mt-0.5">Adicionar à tela inicial</p>
          </div>
          <button onClick={() => setDispensado(true)} className="text-gray-300 hover:text-gray-500 transition">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setDispensado(true)}
            className="flex-1 py-2 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Agora não
          </button>
          <button
            onClick={instalar}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl transition"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  )
}