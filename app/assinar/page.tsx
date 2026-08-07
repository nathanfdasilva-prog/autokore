'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader, Clock } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { criarClienteAsaas, criarAssinatura } from '@/lib/services/asaas'
import { doc, updateDoc, db } from '@/lib/firebase/firestore'

const PLANO = {
  nome:     'Profissional',
  preco:    'R$97',
  periodo:  '/mês',
  recursos: ['OS ilimitadas','Até 5 mecânicos','Estoque completo','Relatórios financeiros','NPS e avaliações','Suporte prioritário'],
}

export default function AssinarPage() {
  const { perfil, oficina, loading: authLoading } = useAuth()
  const router              = useRouter()
  const [pagamento,   setPagamento] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
  const [loading,     setLoading]   = useState(false)
  const [erro,        setErro]      = useState('')
  const [pendente,    setPendente]  = useState(false)
  const [linkPagamento, setLinkPagamento] = useState('')

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!perfil) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Você precisa estar logado para assinar.</p>
        <a href="/login" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium">Fazer login</a>
      </div>
    </div>
  )

  async function handleAssinar() {
    if (!perfil) return
    setLoading(true)
    setErro('')

    try {
      const cliente = await criarClienteAsaas({
        name:        oficina?.nome ?? perfil.nome,
        mobilePhone: oficina?.whatsapp,
        email:       perfil.email,
        cpfCnpj:     oficina?.cnpj,
      })

      if (!cliente.id) throw new Error(cliente.errors?.[0]?.description ?? 'Erro ao criar cliente no Asaas')

      const assinatura = await criarAssinatura({
        customer:          cliente.id,
        plano:             'pro',
        billingType:       pagamento,
        externalReference: perfil.oficina_id,
      })

      if (!assinatura.id) throw new Error(assinatura.errors?.[0]?.description ?? 'Erro ao criar assinatura')

      // IMPORTANTE: NÃO marcamos assinatura_ativa aqui.
      // Isso só acontece quando o webhook do Asaas confirma o pagamento de verdade.
      await updateDoc(doc(db, 'oficinas', perfil.oficina_id), {
        plano:            'pro',
        asaas_id:         cliente.id,
        assinatura_id:    assinatura.id,
      })

      if (assinatura.invoiceUrl) {
        setLinkPagamento(assinatura.invoiceUrl)
        window.open(assinatura.invoiceUrl, '_blank')
      }

      setPendente(true)

    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (pendente) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Aguardando pagamento</h2>
        <p className="text-gray-500 text-sm mb-4">
          Assim que o pagamento for confirmado, seu plano é ativado automaticamente — geralmente em poucos minutos (PIX) ou até 1-2 dias úteis (boleto).
        </p>
        {linkPagamento && (
          <a href={linkPagamento} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm mb-3">
            Ver cobrança novamente
          </a>
        )}
        <div>
          <button onClick={() => router.replace('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Voltar para o dashboard
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">AutoKore<span className="text-gray-700 dark:text-gray-300 font-normal">.app</span></h1>
          <p className="text-gray-500 mt-2">Continue com acesso completo</p>
          {perfil && <p className="text-xs text-gray-400 mt-1">Logado como {perfil.nome} · {oficina?.nome}</p>}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-orange-500 p-5 mb-5">
          <span className="text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full mb-3 inline-block">Plano Profissional</span>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold text-orange-500">{PLANO.preco}</span>
            <span className="text-sm text-gray-400">{PLANO.periodo}</span>
          </div>
          <ul className="space-y-1.5">
            {PLANO.recursos.map(r => (
              <li key={r} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Check size={12} className="text-green-500 flex-shrink-0" />{r}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Forma de pagamento</p>
          <div className="flex gap-3">
            {([
              { val: 'PIX',         label: '💸 PIX' },
              { val: 'CREDIT_CARD', label: '💳 Cartão' },
              { val: 'BOLETO',      label: '📄 Boleto' },
            ] as const).map(p => (
              <button key={p.val} onClick={() => setPagamento(p.val)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition ${
                  pagamento === p.val
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30 text-orange-700'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {erro && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{erro}</p>
        )}

        <button onClick={handleAssinar} disabled={loading}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-2 text-base">
          {loading
            ? <><Loader size={18} className="animate-spin" />Processando...</>
            : `Assinar plano Profissional →`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Pagamento seguro via Asaas · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}