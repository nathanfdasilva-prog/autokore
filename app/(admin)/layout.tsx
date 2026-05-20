import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-6 pt-20 md:pt-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}