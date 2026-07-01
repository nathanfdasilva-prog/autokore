'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Fatia {
  nome:  string
  valor: number
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Paleta de cores pras formas de pagamento
const CORES = ['#e85d04', '#2c9e6f', '#3b82f6', '#a855f7', '#9a9690']

function TooltipCustom({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]
  return (
    <div style={{ background: '#2c2a28', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
      <div style={{ opacity: 0.7, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontWeight: 700 }}>{brl(p.value)}</div>
    </div>
  )
}

export default function GraficoPagamentos({ dados, altura = 200 }: { dados: Fatia[]; altura?: number }) {
  const total = dados.reduce((s, d) => s + d.valor, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height: altura }}>
        Sem dados de pagamento.
      </div>
    )
  }

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={altura}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius={altura * 0.28}
              outerRadius={altura * 0.42}
              paddingAngle={2}
              stroke="none"
            >
              {dados.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
            </Pie>
            <Tooltip content={<TooltipCustom />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Total no centro da rosca */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 10, color: '#9a9690', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#2c2a28' }}>{brl(total)}</div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-3 space-y-1.5">
        {dados.sort((a, b) => b.valor - a.valor).map((d, i) => {
          const pct = total > 0 ? (d.valor / total) * 100 : 0
          return (
            <div key={d.nome} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: CORES[dados.indexOf(d) % CORES.length], display: 'inline-block' }} />
                <span className="text-gray-600">{d.nome}</span>
              </div>
              <span className="font-semibold text-gray-800">{brl(d.valor)} <span className="text-gray-400 font-normal">({pct.toFixed(0)}%)</span></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}