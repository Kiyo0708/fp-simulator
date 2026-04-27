import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'
import type { YearlyData } from '../types/simulation'

interface Props {
  years: YearlyData[]
  spouseBaseAge: number | null
}

type Tab = 'cashflow' | 'assets'

const fmt = (v: number) => `${Math.round(v).toLocaleString()}万円`

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-[#0f1623] border border-white/10 px-4 py-3 text-sm shadow-xl">
      <p className="text-white/60 mb-2 font-medium">{label}歳</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="leading-6">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export function AssetChart({ years, spouseBaseAge }: Props) {
  const [tab, setTab] = useState<Tab>('cashflow')

  const cashflowData = years.map((y) => ({
    age: y.age,
    収入: y.incomeAnnual,
    生活費: y.expenseBreakdown.living,
    住宅費: y.expenseBreakdown.housing,
    その他: y.expenseBreakdown.other,
  }))

  const assetData = years.map((y) => ({
    age: y.age,
    資産残高: y.assetsEnd,
  }))

  const tickInterval = Math.floor(years.length / 10)

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
      {/* Tabs */}
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
            <XAxis
              dataKey="age"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(v) => `${v}歳`}
              interval={tickInterval}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(v) => `${v}万`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, paddingTop: 16 }}
            />
            <Bar dataKey="生活費" stackId="exp" fill="#6366f1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="住宅費" stackId="exp" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="その他" stackId="exp" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            <Line
              type="monotone"
              dataKey="収入"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
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
            <XAxis
              dataKey="age"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(v) => `${v}歳`}
              interval={tickInterval}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              tickFormatter={(v) => `${v}万`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(239,68,68,0.5)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="資産残高"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#assetGradient)"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>

      {/* Family age axis */}
      {spouseBaseAge !== null && (
        <p className="text-xs text-white/30 mt-3 text-right">
          ※ 配偶者は家族代表者より {spouseBaseAge > 0 ? spouseBaseAge + '歳年上' : Math.abs(spouseBaseAge) + '歳年下'}
        </p>
      )}
    </div>
  )
}
