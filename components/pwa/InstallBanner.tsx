'use client'
// ============================================================
// BANNER DE INSTALAÇÃO PWA — components/pwa/InstallBanner.tsx
// Aparece quando o app pode ser instalado no dispositivo.
// ============================================================

import { useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '@/lib/hooks/usePWA'

export default function InstallBanner() {
  const { instalavel, instalado, instalar } = usePWA()
  const [dispensado, setDispensado] = useState(false)

  // Não exibe se: já instalado, não instalável, ou o usuário dispensou
  if (!instalavel || instalado || dispensado) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div className="bg-white border border-orange-200 rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Smartphone size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800">
              Instalar AutoKore
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Acesse mais rápido direto da tela inicial do seu celular. Funciona offline!
            </p>
          </div>
          <button
            onClick={() => setDispensado(true)}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setDispensado(true)}
            className="flex-1 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
          >
            Agora não
          </button>
          <button
            onClick={instalar}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            Instalar app
          </button>
        </div>
      </div>
    </div>
  )
}
