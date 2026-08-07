import type { Oficina } from '@/lib/types'

export interface TrialStatus {
  emTrial: boolean
  trialExpirado: boolean
  diasRestantes: number
  precisaAssinar: boolean // trial expirado e sem assinatura ativa
}

function toDateSafe(v: any): Date {
  if (!v) return new Date(0)
  if (v instanceof Date) return v
  if (typeof v?.toDate === 'function') return v.toDate() // Firestore Timestamp
  return new Date(v)
}

export function useTrialStatus(oficina: Oficina | null | undefined): TrialStatus {
  // Sem oficina carregada ou sem trial_ate definido (contas antigas/de teste) —
  // não bloqueia por precaução, até termos certeza do estado real.
  if (!oficina || !oficina.trial_ate) {
    return { emTrial: false, trialExpirado: false, diasRestantes: 0, precisaAssinar: false }
  }

  const agora = new Date()
  const trialAte = toDateSafe(oficina.trial_ate)
  const msRestante = trialAte.getTime() - agora.getTime()
  const diasRestantes = Math.max(0, Math.ceil(msRestante / (1000 * 60 * 60 * 24)))
  const trialExpirado = msRestante <= 0
  const emTrial = !trialExpirado
  const precisaAssinar = trialExpirado && !oficina.assinatura_ativa

  return { emTrial, trialExpirado, diasRestantes, precisaAssinar }
}