import { useState, useMemo } from 'react'
import type { YearlyData, AssetCategory } from '../types/simulation'

interface Props {
  years: YearlyData[]
}

const fmt = (v: number) => `${Math.round(v).toLocaleString()}`

const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  '現金・預金': '#10b981',
  '積み立て': '#6366f1',
  '投資': '#f59e0b',
  'その他': '#64748b',
}

export function SummaryTable({ years }: Props) {
  const [assetExpanded, setAssetExpanded] = useState(false)

  // 資産アイテムの一覧（id → 表示ラベル）を全年のデータから収集
  const assetMeta = useMemo(() => {
    const seen = new Map<string, { category: AssetCategory; label: string }>()
    const categoryCount = new Map<AssetCategory, number>()

    for (const year of years) {
      for (const item of year.assetItemBalances) {
        if (!seen.has(item.id)) {
          const count = (categoryCount.get(item.category) ?? 0) + 1
          categoryCount.set(item.category, count)
          seen.set(item.id, { category: item.category, label: `${item.category}` })
        }
      }
    }

    // 同一カテゴリが複数ある場合は番号を付ける
    const categoryFinalCount = new Map<AssetCategory, number>()
    for (const { category } of seen.values()) {
      categoryFinalCount.set(category, (categoryFinalCount.get(category) ?? 0) + 1)
    }
    const categoryIndex = new Map<AssetCategory, number>()
    for (const [id, meta] of seen.entries()) {
      if ((categoryFinalCount.get(meta.category) ?? 0) > 1) {
        const idx = (categoryIndex.get(meta.category) ?? 0) + 1
        categoryIndex.set(meta.category, idx)
        seen.set(id, { ...meta, label: `${meta.category} ${idx}` })
      }
    }

    return seen
  }, [years])

  // 資産ごと・年齢ごとの残高マップ
  const assetBalanceMap = useMemo(() => {
    const map = new Map<string, Map<number, number>>()
    for (const year of years) {
      for (const item of year.assetItemBalances) {
        if (!map.has(item.id)) map.set(item.id, new Map())
        map.get(item.id)!.set(year.age, item.balance)
      }
    }
    return map
  }, [years])

  type RowDef = {
    label: string
    getValue: (y: YearlyData) => number
    color: (v: number) => string
    bold?: boolean
    prefix?: (v: number) => string
    expandable?: boolean
  }

  const rows: RowDef[] = [
    { label: '収入', getValue: (y) => y.incomeAnnual, color: () => 'text-emerald-400' },
    { label: '支出', getValue: (y) => y.expensesAnnual, color: () => 'text-white/60' },
    { label: '積立', getValue: (y) => y.contributionsAnnual, color: () => 'text-teal-400' },
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
      expandable: true,
    },
  ]

  const stickyCell = 'sticky left-0 z-10 bg-[#080c14]'

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className={`${stickyCell} px-4 py-3 text-left text-white/40 font-medium whitespace-nowrap min-w-[7rem]`}>
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
            {rows.map((row, ri) => (
              <>
                <tr
                  key={row.label}
                  className={`border-b border-white/5 ${ri % 2 === 0 ? '' : 'bg-white/[0.015]'} ${row.bold ? 'font-bold' : ''}`}
                >
                  <td className={`${stickyCell} px-4 py-2.5 text-white/60 font-medium whitespace-nowrap`}>
                    {row.expandable ? (
                      <button
                        onClick={() => setAssetExpanded((v) => !v)}
                        className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                      >
                        <span className={`text-xs transition-transform duration-200 ${assetExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                        {row.label}
                      </button>
                    ) : (
                      row.label
                    )}
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

                {/* 資産ごとのブレークダウン */}
                {row.expandable && assetExpanded && Array.from(assetMeta.entries()).map(([id, meta]) => (
                  <tr key={id} className="border-b border-white/[0.04] bg-white/[0.008]">
                    <td className={`${stickyCell} bg-[#060a11] pl-8 pr-4 py-2 whitespace-nowrap`}>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ASSET_CATEGORY_COLORS[meta.category] }}
                        />
                        <span className="text-xs text-white/40">{meta.label}</span>
                      </span>
                    </td>
                    {years.map((y) => {
                      const balance = assetBalanceMap.get(id)?.get(y.age) ?? 0
                      return (
                        <td key={y.age} className="px-3 py-2 text-right text-xs text-white/40 tabular-nums whitespace-nowrap">
                          {fmt(balance)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
