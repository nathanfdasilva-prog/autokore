'use client'
import { useState, useEffect } from 'react'
import { Save, User, Building, Lock, UserPlus, Clock } from 'lucide-react'
import {
  doc, updateDoc, getDoc, setDoc,
  serverTimestamp, db,
} from '@/lib/firebase/firestore'
import { recuperarSenha } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/context/AuthContext'
import type { Oficina } from '@/lib/types'

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function ConfiguracoesPage() {
  const { perfil, isAdmin } = useAuth()

  const [nomeUsuario,    setNomeUsuario]    = useState(perfil?.nome ?? '')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [msgPerfil,      setMsgPerfil]      = useState('')

  const [oficina,         setOficina]         = useState<Partial<Oficina>>({})
  const [salvandoOficina, setSalvandoOficina] = useState(false)
  const [msgOficina,      setMsgOficina]      = useState('')

  const [horarios, setHorarios] = useState<Record<string, { aberto: boolean; inicio: string; fim: string }>>(
    Object.fromEntries(DIAS.map(d => [d, { aberto: d !== 'Domingo', inicio: '08:00', fim: '18:00' }]))
  )

  const [emailConvite,  setEmailConvite]  = useState('')
  const [nomeConvite,   setNomeConvite]   = useState('')
  const [enviandoConv,  setEnviandoConv]  = useState(false)
  const [msgConvite,    setMsgConvite]    = useState('')

  useEffect(() => {
    if (!isAdmin || !perfil?.oficina_id) return
    getDoc(doc(db, 'oficinas', perfil.oficina_id)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as any
        setOficina(data as Oficina)
        if (data.horarios) setHorarios(data.horarios)
      }
    })
  }, [isAdmin, perfil?.oficina_id])

  async function salvarPerfil() {
    if (!perfil) return
    setSalvandoPerfil(true)
    setMsgPerfil('')
    try {
      await updateDoc(doc(db, 'users', perfil.uid), { nome: nomeUsuario, updatedAt: serverTimestamp() })
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
        ...oficina, horarios, updatedAt: serverTimestamp(),
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

  async function convidarMecanico() {
    if (!emailConvite.trim() || !nomeConvite.trim()) {
      setMsgConvite('⚠️ Preencha nome e e-mail.')
      return
    }
    if (!perfil?.oficina_id) return
    setEnviandoConv(true)
    setMsgConvite('')
    try {
      // Cria um convite pendente no Firestore
      await setDoc(doc(db, 'convites', emailConvite.toLowerCase()), {
        email:      emailConvite.toLowerCase(),
        nome:       nomeConvite,
        oficina_id: perfil.oficina_id,
        role:       'mecanico',
        status:     'pendente',
        createdAt:  serverTimestamp(),
      })
      setMsgConvite(`✓ Convite registrado para ${emailConvite}! Peça para ele se cadastrar em autokore.com.br/registro usando este e-mail.`)
      setEmailConvite('')
      setNomeConvite('')
    } catch {
      setMsgConvite('Erro ao enviar convite.')
    } finally {
      setEnviandoConv(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuracoes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gerencie seu perfil e dados da oficina</p>
      </div>

      {/* Perfil */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <User size={16} className="text-orange-500" />Meu perfil
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {perfil?.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{perfil?.nome}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{perfil?.email}</p>
            <span className={`badge mt-1 ${perfil?.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>
              {perfil?.role === 'admin' ? 'Administrador' : 'Mecanico'}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome</label>
            <input value={nomeUsuario} onChange={e => setNomeUsuario(e.target.value)} className="input-base" />
          </div>
          {msgPerfil && <p className={`text-xs ${msgPerfil.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msgPerfil}</p>}
          <button onClick={salvarPerfil} disabled={salvandoPerfil} className="btn-primary flex items-center gap-2">
            <Save size={15} />{salvandoPerfil ? 'Salvando...' : 'Salvar nome'}
          </button>
        </div>
      </div>

      {/* Segurança */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-orange-500" />Seguranca
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Enviaremos um e-mail para <strong>{perfil?.email}</strong> com o link para redefinir sua senha.
        </p>
        <button onClick={enviarRedefinicao} className="btn-ghost text-sm">Enviar link de redefinicao de senha</button>
      </div>

      {isAdmin && (
        <>
          {/* Dados da oficina */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Building size={16} className="text-orange-500" />Dados da oficina
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome da oficina</label>
                <input value={oficina.nome ?? ''} onChange={e => setOficina(o => ({ ...o, nome: e.target.value }))} className="input-base" placeholder="Oficina do Ze" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">CNPJ</label>
                  <input value={oficina.cnpj ?? ''} onChange={e => setOficina(o => ({ ...o, cnpj: e.target.value }))} className="input-base" placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">WhatsApp</label>
                  <input value={oficina.whatsapp ?? ''} onChange={e => setOficina(o => ({ ...o, whatsapp: e.target.value }))} className="input-base" placeholder="(69) 9 9900-0000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Endereco</label>
                <input value={oficina.endereco ?? ''} onChange={e => setOficina(o => ({ ...o, endereco: e.target.value }))} className="input-base" placeholder="Rua das Palmeiras, 420 — Cacoal/RO" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Plano atual: <strong className="text-orange-500 capitalize">{oficina.plano ?? 'Basico'}</strong>
                </p>
                {msgOficina && <p className={`text-xs ${msgOficina.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msgOficina}</p>}
              </div>
              <button onClick={salvarOficina} disabled={salvandoOficina} className="btn-primary flex items-center gap-2">
                <Save size={15} />{salvandoOficina ? 'Salvando...' : 'Salvar dados da oficina'}
              </button>
            </div>
          </div>

          {/* Horário de funcionamento */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />Horário de funcionamento
            </h2>
            <div className="space-y-2">
              {DIAS.map(dia => (
                <div key={dia} className="flex items-center gap-3">
                  <div className="w-20 flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={horarios[dia]?.aberto ?? false}
                        onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], aberto: e.target.checked } }))}
                        className="w-4 h-4 accent-orange-500" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{dia}</span>
                    </label>
                  </div>
                  {horarios[dia]?.aberto ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={horarios[dia]?.inicio ?? '08:00'}
                        onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], inicio: e.target.value } }))}
                        className="input-base py-1 text-xs flex-1" />
                      <span className="text-xs text-gray-400">até</span>
                      <input type="time" value={horarios[dia]?.fim ?? '18:00'}
                        onChange={e => setHorarios(h => ({ ...h, [dia]: { ...h[dia], fim: e.target.value } }))}
                        className="input-base py-1 text-xs flex-1" />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Fechado</span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={salvarOficina} disabled={salvandoOficina} className="btn-primary flex items-center gap-2 mt-4">
              <Save size={15} />{salvandoOficina ? 'Salvando...' : 'Salvar horários'}
            </button>
          </div>

          {/* Convidar mecânico */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center gap-2">
              <UserPlus size={16} className="text-orange-500" />Convidar mecânico
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              O mecânico receberá um link para se cadastrar e já será vinculado à sua oficina automaticamente.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome do mecânico</label>
                <input value={nomeConvite} onChange={e => setNomeConvite(e.target.value)} className="input-base" placeholder="João da Silva" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">E-mail do mecânico</label>
                <input type="email" value={emailConvite} onChange={e => setEmailConvite(e.target.value)} className="input-base" placeholder="joao@email.com" />
              </div>
              {msgConvite && (
                <p className={`text-xs ${msgConvite.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msgConvite}</p>
              )}
              <button onClick={convidarMecanico} disabled={enviandoConv} className="btn-primary flex items-center gap-2">
                <UserPlus size={15} />{enviandoConv ? 'Registrando...' : 'Registrar convite'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}