'use client'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Car, Bike, Package, DollarSign, User } from 'lucide-react'
import { useOS, atualizarStatusOS } from '@/lib/hooks/useOS'
import { useAuth } from '@/lib/context/AuthContext'
import {
  BotaoOsConcluida,
  BotaoEnviarOrcamento,
  BotaoWhatsApp,
} from '@/components/whatsapp/BotoesWhatsApp'
import type { StatusOS } from '@/lib/types'

const STATUS_LABELS: Record<StatusOS, string> = {
  aberta: 'Aberta', em_andamento: 'Em andamento',
  aguardando_pecas: 'Aguardando peças', concluida: 'Concluída', cancelada: 'Cancelada',
}
const STATUS_CLS: Record<StatusOS, string> = {
  aberta: 'badge badge-blue', em_andamento: 'badge badge-orange',
  aguardando_pecas: 'badge badge-gray', concluida: 'badge badge-green', cancelada: 'badge badge-red',
}

export default function OSDetalhePage({ params }: { params: { id: string } }) {
  const { id }              = params
  const { os, loading }     = useOS(id)
  const { perfil, isAdmin } = useAuth()

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!os) return <div className="text-center py-20"><p className="text-gray-500">OS não encontrada.</p><Link href="/os" className="btn-primary mt-4 inline-flex">Voltar</Link></div>

  const podeEditar = (os.status === 'aberta' || os.status === 'em_andamento') && (isAdmin || perfil?.uid === os.mecanico_id)
  async function mudarStatus(status: StatusOS) { await atualizarStatusOS(id, status) }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/os" className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">OS #{String(os.numero).padStart(4, '0')}</h1>
            <span className={STATUS_CLS[os.status]}>{STATUS_LABELS[os.status]}</span>
          </div>
          <p className="text-sm text-gray-500">Aberta {format(os.createdAt, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            {os.tipo_veiculo === 'moto' ? <Bike size={16} className="text-orange-500" /> : <Car size={16} className="text-orange-500" />}
            Cliente e Veículo
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
            <div><p className="text-xs text-gray-400">Cliente</p><p className="font-medium text-gray-800">{os.cliente_nome}</p></div>
            <div><p className="text-xs text-gray-400">Veículo</p><p className="font-medium text-gray-800">{os.veiculo}</p></div>
            <div><p className="text-xs text-gray-400">Placa</p><p className="font-mono font-bold text-gray-800">{os.placa}</p></div>
            {os.km_entrada && <div><p className="text-xs text-gray-400">Km</p><p className="font-medium text-gray-800">{os.km_entrada.toLocaleString('pt-BR')} km</p></div>}
          </div>
          {os.cliente_whatsapp && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <BotaoWhatsApp numero={os.cliente_whatsapp} mensagem={`Olá, ${os.cliente_nome}!`} label="Contato direto" variante="icon" />
              {os.valor_total > 0 && os.status !== 'concluida' && <BotaoEnviarOrcamento os={os} oficina_nome="Minha Oficina" />}
              {os.status === 'concluida' && <BotaoOsConcluida os={os} oficina_nome="Minha Oficina" />}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Serviço / Problema</h2>
          <p className="text-sm text-gray-600">{os.descricao_problema}</p>
          {os.observacoes_internas && <div className="mt-3 pt-3 border-t border-gray-100"><p className="text-xs text-gray-400 mb-1">Obs. internas</p><p className="text-sm text-gray-600">{os.observacoes_internas}</p></div>}
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center"><User size={16} className="text-orange-500" /></div>
          <div><p className="text-xs text-gray-400">Mecânico</p><p className="text-sm font-medium text-gray-800">{os.mecanico_nome}</p></div>
          {os.finalizadaAt && <div className="ml-auto text-right"><p className="text-xs text-gray-400">Finalizada em</p><p className="text-sm font-medium text-gray-800">{format(os.finalizadaAt, "dd/MM/yyyy 'às' HH:mm")}</p></div>}
        </div>

        {os.itens.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Package size={16} className="text-orange-500" />Peças</h2>
            <div className="space-y-2">
              {os.itens.map(item => (
                <div key={item.produto_id} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <div><p className="font-medium text-gray-800">{item.nome}</p><p className="text-xs text-gray-400">{item.quantidade} × R${item.preco_unitario.toFixed(2)}</p></div>
                  <p className="font-semibold text-gray-700">R${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {os.valor_total > 0 && (
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

        {podeEditar && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Alterar status</h2>
            <div className="flex flex-wrap gap-2">
              {os.status === 'aberta' && <button onClick={() => mudarStatus('em_andamento')} className="btn-primary text-sm">▶ Iniciar</button>}
              {os.status === 'em_andamento' && <>
                <button onClick={() => mudarStatus('aguardando_pecas')} className="btn-secondary text-sm">⏸ Aguardando peças</button>
                <Link href={`/os/${id}/finalizar`} className="btn-primary text-sm bg-green-600 hover:bg-green-700">✓ Finalizar OS</Link>
              </>}
              {os.status === 'aguardando_pecas' && <button onClick={() => mudarStatus('em_andamento')} className="btn-primary text-sm">▶ Retomar</button>}
              {isAdmin && os.status !== 'concluida' && os.status !== 'cancelada' && (
                <button onClick={() => mudarStatus('cancelada')} className="btn-ghost text-sm text-red-600 border-red-200 hover:bg-red-50">✕ Cancelar OS</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}