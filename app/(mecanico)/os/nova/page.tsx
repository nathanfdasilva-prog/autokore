'use client'
// ============================================================
// NOVA OS — app/(mecanico)/os/nova/page.tsx
// ============================================================

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import OSForm from '@/components/os/OSForm'

export default function NovaOSPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/os"
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
        >
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Nova Ordem de Serviço</h1>
          <p className="text-sm text-gray-500">Preencha os dados e adicione as peças utilizadas</p>
        </div>
      </div>

      <OSForm />
    </div>
  )
}
