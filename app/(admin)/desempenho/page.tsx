'use client'
import { useState } from 'react'
import { subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Trophy, Wrench, DollarSign, Clock, TrendingUp, Package } from 'lucide-react'
import { useDesempenhoMecanicos } from '@/lib/hooks/useMecanicos'
import { useAuth } from '@/lib/context/AuthContext'
import BloqueioPlano from '@/components/plano/BloqueioPlano'

export default function DesempenhoPage() {
  const { temAcesso } = useAuth()

  if (!temAcesso('desempenho')) return <BloqueioPlano recurso="Desempenho da Equipe" planoMin="pro" />

  const [mesRef, setMesRef] = useState(new Date())
  const { metricas, loading } = useDesempenhoMecanicos(mesRef)

  function mesAnterior() { setMesRef(m => subMonths(m, 1)) }
  function mesProximo() {
    const prox = new Date(mesRef)
    prox.setMonth(prox.getMonth() + 1)
    if (prox <= new Date()) setMesRef(prox)
  }
  const isUltimoMes = mesRef.getMonth() === new Date().getMonth() && mesRef.getFullYear() === new Date().getFullYear()

  const totalOSMes = metricas.reduce((s, m) => s + m.os_mes, 0)
  const totalFat   = metricas.reduce((s, m) => s + m.faturamento_gerado, 0)
  const totalConcl = metricas.reduce((s, m) => s + m.os_concluidas, 0)
  const mediaConc  = metricas.length > 0 ? Math.round(metricas.reduce((s, m) => s + m.taxa_conclusao, 0) / metricas.length) : 0

  function formatMin(min: number) {
    if (min <= 0) return '—'
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Desempenho da Equipe</h1>
          <p className="text-sm text-gray-500 mt-0.5">Métricas e ranking dos mecânicos</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <button onClick={mesAnterior} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800 w-32 text-center">
            {format(mesRef, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={mesProximo} disabled={isUltimoMes}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'OS abertas',    val: totalOSMes, icon: <Wrench size={18} />,    cor: 'text-orange-500 bg-orange-50' },
              { label: 'Concluídas',    val: totalConcl, icon: <TrendingUp size={18} />, cor: 'text-green-500 bg-green-50' },
              { label: 'Faturamento',   val: `R$${totalFat.toLocaleString('pt-BR',{minimumFractionDigits:2})}`, icon: <DollarSign size={18} />, cor: 'text-blue-500 bg-blue-50' },
              { label: 'Taxa conclusão',val: `${mediaConc}%`, icon: <Trophy size={18} />, cor: 'text-amber-500 bg-amber-50' },
            ].map(k => (
              <div key={k.label} className="card">
                <div className={`w-9 h-9 rounded-xl ${k.cor} flex items-center justify-center mb-3`}>{k.icon}</div>
                <p className="text-xl font-bold text-gray-800">{k.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {metricas.length === 0 ? (
            <div className="card text-center py-16">
              <Wrench size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum mecânico cadastrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metricas.length >= 2 && (
                <div className="card">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
                    Ranking do mês — {format(mesRef, 'MMMM', { locale: ptBR })}
                  </h2>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(metricas.length, 3)}, 1fr)` }}>
                    {metricas.slice(0, 3).map((m, i) => (
                      <div key={m.uid} className={`rounded-xl p-4 text-center border-2 ${
                        i === 0 ? 'border-amber-300 bg-amber-50' : i === 1 ? 'border-gray-300 bg-gray-50' : 'border-orange-200 bg-orange-50'
                      }`}>
                        <div className="text-3xl mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                        <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${
                          i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-500' : 'bg-orange-400'
                        }`}>
                          {m.nome.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-gray-800">{m.nome.split(' ')[0]}</p>
                        <p className="text-lg font-bold text-orange-500 mt-1">R${m.faturamento_gerado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                        <p className="text-xs text-gray-400">{m.os_concluidas} OS concluídas</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card overflow-x-auto">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Detalhes por mecânico</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">#</th>
                      <th className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">Mecânico</th>
                      <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">OS</th>
                      <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Concluídas</th>
                      <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Taxa</th>
                      <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Tempo médio</th>
                      <th className="text-center text-xs font-semibold text-gray-400 pb-3 pr-4">Peças usadas</th>
                      <th className="text-right text-xs font-semibold text-gray-400 pb-3">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.map((m, i) => (
                      <tr key={m.uid} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'
                          }`}>{i + 1}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
                              {m.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{m.nome}</p>
                              {!m.ativo && <span className="text-[10px] text-gray-400">Inativo</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center text-gray-700 font-medium">{m.os_mes}</td>
                        <td className="py-3 pr-4 text-center text-green-600 font-medium">{m.os_concluidas}</td>
                        <td className="py-3 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${m.taxa_conclusao >= 90 ? 'bg-green-500' : m.taxa_conclusao >= 70 ? 'bg-orange-400' : 'bg-red-400'}`}
                                style={{ width: `${m.taxa_conclusao}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${m.taxa_conclusao >= 90 ? 'text-green-600' : m.taxa_conclusao >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
                              {m.taxa_conclusao}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-center text-gray-600 text-xs">
                          <span className="flex items-center justify-center gap-1"><Clock size={12} className="text-gray-400" />{formatMin(m.tempo_medio_min)}</span>
                        </td>
                        <td className="py-3 pr-4 text-center text-gray-600">
                          <span className="flex items-center justify-center gap-1 text-xs"><Package size={12} className="text-gray-400" />{m.total_pecas_usadas}</span>
                        </td>
                        <td className="py-3 text-right font-bold text-orange-600">
                          R${m.faturamento_gerado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}