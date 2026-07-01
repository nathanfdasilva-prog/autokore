'use client'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface Ponto {
  data:  string
  valor: number
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function TooltipCustom({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{ background: '#2c2a28', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
      <div style={{ opacity: 0.7, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{brl(payload[0].value)}</div>
    </div>
  )
}

export default function GraficoFaturamento({ dados, altura = 240 }: { dados: Ponto[]; altura?: number }) {
  const temValor = dados.some(d => d.valor > 0)

  if (!temValor) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height: altura }}>
        Nenhum faturamento neste período.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="corFaturamento" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e85d04" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#e85d04" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" vertical={false} />
        <XAxis
          dataKey="data"
          tick={{ fontSize: 11, fill: '#9a9690' }}
          axisLine={{ stroke: '#e5e2dd' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9a9690' }}
          axisLine={false}
          tickLine={false}
          width={55}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip content={<TooltipCustom />} />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="#e85d04"
          strokeWidth={2.5}
          fill="url(#corFaturamento)"
          dot={{ r: 3, fill: '#e85d04', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#e85d04', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}