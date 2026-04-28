import type { YearlyData } from '../types/simulation'

interface Props {
  years: YearlyData[]
}

const fmt = (v: number) => `${Math.round(v).toLocaleString()}`

interface RowDef {
  label: string
  getValue: (y: YearlyData) => number
  color: (v: number) => string
  bold?: boolean
  prefix?: (v: number) => string
}

const ROWS: RowDef[] = [
  {
    label: '収入',
    getValue: (y) => y.incomeAnnual,
    color: () => 'text-emerald-400',
  },
  {
    label: '支出',
    getValue: (y) => y.expensesAnnual,
    color: () => 'text-white/60',
  },
  {
    label: '積立',
    getValue: (y) => y.contributionsAnnual,
    color: () => 'text-teal-400',
  },
  {
    label: '収支',
    getValue: (y) => y.netAnnual,
    color: (v) => (v >= 0 ? 'text-emerald-400' : 'text-red-400'),
    prefix: (v) => (v >= 0 ? '+' : ''),
  },
  {
    label: '運用益',
    getValue: (y) => y.investmentReturnAnnual,
    color: () => 'text-amber-400',
    prefix: () => '+',
  },
  {
    label: '資産残高',
    getValue: (y) => y.assetsEnd,
    color: (v) => (v >= 0 ? 'text-white/90' : 'text-red-400'),
    bold: true,
  },
]

export function SummaryTable({ years }: Props) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="sticky left-0 z-10 bg-[#080c14] px-4 py-3 text-left text-white/40 font-medium whitespace-nowrap min-w-[5rem]">
                万円
              </th>
              {years.map((y) => (
                <th key={y.age} className="px-3 py-3 text-right text-white/40 font-medium whitespace-nowrap min-w-[5rem]">
                  {y.age}歳
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr
                key={row.label}
                className={`border-b border-white/5 ${ri % 2 === 0 ? '' : 'bg-white/[0.015]'} ${row.bold ? 'font-bold' : ''}`}
              >
                <td className="sticky left-0 z-10 bg-[#080c14] px-4 py-2.5 text-white/60 font-medium whitespace-nowrap">
                  {row.label}
                </td>
                {years.map((y) => {
                  const v = row.getValue(y)
                  return (
                    <td key={y.age} className={`px-3 py-2.5 text-right whitespace-nowrap tabular-nums ${row.color(v)}`}>
                      {row.prefix ? row.prefix(v) : ''}{fmt(v)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
