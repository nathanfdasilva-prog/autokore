'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Star, MessageSquare, X, Send, TrendingUp } from 'lucide-react'
import { useAvaliacoes, useResumoAvaliacoes, responderAvaliacao, type Avaliacao } from '@/lib/hooks/useAvaliacoes'
import { useAuth } from '@/lib/context/AuthContext'
import BloqueioPlano from '@/components/plano/BloqueioPlano'

export default function AvaliacoesPage() {
  const { temAcesso } = useAuth()

  if (!temAcesso('avaliacoes')) return <BloqueioPlano recurso="Avaliações e NPS" planoMin="pro" />

  const { avaliacoes, loading } = useAvaliacoes(100)
  const { resumo }              = useResumoAvaliacoes()
  const [filtroNota, setFiltroNota] = useState<number | 'todas'>('todas')
  const [modalAv,    setModalAv]    = useState<Avaliacao | null>(null)
  const [resposta,   setResposta]   = useState('')
  const [salvando,   setSalvando]   = useState(false)

  const listagem = avaliacoes.filter(a => filtroNota === 'todas' || a.nota === filtroNota)

  async function handleResponder() {
    if (!modalAv || !resposta.trim()) return
    setSalvando(true)
    try {
      await responderAvaliacao(modalAv.id, resposta)
      setModalAv(null)
      setResposta('')
    } finally {
      setSalvando(false)
    }
  }

  function renderEstrelas(nota: number, size = 14) {
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={size} className={s <= nota ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Avaliações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Satisfação dos clientes e NPS</p>
        </div>
      </div>

      {resumo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />Net Promoter Score (NPS)
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={resumo.nps_score >= 50 ? '#22c55e' : resumo.nps_score >= 0 ? '#f97316' : '#ef4444'}
                    strokeWidth="12"
                    strokeDasharray={`${((resumo.nps_score + 100) / 200) * 251} 251`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${resumo.nps_score >= 50 ? 'text-green-600' : resumo.nps_score >= 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {resumo.nps_score}
                  </span>
                  <span className="text-[10px] text-gray-400">NPS</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Promotores (9-10)</span>
                  <span className="font-semibold text-green-600">{resumo.promotores}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Neutros (7-8)</span>
                  <span className="font-semibold text-amber-500">{resumo.neutros}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Detratores (0-6)</span>
                  <span className="font-semibold text-red-500">{resumo.detratores}</span>
                </div>
                <div className="pt-1 border-t border-gray-100 text-xs text-gray-400">
                  {resumo.total} avaliações · Média {resumo.media_estrelas}★
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Star size={16} className="text-amber-400 fill-amber-400" />Distribuição de notas
            </h2>
            <div className="space-y-2">
              {([5,4,3,2,1] as const).map(n => {
                const qtd = resumo.distribuicao[n] ?? 0
                const pct = resumo.total > 0 ? (qtd / resumo.total) * 100 : 0
                return (
                  <div key={n} className="flex items-center gap-2 text-sm">
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{qtd}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFiltroNota('todas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filtroNota === 'todas' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Todas
        </button>
        {[5,4,3,2,1].map(n => (
          <button key={n} onClick={() => setFiltroNota(n)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filtroNota === n ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {n}<Star size={11} className={filtroNota === n ? 'fill-white text-white' : 'text-amber-400 fill-amber-400'} />
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listagem.length === 0 ? (
        <div className="card text-center py-14">
          <Star size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhuma avaliação ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listagem.map(av => (
            <div key={av.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{av.cliente_nome}</p>
                    {renderEstrelas(av.nota)}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${av.nps >= 9 ? 'bg-green-100 text-green-700' : av.nps >= 7 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                      NPS {av.nps}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{av.veiculo} · {av.mecanico_nome}</p>
                  {av.comentario && <p className="text-sm text-gray-600 mt-2 italic">"{av.comentario}"</p>}
                  {av.respondido && av.resposta && (
                    <div className="mt-2 pl-3 border-l-2 border-orange-300">
                      <p className="text-xs text-gray-500 font-medium">Sua resposta:</p>
                      <p className="text-xs text-gray-600">{av.resposta}</p>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{format(av.createdAt, "dd/MM/yy", { locale: ptBR })}</p>
                  {!av.respondido && av.comentario && (
                    <button onClick={() => { setModalAv(av); setResposta('') }}
                      className="mt-1 flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition">
                      <MessageSquare size={12} />Responder
                    </button>
                  )}
                  {av.respondido && <span className="text-xs text-green-600 flex items-center gap-1 justify-end mt-1">✓ Respondido</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800">Responder avaliação</h2>
              <button onClick={() => setModalAv(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <p className="font-medium text-gray-800">{modalAv.cliente_nome}</p>
              {renderEstrelas(modalAv.nota)}
              {modalAv.comentario && <p className="text-gray-500 text-xs mt-1 italic">"{modalAv.comentario}"</p>}
            </div>
            <textarea value={resposta} onChange={e => setResposta(e.target.value)} rows={3}
              placeholder="Escreva sua resposta ao cliente..." className="input-base resize-none" />
            <div className="flex gap-3 mt-3">
              <button onClick={() => setModalAv(null)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={handleResponder} disabled={salvando || !resposta.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Send size={14} />{salvando ? 'Enviando...' : 'Responder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}