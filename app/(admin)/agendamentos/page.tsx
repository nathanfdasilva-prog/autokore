'use client'
import { useState } from 'react'
import { format, isTomorrow, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, List, Send } from 'lucide-react'
import CalendarioSemanal from '@/components/agendamento/CalendarioSemanal'
import AgendamentoForm   from '@/components/agendamento/AgendamentoForm'
import { useAgendamentosSemana } from '@/lib/hooks/useAgendamentos'
import { useAuth } from '@/lib/context/AuthContext'
import type { Agendamento, StatusAgendamento } from '@/lib/types'

const STATUS_CONFIG: Record<StatusAgendamento, { label: string; cls: string }> = {
  agendado:       { label: 'Agendado',       cls: 'badge badge-blue'   },
  confirmado:     { label: 'Confirmado',      cls: 'badge badge-green'  },
  em_andamento:   { label: 'Em andamento',   cls: 'badge badge-orange' },
  concluido:      { label: 'Concluído',      cls: 'badge badge-green'  },
  cancelado:      { label: 'Cancelado',      cls: 'badge badge-red'    },
  nao_compareceu: { label: 'Não compareceu', cls: 'badge badge-gray'   },
}

export default function AgendamentosPage() {
  const { oficina }                        = useAuth()
  const [aba,         setAba]              = useState<'calendario' | 'lista'>('calendario')
  const [modalAberto, setModalAberto]      = useState(false)
  const [dataModal,   setDataModal]        = useState<Date | undefined>()
  const [editandoAg,  setEditandoAg]       = useState<Agendamento | null>(null)
  const [semanaRef]                        = useState(new Date())
  const { agendamentos, loading }          = useAgendamentosSemana(semanaRef)

  function abrirNovo(data?: Date) {
    setEditandoAg(null)
    setDataModal(data)
    setModalAberto(true)
  }

  function abrirEditar(ag: Agendamento) {
    setEditandoAg(ag)
    setDataModal(undefined)
    setModalAberto(true)
  }

  function enviarLembrete(ag: Agendamento, e: React.MouseEvent) {
    e.stopPropagation()
    const data    = format(ag.data_hora, "dd/MM", { locale: ptBR })
    const hora    = format(ag.data_hora, "HH:mm")
    const oficina_nome = oficina?.nome ?? 'nossa oficina'

    const msg = encodeURIComponent(
      `Olá ${ag.cliente_nome}! 👋\n\n` +
      `Lembrando que você tem um agendamento ${isToday(ag.data_hora) ? '*hoje*' : isTomorrow(ag.data_hora) ? '*amanhã*' : `em *${data}*'`} na *${oficina_nome}*:\n\n` +
      `📅 Data: ${data} às ${hora}\n` +
      `🚗 Veículo: ${ag.veiculo} — ${ag.placa}\n` +
      `🔧 Serviço: ${ag.servico}\n\n` +
      `Qualquer dúvida é só nos chamar! 😊`
    )
    window.open(`https://wa.me/${ag.cliente_whatsapp?.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Calendário e gestão de horários</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setAba('calendario')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${aba === 'calendario' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Calendar size={15} />Calendário
          </button>
          <button onClick={() => setAba('lista')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${aba === 'lista' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <List size={15} />Lista
          </button>
        </div>
      </div>

      {aba === 'calendario' && (
        <CalendarioSemanal
          onNovoAgendamento={abrirNovo}
          onEditarAgendamento={abrirEditar}
        />
      )}

      {aba === 'lista' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Agendamentos desta semana</h2>
            <button onClick={() => abrirNovo()} className="btn-primary text-sm">+ Novo</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhum agendamento nesta semana.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Data / Hora</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Cliente</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Veículo</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Serviço</th>
                    <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">Status</th>
                    <th className="text-center text-xs font-semibold text-gray-400 pb-2">Lembrete</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.map(ag => (
                    <tr key={ag.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isToday(ag.data_hora) ? 'bg-orange-50/30' :
                        isTomorrow(ag.data_hora) ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => abrirEditar(ag)}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-800">{format(ag.data_hora, "dd/MM")}</p>
                        <p className="text-xs text-orange-500 font-semibold">{format(ag.data_hora, "HH:mm")}</p>
                        {isToday(ag.data_hora) && <span className="text-[10px] text-orange-600 font-bold">HOJE</span>}
                        {isTomorrow(ag.data_hora) && <span className="text-[10px] text-blue-600 font-bold">AMANHÃ</span>}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{ag.cliente_nome}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {ag.veiculo}<span className="ml-1 text-xs font-mono text-gray-400">{ag.placa}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{ag.servico}</td>
                      <td className="py-3 pr-4">
                        <span className={STATUS_CONFIG[ag.status]?.cls ?? 'badge badge-gray'}>
                          {STATUS_CONFIG[ag.status]?.label}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {ag.cliente_whatsapp && ag.status !== 'cancelado' && ag.status !== 'concluido' && (
                          <button
                            onClick={e => enviarLembrete(ag, e)}
                            title="Enviar lembrete WhatsApp"
                            className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center mx-auto transition">
                            <Send size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalAberto && (
        <AgendamentoForm
          onClose={() => setModalAberto(false)}
          dataInicial={dataModal}
          agendamento={editandoAg}
        />
      )}
    </div>
  )
}