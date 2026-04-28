import type { AgeMonth } from '../types/simulation'

interface Props {
  label: string
  value: AgeMonth          // 内部値は常に代表者の年齢基準
  onChange: (v: AgeMonth) => void
  repCurrentAge: number    // 代表者の現在年齢（西暦計算に使用）
  /** 対象人物の現在年齢。未指定 or null = 代表者と同じ（年齢変換なし）*/
  personCurrentAge?: number | null
  minAge?: number
  maxAge?: number
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const CURRENT_YEAR = new Date().getFullYear()

export function AgeMonthInput({
  label,
  value,
  onChange,
  repCurrentAge,
  personCurrentAge,
  minAge = 0,
  maxAge = 100,
}: Props) {
  // ageDiff = 代表者年齢 - 対象者年齢。対象者の方が年下なら正値。
  const ageDiff = repCurrentAge - (personCurrentAge ?? repCurrentAge)

  // 表示上の年齢 = 対象者の年齢（= 代表者基準の値 - ageDiff）
  const displayAge = value.age - ageDiff

  // 西暦 = 現在年 + (代表者基準の年齢 - 代表者の現在年齢)
  const calendarYear = CURRENT_YEAR + (value.age - repCurrentAge)
  const calendarLabel = `${calendarYear}年${value.month}月`

  const handleAgeChange = (displayedAge: number) => {
    // 表示値を代表者基準に変換して保存
    onChange({ ...value, age: displayedAge + ageDiff })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/60">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          min={minAge}
          max={maxAge}
          value={displayAge}
          onChange={(e) => handleAgeChange(Number(e.target.value))}
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
        <span className="text-xs text-amber-300/70 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-lg">
          {calendarLabel}
        </span>
      </div>
    </div>
  )
}
