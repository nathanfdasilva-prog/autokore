'use client'
// ============================================================
// BUSCA DE PEÇAS — components/os/BuscaPecas.tsx
// Duas abas: buscar no estoque OU digitar peça na mão.
// Peça manual entra sem preço (o dono precifica depois).
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { Search, Package, AlertTriangle, Plus, PenLine } from 'lucide-react'
import { useBuscaPecas } from '@/lib/hooks/useEstoque'
import type { ItemEstoque, ItemOS } from '@/lib/types'

interface BuscaPecasProps {
  onAdicionar: (item: ItemOS) => void
  /** Se true, o mecânico não vê preço ao digitar peça manual (dono precifica). Default: false */
  ocultarPrecoManual?: boolean
}

export default function BuscaPecas({ onAdicionar, ocultarPrecoManual = false }: BuscaPecasProps) {
  const [aba, setAba] = useState<'estoque' | 'manual'>('estoque')

  return (
    <div className="space-y-3">
      {/* Abas */}
      <div className="flex bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => setAba('estoque')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition ${
            aba === 'estoque' ? 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package size={14} /> Buscar no estoque
        </button>
        <button
          type="button"
          onClick={() => setAba('manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition ${
            aba === 'manual' ? 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PenLine size={14} /> Digitar na mão
        </button>
      </div>

      {aba === 'estoque'
        ? <BuscaEstoque onAdicionar={onAdicionar} />
        : <PecaManual onAdicionar={onAdicionar} ocultarPreco={ocultarPrecoManual} />}
    </div>
  )
}

// ---------- ABA 1: buscar no estoque ----------
function BuscaEstoque({ onAdicionar }: { onAdicionar: (item: ItemOS) => void }) {
  const [termo,         setTermo]    = useState('')
  const [aberto,        setAberto]   = useState(false)
  const [qtdSelecionada, setQtd]     = useState(1)
  const [itemFoco,      setItemFoco] = useState<ItemEstoque | null>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { resultados, loading } = useBuscaPecas(termo)

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  function handleSelect(item: ItemEstoque) {
    setItemFoco(item)
    setTermo(item.nome)
    setQtd(1)
    setAberto(false)
  }

  function handleAdicionar() {
    if (!itemFoco) return
    if (qtdSelecionada <= 0) return
    if (qtdSelecionada > itemFoco.quantidade) return

    const itemOS: ItemOS = {
      produto_id:     itemFoco.id,
      nome:           itemFoco.nome,
      quantidade:     qtdSelecionada,
      preco_unitario: itemFoco.preco_venda,
      subtotal:       itemFoco.preco_venda * qtdSelecionada,
      tipo_item:      'estoque',
    }

    onAdicionar(itemOS)
    setTermo('')
    setItemFoco(null)
    setQtd(1)
    inputRef.current?.focus()
  }

  const estoqueInsuficiente = itemFoco !== null && qtdSelecionada > itemFoco.quantidade

  return (
    <div ref={wrapperRef} className="space-y-2">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={termo}
          onChange={e => {
            setTermo(e.target.value)
            setItemFoco(null)
            setAberto(e.target.value.length >= 2)
          }}
          onFocus={() => termo.length >= 2 && setAberto(true)}
          placeholder="Buscar peça no estoque..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {aberto && resultados.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
            {resultados.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-left transition-colors"
              >
                <Package size={15} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.nome}</p>
                  <p className="text-xs text-gray-400">{item.categoria} · {item.unidade}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-orange-600">R${item.preco_venda.toFixed(2)}</p>
                  <p className={`text-xs ${item.quantidade <= item.quantidade_minima ? 'text-red-500' : 'text-gray-400'}`}>
                    Estoque: {item.quantidade}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {aberto && !loading && resultados.length === 0 && termo.length >= 2 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
            Nenhuma peça encontrada no estoque. Use a aba "Digitar na mão".
          </div>
        )}
      </div>

      {itemFoco && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{itemFoco.nome}</p>
            <p className="text-xs text-gray-500">
              R${itemFoco.preco_venda.toFixed(2)}/{itemFoco.unidade} · Disponível: {itemFoco.quantidade}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setQtd(q => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition">−</button>
            <input type="number" min={1} max={itemFoco.quantidade} value={qtdSelecionada}
              onChange={e => setQtd(Number(e.target.value))}
              className="w-14 text-center border border-gray-300 rounded-md py-1 text-sm outline-none focus:border-orange-400" />
            <button type="button" onClick={() => setQtd(q => Math.min(itemFoco.quantidade, q + 1))}
              className="w-7 h-7 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition">+</button>
          </div>
          <p className="text-sm font-semibold text-orange-600 w-20 text-right flex-shrink-0">
            R${(itemFoco.preco_venda * qtdSelecionada).toFixed(2)}
          </p>
          <button type="button" onClick={handleAdicionar} disabled={estoqueInsuficiente || qtdSelecionada <= 0}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus size={13} /> Adicionar
          </button>
        </div>
      )}

      {estoqueInsuficiente && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle size={13} />
          Quantidade maior que o estoque disponível ({itemFoco?.quantidade}).
        </p>
      )}
    </div>
  )
}

// ---------- ABA 2: digitar peça na mão ----------
function PecaManual({ onAdicionar, ocultarPreco }: { onAdicionar: (item: ItemOS) => void; ocultarPreco: boolean }) {
  const [nome, setNome] = useState('')
  const [qtd,  setQtd]  = useState(1)
  const [preco, setPreco] = useState(0)

  function handleAdicionar() {
    if (!nome.trim()) return
    const precoFinal = ocultarPreco ? 0 : preco
    const itemOS: ItemOS = {
      produto_id:     `manual_${Date.now()}`,
      nome:           nome.trim(),
      quantidade:     qtd,
      preco_unitario: precoFinal,
      subtotal:       precoFinal * qtd,
      tipo_item:      'manual',
    }
    onAdicionar(itemOS)
    setNome('')
    setQtd(1)
    setPreco(0)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Nome da peça (ex: Pastilha de freio dianteira)"
          className="input-base flex-1"
        />
        <input
          type="number" min={1} value={qtd}
          onChange={e => setQtd(Number(e.target.value))}
          className="input-base w-16 text-center"
          placeholder="Qtd"
        />
        {!ocultarPreco && (
          <input
            type="number" min={0} step={0.01} value={preco || ''}
            onChange={e => setPreco(Number(e.target.value))}
            className="input-base w-24"
            placeholder="R$ 0,00"
          />
        )}
        <button type="button" onClick={handleAdicionar} disabled={!nome.trim()}
          className="btn-primary px-3 flex-shrink-0 disabled:opacity-40">
          <Plus size={16} />
        </button>
      </div>
      {ocultarPreco && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <AlertTriangle size={12} className="text-amber-500" />
          O valor desta peça será definido pelo dono ao fechar a OS.
        </p>
      )}
    </div>
  )
}