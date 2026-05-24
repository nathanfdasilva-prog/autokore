// ============================================================
// TIPOS GLOBAIS — AutoKore
// ============================================================

// ---------- AUTH / USUÁRIOS ----------
export type Role = 'admin' | 'mecanico'

export interface Usuario {
  uid: string
  nome: string
  email: string
  role: Role
  oficina_id: string
  avatar_url?: string
  ativo: boolean
  createdAt: Date
}

// ---------- OFICINA ----------
export type Plano = 'basico' | 'pro' | 'premium'

// ---------- OFICINA ----------
export type Plano = 'basico' | 'pro' | 'premium'

export interface Oficina {
  id:                string
  nome:              string
  cnpj?:             string
  endereco?:         string
  whatsapp?:         string
  plano:             Plano
  dono_uid:          string
  ativo:             boolean
  createdAt:         Date
  assinatura_ativa?: boolean
  asaas_id?:         string
  assinatura_id?:    string
  trial_ate?:        Date
}
  id: string
  nome: string
  cnpj?: string
  endereco?: string
  whatsapp?: string
  plano: Plano
  dono_uid: string
  ativo: boolean
  createdAt: Date
}

// ---------- CLIENTE / VEÍCULO ----------
export interface Cliente {
  id: string
  oficina_id: string
  nome: string
  whatsapp: string
  email?: string
  cpf?: string
  createdAt: Date
}

export interface Veiculo {
  id: string
  oficina_id: string
  cliente_id: string
  marca: string
  modelo: string
  ano: number
  placa: string
  cor?: string
  km?: number
  tipo: 'carro' | 'moto'
  createdAt: Date
}

// ---------- ESTOQUE ----------
export type CategoriaEstoque =
  | 'lubrificantes'
  | 'filtros'
  | 'freios'
  | 'motor'
  | 'eletrica'
  | 'suspensao'
  | 'funilaria'
  | 'outros'

export interface ItemEstoque {
  id: string
  oficina_id: string
  nome: string
  descricao?: string
  categoria: CategoriaEstoque
  unidade: 'un' | 'lt' | 'kg' | 'par' | 'jogo'
  quantidade: number
  quantidade_minima: number
  preco_custo: number
  preco_venda: number
  codigo_barras?: string
  fornecedor?: string
  updatedAt: Date
  createdAt: Date
}

export interface MovimentacaoEstoque {
  id: string
  item_id: string
  oficina_id: string
  tipo: 'entrada' | 'saida'
  quantidade: number
  os_id?: string           // preenchido quando saída via OS
  motivo?: string
  usuario_id: string
  usuario_nome: string
  createdAt: Date
}

// ---------- ORDEM DE SERVIÇO ----------
export type StatusOS =
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
}

export interface OrdemServico {
  id: string
  numero: number          // número sequencial da OS
  oficina_id: string

  // Cliente / Veículo
  cliente_nome: string
  cliente_whatsapp: string
  veiculo: string         // Ex: "VW Gol G5"
  placa: string
  km_entrada?: number
  tipo_veiculo: 'carro' | 'moto'

  // Operacional
  status: StatusOS
  descricao_problema: string
  observacoes_internas?: string
  mecanico_id: string
  mecanico_nome: string

  // Itens (peças)
  itens: ItemOS[]

  // Financeiro
  valor_pecas: number
  valor_mao_obra: number
  valor_total: number
  forma_pagamento?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito'

  // Agendamento vinculado (opcional)
  agendamento_id?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
  finalizadaAt?: Date
}

// ---------- AGENDAMENTO ----------
export type StatusAgendamento =
  | 'agendado'
  | 'confirmado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'nao_compareceu'

export interface Agendamento {
  id: string
  oficina_id: string

  // Campos obrigatórios (conforme requisito)
  cliente_nome: string
  cliente_whatsapp: string
  veiculo: string
  placa: string
  data_hora: Date
  servico: string

  // Opcionais
  observacoes?: string
  mecanico_id?: string
  mecanico_nome?: string
  status: StatusAgendamento
  os_id?: string          // OS gerada a partir deste agendamento

  createdAt: Date
  updatedAt: Date
}

// ---------- DASHBOARD ----------
export interface KPIDiario {
  data: string            // 'YYYY-MM-DD'
  total_os: number
  os_concluidas: number
  faturamento: number
}

export interface ResumoDashboard {
  os_ativas: number
  os_hoje: number
  faturamento_hoje: number
  faturamento_mes: number
  agendamentos_hoje: number
  itens_estoque_critico: number
}

// ---------- UTILITÁRIOS ----------
export type OrderBy = 'asc' | 'desc'

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
}
