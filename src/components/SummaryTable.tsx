import type { YearlyData } from '../types/simulation'

interface Props {
  years: YearlyData[]
}

const fmt = (v: number) => `${Math.round(v).toLocaleString()}`

const ROWS: { label: string; key: keyof Pick<YearlyData, 'incomeAnnual' | 'expensesAnnual' | 'netAnnual' | 'assetsEnd'>; color?: (v: number) => string }[] = [
  { label: '収入', key: 'incomeAnnual', color: () => 'text-emerald-400' },
  { label: '支出', key: 'expensesAnnual', color: () => 'text-white/60' },
  {
    label: '収支',
    key: 'netAnnual',
    color: (v) => (v >= 0 ? 'text-emerald-400' : 'text-red-400'),
  },
  {
    label: '資産残高',
    key: 'assetsEnd',
    color: (v) => (v >= 0 ? 'text-white/90' : 'text-red-400'),
  },
]

export function SummaryTable({ years }: Props) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {/* 左端の行ラベル列ヘッダー */}
              <th className="sticky left-0 z-10 bg-[#080c14] px-4 py-3 text-left text-white/40 font-medium whitespace-nowrap min-w-[5rem]">
                万円
              </th>
              {years.map((y) => (
                <th
                  key={y.age}
                  className="px-3 py-3 text-right text-white/40 font-medium whitespace-nowrap min-w-[5rem]"
                >
                  {y.age}歳
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr
                key={row.key}
                className={`border-b border-white/5 ${ri % 2 === 0 ? '' : 'bg-white/[0.015]'} ${
                  row.key === 'assetsEnd' ? 'font-bold' : ''
                }`}
              >
                {/* 行ラベル（スクロールしても固定） */}
                <td className="sticky left-0 z-10 bg-[#080c14] px-4 py-2.5 text-white/60 font-medium whitespace-nowrap">
                  {row.label}
                </td>
                {years.map((y) => {
                  const v = y[row.key]
                  const colorClass = row.color ? row.color(v) : 'text-white/80'
                  return (
                    <td key={y.age} className={`px-3 py-2.5 text-right whitespace-nowrap tabular-nums ${colorClass}`}>
                      {row.key === 'netAnnual' && v >= 0 ? '+' : ''}
                      {fmt(v)}
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
