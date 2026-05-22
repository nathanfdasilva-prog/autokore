import { NextRequest, NextResponse } from 'next/server'

const ASAAS_URL = 'https://api.asaas.com/v3'
const ASAAS_KEY = process.env.ASAAS_API_KEY!

const headers = {
  'Content-Type': 'application/json',
  'access_token': ASAAS_KEY,
}

// ---- Criar cliente no Asaas ----
async function criarClienteAsaas(dados: {
  name:         string
  cpfCnpj?:     string
  mobilePhone?: string
  email?:       string
}) {
  const res = await fetch(`${ASAAS_URL}/customers`, {
    method:  'POST',
    headers,
    body: JSON.stringify(dados),
  })
  return res.json()
}

// ---- Criar assinatura no Asaas ----
async function criarAssinatura(dados: {
  customer:     string
  billingType:  'CREDIT_CARD' | 'PIX' | 'BOLETO'
  value:        number
  nextDueDate:  string
  cycle:        'MONTHLY'
  description:  string
}) {
  const res = await fetch(`${ASAAS_URL}/subscriptions`, {
    method:  'POST',
    headers,
    body: JSON.stringify(dados),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, ...dados } = body

    if (action === 'criar_cliente') {
      const cliente = await criarClienteAsaas(dados)
      return NextResponse.json(cliente)
    }

    if (action === 'criar_assinatura') {
      const assinatura = await criarAssinatura(dados)
      return NextResponse.json(assinatura)
    }

    if (action === 'listar_assinaturas') {
      const res = await fetch(`${ASAAS_URL}/subscriptions?customer=${dados.customer_id}`, { headers })
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (action === 'cancelar_assinatura') {
      const res = await fetch(`${ASAAS_URL}/subscriptions/${dados.subscription_id}/cancel`, {
        method: 'POST',
        headers,
      })
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ erro: 'Acao invalida' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'listar_planos') {
      const res = await fetch(`${ASAAS_URL}/subscriptions`, { headers })
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ erro: 'Acao invalida' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}