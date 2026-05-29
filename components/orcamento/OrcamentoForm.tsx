'use client'
// ============================================================
// FORMULÁRIO DE ORÇAMENTO — components/orcamento/OrcamentoForm.tsx
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Car, Bike, AlertTriangle,
  CheckCircle, FileText, Wrench,
} from 'lucide-react'
import { criarOrcamento, type ItemOrcamento } from '@/lib/hooks/useOrcamentos'
import { useBuscaPecas } from '@/lib/hooks/useEstoque'
import { useAuth } from '@/lib/context/AuthContext'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function OrcamentoForm() {
  const router        = useRouter()
  const { perfil }    = useAuth()

  const [form, setForm] = useState({
    cliente_nome:     '',
    cliente_whatsapp: '',
    veiculo:          '',
    placa:            '',
    tipo_veiculo:     'carro' as 'carro' | 'moto',
    km:               '',
    descricao:        '',
    observacoes:      '',
    validade_dias:    7,
    desconto:         0,
  })

  // Itens do orçamento
  const [itens,          setItens]     = useState<ItemOrcamento[]>([])
  // Linha manual de serviço
  const [novoServico,    setServico]   = useState({ descricao: '', preco: 0, qtd: 1 })
  // Busca de peças
  const [termoPeca,      setTermo]     = useState('')
  const { resultados }                 = useBuscaPecas(termoPeca)
  const [showResultados, setShowResultados]   = useState(false)

  const [salvando,  setSalvando]  = useState(false)
  const [sucesso,   setSucesso]   = useState<string | null>(null)
  const [erro,      setErro]      = useState('')

  function setField(k: keyof typeof form, v: any) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function adicionarPeca(item: { id: string; nome: string; preco_venda: number }) {
    const existente = itens.findIndex(i => i.produto_id === item.id)
    if (existente >= 0) {
      const novos = [...itens]
      novos[existente].quantidade++
      novos[existente].subtotal = novos[existente].preco_unitario * novos[existente].quantidade
      setItens(novos)
    } else {
      setItens(prev => [...prev, {
        descricao: item.nome, tipo: 'peca', produto_id: item.id,
        quantidade: 1, preco_unitario: item.preco_venda, subtotal: item.preco_venda,
      }])
    }
    setTermo('')
    setShowResultados(false)
  }

  function adicionarServico() {
    if (!novoServico.descricao.trim() || novoServico.preco <= 0) return
    setItens(prev => [...prev, {
      descricao: novoServico.descricao, tipo: 'servico',
      quantidade: novoServico.qtd, preco_unitario: novoServico.preco,
      subtotal: novoServico.preco * novoServico.qtd,
    }])
    setServico({ descricao: '', preco: 0, qtd: 1 })
  }

  function removerItem(idx: number) {
    setItens(prev => prev.filter((_, i) => i !== idx))
  }

  function alterarQtd(idx: number, qtd: number) {
    setItens(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantidade: qtd, subtotal: item.preco_unitario * qtd } : item
    ))
  }

  const valorPecas    = itens.filter(i => i.tipo === 'peca').reduce((s, i) => s + i.subtotal, 0)
  const valorServicos = itens.filter(i => i.tipo === 'servico').reduce((s, i) => s + i.subtotal, 0)
  const valorTotal    = valorPecas + valorServicos
  const valorFinal    = Math.max(0, valorTotal - form.desconto)

  async function handleSalvar(enviar = false) {
    setErro('')
    if (!form.cliente_nome.trim()) return setErro('Nome do cliente obrigatório.')
    if (!form.veiculo.trim())      return setErro('Veículo obrigatório.')
    if (!form.placa.trim())        return setErro('Placa obrigatória.')
    if (!form.descricao.trim())    return setErro('Descrição do problema obrigatória.')
    if (itens.length === 0)        return setErro('Adicione pelo menos um item ao orçamento.')

    setSalvando(true)
    try {
      const id = await criarOrcamento({
        oficina_id:       perfil!.oficina_id,
        cliente_nome:     form.cliente_nome,
        cliente_whatsapp: form.cliente_whatsapp,
        veiculo:          form.veiculo,
        placa:            form.placa.toUpperCase(),
        tipo_veiculo:     form.tipo_veiculo,
        km:               form.km ? Number(form.km) : null,
        descricao:        form.descricao,
        observacoes:      form.observacoes || undefined,
        itens,
        desconto:         form.desconto,
        validade_dias:    form.validade_dias,
        criado_por:       perfil!.uid,
        criado_por_nome:  perfil!.nome,
      })
      setSucesso(id)
    } catch (e: any) { setErro(e.message) }
    finally { setSalvando(false) }
  }

  if (sucesso) {
    return (
      <div className="max-w-md mx-auto text-center py-14">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={30} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Orçamento criado!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Valor final: <strong className="text-orange-500">{brl(valorFinal)}</strong>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => router.push('/orcamentos')} className="btn-secondary">
            Ver orçamentos
          </button>
          <button onClick={() => router.push(`/orcamentos/${sucesso}`)} className="btn-primary">
            Abrir orçamento →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {erro && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />{erro}
        </div>
      )}

      {/* Dados do cliente */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText size={16} className="text-orange-500" />Dados do cliente e veículo
        </h2>
        <div className="flex gap-2 mb-3">
          {(['carro','moto'] as const).map(t => (
            <button key={t} type="button" onClick={() => setField('tipo_veiculo', t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${form.tipo_veiculo === t ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'carro' ? <Car size={14} /> : <Bike size={14} />}
              {t === 'carro' ? 'Carro' : 'Moto'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Nome do cliente *</label><input value={form.cliente_nome} onChange={e => setField('cliente_nome', e.target.value)} className="input-base" placeholder="João Silva" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label><input value={form.cliente_whatsapp} onChange={e => setField('cliente_whatsapp', e.target.value)} className="input-base" placeholder="(69) 9 9999-9999" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Veículo *</label><input value={form.veiculo} onChange={e => setField('veiculo', e.target.value)} className="input-base" placeholder="VW Gol G5 2014" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Placa *</label><input value={form.placa} onChange={e => setField('placa', e.target.value.toUpperCase())} className="input-base uppercase font-mono" placeholder="ABC-1234" maxLength={8} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Km atual</label><input type="number" value={form.km} onChange={e => setField('km', e.target.value)} className="input-base" placeholder="98450" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Validade (dias)</label><select value={form.validade_dias} onChange={e => setField('validade_dias', Number(e.target.value))} className="input-base"><option value={3}>3 dias</option><option value={7}>7 dias</option><option value={15}>15 dias</option><option value={30}>30 dias</option></select></div>
        </div>
        <div className="mt-3"><label className="block text-xs font-medium text-gray-600 mb-1">Problema / Serviço solicitado *</label><textarea value={form.descricao} onChange={e => setField('descricao', e.target.value)} rows={2} className="input-base resize-none" placeholder="Descreva o problema..." /></div>
      </div>

      {/* Peças */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">P</span>
          Peças do estoque
        </h2>
        <div className="relative">
          <input
            value={termoPeca}
            onChange={e => { setTermo(e.target.value); setShowResultados(e.target.value.length >= 2) }}
            className="input-base"
            placeholder="🔍 Buscar peça no estoque..."
          />
          {showResultados && resultados.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {resultados.map(item => (
                <button key={item.id} type="button" onClick={() => adicionarPeca(item)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-orange-50 text-left transition-colors text-sm">
                  <span className="font-medium text-gray-800">{item.nome}</span>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-orange-500 font-semibold">{brl(item.preco_venda)}</span>
                    <span className="text-xs text-gray-400 block">Estoque: {item.quantidade}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Serviços manuais */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wrench size={15} className="text-orange-500" />
          Serviços / Mão de obra
        </h2>
        <div className="flex gap-2">
          <input value={novoServico.descricao} onChange={e => setServico(s => ({ ...s, descricao: e.target.value }))} className="input-base flex-1" placeholder="Ex: Alinhamento e balanceamento" />
          <input type="number" min={0} value={novoServico.preco || ''} onChange={e => setServico(s => ({ ...s, preco: Number(e.target.value) }))} className="input-base w-28" placeholder="R$ 0,00" />
          <input type="number" min={1} value={novoServico.qtd} onChange={e => setServico(s => ({ ...s, qtd: Number(e.target.value) }))} className="input-base w-16" placeholder="Qtd" />
          <button type="button" onClick={adicionarServico} className="btn-primary px-3 flex-shrink-0"><Plus size={16} /></button>
        </div>
      </div>

      {/* Lista de itens */}
      {itens.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Itens do orçamento ({itens.length})</h2>
          <div className="space-y-2">
            {itens.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${item.tipo === 'peca' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {item.tipo === 'peca' ? 'PEÇA' : 'SERV'}
                </span>
                <p className="flex-1 text-sm text-gray-800 truncate">{item.descricao}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => alterarQtd(idx, Math.max(1, item.quantidade - 1))} className="w-6 h-6 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">−</button>
                  <span className="w-6 text-center text-xs font-medium">{item.quantidade}</span>
                  <button onClick={() => alterarQtd(idx, item.quantidade + 1)} className="w-6 h-6 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100">+</button>
                </div>
                <p className="text-sm font-semibold text-orange-600 w-20 text-right flex-shrink-0">{brl(item.subtotal)}</p>
                <button onClick={() => removerItem(idx)} className="text-gray-300 hover:text-red-400 transition flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
            {valorPecas > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Peças:</span><span>{brl(valorPecas)}</span></div>}
            {valorServicos > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Serviços:</span><span>{brl(valorServicos)}</span></div>}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Desconto (R$):</span>
              <input type="number" min={0} max={valorTotal} value={form.desconto || ''} onChange={e => setField('desconto', Number(e.target.value))} className="w-24 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-400" />
            </div>
            <div className="flex justify-between text-base font-bold text-orange-600 pt-1 border-t border-gray-200">
              <span>Total:</span><span>{brl(valorFinal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Observações */}
      <div className="card">
        <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
        <textarea value={form.observacoes} onChange={e => setField('observacoes', e.target.value)} rows={2} className="input-base resize-none" placeholder="Condições, prazo de entrega, garantia..." />
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button onClick={() => handleSalvar(false)} disabled={salvando} className="btn-ghost flex-1">
          {salvando ? 'Salvando...' : 'Salvar rascunho'}
        </button>
        <button onClick={() => handleSalvar(true)} disabled={salvando} className="btn-primary flex-1">
          {salvando ? 'Salvando...' : 'Criar orçamento →'}
        </button>
      </div>
    </div>
  )
}
