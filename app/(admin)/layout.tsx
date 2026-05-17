// ============================================================
// ADMIN LAYOUT — app/(admin)/layout.tsx
// Layout protegido para rotas administrativas.
// ============================================================

import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar   from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
