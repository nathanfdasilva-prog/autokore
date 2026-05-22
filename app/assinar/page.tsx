'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { criarClienteAsaas, criarAssinatura, PLANOS_ASAAS } from '@/lib/services/asaas'
import { doc, updateDoc, db } from '@/lib/firebase/firestore'

const PLANOS = [
  {
    id:       'basico' as const,
    nome:     'Básico',
    preco:    'R$97',
    periodo:  '/mês',
    destaque: false,
    recursos: ['OS ilimitadas','Até 2 mecânicos','Clientes e veículos','Agendamentos','Suporte por e-mail'],
  },
  {
    id:       'pro' as const,
    nome:     'Profissional',
    preco:    'R$197',
    periodo:  '/mês',
    destaque: true,
    recursos: ['Tudo do Básico','Até 5 mecânicos','Estoque completo','Relatórios financeiros','NPS e avaliações','Suporte prioritário'],
  },
  {
    id:       'premium' as const,
    nome:     'Premium',
    preco:    'R$297',
    periodo:  '/mês',
    destaque: false,
    recursos: ['Tudo do Pro','Mecânicos ilimitados','Múltiplas unidades','API e integrações','Suporte 24h'],
  },
]

export default function AssinarPage() {
  const { perfil, oficina, loading: authLoading } = useAuth()
  const router              = useRouter()
  const [planoSel,    setPlano]     = useState<'basico' | 'pro' | 'premium'>('pro')
  const [pagamento,   setPagamento] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
  const [loading,     setLoading]   = useState(false)
  const [erro,        setErro]      = useState('')
  const [sucesso,     setSucesso]   = useState(false)

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
        customer:    cliente.id,
        plano:       planoSel,
        billingType: pagamento,
      })

      if (!assinatura.id) throw new Error(assinatura.errors?.[0]?.description ?? 'Erro ao criar assinatura')

      await updateDoc(doc(db, 'oficinas', perfil.oficina_id), {
        plano:            planoSel,
        asaas_id:         cliente.id,
        assinatura_id:    assinatura.id,
        assinatura_ativa: true,
      })

      if (assinatura.invoiceUrl) {
        window.open(assinatura.invoiceUrl, '_blank')
      }

      setSucesso(true)
      setTimeout(() => router.replace('/dashboard'), 3000)

    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Assinatura criada!</h2>
        <p className="text-gray-500">Redirecionando para o dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">AutoKore<span className="text-gray-700 dark:text-gray-300 font-normal">.app</span></h1>
          <p className="text-gray-500 mt-2">Escolha o plano ideal para sua oficina</p>
          {perfil && <p className="text-xs text-gray-400 mt-1">Logado como {perfil.nome} · {oficina?.nome}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PLANOS.map(plano => (
            <button key={plano.id} onClick={() => setPlano(plano.id)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${
                planoSel === plano.id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300'
              }`}>
              {plano.destaque && (
                <span className="text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full mb-3 inline-block">Mais popular</span>
              )}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-orange-500">{plano.preco}</span>
                <span className="text-sm text-gray-400">{plano.periodo}</span>
              </div>
              <p className="font-semibold text-gray-800 dark:text-white mb-3">{plano.nome}</p>
              <ul className="space-y-1.5">
                {plano.recursos.map(r => (
                  <li key={r} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Check size={12} className="text-green-500 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </button>
          ))}
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
            : `Assinar plano ${PLANOS.find(p => p.id === planoSel)?.nome} →`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Pagamento seguro via Asaas · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}