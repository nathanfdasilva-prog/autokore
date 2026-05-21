// ============================================================
// SERVIÇO DE NOTIFICAÇÕES WHATSAPP — lib/services/whatsapp.ts
// ============================================================

export type ProvedorWhatsApp = 'link' | 'evolution' | 'twilio'

export const TEMPLATES = {
  // Confirmação de agendamento
  agendamento_confirmado: (params: {
    cliente:  string
    veiculo:  string
    data:     string
    horario:  string
    servico:  string
    oficina:  string
    whatsapp: string
  }) =>
    `Olá, *${params.cliente}*! Tudo bem?\n\n` +
    `Passando para confirmar seu agendamento aqui na *${params.oficina}*.\n\n` +
    `*Data:* ${params.data}\n` +
    `*Horário:* ${params.horario}\n` +
    `*Veículo:* ${params.veiculo}\n` +
    `*Serviço:* ${params.servico}\n\n` +
    `Qualquer dúvida é só responder essa mensagem. Te esperamos!\n\n` +
    `_${params.oficina} · AutoKore.app_`,

  // Lembrete 1 dia antes
  lembrete_agendamento: (params: {
    cliente: string
    data:    string
    horario: string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*!\n\n` +
    `Lembrando que amanhã você tem horário marcado aqui na *${params.oficina}*.\n\n` +
    `*Data:* ${params.data} às ${params.horario}\n\n` +
    `Se precisar remarcar, é só nos avisar com antecedência. Até amanhã!\n\n` +
    `_${params.oficina} · AutoKore.app_`,

  // OS concluída — veículo pronto
  os_concluida: (params: {
    cliente: string
    veiculo: string
    servico: string
    valor:   string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*!\n\n` +
    `Seu veículo já está pronto e pode ser retirado quando quiser.\n\n` +
    `*Serviço realizado:* ${params.servico}\n` +
    `*Veículo:* ${params.veiculo}\n` +
    `*Valor total:* R$ ${params.valor}\n\n` +
    `Qualquer dúvida estamos à disposição. Obrigado pela confiança!\n\n` +
    `_${params.oficina} · AutoKore.app_`,

  // Orçamento
  orcamento: (params: {
    cliente:  string
    veiculo:  string
    pecas:    string
    mao_obra: string
    total:    string
    oficina:  string
  }) =>
    `Olá, *${params.cliente}*!\n\n` +
    `Segue o orçamento que preparamos para o seu *${params.veiculo}*:\n\n` +
    `Peças: R$ ${params.pecas}\n` +
    `Mão de obra: R$ ${params.mao_obra}\n` +
    `*Total: R$ ${params.total}*\n\n` +
    `Se quiser aprovar ou tiver alguma dúvida, é só responder essa mensagem.\n\n` +
    `_${params.oficina} · AutoKore.app_`,

  // Revisão preventiva
  lembrete_revisao: (params: {
    cliente: string
    veiculo: string
    km:      string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*!\n\n` +
    `Tudo bem? Passando para avisar que seu *${params.veiculo}* está próximo da revisão dos *${params.km} km*.\n\n` +
    `Manter a revisão em dia evita problemas maiores e garante mais segurança. Se quiser agendar, é só nos chamar!\n\n` +
    `_${params.oficina} · AutoKore.app_`,
}

export function gerarLinkWhatsApp(numero: string, mensagem: string): string {
  const num = numero.replace(/\D/g, '')
  const numBR = num.startsWith('55') ? num : `55${num}`
  return `https://wa.me/${numBR}?text=${encodeURIComponent(mensagem)}`
}

export function abrirWhatsApp(numero: string, mensagem: string) {
  const link = gerarLinkWhatsApp(numero, mensagem)
  window.open(link, '_blank')
}

export async function enviarViaEvolutionAPI(params: {
  numero:   string
  mensagem: string
}): Promise<{ sucesso: boolean; erro?: string }> {
  const BASE_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL
  const API_KEY  = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY
  const INSTANCE = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE ?? 'autokore'

  if (!BASE_URL || !API_KEY) {
    return { sucesso: false, erro: 'API não configurada' }
  }

  try {
    const num = params.numero.replace(/\D/g, '')
    const numBR = num.startsWith('55') ? num : `55${num}`

    const resp = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
      body: JSON.stringify({
        number: `${numBR}@s.whatsapp.net`,
        text:   params.mensagem,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return { sucesso: false, erro: err }
    }

    return { sucesso: true }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function enviarNotificacaoWhatsApp(params: {
  numero:       string
  mensagem:     string
  forcar_link?: boolean
}): Promise<void> {
  const { numero, mensagem, forcar_link } = params

  if (forcar_link || !process.env.NEXT_PUBLIC_EVOLUTION_API_URL) {
    abrirWhatsApp(numero, mensagem)
    return
  }

  const resultado = await enviarViaEvolutionAPI({ numero, mensagem })

  if (!resultado.sucesso) {
    abrirWhatsApp(numero, mensagem)
  }
}