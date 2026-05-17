'use client'
// ============================================================
// BOTÃO IMPRIMIR OS — components/os/BotaoImprimirOS.tsx
// Gera PDF via janela de impressão do navegador.
// ============================================================

import { useState } from 'react'
import { Printer, FileDown } from 'lucide-react'
import { imprimirOS } from '@/lib/services/osPDF'
import type { OrdemServico } from '@/lib/types'

interface Props {
  os:               OrdemServico
  oficina_nome:     string
  oficina_whatsapp?: string
  variante?:        'primary' | 'ghost' | 'icon'
}

export default function BotaoImprimirOS({
  os, oficina_nome, oficina_whatsapp, variante = 'ghost',
}: Props) {
  const [gerando, setGerando] = useState(false)

  async function handleImprimir() {
    setGerando(true)
    try {
      imprimirOS(os, oficina_nome, oficina_whatsapp)
    } finally {
      setTimeout(() => setGerando(false), 1000)
    }
  }

  if (variante === 'icon') {
    return (
      <button
        onClick={handleImprimir}
        disabled={gerando}
        title="Imprimir / Salvar PDF"
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition disabled:opacity-50"
      >
        <Printer size={15} />
      </button>
    )
  }

  return (
    <button
      onClick={handleImprimir}
      disabled={gerando}
      className={`flex items-center gap-2 text-sm font-medium transition rounded-lg px-3 py-2 disabled:opacity-50 ${
        variante === 'primary'
          ? 'bg-gray-800 hover:bg-gray-900 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
      }`}
    >
      <FileDown size={15} />
      {gerando ? 'Gerando...' : 'Imprimir / PDF'}
    </button>
  )
}
