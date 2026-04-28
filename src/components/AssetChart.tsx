import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts'
import type { YearlyData, ExpenseCategory } from '../types/simulation'

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

const INCOME_COLOR = '#10b981'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-[#0f1623] border border-white/10 px-4 py-3 text-sm shadow-xl">
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

  const cashflowData = years.map((y) => ({
    age: y.age,
    収入: y.incomeAnnual,
    ...Object.fromEntries(
      expenseCategories.map((cat) => [cat, y.expenseBreakdown[cat] ?? 0])
    ),
  }))

  const assetData = years.map((y) => ({ age: y.age, 資産残高: y.assetsEnd }))
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
              <Bar key={cat} dataKey={cat} stackId="exp" fill={EXPENSE_COLORS[cat]} />
            ))}
            <Line type="monotone" dataKey="収入" stroke={INCOME_COLOR} strokeWidth={2} dot={false} />
          </ComposedChart>
        ) : (
          <AreaChart data={assetData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="資産残高" stroke="#10b981" strokeWidth={2} fill="url(#assetGradient)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
