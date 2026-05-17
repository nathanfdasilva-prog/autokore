# PARTE 2 — Módulo do Mecânico
## Resumo do que foi entregue

---

## Arquivos novos nesta parte

```
lib/
  firebase/
    firestore.ts          ← helpers e re-exports do Firestore
  hooks/
    useEstoque.ts         ← estoque em tempo real + busca + baixa atômica
    useOS.ts              ← CRUD completo de OS + finalização

components/
  os/
    BuscaPecas.tsx        ← busca em tempo real (prefix query Firestore)
    OSForm.tsx            ← formulário 3 etapas: Dados → Peças → Finalizar
    OSCard.tsx            ← card da listagem de OS

app/(mecanico)/
  os/
    page.tsx              ← listagem com filtros + busca
    nova/page.tsx         ← criação de nova OS
    [id]/page.tsx         ← detalhe + troca de status
    [id]/finalizar/
      page.tsx            ← fluxo dedicado de finalização

scripts/
  seed-admin.ts           ← cria oficina + promove primeiro admin
  seed-estoque.ts         ← popula 33 itens de estoque para testes

firestore.indexes.json    ← índices compostos obrigatórios
firebase.json             ← config hosting + emuladores
next.config.js            ← config Next.js otimizada
.gitignore
```

---

## Fluxo da OS (passo a passo)

```
Mecânico acessa /os/nova
      ↓
[Etapa 1] Preenche: cliente, veiculo, placa, problema
      ↓  criarOS() → Firestore (status: 'aberta')
[Etapa 2] Busca peças em tempo real (prefix query)
          Adiciona itens com quantidade
          Define valor de mão de obra
      ↓  salvarItensOS() → rascunho salvo
[Etapa 3] Revisão + forma de pagamento
      ↓  finalizarOS():
            1. baixarEstoque() → runTransaction() atômico
               - verifica saldo de cada item
               - decrementa quantidade no estoque
               - registra movimentação (append-only)
            2. updateDoc OS → status: 'concluida'
      ↓
  ✅ OS finalizada, estoque atualizado
```

---

## Transação atômica — Como funciona

```typescript
// lib/hooks/useEstoque.ts → baixarEstoque()
await runTransaction(db, async (transaction) => {
  for (const item of itens) {
    const snap = await transaction.get(itemRef)

    // Valida estoque DENTRO da transação (atomic read)
    if (snap.data().quantidade < item.quantidade) {
      throw new Error(`Estoque insuficiente para "${item.nome}"`)
    }

    // Decrementa
    transaction.update(itemRef, {
      quantidade: increment(-item.quantidade),
      updatedAt:  serverTimestamp(),
    })

    // Registra movimentação (imutável)
    transaction.set(movRef, { tipo: 'saida', os_id, ... })
  }
})
```

**Garantia:** se qualquer item falhar (estoque insuficiente, erro de rede),
toda a transação é revertida — nenhum item é decrementado parcialmente.

---

## Setup Rápido para Testes

```bash
# 1. Instalar emuladores Firebase
npm install -g firebase-tools
firebase login
firebase init emulators   # selecione: Auth, Firestore, Hosting

# 2. Rodar emuladores + Next.js
firebase emulators:start &
npm run dev

# 3. Criar admin (após primeiro login no app)
UID_ADMIN=SEU_UID OFICINA_NOME="Oficina Teste" \
  npx ts-node scripts/seed-admin.ts

# 4. Popular estoque (substitua o OFICINA_ID no arquivo)
npx ts-node scripts/seed-estoque.ts
```

---

## Índices — Deploy obrigatório

```bash
firebase deploy --only firestore:indexes,firestore:rules
```

Sem os índices compostos, as queries com múltiplos `where` + `orderBy`
retornam erro no Firestore.

---

## Próxima parte (PARTE 3)

- Dashboard do Admin (KPIs, faturamento diário/mensal, OS ativas)
- Módulo de Estoque (CRUD + histórico de movimentações)
- Tela de Agendamentos com calendário semanal/diário
