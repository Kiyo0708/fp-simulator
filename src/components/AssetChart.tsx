import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts'
import type { YearlyData, ExpenseCategory, AssetCategory } from '../types/simulation'

interface Props {
  years: YearlyData[]
}

type Tab = 'cashflow' | 'assets'

const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  '生活費': '#6366f1',
  '住宅': '#f59e0b',
  '子供関連': '#ec4899',
  '保険': '#8b5cf6',
  'その他': '#64748b',
}

const ASSET_COLORS: Record<AssetCategory, string> = {
  '現金・預金': '#10b981',
  '積み立て': '#6366f1',
  '投資': '#f59e0b',
  'その他': '#64748b',
}

const CONTRIB_COLOR = '#34d399'
const INCOME_COLOR = '#10b981'
const SURPLUS_COLOR = '#94a3b8'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-[#0f1623] border border-white/10 px-4 py-3 text-sm shadow-xl max-w-xs">
      <p className="text-white/60 mb-2 font-medium">{label}歳</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="leading-6">
          {p.name}: {Math.round(p.value).toLocaleString()}万円
        </p>
      ))}
    </div>
  )
}

export function AssetChart({ years }: Props) {
  const [tab, setTab] = useState<Tab>('cashflow')

  const expenseCategories = [
    ...new Set(years.flatMap((y) => Object.keys(y.expenseBreakdown) as ExpenseCategory[])),
  ]

  const assetCategories = [
    ...new Set(years.flatMap((y) => Object.keys(y.assetCategoryBalances) as AssetCategory[])),
  ]

  const cashflowData = years.map((y) => ({
    age: y.age,
    収入: y.incomeAnnual,
    積立: y.contributionsAnnual,
    ...Object.fromEntries(expenseCategories.map((cat) => [cat, y.expenseBreakdown[cat] ?? 0])),
  }))

  const assetData = years.map((y) => ({
    age: y.age,
    資金余剰: y.liquidSavings,
    ...Object.fromEntries(assetCategories.map((cat) => [cat, y.assetCategoryBalances[cat] ?? 0])),
  }))

  const tickInterval = Math.max(1, Math.floor(years.length / 10))

  const xAxisProps = {
    dataKey: 'age',
    stroke: 'rgba(255,255,255,0.3)',
    tick: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 },
    tickFormatter: (v: number) => `${v}歳`,
    interval: tickInterval,
  }
  const yAxisProps = {
    stroke: 'rgba(255,255,255,0.3)',
    tick: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 },
    tickFormatter: (v: number) => `${v}万`,
    width: 56,
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
      <div className="flex gap-2 mb-6">
        {([['cashflow', '収支バランス'], ['assets', '資産推移']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={360}>
        {tab === 'cashflow' ? (
          <ComposedChart data={cashflowData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, paddingTop: 16 }} />
            {expenseCategories.map((cat) => (
              <Bar key={cat} dataKey={cat} stackId="out" fill={EXPENSE_COLORS[cat]} />
            ))}
            <Bar dataKey="積立" stackId="out" fill={CONTRIB_COLOR} />
            <Line type="monotone" dataKey="収入" stroke={INCOME_COLOR} strokeWidth={2} dot={false} />
          </ComposedChart>
        ) : (
          <AreaChart data={assetData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="grad-surplus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SURPLUS_COLOR} stopOpacity={0.4} />
                <stop offset="95%" stopColor={SURPLUS_COLOR} stopOpacity={0.02} />
              </linearGradient>
              {assetCategories.map((cat) => (
                <linearGradient key={cat} id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ASSET_COLORS[cat]} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={ASSET_COLORS[cat]} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, paddingTop: 16 }} />
            <ReferenceLine y={0} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="資金余剰" stackId="assets"
              stroke={SURPLUS_COLOR} fill="url(#grad-surplus)" strokeWidth={1} />
            {assetCategories.map((cat) => (
              <Area key={cat} type="monotone" dataKey={cat} stackId="assets"
                stroke={ASSET_COLORS[cat]} fill={`url(#grad-${cat})`} strokeWidth={1} />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
