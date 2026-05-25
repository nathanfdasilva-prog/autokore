'use client'
import { useState, useRef } from 'react'
import {
  Plus, Search, Package, AlertTriangle,
  ArrowDown, ArrowUp, X, Save, Trash2,
  Upload, Download,
} from 'lucide-react'
import {
  collection, addDoc, updateDoc, doc, deleteDoc,
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
  { value: 'eletrica',      label: 'Eletrica' },
  { value: 'suspensao',     label: 'Suspensao' },
  { value: 'funilaria',     label: 'Funilaria' },
  { value: 'outros',        label: 'Outros' },
]

const UNIDADES = ['un', 'lt', 'kg', 'par', 'jogo'] as const

const FORM_VAZIO = {
  nome:              '',
  categoria:         'outros' as CategoriaEstoque,
  unidade:           'un' as typeof UNIDADES[number],
  quantidade:        0,
  quantidade_minima: 2,
  preco_custo:       0,
  preco_venda:       0,
  fornecedor:        '',
  descricao:         '',
  localizacao:       '',
}

export default function EstoquePage() {
  const { perfil }                        = useAuth()
  const { itens, itensCriticos, loading } = useEstoque()

  const [busca,       setBusca]       = useState('')
  const [catFiltro,   setCatFiltro]   = useState<CategoriaEstoque | 'todas'>('todas')
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoItem,setEditandoItem]= useState<ItemEstoque | null>(null)
  const [form,        setForm]        = useState(FORM_VAZIO)
  const [salvando,    setSalvando]    = useState(false)
  const [erroForm,    setErroForm]    = useState('')

  const [modalMov,    setModalMov]    = useState<{ item: ItemEstoque; tipo: 'entrada' | 'saida' } | null>(null)
  const [qtdMov,      setQtdMov]      = useState(1)
  const [salvandoMov, setSalvandoMov] = useState(false)

  const [modalDeletar, setModalDeletar] = useState<ItemEstoque | null>(null)
  const [deletando,    setDeletando]    = useState(false)

  const [importando,   setImportando]  = useState(false)
  const [importResult, setImportResult]= useState<{ ok: number; erro: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const itensFiltrados = itens
    .filter(i => catFiltro === 'todas' || i.categoria === catFiltro)
    .filter(i => !busca || i.nome.toLowerCase().includes(busca.toLowerCase()))

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
      fornecedor:        item.fornecedor  ?? '',
      descricao:         item.descricao   ?? '',
      localizacao:       (item as any).localizacao ?? '',
    })
    setErroForm('')
    setModalAberto(true)
  }

  async function handleSalvar() {
    if (!form.nome.trim()) return setErroForm('Nome e obrigatorio.')
    if (form.preco_venda <= 0) return setErroForm('Preco de venda deve ser maior que zero.')
    setSalvando(true)
    setErroForm('')
    try {
      const payload = {
        ...form,
        nome_lower: form.nome.toLowerCase(),
        oficina_id: perfil!.oficina_id,
        updatedAt:  serverTimestamp(),
      }
      if (editandoItem) {
        await updateDoc(doc(db, 'estoque', editandoItem.id), payload)
      } else {
        await addDoc(collection(db, 'estoque'), { ...payload, createdAt: serverTimestamp() })
      }
      setModalAberto(false)
    } catch (e: any) {
      setErroForm(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function handleDeletar() {
    if (!modalDeletar) return
    setDeletando(true)
    try {
      await deleteDoc(doc(db, 'estoque', modalDeletar.id))
      setModalDeletar(null)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeletando(false)
    }
  }

  async function handleMovimentacao() {
    if (!modalMov || !perfil) return
    if (qtdMov <= 0) return
    setSalvandoMov(true)
    try {
      const novaQtd = modalMov.tipo === 'entrada'
        ? modalMov.item.quantidade + qtdMov
        : modalMov.item.quantidade - qtdMov
      if (novaQtd < 0) throw new Error('Estoque ficaria negativo.')
      await updateDoc(doc(db, 'estoque', modalMov.item.id), {
        quantidade: novaQtd,
        updatedAt:  serverTimestamp(),
      })
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

  function baixarModelo() {
    const csv = [
      'nome,categoria,unidade,quantidade,quantidade_minima,preco_custo,preco_venda,fornecedor,localizacao',
      'Oleo Motor 5W30,lubrificantes,lt,10,2,25.00,45.00,Distribuidora Auto,Prateleira A1',
      'Filtro de Oleo,filtros,un,20,5,8.00,18.00,Bosch,Prateleira B2',
      'Pastilha de Freio Dianteira,freios,par,8,2,35.00,75.00,TRW,Gaveta 3',
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'modelo_estoque_autokore.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function exportarEstoque() {
    const linhas = [
      'nome,categoria,unidade,quantidade,quantidade_minima,preco_custo,preco_venda,fornecedor,localizacao',
      ...itensFiltrados.map(i =>
        `${i.nome},${i.categoria},${i.unidade},${i.quantidade},${i.quantidade_minima},${i.preco_custo.toFixed(2)},${i.preco_venda.toFixed(2)},${i.fornecedor ?? ''},${(i as any).localizacao ?? ''}`
      ),
    ].join('\n')
    const blob = new Blob([linhas], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `estoque_autokore_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportarCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !perfil) return
    setImportando(true)
    setImportResult(null)
    const text = await file.text()
    const linhas = text.split('\n').map(l => l.trim()).filter(Boolean)
    const cabecalho = linhas[0].toLowerCase()
    if (!cabecalho.includes('nome')) {
      alert('Arquivo invalido. Use o modelo fornecido.')
      setImportando(false)
      return
    }
    const dados = linhas.slice(1)
    let ok = 0, erro = 0
    for (const linha of dados) {
      try {
        const sep = linha.includes(';') ? ';' : ','
        const cols = linha.split(sep)
        const nome = cols[0]?.trim()
        if (!nome) { erro++; continue }
        await addDoc(collection(db, 'estoque'), {
          nome,
          nome_lower:        nome.toLowerCase(),
          categoria:         (cols[1]?.trim() || 'outros') as CategoriaEstoque,
          unidade:           (cols[2]?.trim() || 'un') as any,
          quantidade:        Number(cols[3]?.trim()) || 0,
          quantidade_minima: Number(cols[4]?.trim()) || 2,
          preco_custo:       Number(cols[5]?.trim()) || 0,
          preco_venda:       Number(cols[6]?.trim()) || 0,
          fornecedor:        cols[7]?.trim() || '',
          localizacao:       cols[8]?.trim() || '',
          descricao:         '',
          oficina_id:        perfil.oficina_id,
          createdAt:         serverTimestamp(),
          updatedAt:         serverTimestamp(),
        })
        ok++
      } catch { erro++ }
    }
    setImportResult({ ok, erro })
    setImportando(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Estoque / Pecas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {itens.length} itens cadastrados
            {itensCriticos.length > 0 && <span className="ml-2 text-red-500 font-medium">· {itensCriticos.length} em alerta</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={baixarModelo}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition">
            <Download size={15} />Modelo CSV
          </button>
          <button onClick={exportarEstoque}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-green-200 rounded-xl text-green-600 hover:bg-green-50 transition">
            <Download size={15} />Exportar
          </button>
          <label className={`flex items-center gap-2 px-3 py-2 text-sm border border-orange-200 rounded-xl text-orange-600 hover:bg-orange-50 transition cursor-pointer ${importando ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={15} />{importando ? 'Importando...' : 'Importar CSV'}
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportarCSV} />
          </label>
          <button onClick={abrirCriar} className="btn-primary flex items-center gap-2">
            <Plus size={16} />Nova peca
          </button>
        </div>
      </div>

      {importResult && (
        <div className={`rounded-xl p-4 mb-5 border ${importResult.erro === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm font-semibold ${importResult.erro === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
            Importacao concluida! ✅ {importResult.ok} itens importados
            {importResult.erro > 0 && ` · ⚠️ ${importResult.erro} com erro`}
          </p>
          <button onClick={() => setImportResult(null)} className="text-xs text-gray-400 mt-1 hover:underline">Fechar</button>
        </div>
      )}

      {itensCriticos.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-2">
            <AlertTriangle size={15} />Itens abaixo do estoque minimo
          </p>
          <div className="flex flex-wrap gap-2">
            {itensCriticos.map(item => (
              <span key={item.id} className="text-xs bg-white border border-red-200 text-red-600 rounded-lg px-2.5 py-1">
                {item.nome} ({item.quantidade}/{item.quantidade_minima})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar peca..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCatFiltro('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${catFiltro === 'todas' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Todas
          </button>
          {CATEGORIAS.map(c => (
            <button key={c.value} onClick={() => setCatFiltro(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${catFiltro === c.value ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Peca</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Categoria</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Localiz.</th>
                <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Qtd</th>
                <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Min.</th>
                <th className="text-right text-xs font-semibold text-gray-400 pb-3 pr-4">Custo</th>
                <th className="text-right text-xs font-semibold text-gray-400 pb-3 pr-4">Venda</th>
                <th className="text-center text-xs font-semibold text-gray-400 pb-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(item => {
                const critico = item.quantidade <= item.quantidade_minima
                return (
                  <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${critico ? 'bg-red-50/40' : ''}`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {critico && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-800">{item.nome}</p>
                          {item.fornecedor && <p className="text-xs text-gray-400">{item.fornecedor}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4"><span className="badge badge-gray capitalize">{item.categoria}</span></td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{(item as any).localizacao || '—'}</td>
                    <td className={`py-3 pr-4 text-center font-bold ${critico ? 'text-red-600' : 'text-gray-800'}`}>{item.quantidade} {item.unidade}</td>
                    <td className="py-3 pr-4 text-center text-gray-500">{item.quantidade_minima}</td>
                    <td className="py-3 pr-4 text-right text-gray-600">R${item.preco_custo.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-orange-600">R${item.preco_venda.toFixed(2)}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setModalMov({ item, tipo: 'entrada' }); setQtdMov(1) }}
                          title="Entrada" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition">
                          <ArrowDown size={13} />
                        </button>
                        <button onClick={() => { setModalMov({ item, tipo: 'saida' }); setQtdMov(1) }}
                          title="Saida" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                          <ArrowUp size={13} />
                        </button>
                        <button onClick={() => abrirEditar(item)}
                          title="Editar" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition text-xs font-bold">
                          ✎
                        </button>
                        <button onClick={() => setModalDeletar(item)}
                          title="Excluir" className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                          <Trash2 size={13} />
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
              <Package size={28} className="mx-auto mb-2 opacity-40" />Nenhum item encontrado.
            </div>
          )}
        </div>
      )}

      {modalDeletar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><Trash2 size={18} className="text-red-500" /></div>
              <div><h2 className="text-base font-bold text-gray-800">Excluir peca</h2><p className="text-xs text-gray-500">Esta acao nao pode ser desfeita.</p></div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Tem certeza que deseja excluir <strong>{modalDeletar.nome}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setModalDeletar(null)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleDeletar} disabled={deletando}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50">
                {deletando ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">{editandoItem ? 'Editar peca' : 'Nova peca'}</h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {erroForm && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{erroForm}</p>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="input-base" placeholder="Ex: Filtro de oleo Bosch" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
                  <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as CategoriaEstoque }))} className="input-base">
                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
                  <select value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value as any }))} className="input-base">
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qtd {!editandoItem && 'inicial'}</label>
                  <input type="number" min={0} value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: Number(e.target.value) }))} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qtd minima</label>
                  <input type="number" min={0} value={form.quantidade_minima} onChange={e => setForm(f => ({ ...f, quantidade_minima: Number(e.target.value) }))} className="input-base" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preco de custo</label>
                  <input type="number" min={0} step={0.01} value={form.preco_custo} onChange={e => setForm(f => ({ ...f, preco_custo: Number(e.target.value) }))} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preco de venda *</label>
                  <input type="number" min={0} step={0.01} value={form.preco_venda} onChange={e => setForm(f => ({ ...f, preco_venda: Number(e.target.value) }))} className="input-base" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fornecedor</label>
                  <input value={form.fornecedor} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))} className="input-base" placeholder="Ex: Distribuidora APIS" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Localização</label>
                  <input value={form.localizacao} onChange={e => setForm(f => ({ ...f, localizacao: e.target.value }))} className="input-base" placeholder="Ex: Prateleira A1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalAberto(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={15} />{salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMov && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                {modalMov.tipo === 'entrada'
                  ? <><ArrowDown size={16} className="text-green-500" />Entrada de estoque</>
                  : <><ArrowUp size={16} className="text-red-500" />Saida manual</>}
              </h2>
              <button onClick={() => setModalMov(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">{modalMov.item.nome}</p>
            <p className="text-xs text-gray-400 mb-4">Estoque atual: <strong>{modalMov.item.quantidade} {modalMov.item.unidade}</strong></p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
              <input type="number" min={1} max={modalMov.tipo === 'saida' ? modalMov.item.quantidade : undefined}
                value={qtdMov} onChange={e => setQtdMov(Number(e.target.value))} className="input-base" />
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-sm">
              <span className="text-gray-500">Estoque apos: </span>
              <strong className={modalMov.tipo === 'entrada' ? 'text-green-600' : (modalMov.item.quantidade - qtdMov) < 0 ? 'text-red-600' : 'text-gray-800'}>
                {modalMov.tipo === 'entrada' ? modalMov.item.quantidade + qtdMov : modalMov.item.quantidade - qtdMov} {modalMov.item.unidade}
              </strong>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalMov(null)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleMovimentacao} disabled={salvandoMov || qtdMov <= 0}
                className={`flex-1 btn-primary ${modalMov.tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                {salvandoMov ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}