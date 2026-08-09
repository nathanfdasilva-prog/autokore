import { NextRequest, NextResponse } from 'next/server'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { ratelimit } from '@/lib/ratelimit'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const adminAuth = getAuth()
const db = getFirestore()

const ASAAS_URL = 'https://api.asaas.com/v3'
const ASAAS_KEY = process.env.ASAAS_API_KEY!
const MASTER_EMAIL = 'nathan.f.dasilva@gmail.com'

const headers = {
  'Content-Type': 'application/json',
  'access_token': ASAAS_KEY,
}

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'sem-ip'
}

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

async function criarAssinatura(dados: {
  customer:           string
  billingType:        'CREDIT_CARD' | 'PIX' | 'BOLETO'
  value:              number
  nextDueDate:        string
  cycle:              'MONTHLY'
  description:        string
  externalReference?: string
}) {
  const res = await fetch(`${ASAAS_URL}/subscriptions`, {
    method:  'POST',
    headers,
    body: JSON.stringify(dados),
  })
  return res.json()
}

async function getOficinaDoUsuario(uid: string) {
  const userSnap = await db.collection('users').doc(uid).get()
  if (!userSnap.exists) return null
  const oficinaId = userSnap.data()?.oficina_id
  if (!oficinaId) return null
  const oficinaSnap = await db.collection('oficinas').doc(oficinaId).get()
  if (!oficinaSnap.exists) return null
  return { id: oficinaSnap.id, ...oficinaSnap.data() } as any
}

export async function POST(req: NextRequest) {
  try {
    // 0. Limite de requisições — bloqueia flood/spam vindo do mesmo IP.
    const { success } = await ratelimit.limit(getIP(req))
    if (!success) {
      return NextResponse.json({ erro: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
    }

    // 1. Exige login de verdade — sem token válido, nem entra.
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })
    }

    let decoded
    try {
      decoded = await adminAuth.verifyIdToken(token)
    } catch {
      return NextResponse.json({ erro: 'Sessão inválida.' }, { status: 401 })
    }

    // 2. Descobre a oficina de quem está chamando — toda ação abaixo fica presa a ela.
    const oficina = await getOficinaDoUsuario(decoded.uid)
    if (!oficina) {
      return NextResponse.json({ erro: 'Oficina não encontrada para este usuário.' }, { status: 403 })
    }

    const body = await req.json()
    const { action, ...dados } = body

    if (action === 'criar_cliente') {
      const cliente = await criarClienteAsaas(dados)
      return NextResponse.json(cliente)
    }

    if (action === 'criar_assinatura') {
      const assinatura = await criarAssinatura({ ...dados, externalReference: oficina.id })
      return NextResponse.json(assinatura)
    }

    if (action === 'listar_assinaturas') {
      if (dados.customer_id !== oficina.asaas_id) {
        return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
      }
      const res = await fetch(`${ASAAS_URL}/subscriptions?customer=${dados.customer_id}`, { headers })
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (action === 'cancelar_assinatura') {
      if (dados.subscription_id !== oficina.assinatura_id) {
        return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
      }
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
    const { success } = await ratelimit.limit(getIP(req))
    if (!success) {
      return NextResponse.json({ erro: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })
    }
    let decoded
    try {
      decoded = await adminAuth.verifyIdToken(token)
    } catch {
      return NextResponse.json({ erro: 'Sessão inválida.' }, { status: 401 })
    }
    if (decoded.email !== MASTER_EMAIL) {
      return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
    }

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