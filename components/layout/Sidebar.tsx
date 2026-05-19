'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, Calendar, Package, DollarSign,
  Users, Settings, LogOut, ChevronRight, BarChart2, UserCheck,
  Star, FileText, Building2, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { logout } from '@/lib/firebase/auth'

interface NavItem { label: string; href: string; icon: React.ReactNode }

const NAV_ADMIN: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',   icon: <LayoutDashboard size={17} /> },
  { label: 'Agendamentos', href: '/agendamentos', icon: <Calendar        size={17} /> },
  { label: 'Clientes',     href: '/clientes',     icon: <UserCheck       size={17} /> },
  { label: 'Orçamentos',   href: '/orcamentos',   icon: <FileText        size={17} /> },
  { label: 'Estoque',      href: '/estoque',      icon: <Package         size={17} /> },
  { label: 'Faturamento',  href: '/faturamento',  icon: <DollarSign      size={17} /> },
  { label: 'Desempenho',   href: '/desempenho',   icon: <BarChart2       size={17} /> },
  { label: 'Avaliações',   href: '/avaliacoes',   icon: <Star            size={17} /> },
  { label: 'Equipe',       href: '/equipe',       icon: <Users           size={17} /> },
  { label: 'Rede',         href: '/rede',         icon: <Building2       size={17} /> },
]
const NAV_OP: NavItem[] = [
  { label: 'Ordens de Serviço', href: '/os',            icon: <ClipboardList size={17} /> },
  { label: 'Configurações',     href: '/configuracoes', icon: <Settings      size={17} /> },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { perfil, isAdmin } = useAuth()
  const router = useRouter()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  async function handleLogout() {
    await logout()
    router.replace('/login')
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-orange-500 leading-none">
            AutoKore<span className="text-gray-600 font-normal text-sm">.app</span>
          </p>
          <span className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${
            isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isAdmin ? '👑 Administrador' : '🔧 Mecânico'}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 overflow-y-auto">
        {isAdmin && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1.5">Gestão</p>
            {NAV_ADMIN.map(item => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
            ))}
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-3 pb-1.5">Operação</p>
          </>
        )}
        {NAV_OP.map(item => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-2.5">
        <div className="flex items-center gap-2 px-2 py-2 mb-0.5">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {perfil?.nome?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{perfil?.nome}</p>
            <p className="text-[10px] text-gray-400 truncate">{perfil?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={15} />Sair da conta
        </button>
      </div>
    </div>
  )
}

function NavLink({ item, active, onClose }: { item: NavItem; active: boolean; onClose?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm transition-all mb-0.5 ${
        active
          ? 'bg-orange-50 text-orange-700 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      <span className={active ? 'text-orange-500' : 'text-gray-400'}>{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight size={13} className="text-orange-300 flex-shrink-0" />}
    </Link>
  )
}

export default function Sidebar() {
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()

  // Fecha menu quando muda de rota
  const paginaAtual = NAV_ADMIN.concat(NAV_OP).find(
    item => pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 h-full bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <p className="text-lg font-bold text-orange-500">
          AutoKore<span className="text-gray-600 font-normal text-xs">.app</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 truncate max-w-[140px]">
            {paginaAtual?.label ?? 'Menu'}
          </span>
          <button
            onClick={() => setMenuAberto(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {menuAberto && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ${
        menuAberto ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <NavContent onClose={() => setMenuAberto(false)} />
      </div>
    </>
  )
}