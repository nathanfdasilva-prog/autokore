// ============================================================
// GOOGLE CALENDAR — lib/services/googleCalendar.ts
// Integração bidirecional com Google Calendar via OAuth.
// Exporta agendamentos da oficina para o calendário do admin.
// ============================================================

import type { Agendamento } from '../types'
import { format } from 'date-fns'

// ---- Tipos ----
export interface EventoCalendario {
  id?:          string
  summary:      string        // título
  description?: string
  location?:    string
  start:        { dateTime: string; timeZone: string }
  end:          { dateTime: string; timeZone: string }
  colorId?:     string        // 1-11 (Google Calendar colors)
  reminders?:   {
    useDefault: boolean
    overrides?: { method: 'popup' | 'email'; minutes: number }[]
  }
}

// Cores do Google Calendar por status
const COR_STATUS: Record<string, string> = {
  agendado:       '1',  // Azul
  confirmado:     '2',  // Verde
  em_andamento:   '6',  // Tangerina
  cancelado:      '4',  // Flamingo (rosa)
  nao_compareceu: '8',  // Grafite
  concluido:      '9',  // Azul-escuro
}

// ----------------------------------------------------------
// Converte Agendamento → EventoCalendario Google
// ----------------------------------------------------------
export function agendamentoParaEvento(
  ag:          Agendamento,
  oficina:     string,
  duracao_min: number = 60,
): EventoCalendario {
  const inicio = new Date(ag.data_hora)
  const fim    = new Date(inicio.getTime() + duracao_min * 60 * 1000)

  return {
    summary:     `🔧 ${ag.cliente_nome} — ${ag.servico}`,
    description: [
      `Veículo: ${ag.veiculo} (${ag.placa})`,
      `WhatsApp: ${ag.cliente_whatsapp}`,
      ag.observacoes ? `Obs: ${ag.observacoes}` : '',
      `Oficina: ${oficina}`,
      `OS: ${ag.os_id ?? 'Não gerada'}`,
    ].filter(Boolean).join('\n'),
    location: oficina,
    start: {
      dateTime: inicio.toISOString(),
      timeZone: 'America/Manaus',
    },
    end: {
      dateTime: fim.toISOString(),
      timeZone: 'America/Manaus',
    },
    colorId: COR_STATUS[ag.status] ?? '1',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  }
}

// ----------------------------------------------------------
// Link para adicionar ao Google Calendar (sem OAuth)
// Funciona para qualquer usuário sem precisar de integração.
// ----------------------------------------------------------
export function gerarLinkGoogleCalendar(ag: Agendamento, oficina: string): string {
  const inicio = new Date(ag.data_hora)
  const fim    = new Date(inicio.getTime() + 60 * 60 * 1000)

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     `🔧 ${ag.cliente_nome} — ${ag.servico}`,
    dates:    `${fmt(inicio)}/${fmt(fim)}`,
    details:  `Veículo: ${ag.veiculo} (${ag.placa})\nWhatsApp: ${ag.cliente_whatsapp}`,
    location: oficina,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// ----------------------------------------------------------
// API Google Calendar (OAuth 2.0 — requer credenciais)
// Configuração: Google Cloud Console → Credentials → OAuth 2.0
// Scopes: https://www.googleapis.com/auth/calendar.events
// ----------------------------------------------------------

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const CALENDAR_ID  = 'primary'

// Cria evento via API (requer access_token do usuário)
export async function criarEventoCalendar(
  evento:       EventoCalendario,
  access_token: string,
): Promise<{ id: string } | null> {
  try {
    const resp = await fetch(
      `${CALENDAR_API}/calendars/${CALENDAR_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(evento),
      },
    )
    if (!resp.ok) return null
    const data = await resp.json()
    return { id: data.id }
  } catch {
    return null
  }
}

// Atualiza evento existente
export async function atualizarEventoCalendar(
  evento_id:    string,
  evento:       Partial<EventoCalendario>,
  access_token: string,
): Promise<boolean> {
  try {
    const resp = await fetch(
      `${CALENDAR_API}/calendars/${CALENDAR_ID}/events/${evento_id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(evento),
      },
    )
    return resp.ok
  } catch {
    return false
  }
}

// Deleta evento
export async function deletarEventoCalendar(
  evento_id:    string,
  access_token: string,
): Promise<boolean> {
  try {
    const resp = await fetch(
      `${CALENDAR_API}/calendars/${CALENDAR_ID}/events/${evento_id}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${access_token}` },
      },
    )
    return resp.status === 204
  } catch {
    return false
  }
}

// Busca eventos do calendário num intervalo
export async function buscarEventosCalendar(
  de:           Date,
  ate:          Date,
  access_token: string,
): Promise<EventoCalendario[]> {
  try {
    const params = new URLSearchParams({
      timeMin:      de.toISOString(),
      timeMax:      ate.toISOString(),
      singleEvents: 'true',
      orderBy:      'startTime',
    })
    const resp = await fetch(
      `${CALENDAR_API}/calendars/${CALENDAR_ID}/events?${params}`,
      { headers: { 'Authorization': `Bearer ${access_token}` } },
    )
    if (!resp.ok) return []
    const data = await resp.json()
    return data.items ?? []
  } catch {
    return []
  }
}
