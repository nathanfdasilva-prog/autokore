// ============================================================
// SEED COMPLETO — scripts/seed-completo.ts
// Popula todas as coleções com dados realistas para teste.
//
// USO:
//   1. Crie a oficina e o admin: npx ts-node scripts/seed-admin.ts
//   2. Edite OFICINA_ID e ADMIN_UID abaixo
//   3. npx ts-node scripts/seed-completo.ts
// ============================================================

import { initializeApp }            from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { subDays, subHours, addHours, setHours, setMinutes } from 'date-fns'

// ⚠️ EDITE AQUI
const OFICINA_ID = 'SUA_OFICINA_ID'
const ADMIN_UID  = 'SEU_ADMIN_UID'
const ADMIN_NOME = 'João Pedro'

initializeApp()
const db  = getFirestore()
const now = new Date()
const ts  = () => FieldValue.serverTimestamp()
const tsd = (d: Date) => Timestamp.fromDate(d)

// ============================================================
// USUÁRIOS (mecânicos)
// ============================================================
const MECANICOS = [
  { uid: 'mec_carlos_001', nome: 'Carlos Andrade',  email: 'carlos@oficina.com',  role: 'mecanico' },
  { uid: 'mec_joao_002',   nome: 'João Santos',     email: 'joao@oficina.com',    role: 'mecanico' },
  { uid: 'mec_marcos_003', nome: 'Marcos Oliveira', email: 'marcos@oficina.com',  role: 'mecanico' },
]

// ============================================================
// CLIENTES
// ============================================================
const CLIENTES = [
  { id: 'cli_001', nome: 'Maria Silva',    whatsapp: '(69) 9 9843-1234', email: 'maria@email.com',    cpf: '111.111.111-11' },
  { id: 'cli_002', nome: 'Roberto Alves',  whatsapp: '(69) 9 9912-5678', email: 'roberto@email.com',  cpf: '222.222.222-22' },
  { id: 'cli_003', nome: 'Fernanda Lima',  whatsapp: '(69) 9 9765-9012', email: 'fernanda@email.com', cpf: '333.333.333-33' },
  { id: 'cli_004', nome: 'Paulo Melo',     whatsapp: '(69) 9 9854-3456', email: 'paulo@email.com',    cpf: '444.444.444-44' },
  { id: 'cli_005', nome: 'Ana Rodrigues',  whatsapp: '(69) 9 9923-7890', email: 'ana@email.com',      cpf: '555.555.555-55' },
  { id: 'cli_006', nome: 'Pedro Souza',    whatsapp: '(69) 9 9867-2345', email: 'pedro@email.com',    cpf: '666.666.666-66' },
  { id: 'cli_007', nome: 'Luisa Costa',   whatsapp: '(69) 9 9934-6789', email: 'luisa@email.com',    cpf: '777.777.777-77' },
  { id: 'cli_008', nome: 'Thiago Barbosa',whatsapp: '(69) 9 9811-0123', email: 'thiago@email.com',   cpf: '888.888.888-88' },
]

// ============================================================
// VEÍCULOS
// ============================================================
const VEICULOS = [
  { id: 'vei_001', cliente_id: 'cli_001', marca: 'VW',      modelo: 'Gol G5',      ano: 2014, placa: 'ABC-1234', cor: 'Prata',   km: 98450, tipo: 'carro' },
  { id: 'vei_002', cliente_id: 'cli_001', marca: 'GM',      modelo: 'Celta',        ano: 2010, placa: 'XYZ-9876', cor: 'Branco',  km: 145200,tipo: 'carro' },
  { id: 'vei_003', cliente_id: 'cli_002', marca: 'Hyundai', modelo: 'HB20',         ano: 2021, placa: 'DEF-5678', cor: 'Cinza',   km: 34200, tipo: 'carro' },
  { id: 'vei_004', cliente_id: 'cli_003', marca: 'GM',      modelo: 'Onix',         ano: 2022, placa: 'GHI-9012', cor: 'Vermelho',km: 22100, tipo: 'carro' },
  { id: 'vei_005', cliente_id: 'cli_004', marca: 'GM',      modelo: 'Tracker',      ano: 2023, placa: 'JKL-3456', cor: 'Preto',   km: 18750, tipo: 'carro' },
  { id: 'vei_006', cliente_id: 'cli_005', marca: 'GM',      modelo: 'Onix Plus',    ano: 2022, placa: 'MNO-7890', cor: 'Branco',  km: 31400, tipo: 'carro' },
  { id: 'vei_007', cliente_id: 'cli_006', marca: 'VW',      modelo: 'Fusca',        ano: 1973, placa: 'PQR-1111', cor: 'Azul',    km: 180200,tipo: 'carro' },
  { id: 'vei_008', cliente_id: 'cli_007', marca: 'Fiat',    modelo: 'Palio',        ano: 2019, placa: 'STU-2222', cor: 'Prata',   km: 67800, tipo: 'carro' },
  { id: 'vei_009', cliente_id: 'cli_008', marca: 'Honda',   modelo: 'CG 160',       ano: 2021, placa: 'VVV-3333', cor: 'Vermelha',km: 28900, tipo: 'moto' },
  { id: 'vei_010', cliente_id: 'cli_008', marca: 'Yamaha',  modelo: 'Factor 125',   ano: 2020, placa: 'WWW-4444', cor: 'Preta',   km: 42100, tipo: 'moto' },
]

// ============================================================
// ESTOQUE
// ============================================================
const ESTOQUE = [
  { nome: 'Óleo Motor 5W30 Sintético 1L',     categoria: 'lubrificantes', unidade: 'lt',  quantidade: 20, quantidade_minima: 8,  preco_custo: 28,  preco_venda: 52  },
  { nome: 'Óleo Motor 10W40 Semi-Sintético 1L',categoria: 'lubrificantes', unidade: 'lt',  quantidade: 15, quantidade_minima: 6,  preco_custo: 18,  preco_venda: 35  },
  { nome: 'Filtro de Óleo Bosch',              categoria: 'filtros',       unidade: 'un',  quantidade: 3,  quantidade_minima: 5,  preco_custo: 15,  preco_venda: 30  },
  { nome: 'Filtro de Ar Universal',            categoria: 'filtros',       unidade: 'un',  quantidade: 8,  quantidade_minima: 3,  preco_custo: 25,  preco_venda: 48  },
  { nome: 'Filtro de Combustível',             categoria: 'filtros',       unidade: 'un',  quantidade: 10, quantidade_minima: 4,  preco_custo: 18,  preco_venda: 35  },
  { nome: 'Pastilha Freio Dianteira Fremax',   categoria: 'freios',        unidade: 'par', quantidade: 4,  quantidade_minima: 4,  preco_custo: 55,  preco_venda: 110 },
  { nome: 'Pastilha Freio Traseira Fremax',    categoria: 'freios',        unidade: 'par', quantidade: 5,  quantidade_minima: 3,  preco_custo: 48,  preco_venda: 95  },
  { nome: 'Fluido de Freio DOT4 500ml',        categoria: 'freios',        unidade: 'un',  quantidade: 8,  quantidade_minima: 4,  preco_custo: 18,  preco_venda: 35  },
  { nome: 'Disco de Freio Dianteiro',          categoria: 'freios',        unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 85,  preco_venda: 165 },
  { nome: 'Vela de Ignição NGK',               categoria: 'motor',         unidade: 'un',  quantidade: 16, quantidade_minima: 8,  preco_custo: 18,  preco_venda: 35  },
  { nome: 'Correia Dentada Gates',             categoria: 'motor',         unidade: 'un',  quantidade: 2,  quantidade_minima: 3,  preco_custo: 75,  preco_venda: 145 },
  { nome: 'Correia Poly-V',                   categoria: 'motor',         unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 35,  preco_venda: 68  },
  { nome: 'Fluido de Arrefecimento 1L',        categoria: 'motor',         unidade: 'lt',  quantidade: 12, quantidade_minima: 6,  preco_custo: 12,  preco_venda: 25  },
  { nome: 'Bateria 60Ah',                      categoria: 'eletrica',      unidade: 'un',  quantidade: 3,  quantidade_minima: 2,  preco_custo: 280, preco_venda: 520 },
  { nome: 'Lâmpada H4 Halogênio Par',         categoria: 'eletrica',      unidade: 'par', quantidade: 6,  quantidade_minima: 2,  preco_custo: 25,  preco_venda: 48  },
  { nome: 'Amortecedor Dianteiro Monroe',      categoria: 'suspensao',     unidade: 'un',  quantidade: 2,  quantidade_minima: 2,  preco_custo: 180, preco_venda: 340 },
  { nome: 'Batente de Amortecedor',            categoria: 'suspensao',     unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 28,  preco_venda: 55  },
  { nome: 'Fluido de Direção Hidráulica 1L',  categoria: 'outros',        unidade: 'lt',  quantidade: 5,  quantidade_minima: 2,  preco_custo: 15,  preco_venda: 30  },
  { nome: 'Gás Refrigerante R134a 1kg',        categoria: 'outros',        unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 65,  preco_venda: 125 },
  { nome: 'Palheta de Para-brisa Par',         categoria: 'outros',        unidade: 'par', quantidade: 8,  quantidade_minima: 3,  preco_custo: 28,  preco_venda: 55  },
]

// Mapa nome → id (preenchido durante seed)
const estoqueIds: Record<string, string> = {}

// ============================================================
// ORDENS DE SERVIÇO (históricas)
// ============================================================
const OS_SEED = [
  {
    num: 1, cliente: 'Maria Silva', whatsapp: '(69) 9 9843-1234',
    veiculo: 'VW Gol G5', placa: 'ABC-1234', tipo_veiculo: 'carro',
    km_entrada: 97800, mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade',
    descricao: 'Troca de óleo e filtros — manutenção 90.000 km',
    status: 'concluida', daysAgo: 30,
    itens: [
      { nome: 'Óleo Motor 5W30 Sintético 1L', qtd: 4, preco: 52 },
      { nome: 'Filtro de Óleo Bosch', qtd: 1, preco: 30 },
      { nome: 'Filtro de Ar Universal', qtd: 1, preco: 48 },
    ],
    mao_obra: 80, pagamento: 'pix',
  },
  {
    num: 2, cliente: 'Roberto Alves', whatsapp: '(69) 9 9912-5678',
    veiculo: 'Hyundai HB20', placa: 'DEF-5678', tipo_veiculo: 'carro',
    km_entrada: 33900, mecanico_id: 'mec_joao_002', mecanico_nome: 'João Santos',
    descricao: 'Alinhamento e balanceamento — cliente relatou vibração no volante',
    status: 'concluida', daysAgo: 25,
    itens: [],
    mao_obra: 120, pagamento: 'cartao_debito',
  },
  {
    num: 3, cliente: 'Fernanda Lima', whatsapp: '(69) 9 9765-9012',
    veiculo: 'GM Onix', placa: 'GHI-9012', tipo_veiculo: 'carro',
    km_entrada: 21800, mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade',
    descricao: 'Troca de pastilhas de freio dianteiras — desgaste excessivo',
    status: 'concluida', daysAgo: 20,
    itens: [
      { nome: 'Pastilha Freio Dianteira Fremax', qtd: 1, preco: 110 },
      { nome: 'Fluido de Freio DOT4 500ml', qtd: 1, preco: 35 },
    ],
    mao_obra: 150, pagamento: 'pix',
  },
  {
    num: 4, cliente: 'Paulo Melo', whatsapp: '(69) 9 9854-3456',
    veiculo: 'GM Tracker', placa: 'JKL-3456', tipo_veiculo: 'carro',
    km_entrada: 18500, mecanico_id: 'mec_marcos_003', mecanico_nome: 'Marcos Oliveira',
    descricao: 'Revisão completa 20.000 km + troca de óleo',
    status: 'concluida', daysAgo: 15,
    itens: [
      { nome: 'Óleo Motor 5W30 Sintético 1L', qtd: 5, preco: 52 },
      { nome: 'Filtro de Óleo Bosch', qtd: 1, preco: 30 },
      { nome: 'Filtro de Ar Universal', qtd: 1, preco: 48 },
      { nome: 'Filtro de Combustível', qtd: 1, preco: 35 },
      { nome: 'Vela de Ignição NGK', qtd: 4, preco: 35 },
    ],
    mao_obra: 200, pagamento: 'dinheiro',
  },
  {
    num: 5, cliente: 'Ana Rodrigues', whatsapp: '(69) 9 9923-7890',
    veiculo: 'GM Onix Plus', placa: 'MNO-7890', tipo_veiculo: 'carro',
    km_entrada: 31200, mecanico_id: 'mec_joao_002', mecanico_nome: 'João Santos',
    descricao: 'Ar-condicionado não esfria — recarga de gás',
    status: 'concluida', daysAgo: 10,
    itens: [
      { nome: 'Gás Refrigerante R134a 1kg', qtd: 1, preco: 125 },
    ],
    mao_obra: 180, pagamento: 'pix',
  },
  {
    num: 6, cliente: 'Thiago Barbosa', whatsapp: '(69) 9 9811-0123',
    veiculo: 'Honda CG 160', placa: 'VVV-3333', tipo_veiculo: 'moto',
    km_entrada: 28700, mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade',
    descricao: 'Troca de óleo + corrente e relação',
    status: 'concluida', daysAgo: 7,
    itens: [
      { nome: 'Óleo Motor 10W40 Semi-Sintético 1L', qtd: 1, preco: 35 },
      { nome: 'Filtro de Óleo Bosch', qtd: 1, preco: 30 },
    ],
    mao_obra: 120, pagamento: 'dinheiro',
  },
  {
    num: 7, cliente: 'Maria Silva', whatsapp: '(69) 9 9843-1234',
    veiculo: 'VW Gol G5', placa: 'ABC-1234', tipo_veiculo: 'carro',
    km_entrada: 98200, mecanico_id: 'mec_joao_002', mecanico_nome: 'João Santos',
    descricao: 'Troca de pastilhas traseiras e amortecedor dianteiro direito',
    status: 'concluida', daysAgo: 5,
    itens: [
      { nome: 'Pastilha Freio Traseira Fremax', qtd: 1, preco: 95 },
      { nome: 'Amortecedor Dianteiro Monroe', qtd: 1, preco: 340 },
      { nome: 'Batente de Amortecedor', qtd: 1, preco: 55 },
    ],
    mao_obra: 250, pagamento: 'cartao_credito',
  },
  {
    num: 8, cliente: 'Luisa Costa', whatsapp: '(69) 9 9934-6789',
    veiculo: 'Fiat Palio', placa: 'STU-2222', tipo_veiculo: 'carro',
    km_entrada: 67600, mecanico_id: 'mec_marcos_003', mecanico_nome: 'Marcos Oliveira',
    descricao: 'Troca de correia dentada e tensor — preventiva',
    status: 'concluida', daysAgo: 3,
    itens: [
      { nome: 'Correia Dentada Gates', qtd: 1, preco: 145 },
      { nome: 'Correia Poly-V', qtd: 1, preco: 68 },
      { nome: 'Fluido de Arrefecimento 1L', qtd: 2, preco: 25 },
    ],
    mao_obra: 300, pagamento: 'pix',
  },
  // OS ativa
  {
    num: 9, cliente: 'Roberto Alves', whatsapp: '(69) 9 9912-5678',
    veiculo: 'Hyundai HB20', placa: 'DEF-5678', tipo_veiculo: 'carro',
    km_entrada: 34200, mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade',
    descricao: 'Barulho na suspensão dianteira esquerda — diagnóstico',
    status: 'em_andamento', daysAgo: 0,
    itens: [],
    mao_obra: 0, pagamento: 'pix',
  },
]

// ============================================================
// AGENDAMENTOS
// ============================================================
function agData(daysFromNow: number, hora: number, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return setMinutes(setHours(d, hora), min)
}

const AGENDAMENTOS = [
  { cliente_nome: 'Pedro Souza',    cliente_whatsapp: '(69) 9 9867-2345', veiculo: 'VW Fusca',        placa: 'PQR-1111', servico: 'Diagnóstico geral',                data: agData(1, 8),  status: 'confirmado' },
  { cliente_nome: 'Ana Rodrigues',  cliente_whatsapp: '(69) 9 9923-7890', veiculo: 'GM Onix Plus',    placa: 'MNO-7890', servico: 'Revisão geral',                    data: agData(1, 10), status: 'agendado'   },
  { cliente_nome: 'Luisa Costa',    cliente_whatsapp: '(69) 9 9934-6789', veiculo: 'Fiat Palio',      placa: 'STU-2222', servico: 'Troca de óleo e filtros',         data: agData(2, 9),  status: 'agendado'   },
  { cliente_nome: 'Paulo Melo',     cliente_whatsapp: '(69) 9 9854-3456', veiculo: 'GM Tracker',      placa: 'JKL-3456', servico: 'Verificação freios',              data: agData(2, 14), status: 'agendado'   },
  { cliente_nome: 'Thiago Barbosa', cliente_whatsapp: '(69) 9 9811-0123', veiculo: 'Honda CG 160',    placa: 'VVV-3333', servico: 'Troca de relação',                data: agData(3, 8),  status: 'agendado'   },
  { cliente_nome: 'Fernanda Lima',  cliente_whatsapp: '(69) 9 9765-9012', veiculo: 'GM Onix',         placa: 'GHI-9012', servico: 'Alinhamento e balanceamento',     data: agData(4, 10), status: 'agendado'   },
  { cliente_nome: 'Maria Silva',    cliente_whatsapp: '(69) 9 9843-1234', veiculo: 'VW Gol G5',       placa: 'ABC-1234', servico: 'Revisão 100.000 km',              data: agData(7, 9),  status: 'agendado'   },
]

// ============================================================
// AVALIAÇÕES
// ============================================================
const AVALIACOES = [
  { cliente_nome: 'Maria Silva',    nota: 5, nps: 10, comentario: 'Serviço excelente! Carlos é muito cuidadoso.', mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade', daysAgo: 29 },
  { cliente_nome: 'Roberto Alves', nota: 4, nps: 8,  comentario: 'Bom atendimento, mas esperou um pouco.',       mecanico_id: 'mec_joao_002',   mecanico_nome: 'João Santos',    daysAgo: 24 },
  { cliente_nome: 'Fernanda Lima', nota: 5, nps: 10, comentario: 'Sempre venho aqui! Confiança total.',           mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade', daysAgo: 19 },
  { cliente_nome: 'Paulo Melo',    nota: 5, nps: 9,  comentario: 'Revisão completa, ficou tudo certinho.',        mecanico_id: 'mec_marcos_003', mecanico_nome: 'Marcos Oliveira',daysAgo: 14 },
  { cliente_nome: 'Ana Rodrigues', nota: 4, nps: 8,  comentario: 'Ótimo serviço, recomendo!',                    mecanico_id: 'mec_joao_002',   mecanico_nome: 'João Santos',    daysAgo: 9  },
  { cliente_nome: 'Thiago Barbosa',nota: 5, nps: 10, comentario: 'Pessoal muito profissional.',                  mecanico_id: 'mec_carlos_001', mecanico_nome: 'Carlos Andrade', daysAgo: 6  },
]

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================
async function seed() {
  console.log('\n🌱 AutoKore — Seed completo\n')

  // 1. Mecânicos
  console.log('👥 Criando mecânicos...')
  for (const m of MECANICOS) {
    await db.collection('users').doc(m.uid).set({
      ...m, oficina_id: OFICINA_ID, ativo: true,
      avatar_url: '', createdAt: ts(), updatedAt: ts(),
    })
    console.log(`   ✅ ${m.nome}`)
  }

  // 2. Clientes
  console.log('\n👤 Criando clientes...')
  for (const c of CLIENTES) {
    await db.collection('clientes').doc(c.id).set({
      ...c, oficina_id: OFICINA_ID, createdAt: ts(),
    })
    console.log(`   ✅ ${c.nome}`)
  }

  // 3. Veículos
  console.log('\n🚗 Criando veículos...')
  for (const v of VEICULOS) {
    await db.collection('veiculos').doc(v.id).set({
      ...v, oficina_id: OFICINA_ID, createdAt: ts(),
    })
    console.log(`   ✅ ${v.marca} ${v.modelo} — ${v.placa}`)
  }

  // 4. Estoque
  console.log('\n📦 Criando estoque...')
  const batch = db.batch()
  for (const item of ESTOQUE) {
    const ref = db.collection('estoque').doc()
    estoqueIds[item.nome] = ref.id
    batch.set(ref, {
      ...item,
      nome_lower: item.nome.toLowerCase(),
      oficina_id: OFICINA_ID,
      fornecedor: 'APIS Distribuidora',
      createdAt: ts(), updatedAt: ts(),
    })
    console.log(`   ✅ ${item.nome}`)
  }
  await batch.commit()

  // 5. OS históricas
  console.log('\n📋 Criando Ordens de Serviço...')
  const osIds: string[] = []
  for (const os of OS_SEED) {
    const dataBase    = subDays(now, os.daysAgo)
    const createdAt   = tsd(subHours(dataBase, 2))
    const finalizadaAt = os.status === 'concluida' ? tsd(dataBase) : null
    const itens = os.itens.map(i => ({
      produto_id:     estoqueIds[i.nome] ?? 'unknown',
      nome:           i.nome,
      quantidade:     i.qtd,
      preco_unitario: i.preco,
      subtotal:       i.preco * i.qtd,
    }))
    const valor_pecas = itens.reduce((s, i) => s + i.subtotal, 0)
    const valor_total = valor_pecas + os.mao_obra

    const ref = db.collection('ordens_servico').doc()
    osIds.push(ref.id)
    await ref.set({
      numero:          os.num,
      oficina_id:      OFICINA_ID,
      cliente_nome:    os.cliente,
      cliente_whatsapp:os.whatsapp,
      veiculo:         os.veiculo,
      placa:           os.placa,
      tipo_veiculo:    os.tipo_veiculo,
      km_entrada:      os.km_entrada ?? null,
      descricao_problema: os.descricao,
      status:          os.status,
      mecanico_id:     os.mecanico_id,
      mecanico_nome:   os.mecanico_nome,
      itens,
      valor_pecas,
      valor_mao_obra:  os.mao_obra,
      valor_total,
      forma_pagamento: os.status === 'concluida' ? os.pagamento : null,
      createdAt,
      updatedAt:       createdAt,
      ...(finalizadaAt ? { finalizadaAt } : {}),
    })
    console.log(`   ✅ OS #${String(os.num).padStart(4,'0')} — ${os.cliente} [${os.status}]`)
  }

  // 6. Agendamentos
  console.log('\n📅 Criando agendamentos...')
  for (const ag of AGENDAMENTOS) {
    await db.collection('agendamentos').add({
      ...ag,
      oficina_id: OFICINA_ID,
      data_hora:  tsd(ag.data),
      createdAt:  ts(),
      updatedAt:  ts(),
    })
    console.log(`   ✅ ${ag.cliente_nome} — ${ag.servico}`)
  }

  // 7. Avaliações
  console.log('\n⭐ Criando avaliações...')
  for (let i = 0; i < AVALIACOES.length; i++) {
    const av       = AVALIACOES[i]
    const osId     = osIds[i] ?? osIds[0]
    const dataAval = tsd(subDays(now, av.daysAgo))
    await db.collection('avaliacoes').add({
      oficina_id:    OFICINA_ID,
      os_id:         osId,
      cliente_nome:  av.cliente_nome,
      veiculo:       'Veículo cadastrado',
      nota:          av.nota,
      nps:           av.nps,
      comentario:    av.comentario,
      mecanico_id:   av.mecanico_id,
      mecanico_nome: av.mecanico_nome,
      respondido:    false,
      createdAt:     dataAval,
    })
    console.log(`   ✅ ${av.cliente_nome} — ${av.nota}★`)
  }

  console.log('\n✨ Seed completo! Resumo:')
  console.log(`   ${MECANICOS.length} mecânicos`)
  console.log(`   ${CLIENTES.length} clientes`)
  console.log(`   ${VEICULOS.length} veículos`)
  console.log(`   ${ESTOQUE.length} itens no estoque`)
  console.log(`   ${OS_SEED.length} ordens de serviço`)
  console.log(`   ${AGENDAMENTOS.length} agendamentos`)
  console.log(`   ${AVALIACOES.length} avaliações\n`)
}

seed().catch(err => { console.error('❌ Erro no seed:', err); process.exit(1) })
