'use client'
import { useAuth } from '@/lib/context/AuthContext'
import { useTrialStatus } from '@/lib/hooks/useTrialStatus'
import TrialExpirado from './TrialExpirado'

export default function TrialGuard({ children }: { children: React.ReactNode }) {
  const { oficina } = useAuth()
  const { precisaAssinar } = useTrialStatus(oficina)

  if (precisaAssinar) {
    return <TrialExpirado nomeOficina={oficina?.nome} />
  }

  return <>{children}</>
}