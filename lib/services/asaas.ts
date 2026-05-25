const API = '/api/asaas'

export const PLANOS_ASAAS = {
  basico: {
    nome:      'Básico',
    valor:     0,
    descricao: 'Plano Básico AutoKore',
  },
  pro: {
    nome:      'Profissional',
    valor:     97,
    descricao: 'Plano Profissional AutoKore',
  },
  premium: {
    nome:      'Premium',
    valor:     247,
    descricao: 'Plano Premium AutoKore',
  },
}

export async function criarClienteAsaas(dados: {
  name:          string
  cpfCnpj?:      string
  mobilePhone?:  string
  email?:        string
}) {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'criar_cliente', ...dados }),
  })
  return res.json()
}

export async function criarAssinatura(dados: {
  customer:    string
  plano:       keyof typeof PLANOS_ASAAS
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
}) {
  const plano = PLANOS_ASAAS[dados.plano]
  const hoje  = new Date()
  const nextDueDate = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`

  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:      'criar_assinatura',
      customer:    dados.customer,
      billingType: dados.billingType,
      value:       plano.valor,
      nextDueDate,
      cycle:       'MONTHLY',
      description: plano.descricao,
    }),
  })
  return res.json()
}

export async function cancelarAssinatura(subscription_id: string) {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'cancelar_assinatura', subscription_id }),
  })
  return res.json()
}