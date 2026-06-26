'use client'
// ============================================================
// FORMULÁRIO DE OS — components/os/OSForm.tsx
// Tela única e enxuta, no jeito do grupo do WhatsApp.
// Mecânico só cria; valor e finalização é do dono.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Car, Bike, FileText, Wrench, Trash2, Plus,
} from 'lucide-react'
import BuscaPecas from './BuscaPecas'
import { criarOS, salvarItensOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import type { ItemOS } from '@/lib/types'

export default function OSForm() {
  const router = useRouter()
  const { perfil } = useAuth()

  const [form, setForm] = useState({
    veiculo:       '',
    ano:           '',
    motor:         '',
    placa:         '',
    km:            '',
    cliente_nome:  '',
    tipo_veiculo:  'carro' as 'carro' | 'moto',
    descricao:     '',
  })

  // Peças opcionais na criação (sem valor — mecânico não precifica)
  const [itens,      setItens]      = useState<ItemOS[]>([])
  const [mostraPecas, setMostraPecas] = useState(false)

  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState<string | null>(null)

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
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

  async function handleCriar() {
    setErro(null)
    if (!form.veiculo.trim()) return setErro('Informe o veículo.')
    if (!form.ano.trim())     return setErro('Informe o ano.')
    if (!form.motor.trim())   return setErro('Informe a motorização (ex: 1.6).')
    if (!form.placa.trim())   return setErro('Informe a placa.')
    if (!form.descricao.trim()) return setErro('Descreva o que fazer no carro.')

    setLoading(true)
    try {
      // Junta veículo + ano + motor num texto só, do jeito do grupo
      const veiculoCompleto = `${form.veiculo.trim()} ${form.ano.trim()} ${form.motor.trim()}`.trim()

      const id = await criarOS({
        oficina_id:         perfil!.oficina_id,
        cliente_nome:       form.cliente_nome.trim() || 'Cliente não informado',
        cliente_whatsapp:   '',
        veiculo:            veiculoCompleto,
        placa:              form.placa.toUpperCase(),
        tipo_veiculo:       form.tipo_veiculo,
        km_entrada:         form.km ? Number(form.km) : undefined,
        descricao_problema: form.descricao.trim(),
        mecanico_id:        perfil!.uid,
        mecanico_nome:      perfil!.nome,
        // status_inicial padrão = aguardando_aprovacao
      })

      // Se o mecânico já lançou peças, salva junto (sem valor)
      if (itens.length > 0) {
        await salvarItensOS(id, itens, 0)
      }

      router.push(`/os/${id}`)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {erro && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />{erro}
        </div>
      )}

      {/* Veículo */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <FileText size={16} className="text-orange-500" />Dados do carro
        </h2>

        {/* Tipo */}
        <div className="flex gap-2">
          {(['carro', 'moto'] as const).map(t => (
            <button key={t} type="button" onClick={() => setField('tipo_veiculo', t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                form.tipo_veiculo === t ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {t === 'carro' ? <Car size={14} /> : <Bike size={14} />}
              {t === 'carro' ? 'Carro' : 'Moto'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Veículo *</label>
          <input value={form.veiculo} onChange={e => setField('veiculo', e.target.value)}
            placeholder="Ex: Ford Ka" className="input-base" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ano *</label>
            <input value={form.ano} onChange={e => setField('ano', e.target.value)}
              placeholder="2020" className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motor *</label>
            <input value={form.motor} onChange={e => setField('motor', e.target.value)}
              placeholder="1.5" className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Km</label>
            <input type="number" value={form.km} onChange={e => setField('km', e.target.value)}
              placeholder="opcional" className="input-base" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Placa *</label>
          <input value={form.placa} onChange={e => setField('placa', e.target.value.toUpperCase())}
            placeholder="ABC1234" maxLength={8} className="input-base uppercase font-mono" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cliente (opcional)</label>
          <input value={form.cliente_nome} onChange={e => setField('cliente_nome', e.target.value)}
            placeholder="Nome do cliente, se souber" className="input-base" />
        </div>
      </div>

      {/* O que fazer */}
      <div className="card">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
          <Wrench size={16} className="text-orange-500" />O que fazer no carro *
        </label>
        <textarea value={form.descricao} onChange={e => setField('descricao', e.target.value)}
          rows={6}
          placeholder={`Uma linha por item, ex:\n\n1 Substituição do coxim do motor\n1 Substituição do coxim do câmbio\n1 Válvula canister`}
          className="input-base resize-none" />
        <p className="text-xs text-gray-400 mt-1">
          Escreva do mesmo jeito que manda no grupo. O dono ajusta os valores depois.
        </p>
      </div>

      {/* Peças (opcional) */}
      <div className="card">
        {!mostraPecas ? (
          <button type="button" onClick={() => setMostraPecas(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-600 py-2 transition">
            <Plus size={15} />Lançar peças agora (opcional)
          </button>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Plus size={16} className="text-orange-500" />Peças (opcional)
            </h2>
            <BuscaPecas onAdicionar={adicionarItem} ocultarPrecoManual />
            {itens.length > 0 && (
              <div className="mt-3 space-y-2">
                {itens.map(item => (
                  <div key={item.produto_id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.nome}</p>
                      <p className="text-xs text-gray-400">
                        Qtd: {item.quantidade}
                        {item.tipo_item === 'manual' ? ' · valor definido pelo dono' : ` · R$${item.preco_unitario.toFixed(2)}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => removerItem(item.produto_id)}
                      className="text-gray-400 hover:text-red-500 transition flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <button onClick={handleCriar} disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl text-base transition disabled:opacity-50">
        {loading ? 'Criando...' : 'Criar OS →'}
      </button>
      <p className="text-center text-xs text-gray-400">
        A OS vai pro dono aprovar e definir os valores.
      </p>
    </div>
  )
}