import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, payment } = body

    console.log('[Asaas Webhook]', event, payment?.id)

    if (!payment?.customer) {
      return NextResponse.json({ ok: true })
    }

    // Busca a oficina pelo asaas_id
    const q = query(
      collection(db, 'oficinas'),
      where('asaas_id', '==', payment.customer)
    )
    const snap = await getDocs(q)

    if (snap.empty) {
      console.log('[Webhook] Oficina não encontrada para customer:', payment.customer)
      return NextResponse.json({ ok: true })
    }

    const oficina_id = snap.docs[0].id

    // Trata os eventos
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      await updateDoc(doc(db, 'oficinas', oficina_id), {
        assinatura_ativa: true,
      })
      console.log('[Webhook] Assinatura ativada para oficina:', oficina_id)
    }

    if (event === 'PAYMENT_OVERDUE' || event === 'SUBSCRIPTION_CANCELED') {
      await updateDoc(doc(db, 'oficinas', oficina_id), {
        assinatura_ativa: false,
      })
      console.log('[Webhook] Assinatura desativada para oficina:', oficina_id)
    }

    return NextResponse.json({ ok: true })

  } catch (e: any) {
    console.error('[Webhook Error]', e.message)
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}