import type { AgeMonth } from '../types/simulation'

interface Props {
  label: string
  value: AgeMonth
  onChange: (v: AgeMonth) => void
  minAge?: number
  maxAge?: number
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export function AgeMonthInput({ label, value, onChange, minAge = 0, maxAge = 100 }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/60">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={minAge}
          max={maxAge}
          value={value.age}
          onChange={(e) => onChange({ ...value, age: Number(e.target.value) })}
          className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
        />
        <span className="text-sm text-white/40">歳</span>
        <select
          value={value.month}
          onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
          className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m} className="bg-[#0f1623]">
              {m}月
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
