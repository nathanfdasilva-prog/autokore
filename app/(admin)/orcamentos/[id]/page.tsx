'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { doc, getDoc, db } from '@/lib/firebase/firestore'
import { atualizarStatusOrcamento, enviarOrcamento, type Orcamento } from '@/lib/hooks/useOrcamentos'
import { criarOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import { abrirWhatsApp, TEMPLATES } from '@/lib/services/whatsapp'
import { format } from 'date-fns'
import { ArrowLeft, Send, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function OrcamentoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { perfil, oficina } = useAuth()
  const [orc, setOrc] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [atualizando, setAtualizando] = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'orcamentos', id)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        setOrc({
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
          validade_ate: data.validade_ate?.toDate?.() ?? new Date(),
          aprovado_em: data.aprovado_em?.toDate?.(),
        } as Orcamento)
      }
      setLoading(false)
    })
  }, [id])

  async function handleEnviarWhatsApp() {
    if (!orc) return
    const msg = TEMPLATES.orcamento({
      cliente:  orc.cliente_nome,
      veiculo:  orc.veiculo,
      pecas:    brl(orc.valor_pecas).replace('R$\u00a0',''),
      mao_obra: brl(orc.valor_servicos).replace('R$\u00a0',''),
      total:    brl(orc.valor_final).replace('R$\u00a0',''),
      oficina:  oficina?.nome ?? 'Oficina',
    })
    abrirWhatsApp(orc.cliente_whatsapp, msg)
    if (orc.status === 'rascunho') {
      await enviarOrcamento(orc.id)
      setOrc(o => o ? { ...o, status: 'enviado' } : o)
    }
  }

  async function handleAprovar() {
    if (!orc) return
    setAtualizando(true)
    await atualizarStatusOrcamento(orc.id, 'aprovado', { aprovado_em: new Date() })
    setOrc(o => o ? { ...o, status: 'aprovado' } : o)
    setAtualizando(false)
  }

  async function handleReprovar() {
    if (!orc) return
    setAtualizando(true)
    await atualizarStatusOrcamento(orc.id, 'reprovado')
    setOrc(o => o ? { ...o, status: 'reprovado' } : o)
    setAtualizando(false)
  }

  async function handleGerarOS() {
    if (!orc || !perfil) return
    setAtualizando(true)
    try {
      const os_id = await criarOS({
        oficina_id:         perfil.oficina_id,
        cliente_nome:       orc.cliente_nome,
        cliente_whatsapp:   orc.cliente_whatsapp,
        veiculo:            orc.veiculo,
        placa:              orc.placa,
        tipo_veiculo:       orc.tipo_veiculo,
        km_entrada:         orc.km ?? undefined,
        descricao_problema: orc.descricao,
        mecanico_id:        perfil.uid,
        mecanico_nome:      perfil.nome,
        agendamento_id:     undefined,
      })
      await atualizarStatusOrcamento(orc.id, 'convertido', { os_id })
      router.push(`/os/${os_id}`)
    } catch (e: any) {
      console.error(e)
    } finally {
      setAtualizando(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!orc) return (
    <div className="text-center py-24 text-gray-400">Orçamento não encontrado.</div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orcamentos" className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Orçamento #{String(orc.numero).padStart(4,'0')}</h1>
          <p className="text-sm text-gray-500">{format(orc.createdAt, 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-semibold text-gray-800">{orc.cliente_nome}</p>
            <p className="text-sm text-gray-500">{orc.veiculo} — {orc.placa}</p>
            <p className="text-xs text-gray-400 mt-1">{orc.descricao}</p>
          </div>
          <span className={`badge ${
            orc.status === 'aprovado' ? 'badge-green' :
            orc.status === 'reprovado' ? 'badge-red' :
            orc.status === 'enviado' ? 'badge-blue' :
            orc.status === 'convertido' ? 'badge-orange' : 'badge-gray'
          } capitalize`}>{orc.status}</span>
        </div>

        <div className="space-y-2 mb-4">
          {orc.itens.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantidade}x {item.descricao}</span>
              <span className="font-medium">{brl(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-600"><span>Peças:</span><span>{brl(orc.valor_pecas)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>Serviços:</span><span>{brl(orc.valor_servicos)}</span></div>
          {orc.desconto > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Desconto:</span><span>-{brl(orc.desconto)}</span></div>}
          <div className="flex justify-between font-bold text-orange-600 text-base pt-1 border-t"><span>Total:</span><span>{brl(orc.valor_final)}</span></div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {orc.cliente_whatsapp && (
          <button onClick={handleEnviarWhatsApp} className="flex items-center gap-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-2 hover:bg-green-100 transition">
            <Send size={14} />Enviar WhatsApp
          </button>
        )}
        {orc.status === 'enviado' && (
          <>
            <button onClick={handleAprovar} disabled={atualizando} className="flex items-center gap-2 text-sm bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition">
              <CheckCircle size={14} />Aprovar
            </button>
            <button onClick={handleReprovar} disabled={atualizando} className="flex items-center gap-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-100 transition">
              <XCircle size={14} />Reprovar
            </button>
          </>
        )}
        {orc.status === 'aprovado' && !orc.os_id && (
          <button onClick={handleGerarOS} disabled={atualizando} className="flex items-center gap-2 text-sm bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 transition disabled:opacity-50">
            <RotateCcw size={14} />{atualizando ? 'Gerando...' : 'Gerar OS'}
          </button>
        )}
        {orc.os_id && (
          <button onClick={() => router.push(`/os/${orc.os_id}`)} className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 transition">
            Ver OS →
          </button>
        )}
      </div>
    </div>
  )
}