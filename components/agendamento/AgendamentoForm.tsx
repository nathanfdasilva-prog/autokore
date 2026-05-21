'use client'
import { useState } from 'react'
import { X, Calendar, Phone, Car, Bike, Clock, Trash2 } from 'lucide-react'
import { format, setHours, setMinutes } from 'date-fns'
import { criarAgendamento, editarAgendamento } from '@/lib/hooks/useAgendamentos'
import { useAuth } from '@/lib/context/AuthContext'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Agendamento } from '@/lib/types'

const HORARIOS = [
  '07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00',
]

const SERVICOS = [
  'Troca de óleo e filtros',
  'Alinhamento e balanceamento',
  'Revisão geral',
  'Freios',
  'Suspensão',
  'Sistema elétrico',
  'Ar-condicionado',
  'Diagnóstico',
  'Funilaria e pintura',
  'Outros',
]

interface AgendamentoFormProps {
  onClose:      () => void
  dataInicial?: Date
  agendamento?: Agendamento | null
}

export default function AgendamentoForm({ onClose, dataInicial, agendamento }: AgendamentoFormProps) {
  const { perfil } = useAuth()

  const parseDataHora = (dh: Date) => ({
    data:    format(dh, 'yyyy-MM-dd'),
    horario: format(dh, 'HH:mm'),
  })

  const { data: dataInic, horario: horInic } = dataInicial
    ? parseDataHora(dataInicial)
    : { data: format(new Date(), 'yyyy-MM-dd'), horario: '08:00' }

  const [form, setForm] = useState({
    cliente_nome:     agendamento?.cliente_nome     ?? '',
    cliente_whatsapp: agendamento?.cliente_whatsapp ?? '',
    veiculo:          agendamento?.veiculo           ?? '',
    placa:            agendamento?.placa             ?? '',
    tipo_veiculo:     'carro' as 'carro' | 'moto',
    servico:          agendamento?.servico           ?? SERVICOS[0],
    data:             agendamento ? parseDataHora(agendamento.data_hora).data    : dataInic,
    horario:          agendamento ? parseDataHora(agendamento.data_hora).horario : horInic,
    observacoes:      agendamento?.observacoes       ?? '',
  })

  const [salvando,        setSalvando]        = useState(false)
  const [erro,            setErro]            = useState('')
  const [confirmDeletar,  setConfirmDeletar]  = useState(false)
  const [deletando,       setDeletando]       = useState(false)

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function buildDataHora(): Date {
    const [h, m] = form.horario.split(':').map(Number)
    const base   = new Date(form.data + 'T00:00:00')
    return setMinutes(setHours(base, h), m)
  }

  async function handleSalvar() {
    setErro('')
    if (!form.cliente_nome.trim()) return setErro('Nome do cliente é obrigatório.')
    if (!form.cliente_whatsapp.trim()) return setErro('WhatsApp é obrigatório.')
    if (!form.veiculo.trim()) return setErro('Veículo é obrigatório.')
    if (!form.placa.trim()) return setErro('Placa é obrigatória.')

    setSalvando(true)
    try {
      const data_hora = buildDataHora()
      if (agendamento) {
        await editarAgendamento(agendamento.id, {
          cliente_nome:     form.cliente_nome,
          cliente_whatsapp: form.cliente_whatsapp,
          veiculo:          form.veiculo,
          placa:            form.placa.toUpperCase(),
          servico:          form.servico,
          data_hora,
          observacoes:      form.observacoes,
        })
      } else {
        await criarAgendamento({
          oficina_id:       perfil!.oficina_id,
          cliente_nome:     form.cliente_nome,
          cliente_whatsapp: form.cliente_whatsapp,
          veiculo:          form.veiculo,
          placa:            form.placa.toUpperCase(),
          servico:          form.servico,
          data_hora,
          observacoes:      form.observacoes,
        })
      }
      onClose()
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function handleDeletar() {
    if (!agendamento) return
    setDeletando(true)
    try {
      await deleteDoc(doc(db, 'agendamentos', agendamento.id))
      onClose()
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setDeletando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar size={17} className="text-orange-500" />
            {agendamento ? 'Editar agendamento' : 'Novo agendamento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {erro && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de veículo</label>
            <div className="flex gap-2">
              {(['carro', 'moto'] as const).map(t => (
                <button key={t} type="button" onClick={() => setField('tipo_veiculo', t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                    form.tipo_veiculo === t
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {t === 'carro' ? <Car size={14} /> : <Bike size={14} />}
                  {t === 'carro' ? 'Carro' : 'Moto'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome do cliente <span className="text-red-500">*</span></label>
              <input value={form.cliente_nome} onChange={e => setField('cliente_nome', e.target.value)} placeholder="João Silva" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp <span className="text-red-500">*</span></label>
              <input value={form.cliente_whatsapp} onChange={e => setField('cliente_whatsapp', e.target.value)} placeholder="(69) 9 9999-9999" className="input-base" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Veículo <span className="text-red-500">*</span></label>
              <input value={form.veiculo} onChange={e => setField('veiculo', e.target.value)} placeholder="VW Gol G5 2014" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Placa <span className="text-red-500">*</span></label>
              <input value={form.placa} onChange={e => setField('placa', e.target.value.toUpperCase())} placeholder="ABC-1234" maxLength={8} className="input-base uppercase font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Serviço</label>
            <select value={form.servico} onChange={e => setField('servico', e.target.value)} className="input-base">
              {SERVICOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data <span className="text-red-500">*</span></label>
              <input type="date" value={form.data} min={format(new Date(), 'yyyy-MM-dd')} onChange={e => setField('data', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Horário <span className="text-red-500">*</span></label>
              <select value={form.horario} onChange={e => setField('horario', e.target.value)} className="input-base">
                {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={e => setField('observacoes', e.target.value)} rows={2} placeholder="Detalhes adicionais..." className="input-base resize-none" />
          </div>
        </div>

        {/* Confirmação de exclusão */}
        {confirmDeletar && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-700 mb-1">Excluir agendamento?</p>
            <p className="text-xs text-red-500 mb-3">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeletar(false)} className="flex-1 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleDeletar} disabled={deletando}
                className="flex-1 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {deletando ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 px-6 pb-5">
          {agendamento && !confirmDeletar && (
            <button onClick={() => setConfirmDeletar(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-200 hover:bg-red-50 rounded-xl transition">
              <Trash2 size={14} />
              Excluir
            </button>
          )}
          <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando} className="btn-primary flex-1">
            {salvando ? 'Salvando...' : agendamento ? 'Salvar alterações' : 'Criar agendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}