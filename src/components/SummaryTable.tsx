import type { YearlyData } from '../types/simulation'

interface Props {
  years: YearlyData[]
}

const fmt = (v: number) =>
  `${Math.round(v).toLocaleString()}万円`

const fmtNet = (v: number) =>
  `${v >= 0 ? '+' : ''}${Math.round(v).toLocaleString()}万円`

export function SummaryTable({ years }: Props) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {['年齢', '収入', '支出', '収支', '資産残高'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-right first:text-left text-white/40 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((y, i) => {
              const isNegative = y.assetsEnd < 0
              return (
                <tr
                  key={y.age}
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                    i % 2 === 0 ? '' : 'bg-white/[0.015]'
                  }`}
                >
                  <td className="px-4 py-2.5 text-white/80 font-medium">{y.age}歳</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400">{fmt(y.incomeAnnual)}</td>
                  <td className="px-4 py-2.5 text-right text-white/60">{fmt(y.expensesAnnual)}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-medium ${
                      y.netAnnual >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {fmtNet(y.netAnnual)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-bold ${
                      isNegative ? 'text-red-400' : 'text-white/90'
                    }`}
                  >
                    {fmt(y.assetsEnd)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
