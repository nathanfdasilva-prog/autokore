'use client'
// ============================================================
// FORMULÁRIO DE AVALIAÇÃO — components/avaliacao/AvaliacaoForm.tsx
// Estrelas + NPS + comentário. Enviado pelo cliente ou mecânico.
// ============================================================

import { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import { registrarAvaliacao } from '@/lib/hooks/useAvaliacoes'
import type { OrdemServico } from '@/lib/types'

interface AvaliacaoFormProps {
  os:          OrdemServico
  oficina_id:  string
  onClose?:    () => void
}

const NPS_LABELS: Record<number, string> = {
  0: 'Péssimo', 1: 'Péssimo', 2: 'Muito ruim', 3: 'Ruim',
  4: 'Ruim', 5: 'Regular', 6: 'Regular',
  7: 'Bom', 8: 'Muito bom', 9: 'Ótimo', 10: 'Excelente!',
}
const NPS_COLOR: Record<number, string> = {
  0:'text-red-500',1:'text-red-500',2:'text-red-500',3:'text-red-400',
  4:'text-red-400',5:'text-amber-500',6:'text-amber-500',
  7:'text-green-500',8:'text-green-500',9:'text-green-600',10:'text-green-600',
}

export default function AvaliacaoForm({ os, oficina_id, onClose }: AvaliacaoFormProps) {
  const [nota,       setNota]       = useState(0)
  const [notaHover,  setNotaHover]  = useState(0)
  const [nps,        setNps]        = useState(-1)
  const [comentario, setComentario] = useState('')
  const [salvando,   setSalvando]   = useState(false)
  const [sucesso,    setSucesso]    = useState(false)
  const [erro,       setErro]       = useState('')

  async function handleEnviar() {
    setErro('')
    if (nota === 0) return setErro('Por favor, dê uma nota em estrelas.')
    if (nps < 0)   return setErro('Por favor, responda a pergunta de recomendação.')
    setSalvando(true)
    try {
      await registrarAvaliacao({
        oficina_id,
        os_id:         os.id,
        cliente_nome:  os.cliente_nome,
        veiculo:       `${os.veiculo} — ${os.placa}`,
        nota,
        nps,
        comentario,
        mecanico_id:   os.mecanico_id,
        mecanico_nome: os.mecanico_nome,
      })
      setSucesso(true)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Obrigado pela avaliação!</h3>
        <p className="text-sm text-gray-500 mb-4">
          Sua opinião é muito importante para nós, {os.cliente_nome.split(' ')[0]}!
        </p>
        <div className="flex justify-center gap-1 mb-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={24} className={s <= nota ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
          ))}
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-primary mt-5 mx-auto">
            Fechar
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5 p-1">
      {/* Info OS */}
      <div className="bg-gray-50 rounded-xl p-3 text-sm">
        <p className="font-semibold text-gray-800">{os.veiculo} — {os.placa}</p>
        <p className="text-gray-500 text-xs mt-0.5">{os.descricao_problema}</p>
        <p className="text-gray-400 text-xs mt-0.5">Mecânico: {os.mecanico_nome}</p>
      </div>

      {/* Estrelas */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Como você avalia o serviço? <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setNotaHover(s)}
              onMouseLeave={() => setNotaHover(0)}
              onClick={() => setNota(s)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={`transition-colors ${
                  s <= (notaHover || nota)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {nota > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {nota === 1 ? 'Muito ruim' : nota === 2 ? 'Ruim' : nota === 3 ? 'Regular' : nota === 4 ? 'Bom' : 'Excelente!'}
          </p>
        )}
      </div>

      {/* NPS */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          De 0 a 10, qual a chance de recomendar nossa oficina? <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-400 mb-2">0 = Não recomendaria · 10 = Recomendaria com certeza</p>
        <div className="flex gap-1 flex-wrap">
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setNps(n)}
              className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all ${
                nps === n
                  ? n >= 9 ? 'bg-green-500 border-green-500 text-white'
                  : n >= 7 ? 'bg-amber-400 border-amber-400 text-white'
                  :          'bg-red-400 border-red-400 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {nps >= 0 && (
          <p className={`text-xs font-medium mt-1.5 ${NPS_COLOR[nps] ?? 'text-gray-500'}`}>
            {NPS_LABELS[nps]}
          </p>
        )}
      </div>

      {/* Comentário */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Comentário (opcional)
        </label>
        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Conte como foi a experiência, o que podemos melhorar..."
          className="input-base resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">{comentario.length}/500</p>
      </div>

      {erro && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <button
        onClick={handleEnviar}
        disabled={salvando}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        {salvando ? 'Enviando...' : 'Enviar avaliação ⭐'}
      </button>
    </div>
  )
}
