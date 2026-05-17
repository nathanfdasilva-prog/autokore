'use client'
// ============================================================
// BOTÕES DE NOTIFICAÇÃO WHATSAPP — components/whatsapp/BotoesWhatsApp.tsx
// Componente reutilizável em OS, Agendamentos, etc.
// ============================================================

import { Phone } from 'lucide-react'
import {
  TEMPLATES,
  enviarNotificacaoWhatsApp,
  gerarLinkWhatsApp,
} from '@/lib/services/whatsapp'
import type { OrdemServico, Agendamento } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ---- Botão genérico de WhatsApp ----
interface BotaoWppProps {
  numero:   string
  mensagem: string
  label?:   string
  variante?: 'primary' | 'ghost' | 'icon'
}

export function BotaoWhatsApp({
  numero, mensagem, label = 'WhatsApp', variante = 'ghost',
}: BotaoWppProps) {
  function handleClick() {
    enviarNotificacaoWhatsApp({ numero, mensagem })
  }

  if (variante === 'icon') {
    return (
      <a
        href={gerarLinkWhatsApp(numero, mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir WhatsApp"
        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition"
      >
        <Phone size={15} />
      </a>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm font-medium transition rounded-lg px-3 py-2 ${
        variante === 'primary'
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
      }`}
    >
      <Phone size={15} />
      {label}
    </button>
  )
}

// ---- OS concluída ----
export function BotaoOsConcluida({
  os,
  oficina_nome,
}: {
  os:          OrdemServico
  oficina_nome: string
}) {
  const msg = TEMPLATES.os_concluida({
    cliente: os.cliente_nome,
    veiculo: os.veiculo,
    servico: os.descricao_problema,
    valor:   os.valor_total.toFixed(2),
    oficina: oficina_nome,
  })

  return (
    <BotaoWhatsApp
      numero={os.cliente_whatsapp}
      mensagem={msg}
      label="Avisar cliente — veículo pronto"
    />
  )
}

// ---- Confirmação de agendamento ----
export function BotaoConfirmarAgendamento({
  agendamento,
  oficina_nome,
  oficina_whatsapp,
}: {
  agendamento:      Agendamento
  oficina_nome:     string
  oficina_whatsapp: string
}) {
  const msg = TEMPLATES.agendamento_confirmado({
    cliente:  agendamento.cliente_nome,
    veiculo:  agendamento.veiculo,
    data:     format(agendamento.data_hora, "dd 'de' MMMM", { locale: ptBR }),
    horario:  format(agendamento.data_hora, 'HH:mm'),
    servico:  agendamento.servico,
    oficina:  oficina_nome,
    whatsapp: oficina_whatsapp,
  })

  return (
    <BotaoWhatsApp
      numero={agendamento.cliente_whatsapp}
      mensagem={msg}
      label="Confirmar via WhatsApp"
    />
  )
}

// ---- Lembrete de agendamento ----
export function BotaoLembreteAgendamento({
  agendamento,
  oficina_nome,
}: {
  agendamento:  Agendamento
  oficina_nome: string
}) {
  const msg = TEMPLATES.lembrete_agendamento({
    cliente: agendamento.cliente_nome,
    data:    format(agendamento.data_hora, "dd/MM/yyyy"),
    horario: format(agendamento.data_hora, 'HH:mm'),
    oficina: oficina_nome,
  })

  return (
    <BotaoWhatsApp
      numero={agendamento.cliente_whatsapp}
      mensagem={msg}
      label="Enviar lembrete"
      variante="ghost"
    />
  )
}

// ---- Orçamento via WhatsApp ----
export function BotaoEnviarOrcamento({
  os,
  oficina_nome,
}: {
  os:          OrdemServico
  oficina_nome: string
}) {
  const msg = TEMPLATES.orcamento({
    cliente:  os.cliente_nome,
    veiculo:  os.veiculo,
    pecas:    os.valor_pecas.toFixed(2),
    mao_obra: os.valor_mao_obra.toFixed(2),
    total:    os.valor_total.toFixed(2),
    oficina:  oficina_nome,
  })

  return (
    <BotaoWhatsApp
      numero={os.cliente_whatsapp}
      mensagem={msg}
      label="Enviar orçamento"
      variante="ghost"
    />
  )
}
