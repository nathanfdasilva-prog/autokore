// ============================================================
// MECÂNICO LAYOUT — app/(mecanico)/layout.tsx
// Layout protegido para mecânicos (e admins também acessam).
// ============================================================

import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar   from '@/components/layout/Sidebar'

export default function MecanicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {/* qualquer usuário logado (mecânico ou admin) */}
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
