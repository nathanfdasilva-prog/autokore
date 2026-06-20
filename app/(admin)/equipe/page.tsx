'use client'
// ============================================================
// EQUIPE — app/(admin)/equipe/page.tsx
// Cadastro e gestão de mecânicos e atendentes.
// ============================================================

import { useState, useEffect } from 'react'
import { Plus, Users, X, Save, User, Shield, Percent } from 'lucide-react'
import {
  collection, query, where, onSnapshot, doc,
  updateDoc, serverTimestamp, db,
} from '@/lib/firebase/firestore'
import { docToData } from '@/lib/firebase/firestore'
import { registrarUsuario } from '@/lib/firebase/auth'
import { useAuth } from '@/lib/context/AuthContext'
import type { Usuario, Role } from '@/lib/types'

export default function EquipePage() {
  const { perfil }        = useAuth()
  const [membros,setMembros]  = useState<Usuario[]>([])
  const [loading,setLoading]  = useState(true)
  const [modal,  setModal]    = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]       = useState('')

  const [form, setForm] = useState({
    nome:  '',
    email: '',
    senha: '',
    role:  'mecanico' as Role,
    comissao_mao_obra: 0,
    comissao_peca: 0,
  })

  // Busca membros da oficina em tempo real
  useEffect(() => {
    if (!perfil?.oficina_id) { setLoading(false); return }

    const q = query(
      collection(db, 'users'),
      where('oficina_id', '==', perfil.oficina_id),
    )

    const unsub = onSnapshot(q, snap => {
      setMembros(snap.docs.map(d => docToData<Usuario>(d)))
      setLoading(false)
    })

    return () => unsub()
  }, [perfil?.oficina_id])

  function setField(k: keyof typeof form, v: string | number) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSalvar() {
    setErro('')
    if (!form.nome.trim())  return setErro('Nome é obrigatório.')
    if (!form.email.trim()) return setErro('E-mail é obrigatório.')
    if (form.senha.length < 6) return setErro('Senha deve ter pelo menos 6 caracteres.')

    setSalvando(true)
    try {
      await registrarUsuario({
        nome:       form.nome,
        email:      form.email,
        senha:      form.senha,
        role:       form.role,
        oficina_id: perfil!.oficina_id,
        comissao_mao_obra: form.comissao_mao_obra,
        comissao_peca:     form.comissao_peca,
      })
      setModal(false)
      setForm({ nome: '', email: '', senha: '', role: 'mecanico', comissao_mao_obra: 0, comissao_peca: 0 })
    } catch (e: any) {
      setErro(
        e.code === 'auth/email-already-in-use'
          ? 'Este e-mail já está cadastrado.'
          : e.message
      )
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(membro: Usuario) {
    await updateDoc(doc(db, 'users', membro.uid), {
      ativo:     !membro.ativo,
      updatedAt: serverTimestamp(),
    })
  }

  async function mudarRole(membro: Usuario, role: Role) {
    await updateDoc(doc(db, 'users', membro.uid), {
      role,
      updatedAt: serverTimestamp(),
    })
  }

  async function salvarComissao(membro: Usuario, comissao_mao_obra: number, comissao_peca: number) {
    await updateDoc(doc(db, 'users', membro.uid), {
      comissao_mao_obra,
      comissao_peca,
      updatedAt: serverTimestamp(),
    })
  }

  const admins    = membros.filter(m => m.role === 'admin')
  const mecanicos = membros.filter(m => m.role === 'mecanico')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipe</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {membros.length} {membros.length === 1 ? 'membro' : 'membros'} na oficina
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Adicionar membro
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Administradores */}
          {admins.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield size={13} />
                Administradores
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {admins.map(m => <MembroCard key={m.uid} membro={m} onToggleAtivo={toggleAtivo} onMudarRole={mudarRole} onSalvarComissao={salvarComissao} isProprioUsuario={m.uid === perfil?.uid} />)}
              </div>
            </div>
          )}

          {/* Mecânicos */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={13} />
              Mecânicos
            </h2>
            {mecanicos.length === 0 ? (
              <div className="card text-center py-10">
                <Users size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum mecânico cadastrado ainda.</p>
                <button onClick={() => setModal(true)} className="btn-primary mt-3 text-sm">
                  Adicionar primeiro mecânico
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mecanicos.map(m => (
                  <MembroCard
                    key={m.uid}
                    membro={m}
                    onToggleAtivo={toggleAtivo}
                    onMudarRole={mudarRole}
                    onSalvarComissao={salvarComissao}
                    isProprioUsuario={m.uid === perfil?.uid}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL ADICIONAR ===== */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">Novo membro</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {erro && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {erro}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input
                  value={form.nome}
                  onChange={e => setField('nome', e.target.value)}
                  placeholder="Carlos Andrade"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="carlos@oficina.com"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Senha inicial *</label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={e => setField('senha', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-base"
                />
                <p className="text-xs text-gray-400 mt-1">
                  O membro poderá alterar a senha depois.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Função</label>
                <div className="flex gap-2">
                  {(['mecanico', 'admin'] as Role[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setField('role', r)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                        form.role === r
                          ? 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r === 'mecanico' ? '🔧 Mecânico' : '👑 Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comissão */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                  <Percent size={12} className="text-orange-500" />
                  Comissão deste membro
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">% mão de obra</label>
                    <input
                      type="number" min={0} max={100}
                      value={form.comissao_mao_obra}
                      onChange={e => setField('comissao_mao_obra', Number(e.target.value))}
                      className="input-base"
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">% peça</label>
                    <input
                      type="number" min={0} max={100}
                      value={form.comissao_peca}
                      onChange={e => setField('comissao_peca', Number(e.target.value))}
                      className="input-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Na maioria das oficinas a comissão é só sobre a mão de obra. Deixe 0 se for salário fixo.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancelar</button>
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Save size={15} />
                {salvando ? 'Criando...' : 'Criar conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Card individual de membro ----
function MembroCard({
  membro, onToggleAtivo, onMudarRole, onSalvarComissao, isProprioUsuario,
}: {
  membro: Usuario
  onToggleAtivo: (m: Usuario) => void
  onMudarRole: (m: Usuario, r: Role) => void
  onSalvarComissao: (m: Usuario, mao: number, peca: number) => Promise<void>
  isProprioUsuario: boolean
}) {
  const [editandoComissao, setEditandoComissao] = useState(false)
  const [mao, setMao]   = useState(membro.comissao_mao_obra ?? 0)
  const [peca, setPeca] = useState(membro.comissao_peca ?? 0)
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar() {
    setSalvando(true)
    try {
      await onSalvarComissao(membro, mao, peca)
      setEditandoComissao(false)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className={`card border transition ${membro.ativo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
          membro.role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
          {membro.nome.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 truncate">{membro.nome}</p>
            {isProprioUsuario && (
              <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-1.5 py-0.5 rounded">você</span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{membro.email}</p>

          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${membro.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>
              {membro.role === 'admin' ? 'Admin' : 'Mecânico'}
            </span>
            <span className={`badge ${membro.ativo ? 'badge-green' : 'badge-gray'}`}>
              {membro.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Comissão */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        {!editandoComissao ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Percent size={12} className="text-orange-500" />
              <span>Mão de obra: <strong>{membro.comissao_mao_obra ?? 0}%</strong></span>
              {(membro.comissao_peca ?? 0) > 0 && (
                <span>· Peça: <strong>{membro.comissao_peca}%</strong></span>
              )}
            </div>
            <button
              onClick={() => { setMao(membro.comissao_mao_obra ?? 0); setPeca(membro.comissao_peca ?? 0); setEditandoComissao(true) }}
              className="text-xs text-orange-500 hover:underline"
            >
              Editar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">% mão de obra</label>
                <input type="number" min={0} max={100} value={mao}
                  onChange={e => setMao(Number(e.target.value))}
                  className="input-base py-1 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">% peça</label>
                <input type="number" min={0} max={100} value={peca}
                  onChange={e => setPeca(Number(e.target.value))}
                  className="input-base py-1 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditandoComissao(false)} className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={salvando}
                className="flex-1 text-xs py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition disabled:opacity-50">
                {salvando ? '...' : 'Salvar %'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ações — não exibe para si mesmo */}
      {!isProprioUsuario && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onMudarRole(membro, membro.role === 'admin' ? 'mecanico' : 'admin')}
            className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg py-1.5 transition"
          >
            {membro.role === 'admin' ? '→ Mecânico' : '→ Admin'}
          </button>
          <button
            onClick={() => onToggleAtivo(membro)}
            className={`flex-1 text-xs rounded-lg py-1.5 border transition ${
              membro.ativo
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
            }`}
          >
            {membro.ativo ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      )}
    </div>
  )
}