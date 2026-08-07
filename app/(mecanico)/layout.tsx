import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/layout/Sidebar'
import TrialGuard from '@/components/plano/TrialGuard'

export default function MecanicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 pt-20 md:pt-6">
          <TrialGuard>{children}</TrialGuard>
        </main>
      </div>
    </AuthGuard>
  )
}