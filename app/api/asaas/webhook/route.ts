import { NextRequest, NextResponse } from 'next/server'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Inicializa o Firebase Admin apenas uma vez (evita erro em ambiente serverless)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

const EVENTOS_PAGAMENTO_CONFIRMADO = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']
const EVENTOS_PAGAMENTO_FALHOU     = ['PAYMENT_OVERDUE', 'PAYMENT_DELETED', 'PAYMENT_REFUNDED']

export async function POST(req: NextRequest) {
  try {
    // 1. Confere se quem chamou é realmente o Asaas (token secreto)
    const tokenRecebido = req.headers.get('asaas-access-token')
    if (tokenRecebido !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ erro: 'Token invalido' }, { status: 401 })
    }

    const body    = await req.json()
    const evento  = body.event as string
    const payment = body.payment

    if (!payment) {
      return NextResponse.json({ ok: true, ignorado: 'sem payment' })
    }

    // 2. Acha a oficina dona dessa assinatura
    let oficinaSnap: FirebaseFirestore.DocumentSnapshot | null = null

    if (payment.externalReference) {
      const doc = await db.collection('oficinas').doc(payment.externalReference).get()
      if (doc.exists) oficinaSnap = doc
    }

    if (!oficinaSnap) {
      const query = await db.collection('oficinas')
        .where('assinatura_id', '==', payment.subscription)
        .limit(1)
        .get()
      if (!query.empty) oficinaSnap = query.docs[0]
    }

    if (!oficinaSnap) {
      console.error('[webhook asaas] oficina nao encontrada para assinatura', payment.subscription)
      return NextResponse.json({ ok: true, ignorado: 'oficina nao encontrada' })
    }

    // 3. Atualiza o status conforme o evento
    if (EVENTOS_PAGAMENTO_CONFIRMADO.includes(evento)) {
      await oficinaSnap.ref.update({ assinatura_ativa: true })
    } else if (EVENTOS_PAGAMENTO_FALHOU.includes(evento)) {
      await oficinaSnap.ref.update({ assinatura_ativa: false })
    }

    return NextResponse.json({ ok: true })

  } catch (e: any) {
    console.error('[webhook asaas] erro:', e)
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}