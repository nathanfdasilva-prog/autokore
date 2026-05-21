'use client'
import { useState } from 'react'
import Link from 'next/link'
import { format, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus, FileText, Clock, CheckCircle,
  XCircle, AlertTriangle, ArrowRight,
  Send, RotateCcw,
} from 'lucide-react'
import {
  useOrcamentos, atualizarStatusOrcamento,
  enviarOrcamento, type Orcamento, type StatusOrcamento,
} from '@/lib/hooks/useOrcamentos'
import { criarOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import { abrirWhatsApp, TEMPLATES } from '@/lib/services/whatsapp'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_CFG: Record<StatusOrcamento, { label: string; cls: string; icon: React.ReactNode }> = {
  rascunho:   { label: 'Rascunho',   cls: 'badge badge-gray',   icon: <FileText  size={11} /> },
  enviado:    { label: 'Enviado',    cls: 'badge badge-blue',   icon: <Send      size={11} /> },
  aprovado:   { label: 'Aprovado',   cls: 'badge badge-green',  icon: <CheckCircle size={11} /> },
  reprovado:  { label: 'Reprovado',  cls: 'badge badge-red',    icon: <XCircle   size={11} /> },
  expirado:   { label: 'Expirado',   cls: 'badge badge-gray',   icon: <Clock     size={11} /> },
  convertido: { label: 'Virou OS',   cls: 'badge badge-orange', icon: <ArrowRight size={11} /> },
}

export default function OrcamentosPage() {
  const { perfil, oficina }     = useAuth()
  const { orcamentos, loading } = useOrcamentos()
  const [filtro, setFiltro]     = useState<StatusOrcamento | 'todos'>('todos')
  const [convertendo, setConv]  = useState<string | null>(null)

  const lista = orcamentos.filter(o =>
    filtro === 'todos' || o.status === filtro
  )

  function handleEnviarWhatsApp(orc: Orcamento) {
    const msg = TEMPLATES.orcamento({
      cliente:  orc.cliente_nome,
      veiculo:  orc.veiculo,
      pecas:    brl(orc.valor_pecas).replace('R$\u00a0',''),
      mao_obra: brl(orc.valor_servicos).replace('R$\u00a0',''),
      total:    brl(orc.valor_final).replace('R$\u00a0',''),
      oficina:  oficina?.nome ?? 'Oficina',
    })
    abrirWhatsApp(orc.cliente_whatsapp, msg)
    if (orc.status === 'rascunho') enviarOrcamento(orc.id)
  }

  async function handleConverter(orc: Orcamento) {
    if (!perfil) return
    setConv(orc.id)
    try {
      const os_id = await criarOS({
        oficina_id:         perfil.oficina_id,
        cliente_nome:       orc.cliente_nome,
        cliente_whatsapp:   orc.cliente_whatsapp,
        veiculo:            orc.veiculo,
        placa:              orc.placa,
        tipo_veiculo:       orc.tipo_veiculo,
        km_entrada:         orc.km,
        descricao_problema: orc.descricao,
        mecanico_id:        perfil.uid,
        mecanico_nome:      perfil.nome,
        agendamento_id:     undefined,
      })
      await atualizarStatusOrcamento(orc.id, 'convertido', { os_id })
    } finally {
      setConv(null)
    }
  }

  const vencido = (orc: Orcamento) =>
    orc.status === 'enviado' && !isAfter(orc.validade_ate, new Date())

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orçamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orcamentos.length} orçamentos no total</p>
        </div>
        <Link href="/orcamentos/novo" className="btn-primary flex items-center gap-2">
          <Plus size={16} />Novo orçamento
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {([
          { label: 'Rascunhos',  status: 'rascunho',  cor: 'text-gray-600 bg-gray-100'   },
          { label: 'Enviados',   status: 'enviado',   cor: 'text-blue-600 bg-blue-100'   },
          { label: 'Aprovados',  status: 'aprovado',  cor: 'text-green-600 bg-green-100' },
          { label: 'Reprovados', status: 'reprovado', cor: 'text-red-600 bg-red-100'     },
        ] as const).map(k => {
          const qtd = orcamentos.filter(o => o.status === k.status).length
          return (
            <button key={k.status} onClick={() => setFiltro(k.status)}
              className={`card text-center transition hover:shadow-sm ${filtro === k.status ? 'border-orange-300' : ''}`}>
              <div className={`text-2xl font-bold ${k.cor.split(' ')[0]}`}>{qtd}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.label}</div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFiltro('todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filtro === 'todos' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Todos
        </button>
        {Object.entries(STATUS_CFG).map(([s, cfg]) => (
          <button key={s} onClick={() => setFiltro(s as StatusOrcamento)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filtro === s ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {cfg.icon}{cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-14">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : lista.length === 0 ? (
        <div className="card text-center py-14">
          <FileText size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhum orçamento encontrado.</p>
          <Link href="/orcamentos/novo" className="btn-primary mt-4 inline-flex text-sm">
            Criar primeiro orçamento
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map(orc => {
            const venc = vencido(orc)
            return (
              <div key={orc.id} className={`card transition hover:shadow-sm ${venc ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <p className="text-xs font-mono text-gray-400 font-semibold">
                      #{String(orc.numero).padStart(4,'0')}
                    </p>
                    <span className={`${STATUS_CFG[orc.status]?.cls} flex items-center gap-1 mt-1`}>
                      {STATUS_CFG[orc.status]?.icon}
                      {STATUS_CFG[orc.status]?.label}
                    </span>
                    {venc && <span className="badge badge-red mt-1 flex items-center gap-1"><AlertTriangle size={10} />Vencido</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{orc.cliente_nome}</p>
                    <p className="text-xs text-gray-500">{orc.veiculo} — <span className="font-mono">{orc.placa}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{orc.descricao}</p>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                      <span>{format(orc.createdAt, 'dd/MM/yy')}</span>
                      <span>Válido até {format(orc.validade_ate, 'dd/MM/yy')}</span>
                      <span>{orc.itens.length} itens</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-orange-500">{brl(orc.valor_final)}</p>
                    {orc.desconto > 0 && (
                      <p className="text-xs text-gray-400 line-through">{brl(orc.valor_total)}</p>
                    )}
                    <div className="flex gap-1.5 mt-2 justify-end flex-wrap">
                      {(orc.status === 'rascunho' || orc.status === 'enviado') && orc.cliente_whatsapp && (
                        <button onClick={() => handleEnviarWhatsApp(orc)}
                          className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition flex items-center gap-1">
                          <Send size={11} />Enviar
                        </button>
                      )}
                      {orc.status === 'enviado' && (
                        <>
                          <button onClick={() => atualizarStatusOrcamento(orc.id, 'aprovado', { aprovado_em: new Date() })}
                            className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition">
                            ✓ Aprovar
                          </button>
                          <button onClick={() => atualizarStatusOrcamento(orc.id, 'reprovado')}
                            className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-100 transition">
                            ✕ Reprovar
                          </button>
                        </>
                      )}
                      {orc.status === 'aprovado' && !orc.os_id && (
                        <button onClick={() => handleConverter(orc)} disabled={convertendo === orc.id}
                          className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg px-2 py-1 hover:bg-orange-100 transition flex items-center gap-1 disabled:opacity-50">
                          <RotateCcw size={11} />
                          {convertendo === orc.id ? '...' : 'Gerar OS'}
                        </button>
                      )}
                      {orc.os_id && (
                        <Link href={`/os/${orc.os_id}`}
                          className="text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-100 transition flex items-center gap-1">
                          <ArrowRight size={11} />Ver OS
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}