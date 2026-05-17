'use client'
// ============================================================
// GRÁFICO DE FATURAMENTO — components/dashboard/FaturamentoChart.tsx
// Barras em CSS puro — sem dependência de biblioteca de gráficos.
// ============================================================

interface BarData {
  data:  string
  valor: number
}

interface FaturamentoChartProps {
  dados:  BarData[]
  altura?: number
}

export default function FaturamentoChart({
  dados,
  altura = 120,
}: FaturamentoChartProps) {
  if (!dados || dados.length === 0) return null

  const maximo = Math.max(...dados.map(d => d.valor), 1)

  return (
    <div>
      <div
        className="flex items-end gap-2"
        style={{ height: `${altura}px` }}
      >
        {dados.map((d, i) => {
          const pct     = (d.valor / maximo) * 100
          const isHoje  = i === dados.length - 1
          const temValor = d.valor > 0

          return (
            <div
              key={d.data}
              className="flex-1 flex flex-col items-center justify-end gap-1 group relative"
            >
              {/* Tooltip */}
              {temValor && (
                <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                  R${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}

              {/* Barra */}
              <div
                className={`w-full rounded-t-md transition-all ${
                  isHoje
                    ? 'bg-orange-500'
                    : temValor
                    ? 'bg-orange-200 group-hover:bg-orange-300'
                    : 'bg-gray-100'
                }`}
                style={{
                  height: `${Math.max(pct, temValor ? 4 : 0)}%`,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels de data */}
      <div className="flex gap-2 mt-1.5">
        {dados.map(d => (
          <div key={d.data} className="flex-1 text-center text-[10px] text-gray-400">
            {d.data}
          </div>
        ))}
      </div>
    </div>
  )
}
