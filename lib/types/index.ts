// ---------- ORDEM DE SERVIÇO ----------
export type StatusOS =
  | 'aguardando_aprovacao'
  | 'aberta'
  | 'em_andamento'
  | 'aguardando_pecas'
  | 'concluida'
  | 'cancelada'

export interface ItemOS {
  produto_id: string
  nome: string
  quantidade: number
  preco_unitario: number
  subtotal: number
  tipo_item?: 'estoque' | 'manual'
}

// Sugestão de mão de obra que o mecânico deixa ao criar a OS.
// Só informativo — o dono decide o valor real na aprovação.
export interface SugestaoMaoObra {
  descricao: string   // nome do serviço escolhido, ou "Manual"
  horas:     number
  valor:     number    // horas * valor_hora no momento em que foi calculado
}

export interface OrdemServico {
  id: string
  numero: number
  oficina_id: string

  cliente_nome: string
  cliente_whatsapp: string
  veiculo: string
  placa: string
  km_entrada?: number
  km_saida?: number
  tipo_veiculo: 'carro' | 'moto'

  status: StatusOS
  descricao_problema: string
  observacoes_internas?: string
  mecanico_id: string
  mecanico_nome: string

  itens: ItemOS[]

  valor_pecas: number
  valor_mao_obra: number
  valor_total: number
  forma_pagamento?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito'
  sugestao_mao_obra?: SugestaoMaoObra

  agendamento_id?: string
  avaliada?: boolean

  createdAt: Date
  updatedAt: Date
  finalizadaAt?: Date
}