'use client'
// ============================================================
// PAINEL DA REDE — app/(admin)/rede/page.tsx
// Visão consolidada para donos de múltiplas oficinas (Premium).
// ============================================================

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Building2, TrendingUp, DollarSign,
  ClipboardList, Users, Plus, Star,
  AlertCircle, ChevronRight,
} from 'lucide-react'
import { useOficinasRede, useKPIRede } from '@/lib/hooks/useRede'
import { useAuth } from '@/lib/context/AuthContext'
import type { Oficina } from '@/lib/types'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function RedePage() {
  const { perfil }           = useAuth()
  const { oficinas, loading } = useOficinasRede()
  const ids                  = oficinas.map(o => o.id)
  const { kpis }             = useKPIRede(ids)
  const [oficinaSel, setSel] = useState<Oficina | null>(null)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel da Rede</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visão consolidada de todas as suas oficinas
            {' · '}{format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />Adicionar unidade
        </button>
      </div>

      {/* Badge Premium */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5">
        <Star size={16} className="text-amber-500 fill-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          <strong>Plano Premium</strong> — Multi-unidades ativo.
          Você está gerenciando <strong>{oficinas.length}</strong> oficinas consolidadas neste painel.
        </p>
      </div>

      {/* KPIs consolidados */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Unidades ativas',  val: kpis.total_oficinas, icon: <Building2   size={20} />, cor: 'text-orange-500 bg-orange-50' },
            { label: 'OS ativas (rede)', val: kpis.os_ativas,      icon: <ClipboardList size={20} />, cor: 'text-blue-500 bg-blue-50' },
            { label: 'OS este mês',      val: kpis.os_mes,         icon: <TrendingUp  size={20} />, cor: 'text-green-500 bg-green-50' },
            { label: 'Faturamento mês',  val: brl(kpis.faturamento_mes), icon: <DollarSign size={20} />, cor: 'text-green-500 bg-green-50' },
          ].map(k => (
            <div key={k.label} className="card">
              <div className={`w-9 h-9 rounded-xl ${k.cor} flex items-center justify-center mb-3`}>
                {k.icon}
              </div>
              <p className="text-xl font-bold text-gray-800">{k.val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lista de unidades */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Unidades da rede</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : oficinas.length === 0 ? (
            <div className="card text-center py-10 border-dashed">
              <Building2 size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-3">
                Nenhuma unidade vinculada.
              </p>
              <p className="text-xs text-gray-400">
                Para adicionar uma oficina à rede, ela precisa estar no plano Pro ou Premium.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {oficinas.map(of => (
                <button key={of.id} onClick={() => setSel(of)}
                  className={`w-full text-left card hover:border-orange-200 hover:shadow-sm transition-all ${oficinaSel?.id === of.id ? 'border-orange-400 bg-orange-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                      {of.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{of.nome}</p>
                      <p className="text-xs text-gray-400 truncate">{of.endereco ?? 'Endereço não informado'}</p>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        of.plano === 'premium' ? 'bg-amber-100 text-amber-700' :
                        of.plano === 'pro'     ? 'bg-orange-100 text-orange-700' :
                                                 'bg-gray-100 text-gray-600'
                      }`}>
                        {of.plano}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhe da unidade selecionada */}
        <div className="lg:col-span-2">
          {!oficinaSel ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center border-dashed h-full">
              <Building2 size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">
                Selecione uma unidade para ver os detalhes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{oficinaSel.nome}</h2>
                    <p className="text-sm text-gray-500">{oficinaSel.endereco}</p>
                  </div>
                  <span className={`badge ${
                    oficinaSel.plano === 'premium' ? 'badge-orange' :
                    oficinaSel.plano === 'pro'     ? 'badge-blue'   : 'badge-gray'
                  } capitalize`}>
                    {oficinaSel.plano}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">WhatsApp</p>
                    <p className="font-medium">{oficinaSel.whatsapp ?? '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">CNPJ</p>
                    <p className="font-medium">{oficinaSel.cnpj ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Acesso rápido</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Ver OS ativas',    href: '/os',          icon: <ClipboardList size={15} /> },
                    { label: 'Ver agendamentos', href: '/agendamentos', icon: <Building2     size={15} /> },
                    { label: 'Ver estoque',      href: '/estoque',      icon: <DollarSign    size={15} /> },
                    { label: 'Ver faturamento',  href: '/faturamento',  icon: <TrendingUp    size={15} /> },
                  ].map(a => (
                    <a key={a.label} href={a.href}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2.5 transition">
                      <span className="text-orange-400">{a.icon}</span>{a.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Alerta informativo */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>
                  Para acessar o sistema completo desta unidade, entre com as credenciais
                  do administrador da unidade. O painel consolidado mostra apenas
                  os KPIs agregados.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
