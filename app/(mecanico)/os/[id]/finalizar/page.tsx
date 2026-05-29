'use client'
// ============================================================
// FINALIZAR OS — app/(mecanico)/os/[id]/finalizar/page.tsx
// Fluxo dedicado para finalizar uma OS já existente.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Trash2, AlertTriangle,
  CheckCircle, DollarSign, Package,
} from 'lucide-react'
import { useOS, salvarItensOS, finalizarOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import BuscaPecas from '@/components/os/BuscaPecas'
import type { ItemOS, OrdemServico } from '@/lib/types'

export default function FinalizarOSPage({
  params,
}: {
  const { id }            = params
}) {
  const { id }            = use(params)
  const { os, loading }   = useOS(id)
  const { perfil }        = useAuth()
  const router            = useRouter()

  const [itens,           setItens]          = useState<ItemOS[]>([])
  const [itensSincronizados, setSync]        = useState(false)
  const [valorMaoObra,    setValorMaoObra]   = useState(0)
  const [formaPagamento,  setFormaPagamento] =
    useState<OrdemServico['forma_pagamento']>('pix')
  const [observacoes,     setObservacoes]    = useState('')
  const [loadingAcao,     setLoadingAcao]    = useState(false)
  const [erro,            setErro]           = useState<string | null>(null)
  const [sucesso,         setSucesso]        = useState(false)

  // Sincroniza itens existentes da OS ao carregar (apenas 1 vez)
  if (os && !itensSincronizados) {
    setItens(os.itens ?? [])
    setValorMaoObra(os.valor_mao_obra ?? 0)
    setObservacoes(os.observacoes_internas ?? '')
    setSync(true)
  }

  // ---- helpers ----
  function adicionarItem(item: ItemOS) {
    setItens(prev => {
      const idx = prev.findIndex(i => i.produto_id === item.produto_id)
      if (idx >= 0) {
        const novo = [...prev]
        novo[idx] = {
          ...novo[idx],
          quantidade: novo[idx].quantidade + item.quantidade,
          subtotal:
            novo[idx].preco_unitario *
            (novo[idx].quantidade + item.quantidade),
        }
        return novo
      }
      return [...prev, item]
    })
  }

  function removerItem(produto_id: string) {
    setItens(prev => prev.filter(i => i.produto_id !== produto_id))
  }

  const valorPecas = itens.reduce((s, i) => s + i.subtotal, 0)
  const valorTotal = valorPecas + valorMaoObra

  // ---- Finalizar ----
  async function handleFinalizar() {
    if (!perfil || !os) return
    setErro(null)
    setLoadingAcao(true)
    try {
      await finalizarOS({
        os_id:           id,
        oficina_id:      perfil.oficina_id,
        usuario_id:      perfil.uid,
        usuario_nome:    perfil.nome,
        itens,
        valor_mao_obra:  valorMaoObra,
        forma_pagamento: formaPagamento,
        observacoes,
      })
      setSucesso(true)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoadingAcao(false)
    }
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!os) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">OS não encontrada.</p>
        <Link href="/os" className="btn-primary mt-4 inline-flex">
          Voltar
        </Link>
      </div>
    )
  }

  // ---- Sucesso ----
  if (sucesso) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">OS Finalizada!</h2>
        <p className="text-sm text-gray-500 mb-1">
          OS #{String(os.numero).padStart(4, '0')} — {os.cliente_nome}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Estoque baixado automaticamente para {itens.length}{' '}
          {itens.length === 1 ? 'item' : 'itens'}.
        </p>
        <p className="text-3xl font-bold text-orange-500 mb-8">
          R${valorTotal.toFixed(2)}
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

  // ---- Formulário ----
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/os/${id}`}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Finalizar OS #{String(os.numero).padStart(4, '0')}
          </h1>
          <p className="text-sm text-gray-500">
            {os.cliente_nome} · {os.veiculo} — {os.placa}
          </p>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          {erro}
        </div>
      )}

      <div className="space-y-4">
        {/* Busca de peças */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Package size={16} className="text-orange-500" />
            Peças utilizadas
          </h2>
          <BuscaPecas onAdicionar={adicionarItem} />

          {/* Lista de itens */}
          {itens.length > 0 && (
            <div className="mt-4 space-y-2">
              {itens.map(item => (
                <div
                  key={item.produto_id}
                  className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.nome}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantidade} × R${item.preco_unitario.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-orange-600 flex-shrink-0">
                    R${item.subtotal.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removerItem(item.produto_id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              <div className="flex justify-between pt-2 text-sm font-semibold border-t border-gray-200">
                <span className="text-gray-600">Subtotal peças:</span>
                <span className="text-orange-600">R${valorPecas.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

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

        {/* Forma de pagamento */}
        <div className="card">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Forma de pagamento
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { val: 'pix',            label: '💸 PIX' },
                { val: 'dinheiro',       label: '💵 Dinheiro' },
                { val: 'cartao_credito', label: '💳 Crédito' },
                { val: 'cartao_debito',  label: '💳 Débito' },
              ] as const
            ).map(op => (
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
            placeholder="Pendências, notas para o admin..."
            className="input-base resize-none"
          />
        </div>

        {/* Resumo financeiro */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Peças:</span>
              <span>R${valorPecas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Mão de obra:</span>
              <span>R${valorMaoObra.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-orange-200">
              <span>Total:</span>
              <span className="text-orange-600">R${valorTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Aviso baixa de estoque */}
        {itens.length > 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              Ao finalizar,{' '}
              <strong>
                {itens.length} {itens.length === 1 ? 'item será deduzido' : 'itens serão deduzidos'}
              </strong>{' '}
              do estoque via transação atômica. Esta ação não pode ser desfeita.
            </span>
          </div>
        )}

        {/* Botão finalizar */}
        <button
          onClick={handleFinalizar}
          disabled={loadingAcao}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DollarSign size={17} />
          {loadingAcao
            ? 'Finalizando e baixando estoque...'
            : `Finalizar OS — R$${valorTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
