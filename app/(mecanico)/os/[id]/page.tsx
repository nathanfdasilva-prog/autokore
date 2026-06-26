'use client'
import Link from 'next/link'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Car, Bike, Package, DollarSign, User, Printer, CheckCircle, XCircle, Clock, Plus, Trash2 } from 'lucide-react'
import { useOS, atualizarStatusOS, atualizarOS, salvarItensOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import { imprimirOS } from '@/lib/services/osPDF'
import BuscaPecas from '@/components/os/BuscaPecas'
import {
  BotaoOsConcluida, BotaoEnviarOrcamento, BotaoWhatsApp,
} from '@/components/whatsapp/BotoesWhatsApp'
import type { StatusOS, ItemOS } from '@/lib/types'

const STATUS_LABELS: Record<StatusOS, string> = {
  aguardando_aprovacao: 'Aguardando aprovação',
  aberta: 'Aberta', em_andamento: 'Em andamento',
  aguardando_pecas: 'Aguardando peças', concluida: 'Concluída', cancelada: 'Cancelada',
}
const STATUS_CLS: Record<StatusOS, string> = {
  aguardando_aprovacao: 'badge badge-gold',
  aberta: 'badge badge-blue', em_andamento: 'badge badge-orange',
  aguardando_pecas: 'badge badge-gray', concluida: 'badge badge-green', cancelada: 'badge badge-red',
}

export default function OSDetalhePage({ params }: { params: { id: string } }) {
  const { id }                       = params
  const { os, loading }              = useOS(id)
  const { perfil, isAdmin, oficina } = useAuth()
  const [kmSaida, setKmSaida]        = useState('')
  const [salvandoKm, setSalvandoKm]  = useState(false)

  // Editor de valores (dono)
  const [editandoValores, setEditandoValores] = useState(false)
  const [itens,           setItens]           = useState<ItemOS[]>([])
  const [valorMaoObra,    setValorMaoObra]    = useState(0)
  const [salvandoValores, setSalvandoValores] = useState(false)

  const oficinaNome = oficina?.nome ?? 'Oficina'
  const oficinaTel  = oficina?.whatsapp ?? ''

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!os) return <div className="text-center py-20"><p className="text-gray-500">OS não encontrada.</p><Link href="/os" className="btn-primary mt-4 inline-flex">Voltar</Link></div>

  const podeEditar = (os.status === 'aguardando_aprovacao' || os.status === 'em_andamento' || os.status === 'aguardando_pecas') && (isAdmin || perfil?.uid === os.mecanico_id)

  async function mudarStatus(status: StatusOS) { await atualizarStatusOS(id, status) }

  // Abre o editor de valores carregando o que já existe na OS
  function abrirEditorValores() {
    setItens(os!.itens ?? [])
    setValorMaoObra(os!.valor_mao_obra ?? 0)
    setEditandoValores(true)
  }

  function adicionarItem(item: ItemOS) {
    setItens(prev => {
      const idx = prev.findIndex(i => i.produto_id === item.produto_id)
      if (idx >= 0) {
        const novo = [...prev]
        novo[idx] = { ...novo[idx], quantidade: novo[idx].quantidade + item.quantidade, subtotal: novo[idx].preco_unitario * (novo[idx].quantidade + item.quantidade) }
        return novo
      }
      return [...prev, item]
    })
  }
  function removerItem(produto_id: string) {
    setItens(prev => prev.filter(i => i.produto_id !== produto_id))
  }
  function alterarPreco(produto_id: string, preco: number) {
    setItens(prev => prev.map(i => i.produto_id === produto_id ? { ...i, preco_unitario: preco, subtotal: preco * i.quantidade } : i))
  }
  function alterarQtd(produto_id: string, qtd: number) {
    setItens(prev => prev.map(i => i.produto_id === produto_id ? { ...i, quantidade: qtd, subtotal: i.preco_unitario * qtd } : i))
  }

  const valorPecas = itens.reduce((s, i) => s + i.subtotal, 0)
  const valorTotal = valorPecas + valorMaoObra

  // Salva os valores (sem mudar status) — dono ajustando
  async function salvarValores() {
    setSalvandoValores(true)
    try {
      await salvarItensOS(id, itens, valorMaoObra)
      setEditandoValores(false)
    } finally {
      setSalvandoValores(false)
    }
  }

  // Aprovar e já lançar valores: salva valores + manda pra em_andamento
  async function aprovarComValores() {
    setSalvandoValores(true)
    try {
      await salvarItensOS(id, itens, valorMaoObra)
      await atualizarStatusOS(id, 'em_andamento')
      setEditandoValores(false)
    } finally {
      setSalvandoValores(false)
    }
  }

  async function salvarKmSaida() {
    if (!kmSaida || isNaN(Number(kmSaida))) return
    setSalvandoKm(true)
    try {
      await atualizarOS(id, { km_saida: Number(kmSaida) })
      setKmSaida('')
    } finally {
      setSalvandoKm(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/os" className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">OS #{String(os.numero).padStart(4, '0')}</h1>
            <span className={STATUS_CLS[os.status]}>{STATUS_LABELS[os.status]}</span>
          </div>
          <p className="text-sm text-gray-500">Aberta {format(os.createdAt, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}</p>
        </div>
      </div>

      {/* AVISO: aguardando aprovação (pro mecânico) */}
      {os.status === 'aguardando_aprovacao' && !isAdmin && (
        <div className="card bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 mb-4">
          <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Clock size={15} />Esta OS está aguardando o dono aprovar e definir os valores.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            {os.tipo_veiculo === 'moto' ? <Bike size={16} className="text-orange-500" /> : <Car size={16} className="text-orange-500" />}
            Cliente e Veículo
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
            <div><p className="text-xs text-gray-400">Cliente</p><p className="font-medium text-gray-800 dark:text-white">{os.cliente_nome}</p></div>
            <div><p className="text-xs text-gray-400">Veículo</p><p className="font-medium text-gray-800 dark:text-white">{os.veiculo}</p></div>
            <div><p className="text-xs text-gray-400">Placa</p><p className="font-mono font-bold text-gray-800 dark:text-white">{os.placa}</p></div>
            {os.km_entrada && <div><p className="text-xs text-gray-400">Km entrada</p><p className="font-medium text-gray-800 dark:text-white">{os.km_entrada.toLocaleString('pt-BR')} km</p></div>}
            {os.km_saida && <div><p className="text-xs text-gray-400">Km saída</p><p className="font-medium text-gray-800 dark:text-white">{os.km_saida.toLocaleString('pt-BR')} km</p></div>}
          </div>

          {podeEditar && !os.km_saida && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5">Registrar Km de saída</p>
              <div className="flex gap-2">
                <input type="number" value={kmSaida} onChange={e => setKmSaida(e.target.value)} placeholder="Ex: 45230" className="input-base flex-1" />
                <button onClick={salvarKmSaida} disabled={salvandoKm || !kmSaida}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50">
                  {salvandoKm ? '...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {os.cliente_whatsapp && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 mt-3">
              <BotaoWhatsApp numero={os.cliente_whatsapp} mensagem={`Olá, ${os.cliente_nome}!`} label="Contato direto" variante="icon" />
              {os.valor_total > 0 && os.status !== 'concluida' && <BotaoEnviarOrcamento os={os} oficina_nome={oficinaNome} />}
              {os.status === 'concluida' && <BotaoOsConcluida os={os} oficina_nome={oficinaNome} />}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Serviço / Problema</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{os.descricao_problema}</p>
          {os.observacoes_internas && <div className="mt-3 pt-3 border-t border-gray-100"><p className="text-xs text-gray-400 mb-1">Obs. internas</p><p className="text-sm text-gray-600 whitespace-pre-line">{os.observacoes_internas}</p></div>}
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"><User size={16} className="text-orange-500" /></div>
          <div><p className="text-xs text-gray-400">Mecânico</p><p className="text-sm font-medium text-gray-800 dark:text-white">{os.mecanico_nome}</p></div>
          {os.finalizadaAt && <div className="ml-auto text-right"><p className="text-xs text-gray-400">Finalizada em</p><p className="text-sm font-medium text-gray-800 dark:text-white">{format(os.finalizadaAt, "dd/MM/yyyy 'às' HH:mm")}</p></div>}
        </div>

        {/* ===== EDITOR DE VALORES (só dono) ===== */}
        {isAdmin && editandoValores && (
          <div className="card border-orange-300">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-orange-500" />Lançar valores
            </h2>
            <BuscaPecas onAdicionar={adicionarItem} />
            {itens.length > 0 && (
              <div className="mt-4 space-y-2">
                {itens.map(item => (
                  <div key={item.produto_id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{item.nome}</p>
                      {item.tipo_item === 'manual' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">manual</span>}
                    </div>
                    <input type="number" min={1} value={item.quantidade} onChange={e => alterarQtd(item.produto_id, Number(e.target.value))}
                      className="w-14 text-center border border-gray-300 rounded-md py-1 text-sm outline-none focus:border-orange-400" title="Qtd" />
                    <span className="text-xs text-gray-400">×</span>
                    <input type="number" min={0} step={0.01} value={item.preco_unitario || ''} onChange={e => alterarPreco(item.produto_id, Number(e.target.value))}
                      placeholder="R$ 0,00" className="w-24 border border-gray-300 rounded-md py-1 px-2 text-sm outline-none focus:border-orange-400" title="Preço unitário" />
                    <p className="text-sm font-semibold text-orange-600 w-20 text-right">R${item.subtotal.toFixed(2)}</p>
                    <button onClick={() => removerItem(item.produto_id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-600 mb-1">Mão de obra (R$)</label>
              <input type="number" min={0} step={0.01} value={valorMaoObra || ''} onChange={e => setValorMaoObra(Number(e.target.value))}
                placeholder="R$ 0,00" className="input-base max-w-[200px]" />
            </div>
            <div className="mt-3 bg-orange-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600"><span>Peças:</span><span>R${valorPecas.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Mão de obra:</span><span>R${valorMaoObra.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-orange-600 pt-1 border-t border-orange-200"><span>Total:</span><span>R${valorTotal.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditandoValores(false)} className="btn-ghost flex-1">Cancelar</button>
              {os.status === 'aguardando_aprovacao' ? (
                <>
                  <button onClick={salvarValores} disabled={salvandoValores} className="btn-secondary flex-1">
                    {salvandoValores ? '...' : 'Só salvar'}
                  </button>
                  <button onClick={aprovarComValores} disabled={salvandoValores} className="btn-primary flex-1 bg-green-600 hover:bg-green-700">
                    {salvandoValores ? '...' : 'Aprovar c/ valores'}
                  </button>
                </>
              ) : (
                <button onClick={salvarValores} disabled={salvandoValores} className="btn-primary flex-1">
                  {salvandoValores ? 'Salvando...' : 'Salvar valores'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista de itens (visualização) */}
        {!editandoValores && os.itens.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Package size={16} className="text-orange-500" />Peças</h2>
            <div className="space-y-2">
              {os.itens.map(item => (
                <div key={item.produto_id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <div><p className="font-medium text-gray-800 dark:text-white">{item.nome}</p><p className="text-xs text-gray-400">{item.quantidade} × R${item.preco_unitario.toFixed(2)}</p></div>
                  <p className="font-semibold text-gray-700">R${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!editandoValores && os.valor_total > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><DollarSign size={16} className="text-orange-500" />Financeiro</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Peças:</span><span>R${os.valor_pecas.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Mão de obra:</span><span>R${os.valor_mao_obra.toFixed(2)}</span></div>
              {os.forma_pagamento && <div className="flex justify-between text-gray-600"><span>Pagamento:</span><span className="capitalize">{os.forma_pagamento.replace('_', ' ')}</span></div>}
              <div className="flex justify-between font-bold text-base text-orange-600 pt-2 border-t border-gray-200"><span>Total:</span><span>R${os.valor_total.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {/* ===== AÇÕES POR STATUS ===== */}
        {!editandoValores && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {os.status === 'aguardando_aprovacao' ? 'Aprovação' : 'Ações'}
            </h2>

            {/* AGUARDANDO APROVAÇÃO */}
            {os.status === 'aguardando_aprovacao' && (
              isAdmin ? (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => mudarStatus('em_andamento')} className="btn-primary text-sm bg-green-600 hover:bg-green-700 flex items-center gap-1.5">
                    <CheckCircle size={15} />Aprovar
                  </button>
                  <button onClick={abrirEditorValores} className="btn-primary text-sm flex items-center gap-1.5">
                    <DollarSign size={15} />Aprovar e lançar valores
                  </button>
                  <button onClick={() => mudarStatus('cancelada')} className="btn-ghost text-sm text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5">
                    <XCircle size={15} />Reprovar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aguardando o dono aprovar.</p>
              )
            )}

            {/* EM ANDAMENTO */}
            {os.status === 'em_andamento' && (
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <button onClick={abrirEditorValores} className="btn-secondary text-sm flex items-center gap-1.5">
                    <DollarSign size={15} />Lançar / editar valores
                  </button>
                )}
                {podeEditar && <button onClick={() => mudarStatus('aguardando_pecas')} className="btn-secondary text-sm">⏸ Aguardando peças</button>}
                {isAdmin && <Link href={`/os/${id}/finalizar`} className="btn-primary text-sm bg-green-600 hover:bg-green-700">✓ Finalizar OS</Link>}
                {!isAdmin && <p className="text-xs text-gray-400 self-center">Quando terminar o serviço, o dono finaliza e fecha o valor.</p>}
              </div>
            )}

            {/* AGUARDANDO PEÇAS */}
            {os.status === 'aguardando_pecas' && (
              <div className="flex flex-wrap gap-2">
                {podeEditar && <button onClick={() => mudarStatus('em_andamento')} className="btn-primary text-sm">▶ Retomar</button>}
                {isAdmin && <Link href={`/os/${id}/finalizar`} className="btn-primary text-sm bg-green-600 hover:bg-green-700">✓ Finalizar OS</Link>}
              </div>
            )}

            {(os.status === 'concluida' || os.status === 'cancelada') && (
              <p className="text-sm text-gray-400">OS {STATUS_LABELS[os.status].toLowerCase()}.</p>
            )}
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Relatório da OS</p>
              <p className="text-xs text-gray-400">Gera PDF ou imprime diretamente</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => imprimirOS(os, oficinaNome, oficinaTel)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition">
              <Printer size={15} />Gerar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}