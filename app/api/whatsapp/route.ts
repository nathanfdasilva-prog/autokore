// ============================================================
// API ROUTE — app/api/whatsapp/route.ts
// Envio server-side via Evolution API (chaves protegidas).
// Chamado pelo cliente via fetch('/api/whatsapp', { ... })
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { numero, mensagem } = await req.json()

    if (!numero || !mensagem) {
      return NextResponse.json(
        { erro: 'numero e mensagem são obrigatórios' },
        { status: 400 },
      )
    }

    const BASE_URL = process.env.EVOLUTION_API_URL        // server-side (sem NEXT_PUBLIC_)
    const API_KEY  = process.env.EVOLUTION_API_KEY
    const INSTANCE = process.env.EVOLUTION_INSTANCE ?? 'autokore'

    if (!BASE_URL || !API_KEY) {
      // Sem API configurada — retorna o link para o cliente abrir
      const num   = numero.replace(/\D/g, '')
      const numBR = num.startsWith('55') ? num : `55${num}`
      const link  = `https://wa.me/${numBR}?text=${encodeURIComponent(mensagem)}`
      return NextResponse.json({ link, api: false })
    }

    const num   = numero.replace(/\D/g, '')
    const numBR = num.startsWith('55') ? num : `55${num}`

    const resp = await fetch(
      `${BASE_URL}/message/sendText/${INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey':       API_KEY,
        },
        body: JSON.stringify({
          number: `${numBR}@s.whatsapp.net`,
          text:   mensagem,
        }),
      },
    )

    if (!resp.ok) {
      const err = await resp.text()
      return NextResponse.json({ erro: err }, { status: 502 })
    }

    const data = await resp.json()
    return NextResponse.json({ sucesso: true, data, api: true })

  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
