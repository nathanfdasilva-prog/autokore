'use client'
// ============================================================
// BOTÃO GOOGLE CALENDAR — components/agendamento/BotaoGoogleCalendar.tsx
// Adiciona o agendamento ao Google Calendar do usuário.
// Funciona sem OAuth — via link direto.
// ============================================================

import { Calendar } from 'lucide-react'
import { gerarLinkGoogleCalendar } from '@/lib/services/googleCalendar'
import type { Agendamento } from '@/lib/types'

interface Props {
  agendamento:  Agendamento
  oficina_nome: string
  variante?:    'ghost' | 'icon'
}

export default function BotaoGoogleCalendar({
  agendamento, oficina_nome, variante = 'ghost',
}: Props) {
  const link = gerarLinkGoogleCalendar(agendamento, oficina_nome)

  if (variante === 'icon') {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        title="Adicionar ao Google Calendar"
        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition"
      >
        <Calendar size={15} />
      </a>
    )
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg px-3 py-2 transition"
    >
      <Calendar size={15} />
      Salvar no Calendar
    </a>
  )
}
