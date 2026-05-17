// ============================================================
// SEED DE ESTOQUE — scripts/seed-estoque.ts
//
// Popula o Firestore com itens iniciais de estoque para testes.
//
// USO:
//   1. Instale ts-node: npm install -D ts-node
//   2. Preencha OFICINA_ID abaixo com o ID real da sua oficina
//   3. Configure GOOGLE_APPLICATION_CREDENTIALS (chave de serviço)
//      ou use o emulador: FIRESTORE_EMULATOR_HOST=localhost:8080
//   4. npx ts-node scripts/seed-estoque.ts
// ============================================================

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// ⚠️  ALTERE para o ID da sua oficina no Firestore
const OFICINA_ID = 'SUA_OFICINA_ID_AQUI'

// Inicializa Admin SDK (usa ADC ou GOOGLE_APPLICATION_CREDENTIALS)
initializeApp()
const db = getFirestore()

// ---- Dados de seed ----
const itensEstoque = [
  // Lubrificantes
  { nome: 'Óleo Motor 5W30 Sintético 1L',   categoria: 'lubrificantes', unidade: 'lt',  quantidade: 20, quantidade_minima: 8,  preco_custo: 28.00, preco_venda: 52.00 },
  { nome: 'Óleo Motor 10W40 Semi-Sintético', categoria: 'lubrificantes', unidade: 'lt',  quantidade: 15, quantidade_minima: 6,  preco_custo: 18.00, preco_venda: 35.00 },
  { nome: 'Óleo Câmbio 75W90',               categoria: 'lubrificantes', unidade: 'lt',  quantidade: 8,  quantidade_minima: 4,  preco_custo: 35.00, preco_venda: 65.00 },
  { nome: 'Graxa de Rolamento 500g',          categoria: 'lubrificantes', unidade: 'un',  quantidade: 6,  quantidade_minima: 2,  preco_custo: 22.00, preco_venda: 40.00 },

  // Filtros
  { nome: 'Filtro de Óleo Bosch',             categoria: 'filtros',       unidade: 'un',  quantidade: 3,  quantidade_minima: 5,  preco_custo: 15.00, preco_venda: 30.00 },
  { nome: 'Filtro de Ar Esportivo',           categoria: 'filtros',       unidade: 'un',  quantidade: 8,  quantidade_minima: 3,  preco_custo: 25.00, preco_venda: 48.00 },
  { nome: 'Filtro de Combustível Universal',  categoria: 'filtros',       unidade: 'un',  quantidade: 10, quantidade_minima: 4,  preco_custo: 18.00, preco_venda: 35.00 },
  { nome: 'Filtro de Cabine / Ar-Condicionado', categoria: 'filtros',    unidade: 'un',  quantidade: 7,  quantidade_minima: 3,  preco_custo: 22.00, preco_venda: 45.00 },

  // Freios
  { nome: 'Pastilha de Freio Dianteira Fremax', categoria: 'freios',     unidade: 'par', quantidade: 4,  quantidade_minima: 4,  preco_custo: 55.00, preco_venda: 110.00 },
  { nome: 'Pastilha de Freio Traseira Fremax',  categoria: 'freios',     unidade: 'par', quantidade: 5,  quantidade_minima: 3,  preco_custo: 48.00, preco_venda: 95.00 },
  { nome: 'Disco de Freio Dianteiro',           categoria: 'freios',     unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 85.00, preco_venda: 165.00 },
  { nome: 'Fluido de Freio DOT4 500ml',         categoria: 'freios',     unidade: 'un',  quantidade: 8,  quantidade_minima: 4,  preco_custo: 18.00, preco_venda: 35.00 },
  { nome: 'Lona de Freio Traseira (Par)',       categoria: 'freios',     unidade: 'par', quantidade: 6,  quantidade_minima: 2,  preco_custo: 40.00, preco_venda: 78.00 },

  // Motor
  { nome: 'Vela de Ignição NGK',              categoria: 'motor',        unidade: 'un',  quantidade: 16, quantidade_minima: 8,  preco_custo: 18.00, preco_venda: 35.00 },
  { nome: 'Correia Dentada Gates',            categoria: 'motor',        unidade: 'un',  quantidade: 2,  quantidade_minima: 3,  preco_custo: 75.00, preco_venda: 145.00 },
  { nome: 'Correia Poly-V',                   categoria: 'motor',        unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 35.00, preco_venda: 68.00 },
  { nome: 'Junta do Cabeçote',                categoria: 'motor',        unidade: 'un',  quantidade: 2,  quantidade_minima: 1,  preco_custo: 120.00, preco_venda: 230.00 },
  { nome: 'Virabrequim Tensor',               categoria: 'motor',        unidade: 'un',  quantidade: 3,  quantidade_minima: 1,  preco_custo: 65.00, preco_venda: 125.00 },
  { nome: 'Fluido de Arrefecimento 1L',        categoria: 'motor',       unidade: 'lt',  quantidade: 12, quantidade_minima: 6,  preco_custo: 12.00, preco_venda: 25.00 },

  // Elétrica
  { nome: 'Bateria 60Ah',                     categoria: 'eletrica',     unidade: 'un',  quantidade: 3,  quantidade_minima: 2,  preco_custo: 280.00, preco_venda: 520.00 },
  { nome: 'Alternador Remanufaturado',         categoria: 'eletrica',    unidade: 'un',  quantidade: 1,  quantidade_minima: 1,  preco_custo: 350.00, preco_venda: 650.00 },
  { nome: 'Fusível 10A (Caixa 50un)',          categoria: 'eletrica',    unidade: 'un',  quantidade: 5,  quantidade_minima: 2,  preco_custo: 8.00,  preco_venda: 18.00 },
  { nome: 'Lâmpada H4 Halogênio Par',         categoria: 'eletrica',    unidade: 'par', quantidade: 6,  quantidade_minima: 2,  preco_custo: 25.00, preco_venda: 48.00 },
  { nome: 'Bobina de Ignição Universal',      categoria: 'eletrica',    unidade: 'un',  quantidade: 2,  quantidade_minima: 1,  preco_custo: 85.00, preco_venda: 160.00 },

  // Suspensão
  { nome: 'Amortecedor Dianteiro Monroe',     categoria: 'suspensao',   unidade: 'un',  quantidade: 2,  quantidade_minima: 2,  preco_custo: 180.00, preco_venda: 340.00 },
  { nome: 'Mola Dianteira',                   categoria: 'suspensao',   unidade: 'un',  quantidade: 2,  quantidade_minima: 1,  preco_custo: 95.00, preco_venda: 180.00 },
  { nome: 'Batente de Amortecedor',           categoria: 'suspensao',   unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 28.00, preco_venda: 55.00 },
  { nome: 'Pivô de Suspensão',                categoria: 'suspensao',   unidade: 'un',  quantidade: 3,  quantidade_minima: 2,  preco_custo: 65.00, preco_venda: 125.00 },
  { nome: 'Bandeja de Suspensão Dianteira',   categoria: 'suspensao',   unidade: 'un',  quantidade: 1,  quantidade_minima: 1,  preco_custo: 220.00, preco_venda: 420.00 },

  // Outros
  { nome: 'Palheta de Para-brisa (Par)',      categoria: 'outros',       unidade: 'par', quantidade: 8,  quantidade_minima: 3,  preco_custo: 28.00, preco_venda: 55.00 },
  { nome: 'Líquido de Direção Hidráulica',    categoria: 'outros',       unidade: 'lt',  quantidade: 5,  quantidade_minima: 2,  preco_custo: 15.00, preco_venda: 30.00 },
  { nome: 'Gás Refrigerante R134a 1kg',       categoria: 'outros',       unidade: 'un',  quantidade: 4,  quantidade_minima: 2,  preco_custo: 65.00, preco_venda: 125.00 },
]

async function seed() {
  console.log(`\n🌱 Iniciando seed de estoque para oficina: ${OFICINA_ID}\n`)

  const batch = db.batch()
  const agora = FieldValue.serverTimestamp()
  let count   = 0

  for (const item of itensEstoque) {
    const ref = db.collection('estoque').doc()
    batch.set(ref, {
      ...item,
      id:          ref.id,
      oficina_id:  OFICINA_ID,
      // campo indexado para busca por prefixo (lowercase)
      nome_lower:  item.nome.toLowerCase(),
      createdAt:   agora,
      updatedAt:   agora,
    })
    count++
    console.log(`  ✅ ${item.nome}`)
  }

  await batch.commit()
  console.log(`\n✨ Seed concluído! ${count} itens inseridos no estoque.\n`)
}

seed().catch(err => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
