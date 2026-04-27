import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { NumberInput } from '../components/NumberInput'
import type { ExpenseInput } from '../types/simulation'

export default function ExpensePage() {
  const { input, setExpenses } = useSimulationStore()
  const navigate = useNavigate()
  const [form, setForm] = useState<ExpenseInput>(input.expenses)

  const set = <K extends keyof ExpenseInput>(key: K, value: ExpenseInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const totalMonthly = form.livingMonthly + form.housingMonthly + form.otherMonthly

  const save = () => {
    setExpenses(form)
    navigate('/result')
  }

  return (
    <div className="p-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-white/90 mb-6">支出</h1>

        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-amber-300 mb-4">月々の支出</h2>
          <div className="flex flex-col gap-4">
            <NumberInput
              label="生活費（食費・光熱費・通信費など）"
              value={form.livingMonthly}
              onChange={(v) => set('livingMonthly', v)}
              hint="食費・光熱費・通信費・娯楽費などの合計"
            />
            <NumberInput
              label="住宅費（家賃）"
              value={form.housingMonthly}
              onChange={(v) => set('housingMonthly', v)}
              hint="v2 以降：住宅ローンにも対応予定"
            />
            <NumberInput
              label="その他固定費（保険料など）"
              value={form.otherMonthly}
              onChange={(v) => set('otherMonthly', v)}
            />
          </div>
        </section>

        <div className="rounded-2xl bg-amber-400/5 border border-amber-400/20 px-5 py-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-white/60">月支出合計</span>
          <span className="text-xl font-bold text-amber-300">{totalMonthly.toLocaleString()} 万円/月</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/result')}
            className="flex-1 py-3 rounded-2xl text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 py-3 rounded-2xl font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
          >
            保存して戻る
          </button>
        </div>
      </motion.div>
    </div>
  )
}
