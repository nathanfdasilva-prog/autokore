// ============================================================
// GERADOR DE PDF DE OS — lib/services/osPDF.ts
// Gera o PDF da OS usando a API de impressão do navegador.
// Sem dependência externa — funciona em qualquer browser.
// ============================================================

import type { OrdemServico } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ---- Formata moeda ----
const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const escapeHTML = (s: string) =>
  (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ---- Gera HTML da OS para impressão ----
export function gerarHTMLOS(os: OrdemServico, oficina_nome: string, oficina_whatsapp?: string): string {
  const dataFormatada  = format(os.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  const dataFinalizada = os.finalizadaAt
    ? format(os.finalizadaAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : '—'

  const itensHTML = os.itens.length > 0
    ? os.itens.map(item => `
        <tr>
          <td class="td-desc">${escapeHTML(item.nome)}</td>
          <td class="td-center">${item.quantidade}</td>
          <td class="td-right">${brl(item.preco_unitario)}</td>
          <td class="td-right td-bold">${brl(item.subtotal)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="td-empty">Nenhuma peça registrada</td></tr>'

  const statusLabel: Record<string, string> = {
    aguardando_aprovacao: 'Aguardando aprovação',
    aberta: 'Aberta', em_andamento: 'Em andamento',
    aguardando_pecas: 'Aguardando peças', concluida: 'Concluída', cancelada: 'Cancelada',
  }
  const pagLabel: Record<string, string> = {
    pix: 'PIX', dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de crédito', cartao_debito: 'Cartão de débito',
  }

  // Define cor do status
  const statusCor =
    os.status === 'concluida'   ? { bg: '#e1f5ee', fg: '#0f6e56', bd: '#a8e6ce' }
    : os.status === 'cancelada' ? { bg: '#fde8e8', fg: '#b42318', bd: '#f3b4b0' }
    : { bg: '#fff0e6', fg: '#b34500', bd: '#f5c4b3' }

  // Título do documento: orçamento vs OS fechada
  const ehOrcamento = os.status === 'aguardando_aprovacao' || (os.status !== 'concluida' && os.valor_total === 0)
  const tituloDoc = os.status === 'concluida' ? 'ORDEM DE SERVIÇO' : ehOrcamento ? 'ORÇAMENTO' : 'ORDEM DE SERVIÇO'

  const iniciais = oficina_nome.trim().charAt(0).toUpperCase() || 'A'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${tituloDoc} #${String(os.numero).padStart(4,'0')} — ${escapeHTML(os.cliente_nome)}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #2c2a28; line-height: 1.45; }

    /* CABEÇALHO */
    .topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; background: linear-gradient(135deg, #e85d04 0%, #d84d00 100%); color: #fff; padding: 18px 22px; border-radius: 12px; }
    .topbar-left { display: flex; align-items: center; gap: 14px; }
    .logo-circle { width: 46px; height: 46px; border-radius: 12px; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0; }
    .oficina-nome { font-size: 19px; font-weight: 800; line-height: 1.1; }
    .oficina-sub { font-size: 11px; opacity: .9; margin-top: 2px; }
    .topbar-right { text-align: right; }
    .doc-tipo { font-size: 11px; font-weight: 600; letter-spacing: 1px; opacity: .85; }
    .doc-num { font-size: 24px; font-weight: 800; line-height: 1; margin-top: 2px; }

    /* faixa abaixo do header */
    .subbar { display: flex; justify-content: space-between; align-items: center; margin: 14px 0 20px; padding-bottom: 14px; border-bottom: 1px solid #ececec; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .datas { text-align: right; font-size: 10.5px; color: #8a8680; line-height: 1.5; }

    .section { margin-bottom: 18px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #b0aca6; margin-bottom: 9px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .field { background: #faf9f7; border: 1px solid #f0ede9; border-radius: 8px; padding: 9px 12px; }
    .field-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: .3px; color: #b0aca6; margin-bottom: 3px; }
    .field-value { font-size: 13px; font-weight: 600; color: #2c2a28; }

    .servico-box { background: #faf9f7; border-left: 3px solid #e85d04; border-radius: 8px; padding: 12px 14px; font-size: 12.5px; color: #3c3a37; white-space: pre-line; }

    .mec-chip { display: inline-flex; align-items: center; gap: 8px; background: #faf9f7; border: 1px solid #f0ede9; border-radius: 999px; padding: 7px 16px; }
    .mec-dot { width: 26px; height: 26px; border-radius: 50%; background: #fff0e6; color: #b34500; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 12px; }

    /* TABELA */
    table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
    thead th { background: #2c2a28; color: #fff; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; padding: 9px 10px; }
    th.th-center, td.td-center { text-align: center; }
    th.th-right, td.td-right { text-align: right; }
    td { padding: 8px 10px; border-bottom: 1px solid #f0ede9; font-size: 12px; }
    .td-desc { font-weight: 500; }
    .td-bold { font-weight: 700; }
    .td-empty { padding: 16px; color: #b0aca6; text-align: center; font-style: italic; }
    tbody tr:nth-child(even) td { background: #faf9f7; }

    /* TOTAIS */
    .resumo { margin-top: 14px; margin-left: auto; width: 280px; }
    .resumo-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 12.5px; color: #5c5955; }
    .resumo-total { display: flex; justify-content: space-between; align-items: center; padding: 13px 16px; background: linear-gradient(135deg, #fff0e6 0%, #ffe4d1 100%); border: 1px solid #f5c4b3; border-radius: 10px; margin-top: 6px; }
    .resumo-total .lbl { font-size: 13px; font-weight: 700; color: #2c2a28; }
    .resumo-total .val { font-size: 22px; font-weight: 800; color: #b34500; }

    .obs-box { background: #faf9f7; border: 1px solid #f0ede9; border-radius: 8px; padding: 11px 14px; font-size: 11.5px; color: #5c5955; white-space: pre-line; }

    .assinatura { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 40px; }
    .assin-linha { border-top: 1.5px solid #c8c4bd; padding-top: 6px; text-align: center; font-size: 10px; color: #8a8680; }

    .footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #f0ede9; text-align: center; font-size: 10px; color: #b0aca6; }
    .footer strong { color: #e85d04; }
    @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <!-- CABEÇALHO -->
  <div class="topbar">
    <div class="topbar-left">
      <div class="logo-circle">${iniciais}</div>
      <div>
        <div class="oficina-nome">${escapeHTML(oficina_nome)}</div>
        ${oficina_whatsapp ? `<div class="oficina-sub">📱 ${escapeHTML(oficina_whatsapp)}</div>` : ''}
      </div>
    </div>
    <div class="topbar-right">
      <div class="doc-tipo">${tituloDoc}</div>
      <div class="doc-num">#${String(os.numero).padStart(4,'0')}</div>
    </div>
  </div>

  <!-- SUBBAR: status + datas -->
  <div class="subbar">
    <span class="status-badge" style="background:${statusCor.bg};color:${statusCor.fg};border:1px solid ${statusCor.bd}">
      ${statusLabel[os.status] ?? os.status}
    </span>
    <div class="datas">
      <div>Aberta em: ${dataFormatada}</div>
      ${os.finalizadaAt ? `<div>Finalizada em: ${dataFinalizada}</div>` : ''}
    </div>
  </div>

  <!-- CLIENTE / VEÍCULO -->
  <div class="section">
    <div class="section-title">Cliente e Veículo</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Cliente</div><div class="field-value">${escapeHTML(os.cliente_nome)}</div></div>
      <div class="field"><div class="field-label">Veículo</div><div class="field-value">${escapeHTML(os.veiculo)}</div></div>
      <div class="field"><div class="field-label">Placa</div><div class="field-value" style="font-family:monospace;letter-spacing:1px">${escapeHTML(os.placa)}</div></div>
      ${os.cliente_whatsapp ? `<div class="field"><div class="field-label">WhatsApp</div><div class="field-value">${escapeHTML(os.cliente_whatsapp)}</div></div>` : ''}
      <div class="field"><div class="field-label">Tipo</div><div class="field-value" style="text-transform:capitalize">${os.tipo_veiculo}</div></div>
      ${os.km_entrada ? `<div class="field"><div class="field-label">Km entrada</div><div class="field-value">${os.km_entrada.toLocaleString('pt-BR')} km</div></div>` : ''}
    </div>
  </div>

  <!-- SERVIÇO -->
  <div class="section">
    <div class="section-title">Serviço / Problema relatado</div>
    <div class="servico-box">${escapeHTML(os.descricao_problema)}</div>
  </div>

  <!-- MECÂNICO -->
  <div class="section">
    <div class="section-title">Mecânico responsável</div>
    <div class="mec-chip">
      <span class="mec-dot">${(os.mecanico_nome || 'M').charAt(0).toUpperCase()}</span>
      <span style="font-weight:600">${escapeHTML(os.mecanico_nome)}</span>
    </div>
  </div>

  <!-- PEÇAS -->
  <div class="section">
    <div class="section-title">Peças e produtos</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th class="th-center" style="width:60px">Qtd</th>
          <th class="th-right" style="width:110px">Preço unit.</th>
          <th class="th-right" style="width:110px">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itensHTML}</tbody>
    </table>

    <!-- RESUMO DE VALORES -->
    <div class="resumo">
      <div class="resumo-row"><span>Peças:</span><span>${brl(os.valor_pecas)}</span></div>
      <div class="resumo-row"><span>Mão de obra:</span><span>${brl(os.valor_mao_obra)}</span></div>
      ${os.forma_pagamento ? `<div class="resumo-row"><span>Pagamento:</span><span>${pagLabel[os.forma_pagamento] ?? os.forma_pagamento}</span></div>` : ''}
      <div class="resumo-total">
        <span class="lbl">TOTAL</span>
        <span class="val">${brl(os.valor_total)}</span>
      </div>
    </div>
  </div>

  <!-- OBSERVAÇÕES -->
  ${os.observacoes_internas ? `
  <div class="section">
    <div class="section-title">Observações</div>
    <div class="obs-box">${escapeHTML(os.observacoes_internas)}</div>
  </div>` : ''}

  <!-- ASSINATURAS -->
  <div class="assinatura">
    <div class="assin-linha">Assinatura do cliente</div>
    <div class="assin-linha">Assinatura do responsável</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    Documento gerado por <strong>AutoKore.app</strong> · ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
  </div>
</body>
</html>`
}

// ----------------------------------------------------------
// Abre janela de impressão / salvar como PDF
// ----------------------------------------------------------
export function imprimirOS(os: OrdemServico, oficina_nome: string, oficina_whatsapp?: string) {
  const html   = gerarHTMLOS(os, oficina_nome, oficina_whatsapp)
  const janela = window.open('', '_blank', 'width=800,height=900')
  if (!janela) {
    alert('Habilite popups para gerar o PDF.')
    return
  }
  janela.document.write(html)
  janela.document.close()
  janela.focus()
  setTimeout(() => janela.print(), 500)
}