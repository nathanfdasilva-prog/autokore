'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Building, Star, CheckCircle, ChevronRight } from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import type { Role, Plano } from '@/lib/types'

type Etapa = 'conta' | 'oficina' | 'plano' | 'sucesso'

const PLANOS: { id: Plano; nome: string; preco: string; periodo: string; destaque: boolean; recursos: string[]; limite: string }[] = [
  {
    id: 'basico', nome: 'Grátis', preco: 'R$0', periodo: '', destaque: false, limite: '1 usuário',
    recursos: ['Até 30 OS por mês','Clientes e veículos','Agendamentos básicos','Suporte por e-mail'],
  },
  {
    id: 'pro', nome: 'Profissional', preco: 'R$97', periodo: '/mês', destaque: true, limite: 'Até 5 mecânicos',
    recursos: ['OS ilimitadas','Estoque completo','Relatórios financeiros','NPS e avaliações','Suporte prioritário'],
  },
  {
    id: 'premium', nome: 'Rede', preco: 'R$247', periodo: '/mês', destaque: false, limite: 'Mecânicos ilimitados',
    recursos: ['Tudo do Pro','Múltiplas unidades','API e integrações','Relatórios avançados','Suporte 24h'],
  },
]

export default function RegistroPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<Etapa>('conta')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [conta, setConta] = useState({ nome: '', email: '', senha: '', confirmaSenha: '' })
  const [oficina, setOficina] = useState({
    nome: '', whatsapp: '', cidade: '', estado: 'RO', cnpj: '',
    tipo: 'carros_e_motos' as 'carros' | 'motos' | 'carros_e_motos',
  })
  const [planoSelecionado, setPlano] = useState<Plano>('basico')

  async function handleConta() {
    setErro('')
    if (!conta.nome.trim())   return setErro('Nome é obrigatório.')
    if (!conta.email.trim())  return setErro('E-mail é obrigatório.')
    if (conta.senha.length < 6) return setErro('Senha deve ter pelo menos 6 caracteres.')
    if (conta.senha !== conta.confirmaSenha) return setErro('As senhas não coincidem.')
    setEtapa('oficina')
  }

  function handleOficina() {
    setErro('')
    if (!oficina.nome.trim())     return setErro('Nome da oficina é obrigatório.')
    if (!oficina.whatsapp.trim()) return setErro('WhatsApp é obrigatório.')
    setEtapa('plano')
  }

  async function handleFinalizar() {
    setErro('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, conta.email, conta.senha)
      await updateProfile(cred.user, { displayName: conta.nome })

      const oficinRef = doc(db, 'oficinas', `oficina_${cred.user.uid}`)
      await setDoc(oficinRef, {
        id: oficinRef.id, nome: oficina.nome, cnpj: oficina.cnpj,
        whatsapp: oficina.whatsapp, endereco: `${oficina.cidade} / ${oficina.estado}`,
        plano: planoSelecionado, dono_uid: cred.user.uid, ativo: true,
        assinatura_ativa: true, createdAt: serverTimestamp(),
      })

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid, nome: conta.nome, email: conta.email,
        role: 'admin' as Role, oficina_id: oficinRef.id,
        ativo: true, avatar_url: '', createdAt: serverTimestamp(),
      })

      setEtapa('sucesso')
    } catch (e: any) {
      const msgs: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/weak-password': 'Senha muito fraca.',
        'auth/invalid-email': 'E-mail inválido.',
      }
      setErro(msgs[e.code] ?? 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const etapas: Etapa[] = ['conta', 'oficina', 'plano']
  const etapaIdx = etapas.indexOf(etapa)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-orange-500">AutoKore<span className="text-gray-700 font-normal">.app</span></h1>
          <p className="text-sm text-gray-500 mt-1">Crie sua conta gratuitamente — acesso completo na fase beta</p>
        </div>

        {etapa !== 'sucesso' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {(['conta', 'oficina', 'plano'] as const).map((e, i) => (
              <div key={e} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < etapaIdx ? 'bg-green-500 border-green-500 text-white' :
                  i === etapaIdx ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {i < etapaIdx ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === etapaIdx ? 'text-gray-800' : 'text-gray-400'}`}>
                  {e === 'conta' ? 'Sua conta' : e === 'oficina' ? 'Oficina' : 'Plano'}
                </span>
                {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
              </div>
            ))}
          </div>
        )}

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{erro}</div>
        )}

        {etapa === 'conta' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-orange-500" />Crie sua conta de administrador
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Seu nome *</label>
                <input value={conta.nome} onChange={e => setConta(c => ({ ...c, nome: e.target.value }))} placeholder="João Silva" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail *</label>
                <input type="email" value={conta.email} onChange={e => setConta(c => ({ ...c, email: e.target.value }))} placeholder="joao@oficina.com" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Senha *</label>
                <input type="password" value={conta.senha} onChange={e => setConta(c => ({ ...c, senha: e.target.value }))} placeholder="Mínimo 6 caracteres" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar senha *</label>
                <input type="password" value={conta.confirmaSenha} onChange={e => setConta(c => ({ ...c, confirmaSenha: e.target.value }))} placeholder="Repita a senha" className="input-base" />
                {conta.confirmaSenha && conta.senha !== conta.confirmaSenha && (
                  <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                )}
                {conta.confirmaSenha && conta.senha === conta.confirmaSenha && (
                  <p className="text-xs text-green-500 mt-1">✓ Senhas coincidem</p>
                )}
              </div>
            </div>
            <button onClick={handleConta} className="btn-primary w-full justify-center mt-4">Continuar →</button>
            <p className="text-center text-xs text-gray-500 mt-3">
              Já tem conta? <Link href="/login" className="text-orange-500 hover:underline">Entrar</Link>
            </p>
          </div>
        )}

        {etapa === 'oficina' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building size={18} className="text-orange-500" />Dados da sua oficina
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome da oficina *</label>
                <input value={oficina.nome} onChange={e => setOficina(o => ({ ...o, nome: e.target.value }))} placeholder="Oficina do João" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp da oficina *</label>
                <input value={oficina.whatsapp} onChange={e => setOficina(o => ({ ...o, whatsapp: e.target.value }))} placeholder="(69) 9 9900-0000" className="input-base" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                  <input value={oficina.cidade} onChange={e => setOficina(o => ({ ...o, cidade: e.target.value }))} placeholder="Cacoal" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                  <select value={oficina.estado} onChange={e => setOficina(o => ({ ...o, estado: e.target.value }))} className="input-base">
                    {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CNPJ (opcional)</label>
                <input value={oficina.cnpj} onChange={e => setOficina(o => ({ ...o, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Tipo de veículo atendido</label>
                <div className="flex gap-2">
                  {([
                    { val: 'carros', label: '🚗 Carros' },
                    { val: 'motos', label: '🏍 Motos' },
                    { val: 'carros_e_motos', label: '🚗🏍 Ambos' },
                  ] as const).map(t => (
                    <button key={t.val} type="button" onClick={() => setOficina(o => ({ ...o, tipo: t.val }))}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition ${oficina.tipo === t.val ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEtapa('conta')} className="btn-ghost flex-1">← Voltar</button>
              <button onClick={handleOficina} className="btn-primary flex-1">Continuar →</button>
            </div>
          </div>
        )}

        {etapa === 'plano' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Star size={18} className="text-orange-500" />Escolha seu plano
            </h2>
            <p className="text-xs text-gray-500 mb-4">Durante o período beta todos os planos têm acesso completo gratuitamente.</p>
            <div className="space-y-3 mb-5">
              {PLANOS.map(plano => (
                <button key={plano.id} type="button" onClick={() => setPlano(plano.id)}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all ${planoSelecionado === plano.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${planoSelecionado === plano.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {planoSelecionado === plano.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="font-bold text-gray-800">{plano.nome}</span>
                      {plano.destaque && <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-500">{plano.preco}</span>
                      <span className="text-xs text-gray-400">{plano.periodo}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 ml-6">{plano.limite}</p>
                  <div className="ml-6 grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {plano.recursos.map(r => (
                      <p key={r} className="text-xs text-gray-600 flex items-center gap-1"><span className="text-green-500">✓</span>{r}</p>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-blue-700">🎉 <strong>Fase Beta:</strong> Você terá acesso completo independente do plano escolhido. Você será avisado antes de qualquer cobrança.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEtapa('oficina')} className="btn-ghost flex-1">← Voltar</button>
              <button onClick={handleFinalizar} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Criando sua conta...' : 'Começar grátis 🚀'}
              </button>
            </div>
          </div>
        )}

        {etapa === 'sucesso' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sua oficina está pronta! 🎉</h2>
            <p className="text-sm text-gray-500 mb-1">Bem-vindo ao AutoKore, <strong>{conta.nome}</strong>!</p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{oficina.nome}</strong> foi criada com acesso completo na fase beta.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-orange-700 mb-2">Próximos passos sugeridos:</p>
              <div className="space-y-1.5">
                {['Cadastre seus mecânicos em Equipe','Adicione as peças do estoque','Crie o primeiro agendamento','Abra sua primeira Ordem de Serviço'].map((p, i) => (
                  <p key={i} className="text-xs text-orange-600 flex items-center gap-2">
                    <span className="w-4 h-4 bg-orange-200 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">{i + 1}</span>
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <button onClick={() => router.replace('/dashboard')} className="btn-primary w-full justify-center py-3 text-base">
              Ir para o Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}