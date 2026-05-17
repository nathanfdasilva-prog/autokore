'use client'
// ============================================================
// RECUPERAR SENHA — app/(auth)/recuperar-senha/page.tsx
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { recuperarSenha } from '@/lib/firebase/auth'

export default function RecuperarSenhaPage() {
  const [email,   setEmail]   = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState('')

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await recuperarSenha(email)
      setEnviado(true)
    } catch (err: any) {
      setErro(
        err.code === 'auth/user-not-found'
          ? 'Nenhuma conta encontrada com este e-mail.'
          : 'Erro ao enviar. Tente novamente.'
      )
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
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {enviado ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-base font-semibold text-gray-800 mb-2">E-mail enviado!</h2>
              <p className="text-sm text-gray-500 mb-4">
                Verifique sua caixa de entrada em <strong>{email}</strong> e siga as instruções.
              </p>
              <Link href="/login" className="btn-primary text-sm">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Recuperar senha</h2>
              <p className="text-sm text-gray-500 mb-5">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleEnviar} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="input-base"
                  />
                </div>
                {erro && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {erro}
                  </p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-xs text-gray-500 hover:text-gray-700">
                  ← Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
