'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { collection, getDocs, updateDoc, doc, db, query, orderBy } from '@/lib/firebase/firestore'
import { Building2, Shield, ShieldOff, ClipboardList, LogOut, RefreshCw } from 'lucide-react'
import { logout } from '@/lib/firebase/auth'

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

export default function MasterPage() {
  const { perfil } = useAuth()
  const router = useRouter()
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [stats, setStats] = useState<Record<string, Stats>>({})
  const [loading, setLoading] = useState(true)
  const [acao, setAcao] = useState<string | null>(null)

  useEffect(() => {
    if (perfil && perfil.email !== MASTER_EMAIL) {
      router.replace('/dashboard')
    }
  }, [perfil, router])

  useEffect(() => {
    if (!perfil || perfil.email !== MASTER_EMAIL) return
    carregarDados()
  }, [perfil])

  async function carregarDados() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, 'oficinas'))
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() } as Oficina))
      setOficinas(lista)

      const [osSnap, agSnap, clSnap, usSnap] = await Promise.all([
        getDocs(collection(db, 'ordens_servico')),
        getDocs(collection(db, 'agendamentos')),
        getDocs(collection(db, 'clientes')),
        getDocs(collection(db, 'users')),
      ])

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
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function toggleBloqueio(oficina: Oficina) {
    setAcao(oficina.id)
    try {
      await updateDoc(doc(db, 'oficinas', oficina.id), {
        bloqueada: !oficina.bloqueada,
        ativo: !!oficina.bloqueada,
      })
      await carregarDados()
    } catch (e) { console.error(e) }
    finally { setAcao(null) }
  }

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  if (!perfil || perfil.email !== MASTER_EMAIL) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-orange-400">⚡ AutoKore Master</h1>
          <p className="text-xs text-gray-400">Painel de controle exclusivo</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={carregarDados} className="text-gray-400 hover:text-white transition p-1">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Oficinas', value: oficinas.length, icon: <Building2 size={20} />, color: 'text-blue-400' },
            { label: 'Ativas', value: oficinas.filter(o => !o.bloqueada).length, icon: <Shield size={20} />, color: 'text-green-400' },
            { label: 'Bloqueadas', value: oficinas.filter(o => o.bloqueada).length, icon: <ShieldOff size={20} />, color: 'text-red-400' },
            { label: 'Total OS', value: Object.values(stats).reduce((s, v) => s + v.os, 0), icon: <ClipboardList size={20} />, color: 'text-orange-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4">
              <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
              <p className="text-xl md:text-2xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-gray-400">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Building2 size={15} className="text-orange-400" />
          Todas as Oficinas Cadastradas
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : oficinas.length === 0 ? (
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
                        {oficina.bloqueada ? '🔒 BLOQUEADA' : '✅ ATIVA'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{oficina.email_dono}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      {oficina.cidade && <span>📍 {oficina.cidade}/{oficina.estado}</span>}
                      {oficina.telefone && <span>📞 {oficina.telefone}</span>}
                      <span>🆔 {oficina.id.substring(0, 8)}...</span>
                    </div>
                    {stats[oficina.id] && (
                      <div className="flex gap-4">
                        {[
                          { label: 'OS', value: stats[oficina.id].os, icon: '🔧' },
                          { label: 'Agend.', value: stats[oficina.id].agendamentos, icon: '📅' },
                          { label: 'Clientes', value: stats[oficina.id].clientes, icon: '👤' },
                          { label: 'Equipe', value: stats[oficina.id].mecanicos, icon: '👥' },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <p className="text-sm font-bold text-white">{s.icon} {s.value}</p>