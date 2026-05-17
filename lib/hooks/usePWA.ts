'use client'
// ============================================================
// PWA — lib/hooks/usePWA.ts
// Registro do Service Worker e prompt de instalação.
// ============================================================

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [instalavel,     setInstalavel]     = useState(false)
  const [instalado,      setInstalado]      = useState(false)
  const [promptEvento,   setPromptEvento]   = useState<BeforeInstallPromptEvent | null>(null)
  const [swRegistrado,   setSwRegistrado]   = useState(false)

  useEffect(() => {
    // Registra o Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
          console.log('[PWA] Service Worker registrado:', reg.scope)
          setSwRegistrado(true)
        })
        .catch(err => console.error('[PWA] Erro ao registrar SW:', err))
    }

    // Captura o prompt de instalação
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvento(e as BeforeInstallPromptEvent)
      setInstalavel(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Detecta se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalado(true)
    }
    window.addEventListener('appinstalled', () => {
      setInstalado(true)
      setInstalavel(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function instalar() {
    if (!promptEvento) return
    await promptEvento.prompt()
    const { outcome } = await promptEvento.userChoice
    if (outcome === 'accepted') {
      setInstalado(true)
      setInstalavel(false)
    }
    setPromptEvento(null)
  }

  return { instalavel, instalado, swRegistrado, instalar }
}
