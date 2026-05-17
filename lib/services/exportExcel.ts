// ============================================================
// EXPORTAÇÃO EXCEL — lib/services/exportExcel.ts
// Gera planilhas .xlsx sem dependência de backend.
// Usa a biblioteca SheetJS (xlsx) já disponível no projeto.
// ============================================================

import type { OrdemServico, ItemEstoque, MovimentacaoEstoque, Agendamento } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmt = (d: Date | undefined) =>
  d ? format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'

// ----------------------------------------------------------
// Helper: gera e faz download do arquivo
// ----------------------------------------------------------
async function baixarXLSX(dados: object[][], nomePlanilha: string, nomeArquivo: string) {
  // Importa SheetJS dinamicamente (já listado no package.json)
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(dados)

  // Largura automática das colunas
  const colWidths = dados[0]?.map((_, colIdx) => ({
    wch: Math.max(...dados.map(row => String(row[colIdx] ?? '').length), 12),
  })) ?? []
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, nomePlanilha)
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`)
}

// ----------------------------------------------------------
// 1. Relatório de Faturamento (OS concluídas)
// ----------------------------------------------------------
export async function exportarFaturamento(
  ordens:      OrdemServico[],
  periodo:     string,
  oficina:     string,
) {
  const cabecalho = [
    ['AutoKore — Relatório de Faturamento'],
    [`Oficina: ${oficina}  |  Período: ${periodo}`],
    [`Gerado em: ${fmt(new Date())}`],
    [],
    ['#OS', 'Data', 'Cliente', 'Veículo', 'Placa', 'Mecânico',
     'Peças (R$)', 'Mão de obra (R$)', 'Total (R$)', 'Pagamento'],
  ]

  const linhas = ordens.map(os => [
    `#${String(os.numero).padStart(4, '0')}`,
    fmt(os.finalizadaAt ?? os.createdAt),
    os.cliente_nome,
    os.veiculo,
    os.placa,
    os.mecanico_nome,
    os.valor_pecas,
    os.valor_mao_obra,
    os.valor_total,
    os.forma_pagamento?.replace('_', ' ') ?? '—',
  ])

  // Linha de totais
  const totalPecas  = ordens.reduce((s, o) => s + o.valor_pecas, 0)
  const totalMO     = ordens.reduce((s, o) => s + o.valor_mao_obra, 0)
  const totalGeral  = ordens.reduce((s, o) => s + o.valor_total, 0)
  const rodape = [
    [],
    ['', '', '', '', '', 'TOTAL', totalPecas, totalMO, totalGeral, ''],
    ['', '', '', '', '', 'Ticket médio', '', '',
     ordens.length > 0 ? totalGeral / ordens.length : 0, ''],
    ['', '', '', '', '', 'Qtd OS', '', '', ordens.length, ''],
  ]

  await baixarXLSX(
    [...cabecalho, ...linhas, ...rodape],
    'Faturamento',
    `faturamento_${format(new Date(), 'yyyyMM')}_${oficina.replace(/\s/g, '_')}`,
  )
}

// ----------------------------------------------------------
// 2. Relatório de Estoque
// ----------------------------------------------------------
export async function exportarEstoque(
  itens:    ItemEstoque[],
  oficina:  string,
) {
  const cabecalho = [
    ['AutoKore — Relatório de Estoque'],
    [`Oficina: ${oficina}  |  Gerado em: ${fmt(new Date())}`],
    [],
    ['Nome', 'Categoria', 'Unidade', 'Qtd atual', 'Qtd mínima',
     'Status', 'Custo unit. (R$)', 'Venda unit. (R$)', 'Valor total (R$)'],
  ]

  const linhas = itens.map(item => [
    item.nome,
    item.categoria,
    item.unidade,
    item.quantidade,
    item.quantidade_minima,
    item.quantidade <= item.quantidade_minima ? 'CRÍTICO' : 'OK',
    item.preco_custo,
    item.preco_venda,
    item.quantidade * item.preco_custo,
  ])

  const valorTotal = itens.reduce((s, i) => s + i.quantidade * i.preco_custo, 0)
  const rodape = [
    [],
    ['', '', '', '', '', '', '', 'VALOR TOTAL:', valorTotal],
    ['', '', '', '', '', '', '', 'Total de itens:', itens.length],
    ['', '', '', '', '', '', '', 'Itens críticos:',
     itens.filter(i => i.quantidade <= i.quantidade_minima).length],
  ]

  await baixarXLSX(
    [...cabecalho, ...linhas, ...rodape],
    'Estoque',
    `estoque_${format(new Date(), 'yyyyMMdd')}`,
  )
}

// ----------------------------------------------------------
// 3. Histórico de movimentações
// ----------------------------------------------------------
export async function exportarMovimentacoes(
  movs:    MovimentacaoEstoque[],
  nomes:   Record<string, string>,  // item_id → nome
  oficina: string,
) {
  const cabecalho = [
    ['AutoKore — Movimentações de Estoque'],
    [`Oficina: ${oficina}  |  Gerado em: ${fmt(new Date())}`],
    [],
    ['Data / Hora', 'Tipo', 'Peça', 'Qtd', 'OS vinculada', 'Responsável', 'Motivo'],
  ]

  const linhas = movs.map(m => [
    fmt(m.createdAt),
    m.tipo === 'entrada' ? 'Entrada' : 'Saída',
    nomes[m.item_id] ?? m.item_id,
    m.tipo === 'entrada' ? `+${m.quantidade}` : `-${m.quantidade}`,
    m.os_id ? `OS vinculada` : '—',
    m.usuario_nome,
    m.motivo ?? '—',
  ])

  await baixarXLSX(
    [...cabecalho, ...linhas],
    'Movimentações',
    `movimentacoes_${format(new Date(), 'yyyyMMdd')}`,
  )
}

// ----------------------------------------------------------
// 4. Relatório de Agendamentos
// ----------------------------------------------------------
export async function exportarAgendamentos(
  agendamentos: Agendamento[],
  oficina:      string,
) {
  const cabecalho = [
    ['AutoKore — Relatório de Agendamentos'],
    [`Oficina: ${oficina}  |  Gerado em: ${fmt(new Date())}`],
    [],
    ['Data', 'Horário', 'Cliente', 'WhatsApp', 'Veículo', 'Placa', 'Serviço', 'Mecânico', 'Status'],
  ]

  const linhas = agendamentos.map(ag => [
    format(ag.data_hora, 'dd/MM/yyyy'),
    format(ag.data_hora, 'HH:mm'),
    ag.cliente_nome,
    ag.cliente_whatsapp,
    ag.veiculo,
    ag.placa,
    ag.servico,
    ag.mecanico_nome ?? '—',
    ag.status,
  ])

  await baixarXLSX(
    [...cabecalho, ...linhas],
    'Agendamentos',
    `agendamentos_${format(new Date(), 'yyyyMMdd')}`,
  )
}

// ----------------------------------------------------------
// 5. OS por mecânico (desempenho)
// ----------------------------------------------------------
export async function exportarDesempenhoMecanicos(
  dados: Array<{
    nome: string; os_mes: number; os_concluidas: number
    taxa_conclusao: number; faturamento_gerado: number
    ticket_medio: number; tempo_medio_min: number
  }>,
  mes:     string,
  oficina: string,
) {
  const cabecalho = [
    [`AutoKore — Desempenho de Mecânicos — ${mes}`],
    [`Oficina: ${oficina}  |  Gerado em: ${fmt(new Date())}`],
    [],
    ['Mecânico', 'OS Abertas', 'OS Concluídas', 'Taxa (%)',
     'Faturamento Gerado (R$)', 'Ticket Médio (R$)', 'Tempo Médio (min)'],
  ]

  const linhas = dados.map(m => [
    m.nome, m.os_mes, m.os_concluidas,
    `${m.taxa_conclusao}%`,
    m.faturamento_gerado,
    m.ticket_medio,
    m.tempo_medio_min,
  ])

  await baixarXLSX(
    [...cabecalho, ...linhas],
    'Desempenho',
    `desempenho_${mes.replace(' ', '_').replace('/', '-')}`,
  )
}
