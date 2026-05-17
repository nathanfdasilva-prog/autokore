// ============================================================
// BOTÃO ENVIAR LINK DE AVALIAÇÃO — components/avaliacao/BotaoSolicitarAvaliacao.tsx
// Envia o link público /avaliar/{os_id} via WhatsApp.
// ============================================================

'use client'

import { Star } from 'lucide-react'
import { abrirWhatsApp } from '@/lib/services/whatsapp'
import type { OrdemServico } from '@/lib/types'

interface Props {
  os:          OrdemServico
  oficina_nome: string
  base_url?:   string   // default: window.location.origin
}

export default function BotaoSolicitarAvaliacao({ os, oficina_nome, base_url }: Props) {
  function handleClick() {
    const origin = base_url ?? (typeof window !== 'undefined' ? window.location.origin : '')
    const link   = `${origin}/avaliar/${os.id}`

    const mensagem =
      `Olá, *${os.cliente_nome}*! 🎉\n\n` +
      `Seu ${os.veiculo} ficou pronto na *${oficina_nome}*.\n\n` +
      `Gostaríamos de saber como foi a experiência! ⭐\n` +
      `Leva menos de 1 minuto:\n${link}\n\n` +
      `Obrigado pela confiança!\n_AutoKore.app_`

    abrirWhatsApp(os.cliente_whatsapp, mensagem)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg px-3 py-2 transition"
    >
      <Star size={15} className="fill-amber-400 text-amber-400" />
      Solicitar avaliação
    </button>
  )
}
