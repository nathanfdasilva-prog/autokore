'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome:          '',
    email:         '',
    senha:         '',
    confirma:      '',
    oficina_nome:  '',
    whatsapp:      '',
  })
  const [erro,     setErro]     = useState('')
  const [loading,  setLoading]  = useState(false)

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim())         return setErro('Nome é obrigatório.')
    if (!form.oficina_nome.trim()) return setErro('Nome da oficina é obrigatório.')
    if (!form.whatsapp.trim())     return setErro('WhatsApp é obrigatório.')
    if (form.senha.length < 6)     return setErro('A senha deve ter pelo menos 6 caracteres.')
    if (form.senha !== form.confirma) return setErro('As senhas não coincidem.')

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha)
      await updateProfile(cred.user, { displayName: form.nome })

      const oficinaRef = await addDoc(collection(db, 'oficinas'), {
        nome:      form.oficina_nome,
        whatsapp:  form.whatsapp.replace(/\D/g, ''),
        plano:     'basico',
        dono_uid:  cred.user.uid,
        ativo:     true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await setDoc(doc(db, 'users', cred.user.uid), {
        uid:        cred.user.uid,
        nome:       form.nome,
        email:      form.email,
        role:       'admin',
        oficina_id: oficinaRef.id,
        ativo:      true,
        createdAt:  serverTimestamp(),
      })

      router.replace('/dashboard')
    } catch (e: any) {
      const erros: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/invalid-email':        'E-mail inválido.',
        'auth/weak-password':        'Senha muito fraca.',
      }
      setErro(erros[e.code] ?? 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">
            AutoKore<span className="text-gray-700 font-normal">.app</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Crie sua conta gratuitamente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Criar conta</h2>

          <form onSubmit={handleRegistro} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Seu nome completo</label>
              <input value={form.nome} onChange={e => setField('nome', e.target.value)}
                placeholder="João Silva" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome da oficina</label>
              <input value={form.oficina_nome} onChange={e => setField('oficina_nome', e.target.value)}
                placeholder="Auto Center Silva" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp da oficina</label>
              <input value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)}
                placeholder="(69) 9 9999-9999" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                placeholder="seu@email.com" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
              <input type="password" value={form.senha} onChange={e => setField('senha', e.target.value)}
                placeholder="Mínimo 6 caracteres" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar senha</label>
              <input type="password" value={form.confirma} onChange={e => setField('confirma', e.target.value)}
                placeholder="Repita a senha" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
            </div>

            {erro && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50 mt-2">
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-orange-500 hover:underline">Entrar</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Ao criar uma conta você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  )
}