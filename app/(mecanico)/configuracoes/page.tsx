'use client'
import { useState, useEffect, useRef } from 'react'
import { Save, User, Building, Lock, Camera, Loader } from 'lucide-react'
import {
  doc, updateDoc, getDoc,
  serverTimestamp, db,
} from '@/lib/firebase/firestore'
import { recuperarSenha } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/context/AuthContext'
import { storage } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { Oficina } from '@/lib/types'

export default function ConfiguracoesPage() {
  const { perfil, isAdmin } = useAuth()

  const [nomeUsuario,    setNomeUsuario]    = useState(perfil?.nome ?? '')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [msgPerfil,      setMsgPerfil]      = useState('')
  const [avatarUrl,      setAvatarUrl]      = useState(perfil?.avatar_url ?? '')
  const [uploadando,     setUploadando]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [oficina,         setOficina]         = useState<Partial<Oficina>>({})
  const [salvandoOficina, setSalvandoOficina] = useState(false)
  const [msgOficina,      setMsgOficina]      = useState('')

  useEffect(() => {
    if (!isAdmin || !perfil?.oficina_id) return
    getDoc(doc(db, 'oficinas', perfil.oficina_id)).then(snap => {
      if (snap.exists()) setOficina(snap.data() as Oficina)
    })
  }, [isAdmin, perfil?.oficina_id])

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !perfil) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Foto muito grande. Maximo 5MB.')
      return
    }

    setUploadando(true)
    try {
      const storageRef = ref(storage, `avatars/${perfil.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, 'users', perfil.uid), {
        avatar_url: url,
        updatedAt: serverTimestamp(),
      })
      setAvatarUrl(url)
      setMsgPerfil('✓ Foto atualizada com sucesso!')
    } catch {
      setMsgPerfil('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploadando(false)
    }
  }

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
    alert(`E-mail de redefinicao enviado para ${perfil.email}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuracoes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gerencie seu perfil e dados da oficina</p>
      </div>

      {/* Perfil do usuário */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <User size={16} className="text-orange-500" />
          Meu perfil
        </h2>

        <div className="flex items-center gap-4 mb-4">
          {/* Avatar com botão de upload */}
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                {perfil?.nome?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadando}
              className="absolute bottom-0 right-0 w-6 h-6 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow transition"
              title="Alterar foto"
            >
              {uploadando ? <Loader size={12} className="animate-spin" /> : <Camera size={12} />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>

          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{perfil?.nome}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{perfil?.email}</p>
            <span className={`badge mt-1 ${perfil?.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>
              {perfil?.role === 'admin' ? 'Administrador' : 'Mecanico'}
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Clique na camera para alterar a foto
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome</label>
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
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-orange-500" />
          Seguranca
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Enviaremos um e-mail para <strong>{perfil?.email}</strong> com o link para redefinir sua senha.
        </p>
        <button onClick={enviarRedefinicao} className="btn-ghost text-sm">
          Enviar link de redefinicao de senha
        </button>
      </div>

      {/* Dados da oficina */}
      {isAdmin && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Building size={16} className="text-orange-500" />
            Dados da oficina
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome da oficina</label>
              <input
                value={oficina.nome ?? ''}
                onChange={e => setOficina(o => ({ ...o, nome: e.target.value }))}
                className="input-base"
                placeholder="Oficina do Ze"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">CNPJ</label>
                <input
                  value={oficina.cnpj ?? ''}
                  onChange={e => setOficina(o => ({ ...o, cnpj: e.target.value }))}
                  className="input-base"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">WhatsApp</label>
                <input
                  value={oficina.whatsapp ?? ''}
                  onChange={e => setOficina(o => ({ ...o, whatsapp: e.target.value }))}
                  className="input-base"
                  placeholder="(69) 9 9900-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Endereco</label>
              <input
                value={oficina.endereco ?? ''}
                onChange={e => setOficina(o => ({ ...o, endereco: e.target.value }))}
                className="input-base"
                placeholder="Rua das Palmeiras, 420 — Rolim de Moura/RO"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Plano atual: <strong className="text-orange-500 capitalize">{oficina.plano ?? 'Basico'}</strong>
              </p>
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