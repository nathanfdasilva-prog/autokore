'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, ClipboardList, Calendar, Package, DollarSign,
  Users, Settings, LogOut, ChevronRight, BarChart2, UserCheck,
  Star, FileText, Building2, Menu, X, Sun, Moon, Bell,
  CheckCheck, AlertTriangle, CalendarClock, ShoppingBag, MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { logout } from '@/lib/firebase/auth'
import { useNotificacoes } from '@/lib/hooks/useNotificacoes'
import type { Notificacao } from '@/lib/hooks/useNotificacoes'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NavItem { label: string; href: string; icon: React.ReactNode }

const NAV_ADMIN: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',   icon: <LayoutDashboard size={17} /> },
  { label: 'Agendamentos', href: '/agendamentos', icon: <Calendar        size={17} /> },
  { label: 'Clientes',     href: '/clientes',     icon: <UserCheck       size={17} /> },
  { label: 'Orcamentos',   href: '/orcamentos',   icon: <FileText        size={17} /> },
  { label: 'Estoque',      href: '/estoque',      icon: <Package         size={17} /> },
  { label: 'Faturamento',  href: '/faturamento',  icon: <DollarSign      size={17} /> },
  { label: 'Desempenho',   href: '/desempenho',   icon: <BarChart2       size={17} /> },
  { label: 'Avaliacoes',   href: '/avaliacoes',   icon: <Star            size={17} /> },
  { label: 'Equipe',       href: '/equipe',       icon: <Users           size={17} /> },
  { label: 'Rede',         href: '/rede',         icon: <Building2       size={17} /> },
]
const NAV_OP: NavItem[] = [
  { label: 'Ordens de Servico', href: '/os',            icon: <ClipboardList size={17} /> },
  { label: 'Configuracoes',     href: '/configuracoes', icon: <Settings      size={17} /> },
]

const TIPO_ICON: Record<string, React.ReactNode> = {
  os:          <ClipboardList size={14} className="text-orange-500" />,
  agendamento: <CalendarClock size={14} className="text-blue-500" />,
  estoque:     <ShoppingBag  size={14} className="text-red-500" />,
  avaliacao:   <Star         size={14} className="text-yellow-500" />,
  sistema:     <MessageSquare size={14} className="text-gray-500" />,
}

function NotificacoesPanel() {
  const [aberto, setAberto] = useState(false)
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas } = useNotificacoes()
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleNotificacaoClick(n: Notificacao) {
    marcarLida(n.id)
    if (n.href) router.push(n.href)
    setAberto(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(a => !a)}
        className="relative w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell size={15} />
        <span>Notificacoes</span>
        {naoLidas > 0 && (
          <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Notificacoes
              {naoLidas > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {naoLidas}
                </span>
              )}
            </p>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasLidas}
                className="text-xs text-orange-500 hover:underline flex items-center gap-1"
              >
                <CheckCheck size={12} />
                Marcar todas lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma notificacao</p>
              </div>
            ) : (
              notificacoes.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificacaoClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-neutral-800 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${
                    !n.lida ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">{TIPO_ICON[n.tipo] ?? TIPO_ICON.sistema}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${!n.lida ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {n.titulo}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{n.mensagem}</p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                        {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {!n.lida && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      {isDark ? 'Modo claro' : 'Modo escuro'}
    </button>
  )
}

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-orange-500 leading-none">
            AutoKore<span className="text-gray-600 dark:text-gray-400 font-normal text-sm">.app</span>
          </p>
          <span className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${
            isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isAdmin ? 'Administrador' : 'Mecanico'}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2.5 overflow-y-auto">
        {isAdmin && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1.5">Gestao</p>
            {NAV_ADMIN.map(item => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
            ))}
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-3 pb-1.5">Operacao</p>
          </>
        )}
        {NAV_OP.map(item => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
        ))}
      </nav>

      <div className="border-t border-gray-100 dark:border-gray-800 p-2.5">
        <div className="flex items-center gap-2 px-2 py-2 mb-0.5">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {perfil?.nome?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{perfil?.nome}</p>
            <p className="text-[10px] text-gray-400 truncate">{perfil?.email}</p>
          </div>
        </div>
        <NotificacoesPanel />
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
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
          ? 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-semibold'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <span className={active ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}>{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight size={13} className="text-orange-300 flex-shrink-0" />}
    </Link>
  )
}

export default function Sidebar() {
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()

  const paginaAtual = NAV_ADMIN.concat(NAV_OP).find(
    item => pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <>
      <aside className="hidden md:flex w-56 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col flex-shrink-0">
        <NavContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <p className="text-lg font-bold text-orange-500">
          AutoKore<span className="text-gray-600 dark:text-gray-400 font-normal text-xs">.app</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
            {paginaAtual?.label ?? 'Menu'}
          </span>
          <button
            onClick={() => setMenuAberto(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuAberto && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMenuAberto(false)} />
      )}

      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-xl transition-transform duration-300 ${
        menuAberto ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <NavContent onClose={() => setMenuAberto(false)} />
      </div>
    </>
  )
}