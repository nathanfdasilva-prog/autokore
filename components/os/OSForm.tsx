'use client'
// ============================================================
// FORMULÁRIO DE OS — components/os/OSForm.tsx
// Criação + edição de Ordem de Serviço com peças e finalização.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Trash2, AlertTriangle, CheckCircle,
  DollarSign, FileText, Car, Bike,
} from 'lucide-react'
import BuscaPecas from './BuscaPecas'
import { criarOS, salvarItensOS, finalizarOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import type { ItemOS, OrdemServico } from '@/lib/types'

// Dados iniciais para novo formulário
const FORM_VAZIO = {
  cliente_nome:       '',
  cliente_whatsapp:   '',
  veiculo:            '',
  placa:              '',
  tipo_veiculo:       'carro' as 'carro' | 'moto',
  km_entrada:         '',
  descricao_problema: '',
}

interface OSFormProps {
  /** Se fornecido, edita a OS existente. Se null, cria nova. */
  osExistente?: OrdemServico | null
}

export default function OSForm({ osExistente }: OSFormProps) {
  const router = useRouter()
  const { perfil } = useAuth()

  // Form fields
  const [form, setForm] = useState({
    cliente_nome:       osExistente?.cliente_nome       ?? '',
    cliente_whatsapp:   osExistente?.cliente_whatsapp   ?? '',
    veiculo:            osExistente?.veiculo             ?? '',
    placa:              osExistente?.placa               ?? '',
    tipo_veiculo:       osExistente?.tipo_veiculo        ?? 'carro',
    km_entrada:         osExistente?.km_entrada?.toString() ?? '',
    descricao_problema: osExistente?.descricao_problema  ?? '',
  })

  // Itens/peças
  const [itens, setItens] = useState<ItemOS[]>(osExistente?.itens ?? [])

  // Financeiro
  const [valorMaoObra,    setValorMaoObra]    = useState(osExistente?.valor_mao_obra ?? 0)
  const [formaPagamento,  setFormaPagamento]  = useState<OrdemServico['forma_pagamento']>(
    osExistente?.forma_pagamento ?? 'pix'
  )
  const [observacoes, setObservacoes] = useState(osExistente?.observacoes_internas ?? '')

  // Estados de UI
  const [etapa,     setEtapa]     = useState<'dados' | 'pecas' | 'finalizar'>('dados')
  const [loading,   setLoading]   = useState(false)
  const [erro,      setErro]      = useState<string | null>(null)
  const [sucesso,   setSucesso]   = useState(false)
  const [osId,      setOsId]      = useState<string | null>(osExistente?.id ?? null)

  // Cálculos
  const valorPecas = itens.reduce((s, i) => s + i.subtotal, 0)
  const valorTotal = valorPecas + valorMaoObra

  // ---- Handlers ----
  function setField(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function adicionarItem(item: ItemOS) {
    setItens(prev => {
      // Se já existe, soma a quantidade
      const idx = prev.findIndex(i => i.produto_id === item.produto_id)
      if (idx >= 0) {
        const novo = [...prev]
        novo[idx] = {
          ...novo[idx],
          quantidade:     novo[idx].quantidade + item.quantidade,
          subtotal:       novo[idx].preco_unitario * (novo[idx].quantidade + item.quantidade),
        }
        return novo
      }
      return [...prev, item]
    })
  }

  function removerItem(produto_id: string) {
    setItens(prev => prev.filter(i => i.produto_id !== produto_id))
  }

  // Etapa 1 → 2: cria a OS no Firestore (status 'aberta')
  async function handleAvancarParaPecas() {
    setErro(null)
    if (!form.cliente_nome.trim()) return setErro('Nome do cliente é obrigatório.')
    if (!form.veiculo.trim())      return setErro('Veículo é obrigatório.')
    if (!form.placa.trim())        return setErro('Placa é obrigatória.')
    if (!form.descricao_problema.trim()) return setErro('Descreva o problema.')

    setLoading(true)
    try {
      // Se a OS ainda não existe, cria agora
      if (!osId) {
        const id = await criarOS({
          oficina_id:         perfil!.oficina_id,
          cliente_nome:       form.cliente_nome,
          cliente_whatsapp:   form.cliente_whatsapp,
          veiculo:            form.veiculo,
          placa:              form.placa.toUpperCase(),
          tipo_veiculo:       form.tipo_veiculo,
          km_entrada:         form.km_entrada ? Number(form.km_entrada) : undefined,
          descricao_problema: form.descricao_problema,
          mecanico_id:        perfil!.uid,
          mecanico_nome:      perfil!.nome,
        })
        setOsId(id)
      }
      setEtapa('pecas')
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Etapa 2 → 3: salva rascunho dos itens
  async function handleAvancarParaFinalizar() {
    setErro(null)
    setLoading(true)
    try {
      await salvarItensOS(osId!, itens, valorMaoObra)
      setEtapa('finalizar')
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Etapa 3: finaliza OS + baixa de estoque
  async function handleFinalizar() {
    setErro(null)
    setLoading(true)
    try {
      await finalizarOS({
        os_id:          osId!,
        oficina_id:     perfil!.oficina_id,
        usuario_id:     perfil!.uid,
        usuario_nome:   perfil!.nome,
        itens,
        valor_mao_obra: valorMaoObra,
        forma_pagamento: formaPagamento,
        observacoes,
      })
      setSucesso(true)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ---- Tela de sucesso ----
  if (sucesso) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">OS Finalizada!</h2>
        <p className="text-gray-500 text-sm mb-1">
          Peças deduzidas automaticamente do estoque.
        </p>
        <p className="text-2xl font-bold text-orange-500 mb-6">
          Total: R${valorTotal.toFixed(2)}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/os')}
            className="btn-secondary"
          >
            Ver todas as OS
          </button>
          <button
            onClick={() => router.push('/os/nova')}
            className="btn-primary"
          >
            Nova OS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {(['dados', 'pecas', 'finalizar'] as const).map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors ${
              etapa === e
                ? 'bg-orange-500 border-orange-500 text-white'
                : i < ['dados','pecas','finalizar'].indexOf(etapa)
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 text-gray-400'
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${etapa === e ? 'text-gray-800' : 'text-gray-400'}`}>
              {e === 'dados' ? 'Dados' : e === 'pecas' ? 'Peças' : 'Finalizar'}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-gray-200 w-8" />}
          </div>
        ))}
      </div>

      {/* Erro global */}
      {erro && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          {erro}
        </div>
      )}

      {/* ===== ETAPA 1: DADOS ===== */}
      {etapa === 'dados' && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-orange-500" />
            Dados da OS
          </h2>

          {/* Tipo de veículo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tipo de veículo
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setField('tipo_veiculo', 'carro')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  form.tipo_veiculo === 'carro'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Car size={16} /> Carro
              </button>
              <button
                type="button"
                onClick={() => setField('tipo_veiculo', 'moto')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  form.tipo_veiculo === 'moto'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bike size={16} /> Moto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nome do cliente <span className="text-red-500">*</span>
              </label>
              <input
                value={form.cliente_nome}
                onChange={e => setField('cliente_nome', e.target.value)}
                placeholder="João Silva"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                WhatsApp
              </label>
              <input
                value={form.cliente_whatsapp}
                onChange={e => setField('cliente_whatsapp', e.target.value)}
                placeholder="(69) 9 9999-9999"
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Veículo <span className="text-red-500">*</span>
              </label>
              <input
                value={form.veiculo}
                onChange={e => setField('veiculo', e.target.value)}
                placeholder="VW Gol G5 2014"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Placa <span className="text-red-500">*</span>
              </label>
              <input
                value={form.placa}
                onChange={e => setField('placa', e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
                className="input-base uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Km atual (opcional)
            </label>
            <input
              type="number"
              value={form.km_entrada}
              onChange={e => setField('km_entrada', e.target.value)}
              placeholder="98450"
              className="input-base max-w-[180px]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Problema / Serviço solicitado <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.descricao_problema}
              onChange={e => setField('descricao_problema', e.target.value)}
              rows={3}
              placeholder="Descreva o problema relatado pelo cliente ou o serviço a ser realizado..."
              className="input-base resize-none"
            />
          </div>

          <button
            onClick={handleAvancarParaPecas}
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? 'Salvando...' : 'Avançar → Peças'}
          </button>
        </div>
      )}

      {/* ===== ETAPA 2: PEÇAS ===== */}
      {etapa === 'pecas' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Package size={18} className="text-orange-500" />
              Peças e produtos utilizados
            </h2>
            <BuscaPecas onAdicionar={adicionarItem} />
          </div>

          {/* Lista de itens adicionados */}
          {itens.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Itens adicionados
              </h3>
              <div className="space-y-2">
                {itens.map(item => (
                  <div
                    key={item.produto_id}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.nome}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantidade} × R${item.preco_unitario.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-orange-600">
                      R${item.subtotal.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removerItem(item.produto_id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Subtotal peças */}
              <div className="flex justify-between pt-3 border-t border-gray-200 text-sm font-semibold">
                <span className="text-gray-600">Subtotal peças:</span>
                <span className="text-orange-600">R${valorPecas.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Mão de obra */}
          <div className="card">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Valor da mão de obra (R$)
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={valorMaoObra}
              onChange={e => setValorMaoObra(Number(e.target.value))}
              className="input-base max-w-[200px]"
            />
          </div>

          {/* Resumo financeiro */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Peças:</span>
                <span>R${valorPecas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Mão de obra:</span>
                <span>R${valorMaoObra.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-orange-200 text-base">
                <span>Total:</span>
                <span className="text-orange-600">R${valorTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEtapa('dados')}
              className="btn-ghost flex-1"
            >
              ← Voltar
            </button>
            <button
              onClick={handleAvancarParaFinalizar}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Salvando...' : 'Avançar → Finalizar'}
            </button>
          </div>
        </div>
      )}

      {/* ===== ETAPA 3: FINALIZAR ===== */}
      {etapa === 'finalizar' && (
        <div className="space-y-4">
          {/* Resumo completo */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={18} className="text-orange-500" />
              Revisar e finalizar OS
            </h2>

            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <p><span className="text-gray-500">Cliente:</span> <strong>{form.cliente_nome}</strong></p>
              <p><span className="text-gray-500">Veículo:</span> <strong>{form.veiculo} — {form.placa}</strong></p>
              <p><span className="text-gray-500">Serviço:</span> {form.descricao_problema}</p>
            </div>

            {itens.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Peças utilizadas</p>
                {itens.map(item => (
                  <div key={item.produto_id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.nome} × {item.quantidade}</span>
                    <span>R${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Peças:</span><span>R${valorPecas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Mão de obra:</span><span>R${valorMaoObra.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-orange-600 pt-1">
                <span>Total:</span><span>R${valorTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Forma de pagamento */}
          <div className="card">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Forma de pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: 'pix',            label: '💸 PIX' },
                { val: 'dinheiro',       label: '💵 Dinheiro' },
                { val: 'cartao_credito', label: '💳 Crédito' },
                { val: 'cartao_debito',  label: '💳 Débito' },
              ] as const).map(op => (
                <button
                  key={op.val}
                  type="button"
                  onClick={() => setFormaPagamento(op.val)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                    formaPagamento === op.val
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="card">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Observações internas (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Anotações para o admin, pendências, etc."
              className="input-base resize-none"
            />
          </div>

          {/* Aviso de baixa de estoque */}
          {itens.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                Ao finalizar, <strong>{itens.length} {itens.length === 1 ? 'peça será deduzida' : 'peças serão deduzidas'}</strong> automaticamente do estoque. Esta ação não pode ser desfeita.
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setEtapa('pecas')}
              className="btn-ghost flex-1"
            >
              ← Voltar
            </button>
            <button
              onClick={handleFinalizar}
              disabled={loading}
              className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Finalizando...' : '✓ Finalizar OS e dar baixa no estoque'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
