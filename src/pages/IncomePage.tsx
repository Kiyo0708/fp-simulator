import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { NumberInput } from '../components/NumberInput'
import type { IncomeInput } from '../types/simulation'

export default function IncomePage() {
  const { input, setIncome } = useSimulationStore()
  const navigate = useNavigate()
  const [form, setForm] = useState<IncomeInput>(input.income)
  const hasSpouse = input.family.hasSpouse

  const set = <K extends keyof IncomeInput>(key: K, value: IncomeInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = () => {
    setIncome(form)
    navigate('/result')
  }

  return (
    <div className="p-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-white/90 mb-6">収入</h1>

        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-amber-300 mb-4">月収（手取り）</h2>
          <div className="flex flex-col gap-4">
            <NumberInput
              label={`家族代表者の月収${input.family.representative.name ? `（${input.family.representative.name}）` : ''}`}
              value={form.representativeMonthly}
              onChange={(v) => set('representativeMonthly', v)}
            />
            {hasSpouse && (
              <NumberInput
                label={`配偶者の月収${input.family.spouse.name ? `（${input.family.spouse.name}）` : ''}`}
                value={form.spouseMonthly}
                onChange={(v) => set('spouseMonthly', v)}
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-amber-300 mb-4">資産・運用</h2>
          <div className="flex flex-col gap-4">
            <NumberInput
              label="現在の総資産（貯金・投資含む）"
              value={form.currentSavings}
              onChange={(v) => set('currentSavings', v)}
            />
            <NumberInput
              label="想定利回り"
              value={form.expectedReturn}
              onChange={(v) => set('expectedReturn', v)}
              unit="%"
              min={0}
              max={20}
              step={0.1}
              hint="資産全体の年率リターン。インデックス投資なら 3〜5% が目安"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="text-sm font-semibold text-amber-300 mb-4">退職</h2>
          <NumberInput
            label="退職年齢"
            value={form.retirementAge}
            onChange={(v) => set('retirementAge', v)}
            unit="歳"
            min={40}
            max={80}
            hint="この年齢以降、給与収入は0になります"
          />
        </section>

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
