// ============================================================
// SERVIÇO DE NOTIFICAÇÕES WHATSAPP — lib/services/whatsapp.ts
//
// Suporta 3 modalidades:
//   1. Link direto wa.me (sem API, gratuito)
//   2. Evolution API (self-hosted, gratuito)
//   3. Twilio (pago, produção)
//
// Configure via variáveis de ambiente.
// ============================================================

export type ProvedorWhatsApp = 'link' | 'evolution' | 'twilio'

// Templates de mensagem
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
    `Olá, *${params.cliente}*! 👋\n\n` +
    `Seu agendamento na *${params.oficina}* foi confirmado! ✅\n\n` +
    `📅 *Data:* ${params.data}\n` +
    `⏰ *Horário:* ${params.horario}\n` +
    `🚗 *Veículo:* ${params.veiculo}\n` +
    `🔧 *Serviço:* ${params.servico}\n\n` +
    `Em caso de dúvidas, responda esta mensagem.\n` +
    `_AutoKore.app_`,

  // Lembrete 1 dia antes
  lembrete_agendamento: (params: {
    cliente: string
    data:    string
    horario: string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*! 🔔\n\n` +
    `Lembrete: você tem um agendamento *amanhã* na *${params.oficina}*.\n\n` +
    `📅 ${params.data} às ${params.horario}\n\n` +
    `Para cancelar ou reagendar, entre em contato conosco.\n` +
    `_AutoKore.app_`,

  // OS concluída — veículo pronto
  os_concluida: (params: {
    cliente: string
    veiculo: string
    servico: string
    valor:   string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*! 🎉\n\n` +
    `Seu veículo está *pronto para retirada*! 🚗✨\n\n` +
    `🔧 *Serviço:* ${params.servico}\n` +
    `🚘 *Veículo:* ${params.veiculo}\n` +
    `💰 *Valor:* R$${params.valor}\n\n` +
    `Nos vemos em breve!\n` +
    `_${params.oficina} · AutoKore.app_`,

  // Orçamento
  orcamento: (params: {
    cliente: string
    veiculo: string
    pecas:   string
    mao_obra: string
    total:   string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*! 📋\n\n` +
    `Segue o orçamento para seu veículo *${params.veiculo}*:\n\n` +
    `🔩 Peças: R$${params.pecas}\n` +
    `🔧 Mão de obra: R$${params.mao_obra}\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `💰 *Total: R$${params.total}*\n\n` +
    `Para aprovar, responda *SIM*.\n` +
    `_${params.oficina} · AutoKore.app_`,

  // Revisão preventiva — lembrete automático
  lembrete_revisao: (params: {
    cliente: string
    veiculo: string
    km:      string
    oficina: string
  }) =>
    `Olá, *${params.cliente}*! 🔔\n\n` +
    `Seu *${params.veiculo}* está próximo da revisão dos *${params.km} km*.\n\n` +
    `Agende já para manter seu veículo em dia! 🚗\n\n` +
    `Responda esta mensagem para marcar.\n` +
    `_${params.oficina} · AutoKore.app_`,
}

// ----------------------------------------------------------
// 1. Link direto — abre o WhatsApp Web / app
//    Não requer API, funciona em qualquer plano.
// ----------------------------------------------------------
export function gerarLinkWhatsApp(
  numero:   string,
  mensagem: string,
): string {
  const num = numero.replace(/\D/g, '')
  const numBR = num.startsWith('55') ? num : `55${num}`
  return `https://wa.me/${numBR}?text=${encodeURIComponent(mensagem)}`
}

export function abrirWhatsApp(numero: string, mensagem: string) {
  const link = gerarLinkWhatsApp(numero, mensagem)
  window.open(link, '_blank')
}

// ----------------------------------------------------------
// 2. Evolution API — self-hosted, grátis
//    https://doc.evolution-api.com
//    Deploy: Railway, VPS, Docker
// ----------------------------------------------------------
export async function enviarViaEvolutionAPI(params: {
  numero:   string
  mensagem: string
}): Promise<{ sucesso: boolean; erro?: string }> {
  const BASE_URL  = process.env.NEXT_PUBLIC_EVOLUTION_API_URL
  const API_KEY   = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY
  const INSTANCE  = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE ?? 'autokore'

  if (!BASE_URL || !API_KEY) {
    console.warn('[WhatsApp] Evolution API não configurada. Usando link direto.')
    return { sucesso: false, erro: 'API não configurada' }
  }

  try {
    const num = params.numero.replace(/\D/g, '')
    const numBR = num.startsWith('55') ? num : `55${num}`

    const resp = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':       API_KEY,
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

// ----------------------------------------------------------
// 3. Twilio (produção paga)
//    Requer conta Twilio + número aprovado para WhatsApp.
//    Chamada deve ser feita via Next.js API Route (server-side)
//    para proteger as credenciais.
// ----------------------------------------------------------
// Exemplo de uso em app/api/whatsapp/route.ts:
//
// import twilio from 'twilio'
// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN,
// )
// await client.messages.create({
//   body: mensagem,
//   from: 'whatsapp:+14155238886',
//   to:   `whatsapp:+55${numero}`,
// })

// ----------------------------------------------------------
// Função principal — tenta Evolution API, fallback para link
// ----------------------------------------------------------
export async function enviarNotificacaoWhatsApp(params: {
  numero:   string
  mensagem: string
  forcar_link?: boolean
}): Promise<void> {
  const { numero, mensagem, forcar_link } = params

  // Se forçar link ou não há API configurada, abre direto
  if (forcar_link || !process.env.NEXT_PUBLIC_EVOLUTION_API_URL) {
    abrirWhatsApp(numero, mensagem)
    return
  }

  // Tenta enviar via API
  const resultado = await enviarViaEvolutionAPI({ numero, mensagem })

  // Se falhou, fallback para link
  if (!resultado.sucesso) {
    console.warn('[WhatsApp] API falhou, abrindo link direto:', resultado.erro)
    abrirWhatsApp(numero, mensagem)
  }
}
