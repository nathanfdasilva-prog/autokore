'use client'
// ============================================================
// CONFIGURAÇÕES — app/(mecanico)/configuracoes/page.tsx
// Perfil do usuário e dados da oficina (admin).
// ============================================================

import { useState, useEffect } from 'react'
import { Save, User, Building, Lock } from 'lucide-react'
import {
  doc, updateDoc, getDoc,
  serverTimestamp, db,
} from '@/lib/firebase/firestore'
import { recuperarSenha } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/context/AuthContext'
import type { Oficina } from '@/lib/types'

export default function ConfiguracoesPage() {
  const { perfil, isAdmin } = useAuth()

  // Perfil
  const [nomeUsuario, setNomeUsuario] = useState(perfil?.nome ?? '')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState('')

  // Oficina (apenas admin)
  const [oficina, setOficina] = useState<Partial<Oficina>>({})
  const [salvandoOficina, setSalvandoOficina] = useState(false)
  const [msgOficina, setMsgOficina] = useState('')

  // Carrega dados da oficina
  useEffect(() => {
    if (!isAdmin || !perfil?.oficina_id) return
    getDoc(doc(db, 'oficinas', perfil.oficina_id)).then(snap => {
      if (snap.exists()) setOficina(snap.data() as Oficina)
    })
  }, [isAdmin, perfil?.oficina_id])

  async function salvarPerfil() {
    if (!perfil) return
    setSalvandoPerfil(true)
    setMsgPerfil('')
    try {
      await updateDoc(doc(db, 'users', perfil.uid), {
        nome: nomeUsuario,
        updatedAt: serverTimestamp(),
      })
      setMsgPerfil('✓ Perfil atualizado com sucesso!')
    } catch {
      setMsgPerfil('Erro ao salvar. Tente novamente.')
    } finally {
      setSalvandoPerfil(false)
    }
  }

  async function salvarOficina() {
    if (!perfil?.oficina_id) return
    setSalvandoOficina(true)
    setMsgOficina('')
    try {
      await updateDoc(doc(db, 'oficinas', perfil.oficina_id), {
        ...oficina,
        updatedAt: serverTimestamp(),
      })
      setMsgOficina('✓ Dados da oficina atualizados!')
    } catch {
      setMsgOficina('Erro ao salvar.')
    } finally {
      setSalvandoOficina(false)
    }
  }

  async function enviarRedefinicao() {
    if (!perfil?.email) return
    await recuperarSenha(perfil.email)
    alert(`E-mail de redefinição enviado para ${perfil.email}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie seu perfil e dados da oficina</p>
      </div>

      {/* Perfil do usuário */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <User size={16} className="text-orange-500" />
          Meu perfil
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {perfil?.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{perfil?.nome}</p>
            <p className="text-sm text-gray-500">{perfil?.email}</p>
            <span className={`badge mt-1 ${perfil?.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>
              {perfil?.role === 'admin' ? 'Administrador' : 'Mecânico'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
            <input
              value={nomeUsuario}
              onChange={e => setNomeUsuario(e.target.value)}
              className="input-base"
            />
          </div>
          {msgPerfil && (
            <p className={`text-xs ${msgPerfil.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {msgPerfil}
            </p>
          )}
          <button
            onClick={salvarPerfil}
            disabled={salvandoPerfil}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={15} />
            {salvandoPerfil ? 'Salvando...' : 'Salvar nome'}
          </button>
        </div>
      </div>

      {/* Segurança */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-orange-500" />
          Segurança
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Enviaremos um e-mail para <strong>{perfil?.email}</strong> com o link para redefinir sua senha.
        </p>
        <button onClick={enviarRedefinicao} className="btn-ghost text-sm">
          Enviar link de redefinição de senha
        </button>
      </div>

      {/* Dados da oficina — somente admin */}
      {isAdmin && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Building size={16} className="text-orange-500" />
            Dados da oficina
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome da oficina</label>
              <input
                value={oficina.nome ?? ''}
                onChange={e => setOficina(o => ({ ...o, nome: e.target.value }))}
                className="input-base"
                placeholder="Oficina do Zé"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CNPJ</label>
                <input
                  value={oficina.cnpj ?? ''}
                  onChange={e => setOficina(o => ({ ...o, cnpj: e.target.value }))}
                  className="input-base"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
                <input
                  value={oficina.whatsapp ?? ''}
                  onChange={e => setOficina(o => ({ ...o, whatsapp: e.target.value }))}
                  className="input-base"
                  placeholder="(69) 9 9900-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
              <input
                value={oficina.endereco ?? ''}
                onChange={e => setOficina(o => ({ ...o, endereco: e.target.value }))}
                className="input-base"
                placeholder="Rua das Palmeiras, 420 — Rolim de Moura/RO"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-gray-500">
                  Plano atual:{' '}
                  <strong className="text-orange-500 capitalize">{oficina.plano}</strong>
                </p>
              </div>
              {msgOficina && (
                <p className={`text-xs ${msgOficina.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {msgOficina}
                </p>
              )}
            </div>
            <button
              onClick={salvarOficina}
              disabled={salvandoOficina}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={15} />
              {salvandoOficina ? 'Salvando...' : 'Salvar dados da oficina'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
