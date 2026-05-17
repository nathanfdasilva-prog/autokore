'use client'
// ============================================================
// BOTÃO EXPORTAR EXCEL — components/relatorios/BotaoExportarExcel.tsx
// Reutilizável em Faturamento, Estoque, Agendamentos, Desempenho.
// ============================================================

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  onExportar: () => Promise<void>
  label?:     string
  variante?:  'primary' | 'ghost'
  disabled?:  boolean
}

export default function BotaoExportarExcel({
  onExportar, label = 'Exportar Excel',
  variante = 'ghost', disabled = false,
}: Props) {
  const [exportando, setExportando] = useState(false)

  async function handleClick() {
    setExportando(true)
    try { await onExportar() }
    catch (e) { console.error('Erro ao exportar:', e) }
    finally { setExportando(false) }
  }

  return (
    <button
      onClick={handleClick}
      disabled={exportando || disabled}
      className={`flex items-center gap-2 text-sm font-medium transition rounded-lg px-3 py-2 disabled:opacity-50 ${
        variante === 'primary'
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
      }`}
    >
      {exportando
        ? <><Loader2 size={15} className="animate-spin" />Exportando...</>
        : <><Download size={15} />{label}</>
      }
    </button>
  )
}
