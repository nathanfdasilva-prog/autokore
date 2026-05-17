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

// ---- Gera HTML da OS para impressão ----
export function gerarHTMLOS(os: OrdemServico, oficina_nome: string, oficina_whatsapp?: string): string {
  const dataFormatada  = format(os.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  const dataFinalizada = os.finalizadaAt
    ? format(os.finalizadaAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : '—'

  const itensHTML = os.itens.length > 0
    ? os.itens.map(item => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f0ede9">${item.nome}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0ede9;text-align:center">${item.quantidade}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0ede9;text-align:right">${brl(item.preco_unitario)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0ede9;text-align:right;font-weight:600">${brl(item.subtotal)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="padding:12px 8px;color:#9a9690;text-align:center">Nenhuma peça registrada</td></tr>'

  const statusLabel: Record<string, string> = {
    aberta: 'Aberta', em_andamento: 'Em andamento',
    aguardando_pecas: 'Aguardando peças', concluida: 'Concluída', cancelada: 'Cancelada',
  }
  const pagLabel: Record<string, string> = {
    pix: 'PIX', dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de crédito', cartao_debito: 'Cartão de débito',
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>OS #${String(os.numero).padStart(4,'0')} — ${os.cliente_nome}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #2c2a28; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 3px solid #e85d04; }
    .logo { font-size: 22px; font-weight: 800; color: #e85d04; }
    .logo span { color: #5c5955; font-weight: 400; font-size: 16px; }
    .oficina-info { text-align: right; font-size: 11px; color: #5c5955; }
    .os-num { font-size: 18px; font-weight: 700; color: #2c2a28; }
    .os-num span { font-size: 11px; color: #9a9690; font-weight: 400; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: ${os.status === 'concluida' ? '#e1f5ee' : '#fff0e6'}; color: ${os.status === 'concluida' ? '#0f6e56' : '#b34500'}; border: 1px solid ${os.status === 'concluida' ? '#a8e6ce' : '#f5c4b3'}; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9a9690; margin-bottom: 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .field { background: #f9f8f6; border-radius: 6px; padding: 8px 10px; }
    .field-label { font-size: 10px; color: #9a9690; margin-bottom: 2px; }
    .field-value { font-size: 12px; font-weight: 500; color: #2c2a28; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9f8f6; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; color: #9a9690; padding: 7px 8px; border-bottom: 2px solid #d8d5ce; }
    th:last-child, td:last-child { text-align: right; }
    th:nth-child(2), td:nth-child(2) { text-align: center; }
    .totais { margin-top: 8px; padding-top: 8px; border-top: 2px solid #d8d5ce; }
    .total-row { display: flex; justify-content: space-between; padding: 3px 8px; font-size: 12px; }
    .total-final { display: flex; justify-content: space-between; padding: 8px; background: #fff0e6; border-radius: 6px; font-size: 14px; font-weight: 700; color: #b34500; margin-top: 4px; }
    .obs-box { background: #f9f8f6; border-radius: 6px; padding: 10px; font-size: 11px; color: #5c5955; min-height: 40px; }
    .assinatura { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
    .assin-linha { border-top: 1px solid #9a9690; padding-top: 5px; text-align: center; font-size: 10px; color: #9a9690; }
    .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #f0ede9; text-align: center; font-size: 10px; color: #9a9690; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="logo">AutoKore<span>.app</span></div>
      <div style="margin-top:4px" class="os-num">
        OS #${String(os.numero).padStart(4,'0')}
        <span>· ${statusLabel[os.status] ?? os.status}</span>
      </div>
      <div style="margin-top:6px"><span class="status-badge">${statusLabel[os.status] ?? os.status}</span></div>
    </div>
    <div class="oficina-info">
      <div style="font-size:14px;font-weight:700;color:#2c2a28">${oficina_nome}</div>
      ${oficina_whatsapp ? `<div>${oficina_whatsapp}</div>` : ''}
      <div style="margin-top:4px;color:#9a9690">Aberta em: ${dataFormatada}</div>
      ${os.finalizadaAt ? `<div style="color:#9a9690">Finalizada em: ${dataFinalizada}</div>` : ''}
    </div>
  </div>

  <!-- CLIENTE / VEÍCULO -->
  <div class="section">
    <div class="section-title">Cliente e Veículo</div>
    <div class="grid-3">
      <div class="field"><div class="field-label">Cliente</div><div class="field-value">${os.cliente_nome}</div></div>
      <div class="field"><div class="field-label">WhatsApp</div><div class="field-value">${os.cliente_whatsapp || '—'}</div></div>
      <div class="field"><div class="field-label">Veículo</div><div class="field-value">${os.veiculo}</div></div>
      <div class="field"><div class="field-label">Placa</div><div class="field-value" style="font-family:monospace;font-weight:700">${os.placa}</div></div>
      <div class="field"><div class="field-label">Tipo</div><div class="field-value" style="text-transform:capitalize">${os.tipo_veiculo}</div></div>
      ${os.km_entrada ? `<div class="field"><div class="field-label">Km entrada</div><div class="field-value">${os.km_entrada.toLocaleString('pt-BR')} km</div></div>` : '<div></div>'}
    </div>
  </div>

  <!-- SERVIÇO -->
  <div class="section">
    <div class="section-title">Serviço / Problema relatado</div>
    <div class="obs-box">${os.descricao_problema}</div>
  </div>

  <!-- MECÂNICO -->
  <div class="section">
    <div class="section-title">Mecânico responsável</div>
    <div class="field" style="display:inline-block;min-width:200px">
      <div class="field-value">${os.mecanico_nome}</div>
    </div>
  </div>

  <!-- PEÇAS -->
  <div class="section">
    <div class="section-title">Peças e produtos utilizados</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="width:60px">Qtd</th>
          <th style="width:100px;text-align:right">Preço unit.</th>
          <th style="width:100px">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itensHTML}</tbody>
    </table>
    <div class="totais">
      <div class="total-row"><span>Subtotal peças:</span><span>${brl(os.valor_pecas)}</span></div>
      <div class="total-row"><span>Mão de obra:</span><span>${brl(os.valor_mao_obra)}</span></div>
      ${os.forma_pagamento ? `<div class="total-row"><span>Forma de pagamento:</span><span>${pagLabel[os.forma_pagamento] ?? os.forma_pagamento}</span></div>` : ''}
      <div class="total-final"><span>TOTAL</span><span>${brl(os.valor_total)}</span></div>
    </div>
  </div>

  <!-- OBSERVAÇÕES -->
  ${os.observacoes_internas ? `
  <div class="section">
    <div class="section-title">Observações</div>
    <div class="obs-box">${os.observacoes_internas}</div>
  </div>` : ''}

  <!-- ASSINATURAS -->
  <div class="assinatura">
    <div class="assin-linha">Assinatura do cliente</div>
    <div class="assin-linha">Assinatura do mecânico</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    Documento gerado por AutoKore.app · ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
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
