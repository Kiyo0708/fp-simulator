import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { AssetChart } from '../components/AssetChart'
import { SummaryTable } from '../components/SummaryTable'

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

export default function ResultPage() {
  const { input, result } = useSimulationStore()
  const { years } = result
  if (!years.length) return null

  const first = years[0]
  const atRetirement = years.find((y) => y.age === input.income.retirementAge) ?? years[years.length - 1]
  const last = years[years.length - 1]
  const monthlyNet = (first.netAnnual / 12)
  const spouseAgeDiff = input.family.hasSpouse
    ? input.family.spouse.age - input.family.representative.age
    : null

  const fmt = (v: number) => `${Math.round(v).toLocaleString()}万円`
  const fmtNet = (v: number) => `${v >= 0 ? '+' : ''}${Math.round(v).toLocaleString()}万円`

  return (
    <div className="p-6 flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-white/90 mb-1">シミュレーション結果</h1>
        <p className="text-sm text-white/40">
          {input.family.representative.name || '家族代表者'} {input.family.representative.age}歳 〜 90歳
        </p>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="現在の資産"
          value={fmt(first.assetsEnd)}
          sub={`${first.age}歳時点`}
          color="#f59e0b"
        />
        <StatCard
          label={`退職時(${input.income.retirementAge}歳)の資産`}
          value={fmt(atRetirement.assetsEnd)}
          color={atRetirement.assetsEnd >= 0 ? '#10b981' : '#ef4444'}
        />
        <StatCard
          label="90歳時の資産"
          value={fmt(last.assetsEnd)}
          color={last.assetsEnd >= 0 ? '#10b981' : '#ef4444'}
        />
        <StatCard
          label="月の収支バランス"
          value={fmtNet(monthlyNet)}
          sub="現役時代の平均"
          color={monthlyNet >= 0 ? '#10b981' : '#ef4444'}
        />
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <AssetChart years={years} spouseBaseAge={spouseAgeDiff} />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-sm font-semibold text-white/50 mb-3">年次サマリー</h2>
        <SummaryTable years={years} />
      </motion.div>
    </div>
  )
}
