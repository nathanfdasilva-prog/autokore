'use client'
// ============================================================
// ESTOQUE — app/(admin)/estoque/page.tsx
// ============================================================

import { useState } from 'react'
import {
  Plus, Search, Package, AlertTriangle,
  ArrowDown, ArrowUp, X, Save,
} from 'lucide-react'
import {
  collection, addDoc, updateDoc, doc,
  serverTimestamp, db,
} from '@/lib/firebase/firestore'
import { useEstoque } from '@/lib/hooks/useEstoque'
import { useAuth } from '@/lib/context/AuthContext'
import type { ItemEstoque, CategoriaEstoque } from '@/lib/types'

const CATEGORIAS: { value: CategoriaEstoque; label: string }[] = [
  { value: 'lubrificantes', label: 'Lubrificantes' },
  { value: 'filtros',       label: 'Filtros' },
  { value: 'freios',        label: 'Freios' },
  { value: 'motor',         label: 'Motor' },
  { value: 'eletrica',      label: 'Elétrica' },
  { value: 'suspensao',     label: 'Suspensão' },
  { value: 'funilaria',     label: 'Funilaria' },
  { value: 'outros',        label: 'Outros' },
]

const UNIDADES = ['un', 'lt', 'kg', 'par', 'jogo'] as const

// ---- Formulário vazio ----
const FORM_VAZIO = {
  nome:             '',
  categoria:        'outros' as CategoriaEstoque,
  unidade:          'un' as typeof UNIDADES[number],
  quantidade:       0,
  quantidade_minima: 2,
  preco_custo:      0,
  preco_venda:      0,
  fornecedor:       '',
  descricao:        '',
}

export default function EstoquePage() {
  const { perfil }         = useAuth()
  const { itens, itensCriticos, loading } = useEstoque()

  const [busca,         setBusca]         = useState('')
  const [catFiltro,     setCatFiltro]     = useState<CategoriaEstoque | 'todas'>('todas')
  const [modalAberto,   setModalAberto]   = useState(false)
  const [editandoItem,  setEditandoItem]  = useState<ItemEstoque | null>(null)
  const [form,          setForm]          = useState(FORM_VAZIO)
  const [salvando,      setSalvando]      = useState(false)
  const [erroForm,      setErroForm]      = useState('')

  // Modal de entrada/saída manual
  const [modalMov,      setModalMov]      = useState<{ item: ItemEstoque; tipo: 'entrada' | 'saida' } | null>(null)
  const [qtdMov,        setQtdMov]        = useState(1)
  const [salvandoMov,   setSalvandoMov]   = useState(false)

  // ---- Filtros ----
  const itensFiltrados = itens
    .filter(i => catFiltro === 'todas' || i.categoria === catFiltro)
    .filter(i => {
      if (!busca) return true
      return i.nome.toLowerCase().includes(busca.toLowerCase())
    })

  // ---- Abrir modal criar/editar ----
  function abrirCriar() {
    setEditandoItem(null)
    setForm(FORM_VAZIO)
    setErroForm('')
    setModalAberto(true)
  }

  function abrirEditar(item: ItemEstoque) {
    setEditandoItem(item)
    setForm({
      nome:              item.nome,
      categoria:         item.categoria,
      unidade:           item.unidade as any,
      quantidade:        item.quantidade,
      quantidade_minima: item.quantidade_minima,
      preco_custo:       item.preco_custo,
      preco_venda:       item.preco_venda,
      fornecedor:        item.fornecedor ?? '',
      descricao:         item.descricao  ?? '',
    })
    setErroForm('')
    setModalAberto(true)
  }

  // ---- Salvar item ----
  async function handleSalvar() {
    if (!form.nome.trim()) return setErroForm('Nome é obrigatório.')
    if (form.preco_venda <= 0) return setErroForm('Preço de venda deve ser maior que zero.')
    setSalvando(true)
    setErroForm('')

    try {
      const payload = {
        ...form,
        nome_lower:  form.nome.toLowerCase(),
        oficina_id:  perfil!.oficina_id,
        updatedAt:   serverTimestamp(),
      }

      if (editandoItem) {
        await updateDoc(doc(db, 'estoque', editandoItem.id), payload)
      } else {
        await addDoc(collection(db, 'estoque'), {
          ...payload,
          createdAt: serverTimestamp(),
        })
      }

      setModalAberto(false)
    } catch (e: any) {
      setErroForm(e.message)
    } finally {
      setSalvando(false)
    }
  }

  // ---- Movimentação manual ----
  async function handleMovimentacao() {
    if (!modalMov || !perfil) return
    if (qtdMov <= 0) return
    setSalvandoMov(true)

    try {
      const novaQtd = modalMov.tipo === 'entrada'
        ? modalMov.item.quantidade + qtdMov
        : modalMov.item.quantidade - qtdMov

      if (novaQtd < 0) throw new Error('Estoque ficaria negativo.')

      // Atualiza item
      await updateDoc(doc(db, 'estoque', modalMov.item.id), {
        quantidade: novaQtd,
        updatedAt:  serverTimestamp(),
      })

      // Registra movimentação
      await addDoc(collection(db, 'movimentacoes_estoque'), {
        item_id:      modalMov.item.id,
        oficina_id:   perfil.oficina_id,
        tipo:         modalMov.tipo,
        quantidade:   qtdMov,
        usuario_id:   perfil.uid,
        usuario_nome: perfil.nome,
        motivo:       'Ajuste manual',
        createdAt:    serverTimestamp(),
      })

      setModalMov(null)
      setQtdMov(1)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSalvandoMov(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estoque / Peças</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {itens.length} itens cadastrados
            {itensCriticos.length > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                · {itensCriticos.length} em alerta
              </span>
            )}
          </p>
        </div>
        <button onClick={abrirCriar} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nova peça
        </button>
      </div>

      {/* Alertas críticos */}
      {itensCriticos.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={15} />
            Itens abaixo do estoque mínimo
          </p>
          <div className="flex flex-wrap gap-2">
            {itensCriticos.map(item => (
              <span
                key={item.id}
                className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-2.5 py-1"
              >
                {item.nome} ({item.quantidade}/{item.quantidade_minima})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar peça..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setCatFiltro('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              catFiltro === 'todas'
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.map(c => (
            <button
              key={c.value}
              onClick={() => setCatFiltro(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                catFiltro === c.value
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Peça</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Categoria</th>
                <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Qtd</th>
                <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Mín.</th>
                <th className="text-right text-xs font-semibold text-gray-400 pb-3 pr-4">Custo</th>
                <th className="text-right text-xs font-semibold text-gray-400 pb-3 pr-4">Venda</th>
                <th className="text-center text-xs font-semibold text-gray-400 pb-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(item => {
                const critico = item.quantidade <= item.quantidade_minima
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      critico ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {critico && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-800">{item.nome}</p>
                          {item.fornecedor && (
                            <p className="text-xs text-gray-400">{item.fornecedor}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="badge badge-gray capitalize">{item.categoria}</span>
                    </td>
                    <td className={`py-3 pr-4 text-center font-bold ${
                      critico ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {item.quantidade} {item.unidade}
                    </td>
                    <td className="py-3 pr-4 text-center text-gray-500">{item.quantidade_minima}</td>
                    <td className="py-3 pr-4 text-right text-gray-600">
                      R${item.preco_custo.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-orange-600">
                      R${item.preco_venda.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setModalMov({ item, tipo: 'entrada' }); setQtdMov(1) }}
                          title="Entrada"
                          className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          onClick={() => { setModalMov({ item, tipo: 'saida' }); setQtdMov(1) }}
                          title="Saída manual"
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => abrirEditar(item)}
                          title="Editar"
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition text-xs font-bold"
                        >
                          ✎
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {itensFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <Package size={28} className="mx-auto mb-2 opacity-40" />
              Nenhum item encontrado.
            </div>
          )}
        </div>
      )}

      {/* ===== MODAL CRIAR/EDITAR ===== */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">
                {editandoItem ? 'Editar peça' : 'Nova peça'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {erroForm && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {erroForm}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="input-base"
                  placeholder="Ex: Filtro de óleo Bosch"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaEstoque }))}
                    className="input-base"
                  >
                    {CATEGORIAS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
                  <select
                    value={form.unidade}
                    onChange={e => setForm(f => ({ ...f, unidade: e.target.value as any }))}
                    className="input-base"
                  >
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Qtd {!editandoItem && 'inicial'}
                  </label>
                  <input
                    type="number" min={0}
                    value={form.quantidade}
                    onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qtd mínima</label>
                  <input
                    type="number" min={0}
                    value={form.quantidade_minima}
                    onChange={e => setForm(f => ({ ...f, quantidade_minima: Number(e.target.value) }))}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preço de custo</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={form.preco_custo}
                    onChange={e => setForm(f => ({ ...f, preco_custo: Number(e.target.value) }))}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preço de venda *</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={form.preco_venda}
                    onChange={e => setForm(f => ({ ...f, preco_venda: Number(e.target.value) }))}
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fornecedor</label>
                <input
                  value={form.fornecedor}
                  onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))}
                  className="input-base"
                  placeholder="Ex: Distribuidora APIS"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalAberto(false)} className="btn-ghost flex-1">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={15} />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL MOVIMENTAÇÃO ===== */}
      {modalMov && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                {modalMov.tipo === 'entrada'
                  ? <><ArrowDown size={16} className="text-green-500" />Entrada de estoque</>
                  : <><ArrowUp   size={16} className="text-red-500"   />Saída manual</>
                }
              </h2>
              <button onClick={() => setModalMov(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-1">{modalMov.item.nome}</p>
            <p className="text-xs text-gray-400 mb-4">
              Estoque atual: <strong>{modalMov.item.quantidade} {modalMov.item.unidade}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
              <input
                type="number" min={1}
                max={modalMov.tipo === 'saida' ? modalMov.item.quantidade : undefined}
                value={qtdMov}
                onChange={e => setQtdMov(Number(e.target.value))}
                className="input-base"
              />
            </div>

            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-sm">
              <span className="text-gray-500">Estoque após: </span>
              <strong className={
                modalMov.tipo === 'entrada'
                  ? 'text-green-600'
                  : (modalMov.item.quantidade - qtdMov) < 0
                    ? 'text-red-600'
                    : 'text-gray-800'
              }>
                {modalMov.tipo === 'entrada'
                  ? modalMov.item.quantidade + qtdMov
                  : modalMov.item.quantidade - qtdMov
                } {modalMov.item.unidade}
              </strong>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalMov(null)} className="btn-ghost flex-1">Cancelar</button>
              <button
                onClick={handleMovimentacao}
                disabled={salvandoMov || qtdMov <= 0}
                className={`flex-1 btn-primary ${
                  modalMov.tipo === 'entrada'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {salvandoMov ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
