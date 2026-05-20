'use client'
import { useState } from 'react'
import {
  Search, Plus, Users, Car, Phone,
  X, Save, ChevronRight, Clock,
  Wrench, Edit2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  useClientes, useVeiculosCliente,
  useOSCliente, criarCliente, criarVeiculo,
} from '@/lib/hooks/useClientes'
import { BotaoWhatsApp } from '@/components/whatsapp/BotoesWhatsApp'
import { useAuth } from '@/lib/context/AuthContext'
import { doc, updateDoc, db } from '@/lib/firebase/firestore'
import type { Cliente, Veiculo, StatusOS } from '@/lib/types'

const STATUS_CLS: Record<StatusOS, string> = {
  aberta:           'badge badge-blue',
  em_andamento:     'badge badge-orange',
  aguardando_pecas: 'badge badge-gray',
  concluida:        'badge badge-green',
  cancelada:        'badge badge-red',
}
const STATUS_LABEL: Record<StatusOS, string> = {
  aberta: 'Aberta', em_andamento: 'Em andamento',
  aguardando_pecas: 'Aguard. peças', concluida: 'Concluída', cancelada: 'Cancelada',
}

export default function ClientesPage() {
  const { perfil }            = useAuth()
  const { clientes, loading } = useClientes()

  const [busca,        setBusca]        = useState('')
  const [clienteSel,   setClienteSel]   = useState<Cliente | null>(null)
  const [modalCliente, setModalCliente] = useState(false)
  const [modalVeiculo, setModalVeiculo] = useState(false)
  const [modalEditar,  setModalEditar]  = useState(false)

  const [formCli,     setFormCli]     = useState({ nome: '', whatsapp: '', email: '', cpf: '' })
  const [salvandoCli, setSalvandoCli] = useState(false)
  const [erroCli,     setErroCli]     = useState('')

  const [formEditar,     setFormEditar]     = useState({ nome: '', whatsapp: '', email: '', cpf: '' })
  const [salvandoEditar, setSalvandoEditar] = useState(false)
  const [erroEditar,     setErroEditar]     = useState('')

  const [formVei, setFormVei] = useState({
    marca: '', modelo: '', ano: new Date().getFullYear(),
    placa: '', cor: '', km: 0, tipo: 'carro' as 'carro' | 'moto',
  })
  const [salvandoVei, setSalvandoVei] = useState(false)
  const [erroVei,     setErroVei]     = useState('')

  const clientesFiltrados = clientes.filter(c => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return (
      c.nome.toLowerCase().includes(q) ||
      c.whatsapp.includes(q) ||
      (c.cpf ?? '').includes(q)
    )
  })

  function abrirEditar(cliente: Cliente) {
    setFormEditar({
      nome:     cliente.nome,
      whatsapp: cliente.whatsapp,
      email:    cliente.email ?? '',
      cpf:      cliente.cpf   ?? '',
    })
    setErroEditar('')
    setModalEditar(true)
  }

  async function handleSalvarEdicao() {
    setErroEditar('')
    if (!formEditar.nome.trim())     return setErroEditar('Nome é obrigatório.')
    if (!formEditar.whatsapp.trim()) return setErroEditar('WhatsApp é obrigatório.')
    if (!clienteSel) return
    setSalvandoEditar(true)
    try {
      await updateDoc(doc(db, 'clientes', clienteSel.id), {
        nome:     formEditar.nome,
        whatsapp: formEditar.whatsapp,
        email:    formEditar.email || '',
        cpf:      formEditar.cpf   || '',
      })
      setClienteSel({ ...clienteSel, ...formEditar })
      setModalEditar(false)
    } catch (e: any) { setErroEditar(e.message) }
    finally { setSalvandoEditar(false) }
  }

  async function handleSalvarCliente() {
    setErroCli('')
    if (!formCli.nome.trim())     return setErroCli('Nome é obrigatório.')
    if (!formCli.whatsapp.trim()) return setErroCli('WhatsApp é obrigatório.')
    setSalvandoCli(true)
    try {
      await criarCliente({
        oficina_id: perfil!.oficina_id,
        nome:       formCli.nome,
        whatsapp:   formCli.whatsapp,
        email:      formCli.email || undefined,
        cpf:        formCli.cpf   || undefined,
      })
      setModalCliente(false)
      setFormCli({ nome: '', whatsapp: '', email: '', cpf: '' })
    } catch (e: any) { setErroCli(e.message) }
    finally { setSalvandoCli(false) }
  }

  async function handleSalvarVeiculo() {
    setErroVei('')
    if (!clienteSel) return
    if (!formVei.marca.trim())  return setErroVei('Marca é obrigatória.')
    if (!formVei.modelo.trim()) return setErroVei('Modelo é obrigatório.')
    if (!formVei.placa.trim())  return setErroVei('Placa é obrigatória.')
    setSalvandoVei(true)
    try {
      await criarVeiculo({
        oficina_id: perfil!.oficina_id,
        cliente_id: clienteSel.id,
        ...formVei,
        placa: formVei.placa.toUpperCase(),
      })
      setModalVeiculo(false)
      setFormVei({ marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', cor: '', km: 0, tipo: 'carro' })
    } catch (e: any) { setErroVei(e.message) }
    finally { setSalvandoVei(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clientes.length} clientes cadastrados</p>
        </div>
        <button onClick={() => setModalCliente(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />Novo cliente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar nome, WhatsApp ou CPF..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="card text-center py-10">
              <Users size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientesFiltrados.map(c => (
                <button
                  key={c.id}
                  onClick={() => setClienteSel(c)}
                  className={`w-full text-left card hover:border-orange-200 hover:shadow-sm transition-all ${
                    clienteSel?.id === c.id ? 'border-orange-400 bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      clienteSel?.id === c.id ? 'bg-orange-500' : 'bg-gray-400'
                    }`}>
                      {c.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.nome}</p>
                      <p className="text-xs text-gray-400 truncate">{c.whatsapp}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!clienteSel ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center border-dashed">
              <Users size={32} className="text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Selecione um cliente para ver os detalhes</p>
            </div>
          ) : (
            <ClienteDetalhe
              cliente={clienteSel}
              onAddVeiculo={() => setModalVeiculo(true)}
              onEditar={() => abrirEditar(clienteSel)}
            />
          )}
        </div>
      </div>

      {/* Modal editar cliente */}
      {modalEditar && clienteSel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Editar cliente</h2>
              <button onClick={() => setModalEditar(false)}><X size={19} className="text-gray-400" /></button>
            </div>
            {erroEditar && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{erroEditar}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input value={formEditar.nome} onChange={e => setFormEditar(f => ({ ...f, nome: e.target.value }))} className="input-base" placeholder="João Silva" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp *</label>
                <input value={formEditar.whatsapp} onChange={e => setFormEditar(f => ({ ...f, whatsapp: e.target.value }))} className="input-base" placeholder="(69) 9 9999-9999" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                <input type="email" value={formEditar.email} onChange={e => setFormEditar(f => ({ ...f, email: e.target.value }))} className="input-base" placeholder="joao@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                <input value={formEditar.cpf} onChange={e => setFormEditar(f => ({ ...f, cpf: e.target.value }))} className="input-base" placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalEditar(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvarEdicao} disabled={salvandoEditar} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={14} />{salvandoEditar ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo cliente */}
      {modalCliente && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Novo cliente</h2>
              <button onClick={() => setModalCliente(false)}><X size={19} className="text-gray-400" /></button>
            </div>
            {erroCli && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{erroCli}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input value={formCli.nome} onChange={e => setFormCli(f => ({ ...f, nome: e.target.value }))} className="input-base" placeholder="João Silva" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp *</label>
                <input value={formCli.whatsapp} onChange={e => setFormCli(f => ({ ...f, whatsapp: e.target.value }))} className="input-base" placeholder="(69) 9 9999-9999" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                <input type="email" value={formCli.email} onChange={e => setFormCli(f => ({ ...f, email: e.target.value }))} className="input-base" placeholder="joao@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                <input value={formCli.cpf} onChange={e => setFormCli(f => ({ ...f, cpf: e.target.value }))} className="input-base" placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalCliente(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvarCliente} disabled={salvandoCli} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={14} />{salvandoCli ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo veículo */}
      {modalVeiculo && clienteSel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Novo veículo — {clienteSel.nome}</h2>
              <button onClick={() => setModalVeiculo(false)}><X size={19} className="text-gray-400" /></button>
            </div>
            {erroVei && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{erroVei}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <div className="flex gap-2">
                  {(['carro','moto'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setFormVei(f => ({ ...f, tipo: t }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${formVei.tipo === t ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {t === 'carro' ? '🚗 Carro' : '🏍 Moto'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca *</label>
                  <input value={formVei.marca} onChange={e => setFormVei(f => ({ ...f, marca: e.target.value }))} className="input-base" placeholder="VW" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Modelo *</label>
                  <input value={formVei.modelo} onChange={e => setFormVei(f => ({ ...f, modelo: e.target.value }))} className="input-base" placeholder="Gol G5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
                  <input type="number" value={formVei.ano} onChange={e => setFormVei(f => ({ ...f, ano: Number(e.target.value) }))} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Placa *</label>
                  <input value={formVei.placa} onChange={e => setFormVei(f => ({ ...f, placa: e.target.value.toUpperCase() }))} className="input-base uppercase font-mono" placeholder="ABC-1234" maxLength={8} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
                  <input value={formVei.cor} onChange={e => setFormVei(f => ({ ...f, cor: e.target.value }))} className="input-base" placeholder="Prata" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Km atual</label>
                  <input type="number" value={formVei.km} onChange={e => setFormVei(f => ({ ...f, km: Number(e.target.value) }))} className="input-base" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalVeiculo(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvarVeiculo} disabled={salvandoVei} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={14} />{salvandoVei ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClienteDetalhe({
  cliente, onAddVeiculo, onEditar,
}: {
  cliente: Cliente
  onAddVeiculo: () => void
  onEditar: () => void
}) {
  const { veiculos }       = useVeiculosCliente(cliente.id)
  const { ordens }         = useOSCliente(cliente.nome)
  const [abaAtiva, setAba] = useState<'veiculos' | 'historico'>('veiculos')

  const [modalEditarVei,  setModalEditarVei]  = useState(false)
  const [veiculoSel,      setVeiculoSel]      = useState<Veiculo | null>(null)
  const [formVeiEdit,     setFormVeiEdit]     = useState({
    marca: '', modelo: '', ano: 0, placa: '', cor: '', km: 0, tipo: 'carro' as 'carro' | 'moto',
  })
  const [salvandoVeiEdit, setSalvandoVeiEdit] = useState(false)
  const [erroVeiEdit,     setErroVeiEdit]     = useState('')

  function abrirEditarVei(v: Veiculo) {
    setVeiculoSel(v)
    setFormVeiEdit({
      marca:  v.marca,
      modelo: v.modelo,
      ano:    v.ano,
      placa:  v.placa,
      cor:    v.cor   ?? '',
      km:     v.km    ?? 0,
      tipo:   v.tipo,
    })
    setErroVeiEdit('')
    setModalEditarVei(true)
  }

  async function handleSalvarVeiEdit() {
    setErroVeiEdit('')
    if (!formVeiEdit.marca.trim())  return setErroVeiEdit('Marca é obrigatória.')
    if (!formVeiEdit.modelo.trim()) return setErroVeiEdit('Modelo é obrigatório.')
    if (!formVeiEdit.placa.trim())  return setErroVeiEdit('Placa é obrigatória.')
    if (!veiculoSel) return
    setSalvandoVeiEdit(true)
    try {
      await updateDoc(doc(db, 'veiculos', veiculoSel.id), {
        marca:  formVeiEdit.marca,
        modelo: formVeiEdit.modelo,
        ano:    formVeiEdit.ano,
        placa:  formVeiEdit.placa.toUpperCase(),
        cor:    formVeiEdit.cor,
        km:     formVeiEdit.km,
        tipo:   formVeiEdit.tipo,
      })
      setModalEditarVei(false)
    } catch (e: any) { setErroVeiEdit(e.message) }
    finally { setSalvandoVeiEdit(false) }
  }

  const totalGasto   = ordens.filter(o => o.status === 'concluida').reduce((s, o) => s + o.valor_total, 0)
  const totalOS      = ordens.length
  const ultimaVisita = ordens[0]?.createdAt

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{cliente.nome}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {cliente.whatsapp && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone size={11} />{cliente.whatsapp}
                </span>
              )}
              {cliente.email && <span className="text-xs text-gray-500">{cliente.email}</span>}
              {cliente.cpf && <span className="text-xs text-gray-500">CPF: {cliente.cpf}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEditar} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-orange-500" title="Editar cliente">
              <Edit2 size={16} />
            </button>
            {cliente.whatsapp && (
              <BotaoWhatsApp numero={cliente.whatsapp} mensagem={`Olá, ${cliente.nome}! Como posso ajudar?`} variante="icon" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{totalOS}</p>
            <p className="text-xs text-gray-400">OS total</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-orange-500">R${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400">Total gasto</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">{ultimaVisita ? format(ultimaVisita, 'dd/MM/yy', { locale: ptBR }) : '—'}</p>
            <p className="text-xs text-gray-400">Última visita</p>
          </div>
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button onClick={() => setAba('veiculos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${abaAtiva === 'veiculos' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          <Car size={14} />Veículos ({veiculos.length})
        </button>
        <button onClick={() => setAba('historico')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${abaAtiva === 'historico' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
          <Wrench size={14} />Histórico ({ordens.length})
        </button>
      </div>

      {abaAtiva === 'veiculos' && (
        <div className="space-y-2">
          <button onClick={onAddVeiculo}
            className="w-full card border-dashed border-gray-300 hover:border-orange-300 hover:bg-orange-50 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition py-3">
            <Plus size={15} />Adicionar veículo
          </button>
          {veiculos.map(v => (
            <div key={v.id} className="card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <span className="text-lg">{v.tipo === 'moto' ? '🏍' : '🚗'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{v.marca} {v.modelo} {v.ano}</p>
                    <p className="text-xs text-gray-400">
                      <span className="font-mono font-bold">{v.placa}</span>
                      {v.cor && ` · ${v.cor}`}
                      {v.km && ` · ${v.km.toLocaleString('pt-BR')} km`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => abrirEditarVei(v)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-orange-500"
                  title="Editar veículo"
                >
                  <Edit2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {veiculos.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum veículo cadastrado.</p>
          )}
        </div>
      )}

      {abaAtiva === 'historico' && (
        <div className="space-y-2">
          {ordens.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma OS encontrada.</p>
          ) : (
            ordens.map(os => (
              <div key={os.id} className="card">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">#{String(os.numero).padStart(4, '0')}</span>
                      <span className={STATUS_CLS[os.status]}>{STATUS_LABEL[os.status]}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{os.veiculo}</p>
                    <p className="text-xs font-mono text-gray-400">{os.placa}</p>
                  </div>
                  {os.valor_total > 0 && (
                    <p className="text-sm font-bold text-orange-500 flex-shrink-0">R${os.valor_total.toFixed(2)}</p>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{os.descricao_problema}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Clock size={11} />{format(os.createdAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                  <span>{os.mecanico_nome}</span>
                  {os.itens.length > 0 && <span>{os.itens.length} peças</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal editar veículo */}
      {modalEditarVei && veiculoSel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Editar veículo</h2>
              <button onClick={() => setModalEditarVei(false)}><X size={19} className="text-gray-400" /></button>
            </div>
            {erroVeiEdit && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{erroVeiEdit}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <div className="flex gap-2">
                  {(['carro','moto'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setFormVeiEdit(f => ({ ...f, tipo: t }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${formVeiEdit.tipo === t ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {t === 'carro' ? '🚗 Carro' : '🏍 Moto'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca *</label>
                  <input value={formVeiEdit.marca} onChange={e => setFormVeiEdit(f => ({ ...f, marca: e.target.value }))} className="input-base" placeholder="VW" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Modelo *</label>
                  <input value={formVeiEdit.modelo} onChange={e => setFormVeiEdit(f => ({ ...f, modelo: e.target.value }))} className="input-base" placeholder="Gol G5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
                  <input type="number" value={formVeiEdit.ano} onChange={e => setFormVeiEdit(f => ({ ...f, ano: Number(e.target.value) }))} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Placa *</label>
                  <input value={formVeiEdit.placa} onChange={e => setFormVeiEdit(f => ({ ...f, placa: e.target.value.toUpperCase() }))} className="input-base uppercase font-mono" placeholder="ABC-1234" maxLength={8} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
                  <input value={formVeiEdit.cor} onChange={e => setFormVeiEdit(f => ({ ...f, cor: e.target.value }))} className="input-base" placeholder="Prata" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Km atual</label>
                  <input type="number" value={formVeiEdit.km} onChange={e => setFormVeiEdit(f => ({ ...f, km: Number(e.target.value) }))} className="input-base" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalEditarVei(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvarVeiEdit} disabled={salvandoVeiEdit} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={14} />{salvandoVeiEdit ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}