'use client'
// ============================================================
// PÁGINA PÚBLICA DE AVALIAÇÃO — app/avaliar/[os_id]/page.tsx
// Acessada pelo cliente via link enviado após a OS ser concluída.
// URL: /avaliar/{os_id}
// ============================================================

import { use, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { docToData } from '@/lib/firebase/firestore'
import { osJaAvaliada } from '@/lib/hooks/useAvaliacoes'
import AvaliacaoForm from '@/components/avaliacao/AvaliacaoForm'
import type { OrdemServico } from '@/lib/types'

export default function AvaliarPage({
  params,
}: {
  params: Promise<{ os_id: string }>
}) {
  const { os_id }   = use(params)
  const [os,        setOS]        = useState<OrdemServico | null>(null)
  const [jaAvaliada,setJaAvaliada]= useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const snap = await getDoc(doc(db, 'ordens_servico', os_id))
        if (!snap.exists()) { setLoading(false); return }
        const dados = docToData<OrdemServico>(snap)
        setOS(dados)
        const jaFoi = await osJaAvaliada(os_id)
        setJaAvaliada(jaFoi)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [os_id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">
            AutoKore<span className="text-gray-700 font-normal">.app</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Avaliação de serviço</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !os ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Link de avaliação inválido ou expirado.</p>
            </div>
          ) : jaAvaliada ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Você já avaliou este serviço!
              </h3>
              <p className="text-sm text-gray-500">
                Obrigado pelo feedback, {os.cliente_nome.split(' ')[0]}!
              </p>
            </div>
          ) : os.status !== 'concluida' ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                Este serviço ainda não foi concluído.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-800 mb-1">
                Olá, {os.cliente_nome.split(' ')[0]}! 👋
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Seu serviço foi concluído. Compartilhe sua experiência!
              </p>
              <AvaliacaoForm os={os} oficina_id={os.oficina_id} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
