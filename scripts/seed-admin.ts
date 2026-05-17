// ============================================================
// SEED DE USUÁRIO ADMIN + OFICINA — scripts/seed-admin.ts
//
// Cria o documento da oficina e promove um usuário a admin.
// Execute APÓS o usuário ter feito o primeiro login no app.
//
// USO:
//   UID_ADMIN=abc123 OFICINA_NOME="Oficina do Zé" \
//   npx ts-node scripts/seed-admin.ts
// ============================================================

import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const UID_ADMIN    = process.env.UID_ADMIN    ?? ''
const OFICINA_NOME = process.env.OFICINA_NOME ?? 'Minha Oficina'

if (!UID_ADMIN) {
  console.error('❌ Defina a variável UID_ADMIN antes de rodar o script.')
  process.exit(1)
}

initializeApp()
const db = getFirestore()

async function seedAdmin() {
  console.log(`\n🔧 Configurando admin: ${UID_ADMIN}\n`)

  // 1. Cria documento da oficina
  const oficinRef = db.collection('oficinas').doc()
  await oficinRef.set({
    id:        oficinRef.id,
    nome:      OFICINA_NOME,
    dono_uid:  UID_ADMIN,
    plano:     'pro',
    ativo:     true,
    createdAt: FieldValue.serverTimestamp(),
  })
  console.log(`  ✅ Oficina criada: ${oficinRef.id}`)

  // 2. Atualiza usuário para admin com oficina_id
  const userRef = db.collection('users').doc(UID_ADMIN)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    console.error(`  ❌ Usuário ${UID_ADMIN} não encontrado no Firestore.`)
    console.error('     Faça o login no app primeiro para criar o documento.')
    process.exit(1)
  }

  await userRef.update({
    role:       'admin',
    oficina_id: oficinRef.id,
    updatedAt:  FieldValue.serverTimestamp(),
  })
  console.log(`  ✅ Usuário promovido a admin`)
  console.log(`\n✨ Setup concluído!`)
  console.log(`   Oficina ID: ${oficinRef.id}`)
  console.log(`   Use este ID no script seed-estoque.ts\n`)
}

seedAdmin().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
