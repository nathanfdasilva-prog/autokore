'use client'
// ============================================================
// CALENDÁRIO SEMANAL — components/agendamento/CalendarioSemanal.tsx
// Visualização semanal e diária de agendamentos.
// ============================================================

import { useState } from 'react'
import {
  format, addDays, subDays, addWeeks, subWeeks,
  startOfWeek, isSameDay, isToday, parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Calendar,
  Clock, Phone, Car, Plus,
} from 'lucide-react'
import { useAgendamentosSemana } from '@/lib/hooks/useAgendamentos'
import { atualizarStatusAgendamento } from '@/lib/hooks/useAgendamentos'
import type { Agendamento, StatusAgendamento } from '@/lib/types'

const HORAS_DIA = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
]

const STATUS_CONFIG: Record<StatusAgendamento, { label: string; cls: string; bg: string }> = {
  agendado:      { label: 'Agendado',       cls: 'badge badge-blue',   bg: 'bg-blue-50 border-blue-200' },
  confirmado:    { label: 'Confirmado',      cls: 'badge badge-green',  bg: 'bg-green-50 border-green-200' },
  em_andamento:  { label: 'Em andamento',   cls: 'badge badge-orange', bg: 'bg-orange-50 border-orange-200' },
  concluido:     { label: 'Concluído',      cls: 'badge badge-green',  bg: 'bg-gray-50 border-gray-200 opacity-60' },
  cancelado:     { label: 'Cancelado',      cls: 'badge badge-red',    bg: 'bg-red-50 border-red-100 opacity-50' },
  nao_compareceu:{ label: 'Não compareceu', cls: 'badge badge-gray',   bg: 'bg-gray-50 border-gray-100 opacity-50' },
}

interface CalendarioSemanalProps {
  onNovoAgendamento: (data?: Date) => void
  onEditarAgendamento: (ag: Agendamento) => void
}

export default function CalendarioSemanal({
  onNovoAgendamento,
  onEditarAgendamento,
}: CalendarioSemanalProps) {
  const [semanaRef,    setSemanaRef]    = useState(new Date())
  const [modo,         setModo]         = useState<'semana' | 'dia'>('semana')
  const [diaSelecionado, setDiaSel]    = useState(new Date())
  const [agDetalhe,    setAgDetalhe]   = useState<Agendamento | null>(null)

  const inicioSemana = startOfWeek(semanaRef, { weekStartsOn: 1 })
  const diasSemana   = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))

  const { agendamentos, loading } = useAgendamentosSemana(semanaRef)

  // Filtra agendamentos por dia
  function agsDia(dia: Date) {
    return agendamentos
      .filter(ag => isSameDay(ag.data_hora, dia))
      .sort((a, b) => a.data_hora.getTime() - b.data_hora.getTime())
  }

  // Navegação
  function navAnterior() {
    if (modo === 'semana') setSemanaRef(s => subWeeks(s, 1))
    else                   setDiaSel(d => subDays(d, 1))
  }
  function navProximo() {
    if (modo === 'semana') setSemanaRef(s => addWeeks(s, 1))
    else                   setDiaSel(d => addDays(d, 1))
  }
  function irParaHoje() {
    const hoje = new Date()
    setSemanaRef(hoje)
    setDiaSel(hoje)
  }

  async function mudarStatus(id: string, status: StatusAgendamento) {
    await atualizarStatusAgendamento(id, status)
    setAgDetalhe(null)
  }

  const diasExibidos = modo === 'semana' ? diasSemana : [diaSelecionado]

  return (
    <div>
      {/* ---- TOOLBAR ---- */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Navegação */}
        <div className="flex items-center gap-1">
          <button
            onClick={navAnterior}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button
            onClick={navProximo}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Período */}
        <div className="font-semibold text-gray-800 text-sm">
          {modo === 'semana'
            ? `${format(diasSemana[0], "dd MMM", { locale: ptBR })} — ${format(diasSemana[6], "dd MMM yyyy", { locale: ptBR })}`
            : format(diaSelecionado, "EEEE, dd 'de' MMMM yyyy", { locale: ptBR })
          }
        </div>

        <button
          onClick={irParaHoje}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 rounded-lg transition"
        >
          Hoje
        </button>

        {/* Modo */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 ml-auto">
          {(['semana', 'dia'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                modo === m
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'semana' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>

        <button
          onClick={() => onNovoAgendamento()}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <Plus size={15} />
          Agendar
        </button>
      </div>

      {/* ---- GRADE DO CALENDÁRIO ---- */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Cabeçalho dos dias */}
          <div
            className="grid border-b border-gray-200"
            style={{ gridTemplateColumns: `64px repeat(${diasExibidos.length}, 1fr)` }}
          >
            <div className="border-r border-gray-100" /> {/* coluna de horas */}
            {diasExibidos.map(dia => (
              <button
                key={dia.toISOString()}
                onClick={() => { setDiaSel(dia); setModo('dia') }}
                className={`py-3 px-2 text-center transition hover:bg-gray-50 ${
                  isToday(dia) ? 'bg-orange-50' : ''
                }`}
              >
                <p className="text-[10px] font-medium text-gray-400 uppercase">
                  {format(dia, 'EEE', { locale: ptBR })}
                </p>
                <p className={`text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${
                  isToday(dia)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-800'
                }`}>
                  {format(dia, 'd')}
                </p>
                {/* Contagem de agendamentos */}
                {agsDia(dia).length > 0 && (
                  <p className="text-[10px] text-orange-500 font-medium mt-0.5">
                    {agsDia(dia).length} ag.
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Grade de horas */}
          <div className="overflow-y-auto max-h-[520px]">
            {HORAS_DIA.map(hora => (
              <div
                key={hora}
                className="grid border-b border-gray-100 last:border-0 min-h-[56px]"
                style={{ gridTemplateColumns: `64px repeat(${diasExibidos.length}, 1fr)` }}
              >
                {/* Label da hora */}
                <div className="border-r border-gray-100 px-2 py-1 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 font-medium">{hora}</span>
                </div>

                {/* Células por dia */}
                {diasExibidos.map(dia => {
                  const agsHora = agsDia(dia).filter(ag =>
                    format(ag.data_hora, 'HH:mm') === hora ||
                    // Mostra em blocos de 30min
                    (format(ag.data_hora, 'HH') === hora.split(':')[0] &&
                     Number(format(ag.data_hora, 'mm')) < 30 &&
                     hora.endsWith(':00')) ||
                    (format(ag.data_hora, 'HH') === hora.split(':')[0] &&
                     Number(format(ag.data_hora, 'mm')) >= 30 &&
                     hora.endsWith(':00'))
                  )
                  // Simplificado: mostra agendamentos cujo horário começa nessa hora
                  const agsExatas = agsDia(dia).filter(ag =>
                    format(ag.data_hora, 'HH:00') === hora
                  )

                  return (
                    <div
                      key={dia.toISOString()}
                      className="border-r border-gray-100 last:border-0 p-1 relative"
                      onClick={() => {
                        if (agsExatas.length === 0) {
                          const [h] = hora.split(':').map(Number)
                          const novaData = new Date(dia)
                          novaData.setHours(h, 0, 0, 0)
                          onNovoAgendamento(novaData)
                        }
                      }}
                    >
                      {agsExatas.map(ag => (
                        <button
                          key={ag.id}
                          onClick={e => { e.stopPropagation(); setAgDetalhe(ag) }}
                          className={`w-full text-left rounded-md px-2 py-1.5 border text-xs mb-1 transition hover:shadow-sm ${
                            STATUS_CONFIG[ag.status]?.bg ?? 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <p className="font-semibold text-gray-800 truncate">
                            {format(ag.data_hora, 'HH:mm')} · {ag.cliente_nome}
                          </p>
                          <p className="text-gray-500 truncate">{ag.servico}</p>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- MODAL DETALHE AGENDAMENTO ---- */}
      {agDetalhe && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setAgDetalhe(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {format(agDetalhe.data_hora, "EEEE, dd 'de' MMM", { locale: ptBR })}
                </p>
                <h3 className="text-base font-bold text-gray-800 mt-0.5">
                  {agDetalhe.cliente_nome}
                </h3>
              </div>
              <span className={STATUS_CONFIG[agDetalhe.status]?.cls ?? 'badge badge-gray'}>
                {STATUS_CONFIG[agDetalhe.status]?.label}
              </span>
            </div>

            {/* Detalhes */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={14} className="text-orange-400 flex-shrink-0" />
                {format(agDetalhe.data_hora, 'HH:mm')} — {agDetalhe.servico}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Car size={14} className="text-orange-400 flex-shrink-0" />
                {agDetalhe.veiculo}
                <span className="font-mono text-xs text-gray-400">{agDetalhe.placa}</span>
              </div>
              {agDetalhe.cliente_whatsapp && (
                <a
                  href={`https://wa.me/${agDetalhe.cliente_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:underline"
                >
                  <Phone size={14} className="flex-shrink-0" />
                  {agDetalhe.cliente_whatsapp}
                </a>
              )}
              {agDetalhe.observacoes && (
                <p className="text-gray-500 bg-gray-50 rounded-lg px-3 py-2 text-xs">
                  {agDetalhe.observacoes}
                </p>
              )}
            </div>

            {/* Ações de status */}
            <div className="flex flex-wrap gap-2 mb-3">
              {agDetalhe.status === 'agendado' && (
                <button
                  onClick={() => mudarStatus(agDetalhe.id, 'confirmado')}
                  className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition"
                >
                  ✓ Confirmar
                </button>
              )}
              {(agDetalhe.status === 'agendado' || agDetalhe.status === 'confirmado') && (
                <>
                  <button
                    onClick={() => mudarStatus(agDetalhe.id, 'cancelado')}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition"
                  >
                    ✕ Cancelar
                  </button>
                  <button
                    onClick={() => mudarStatus(agDetalhe.id, 'nao_compareceu')}
                    className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-200 transition"
                  >
                    Não compareceu
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setAgDetalhe(null); onEditarAgendamento(agDetalhe) }}
                className="btn-ghost flex-1 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => setAgDetalhe(null)}
                className="btn-secondary flex-1 text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
