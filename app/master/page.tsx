'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { collection, getDocs, updateDoc, doc, db } from '@/lib/firebase/firestore'
import { Building2, Shield, ShieldOff, ClipboardList, LogOut, RefreshCw, Users, ArrowRightLeft, X } from 'lucide-react'
import { logout } from '@/lib/firebase/auth'
import { format } from 'date-fns'

const MASTER_EMAIL = 'nathan.f.dasilva@gmail.com'

interface Oficina {
  id: string
  nome: string
  email_dono: string
  telefone?: string
  cidade?: string
  estado?: string
  ativo: boolean
  bloqueada?: boolean
  createdAt: any
  plano?: string
}

interface Stats {
  os: number
  agendamentos: number
  clientes: number
  mecanicos: number
}

interface Lead {
  id: string
  nome: string
  whatsapp: string
  origem: string
  createdAt: any
}

interface UsuarioMaster {
  uid: string
  nome: string
  email: string
  role: string
  oficina_id: string
  ativo: boolean
}

export default function MasterPage() {
  const { perfil, loading } = useAuth()
  const router = useRouter()
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [stats, setStats] = useState<Record<string, Stats>>({})
  const [leads, setLeads] = useState<Lead[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioMaster[]>([])
  const [loadingDados, setLoadingDados] = useState(true)
  const [acao, setAcao] = useState<string | null>(null)
  const [aba, setAba] = useState<'oficinas' | 'leads' | 'usuarios'>('oficinas')

  // Modal de mover usuário
  const [movendo, setMovendo] = useState<UsuarioMaster | null>(null)
  const [oficinaDestino, setOficinaDestino] = useState('')
  const [salvandoMove, setSalvandoMove] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!perfil) { router.replace('/login'); return }
    if (perfil.email !== MASTER_EMAIL) { router.replace('/dashboard'); return }
    carregarDados()
  }, [perfil, loading])

  async function carregarDados() {
    setLoadingDados(true)
    try {
      const snap = await getDocs(collection(db, 'oficinas'))
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Oficina))
      setOficinas(lista)

      const leadsSnap = await getDocs(collection(db, 'leads'))
      setLeads(leadsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)).sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds))

      const [osSnap, agSnap, clSnap, usSnap] = await Promise.all([
        getDocs(collection(db, 'ordens_servico')),
        getDocs(collection(db, 'agendamentos')),
        getDocs(collection(db, 'clientes')),
        getDocs(collection(db, 'users')),
      ])

      setUsuarios(usSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UsuarioMaster)))

      const statsMap: Record<string, Stats> = {}
      lista.forEach(of => {
        statsMap[of.id] = {
          os: osSnap.docs.filter(d => d.data().oficina_id === of.id).length,
          agendamentos: agSnap.docs.filter(d => d.data().oficina_id === of.id).length,
          clientes: clSnap.docs.filter(d => d.data().oficina_id === of.id).length,
          mecanicos: usSnap.docs.filter(d => d.data().oficina_id === of.id).length,
        }
      })
      setStats(statsMap)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDados(false)
    }
  }

  async function toggleBloqueio(oficina: Oficina) {
    setAcao(oficina.id)
    try {
      await updateDoc(doc(db, 'oficinas', oficina.id), {
        bloqueada: !oficina.bloqueada,
        ativo: !!oficina.bloqueada,
      })
      await carregarDados()
    } catch (e) {
      console.error(e)
    } finally {
      setAcao(null)
    }
  }

  async function confirmarMover() {
    if (!movendo || !oficinaDestino) return
    setSalvandoMove(true)
    try {
      await updateDoc(doc(db, 'users', movendo.uid), {
        oficina_id: oficinaDestino,
      })
      setMovendo(null)
      setOficinaDestino('')
      await carregarDados()
    } catch (e) {
      console.error(e)
    } finally {
      setSalvandoMove(false)
    }
  }

  function nomeOficina(id: string) {
    return oficinas.find(o => o.id === id)?.nome ?? '(sem oficina)'
  }

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!perfil || perfil.email !== MASTER_EMAIL) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-orange-400">AutoKore Master</h1>
          <p className="text-xs text-gray-400">Painel de controle exclusivo</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={carregarDados} className="text-gray-400 hover:text-white transition p-1">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition">
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Building2 size={20} className="text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{oficinas.length}</p>
            <p className="text-xs text-gray-400">Total Oficinas</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Shield size={20} className="text-green-400 mb-2" />
            <p className="text-2xl font-bold">{oficinas.filter(o => !o.bloqueada).length}</p>
            <p className="text-xs text-gray-400">Ativas</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <ShieldOff size={20} className="text-red-400 mb-2" />
            <p className="text-2xl font-bold">{oficinas.filter(o => o.bloqueada).length}</p>
            <p className="text-xs text-gray-400">Bloqueadas</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Users size={20} className="text-purple-400 mb-2" />
            <p className="text-2xl font-bold">{usuarios.length}</p>
            <p className="text-xs text-gray-400">Usuários</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <ClipboardList size={20} className="text-orange-400 mb-2" />
            <p className="text-2xl font-bold">{Object.values(stats).reduce((s, v) => s + v.os, 0)}</p>
            <p className="text-xs text-gray-400">Total OS</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setAba('oficinas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${aba === 'oficinas' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Oficinas
          </button>
          <button onClick={() => setAba('usuarios')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${aba === 'usuarios' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Usuários ({usuarios.length})
          </button>
          <button onClick={() => setAba('leads')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${aba === 'leads' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Leads ({leads.length})
          </button>
        </div>

        {loadingDados ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : aba === 'oficinas' ? (
          oficinas.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Nenhuma oficina cadastrada ainda.</div>
          ) : (
            <div className="space-y-3">
              {oficinas.map(oficina => (
                <div key={oficina.id} className={`bg-gray-900 border rounded-xl p-4 ${oficina.bloqueada ? 'border-red-800/50' : 'border-gray-800'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white">{oficina.nome || 'Sem nome'}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${oficina.bloqueada ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                          {oficina.bloqueada ? 'BLOQUEADA' : 'ATIVA'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{oficina.email_dono}</p>
                      <p className="text-[10px] text-gray-600 mb-2 font-mono">ID: {oficina.id}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        {oficina.cidade && <span>{oficina.cidade}/{oficina.estado}</span>}
                        {oficina.telefone && <span>{oficina.telefone}</span>}
                      </div>
                      {stats[oficina.id] && (
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">{stats[oficina.id].os}</p>
                            <p className="text-[10px] text-gray-500">OS</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">{stats[oficina.id].agendamentos}</p>
                            <p className="text-[10px] text-gray-500">Agend.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">{stats[oficina.id].clientes}</p>
                            <p className="text-[10px] text-gray-500">Clientes</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">{stats[oficina.id].mecanicos}</p>
                            <p className="text-[10px] text-gray-500">Equipe</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => toggleBloqueio(oficina)} disabled={acao === oficina.id}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0 ${oficina.bloqueada ? 'bg-green-800 hover:bg-green-700 text-green-200' : 'bg-red-800 hover:bg-red-700 text-red-200'}`}>
                      {acao === oficina.id ? '...' : oficina.bloqueada ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : aba === 'usuarios' ? (
          usuarios.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Nenhum usuário cadastrado.</div>
          ) : (
            <div className="space-y-3">
              {usuarios.map(u => (
                <div key={u.uid} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{u.nome}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
                        {u.role === 'admin' ? 'ADMIN' : 'MECÂNICO'}
                      </span>
                      {u.email === MASTER_EMAIL && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900 text-purple-300">MASTER</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Oficina: <span className="text-gray-400">{nomeOficina(u.oficina_id)}</span></p>
                  </div>
                  <button
                    onClick={() => { setMovendo(u); setOficinaDestino('') }}
                    className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0">
                    <ArrowRightLeft size={13} />
                    Mover
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          leads.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Nenhum lead ainda.</div>
          ) : (
            <div className="space-y-3">
              {leads.map(lead => (
                <div key={lead.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{lead.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📱 {lead.whatsapp}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {lead.createdAt?.seconds ? format(new Date(lead.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm') : '—'}
                    </p>
                  </div>
                  <a href={`https://wa.me/55${lead.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs bg-green-800 hover:bg-green-700 text-green-200 px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0">
                    💬 WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal mover usuário */}
      {movendo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Mover usuário</h2>
              <button onClick={() => setMovendo(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-white">{movendo.nome}</p>
              <p className="text-xs text-gray-400">{movendo.email}</p>
              <p className="text-xs text-gray-500 mt-1">Oficina atual: {nomeOficina(movendo.oficina_id)}</p>
            </div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Mover para a oficina:</label>
            <select value={oficinaDestino} onChange={e => setOficinaDestino(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 mb-4">
              <option value="">Selecione...</option>
              {oficinas.map(o => (
                <option key={o.id} value={o.id} disabled={o.id === movendo.oficina_id}>
                  {o.nome} {o.id === movendo.oficina_id ? '(atual)' : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setMovendo(null)} className="flex-1 py-2 text-sm border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition">
                Cancelar
              </button>
              <button onClick={confirmarMover} disabled={!oficinaDestino || salvandoMove}
                className="flex-1 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition disabled:opacity-50">
                {salvandoMove ? 'Movendo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}