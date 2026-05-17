'use client'
// app/(admin)/orcamentos/novo/page.tsx

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import OrcamentoForm from '@/components/orcamento/OrcamentoForm'

export default function NovoOrcamentoPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orcamentos"
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
          <ArrowLeft size={17} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Novo Orçamento</h1>
          <p className="text-sm text-gray-500">Crie um orçamento para o cliente aprovar antes da OS</p>
        </div>
      </div>
      <OrcamentoForm />
    </div>
  )
}
