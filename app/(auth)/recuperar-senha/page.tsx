'use client'
import { useState } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export default function RecuperarSenhaPage() {
  const [email,   setEmail]   = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setEnviado(true)
    } catch (e: any) {
      const erros: Record<string, string> = {
        'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
        'auth/invalid-email':  'E-mail inválido.',
      }
      setErro(erros[e.code] ?? 'Erro ao enviar. Tente novamente.')
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
          <p className="text-sm text-gray-500 mt-1">Recuperar acesso</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {enviado ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-base font-semibold text-gray-800 mb-2">E-mail enviado!</h2>
              <p className="text-sm text-gray-500 mb-5">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link href="/login" className="text-orange-500 hover:underline text-sm">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Recuperar senha</h2>
              <p className="text-xs text-gray-500 mb-5">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleEnviar} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>

                {erro && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-4">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-orange-500 hover:underline">Voltar ao login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}