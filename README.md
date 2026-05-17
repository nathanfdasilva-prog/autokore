# AutoKore.app — Documentação Completa

SaaS de gestão para oficinas mecânicas de carros e motos.
Next.js 14 + Firebase + Tailwind CSS + TypeScript.

---

## Stack

| Camada     | Tecnologia |
|------------|------------|
| Frontend   | Next.js 14 App Router + TypeScript |
| Estilos    | Tailwind CSS |
| Auth       | Firebase Authentication (Google + Email) |
| Banco      | Firestore (NoSQL — real-time) |
| Hosting    | Vercel (recomendado) ou Firebase Hosting |
| PWA        | Service Worker + Web App Manifest |
| PDF        | API de impressão do browser (sem lib) |
| Excel      | SheetJS (xlsx) — client-side |
| WhatsApp   | Link wa.me + Evolution API (self-hosted) |
| CI/CD      | GitHub Actions |

---

## Setup em 5 passos

### 1. Instalar

```bash
git clone https://github.com/seu-usuario/autokore.git
cd autokore && npm install
```

### 2. Firebase Console

1. https://console.firebase.google.com → Criar projeto
2. **Authentication** → habilitar Google + Email/Senha
3. **Firestore** → Criar banco → modo produção
4. **Project Settings → Web App** → copiar credenciais

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
# Preencha com as credenciais do Firebase
```

### 4. Deploy Firestore

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
# Índices levam 2–5 min para ativar
```

### 5. Rodar

```bash
npm run dev  # http://localhost:3000
```

---

## Primeiro admin

```bash
# 1. Faça login no app
# 2. Copie seu UID em Firebase Console → Authentication

UID_ADMIN=SEU_UID OFICINA_NOME="Oficina do João" \
  npx ts-node scripts/seed-admin.ts

# Seed de dados de teste (opcional):
# Edite OFICINA_ID e ADMIN_UID em scripts/seed-completo.ts
npx ts-node scripts/seed-completo.ts
```

---

## Deploy Vercel (produção)

```bash
# 1. Conecte o repo em vercel.com → New Project
# 2. Adicione TODAS as variáveis do .env.example em Settings → Env Vars
# 3. git push → deploy automático

# Domínio no Firebase:
# Authentication → Settings → Authorized domains → adicionar seu domínio
```

## Deploy Firebase Hosting

```bash
# Em next.config.js, descomente:
# output: 'export', distDir: 'out'

npm run build
firebase deploy --only hosting
```

---

## Estrutura de coleções Firestore

```
users/                  → admins e mecânicos (role, oficina_id)
oficinas/               → dados da oficina (plano, rede_dono_uid)
ordens_servico/         → OS com itens e financeiro
orcamentos/             → orçamentos pré-OS (status: rascunho→convertido)
agendamentos/           → calendário de serviços
estoque/                → peças (nome_lower indexado para busca)
movimentacoes_estoque/  → histórico append-only (imutável)
clientes/               → cadastro de clientes
veiculos/               → vinculados a clientes
avaliacoes/             → avaliações pós-OS (leitura pública)
```

---

## Roles e acesso

| Módulo                | Admin | Mecânico |
|-----------------------|-------|----------|
| Dashboard + KPIs      | ✅    | ❌       |
| Agendamentos          | ✅    | ❌       |
| Clientes              | ✅    | ❌       |
| Orçamentos            | ✅    | ❌       |
| Estoque (CRUD)        | ✅    | leitura  |
| Faturamento           | ✅    | ❌       |
| Desempenho equipe     | ✅    | ❌       |
| Avaliações            | ✅    | ❌       |
| Equipe                | ✅    | ❌       |
| Rede (multi-unidade)  | ✅    | ❌       |
| Minhas OS             | ✅    | ✅       |
| Abrir/finalizar OS    | ✅    | ✅       |
| Configurações perfil  | ✅    | ✅       |

---

## Fluxo completo de atendimento

```
Agendamento criado → WhatsApp de confirmação enviado
        ↓
[Opcional] Orçamento → enviado via WhatsApp → aprovado pelo cliente
        ↓
Orçamento aprovado → "Gerar OS" com 1 clique
        ↓
Mecânico: aberta → em_andamento → adiciona peças em tempo real
        ↓
Finalizar OS → runTransaction() → baixa atômica do estoque
        ↓
Admin: "Veículo pronto" via WhatsApp + link de avaliação
        ↓
Cliente avalia em /avaliar/{os_id} (sem login)
        ↓
NPS calculado automaticamente no painel de Avaliações
```

---

## WhatsApp

```ts
// Sem configuração (link direto):
import { abrirWhatsApp, TEMPLATES } from '@/lib/services/whatsapp'
abrirWhatsApp('69999990000', TEMPLATES.os_concluida({ ... }))

// Com Evolution API self-hosted (gratuito):
// 1. Deploy: https://github.com/EvolutionAPI/evolution-api
// 2. Configure EVOLUTION_API_* no .env.local
// 3. POST /api/whatsapp → envia via servidor
```

---

## Exportação Excel

```ts
import { exportarFaturamento } from '@/lib/services/exportExcel'

// Disponível em: Faturamento, Estoque, Movimentações,
//                Agendamentos, Desempenho de mecânicos
await exportarFaturamento(ordens, 'Maio 2025', 'Oficina do João')
// → baixa arquivo .xlsx diretamente no browser
```

---

## PWA — Instalar no celular

O app é instalável via banner automático (botão "Instalar app").

No iOS: Safari → Compartilhar → Adicionar à Tela de Início

---

## Troubleshooting

```
"Missing or insufficient permissions"
→ firebase deploy --only firestore:rules

"The query requires an index"
→ firebase deploy --only firestore:indexes (aguarde 2–5 min)

Login Google não funciona em produção
→ Firebase Console → Authentication → Authorized domains → adicionar domínio

Build falha — variáveis não encontradas
→ Verifique se todas NEXT_PUBLIC_FIREBASE_* estão no .env.local e no Vercel
```

---

## Scripts

```bash
npm run dev                                          # desenvolvimento
npm run build                                        # build produção
firebase deploy --only firestore:rules,indexes       # regras + índices
npx ts-node scripts/seed-admin.ts                   # cria primeiro admin
npx ts-node scripts/seed-completo.ts                # popula dados de teste
```

---

**Versão 1.0.0 — 8 partes — 80 arquivos**
