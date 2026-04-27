interface Props {
  label: string
  value: number
  onChange: (v: number) => void
  unit?: string
  min?: number
  max?: number
  step?: number
  hint?: string
}

export function NumberInput({ label, value, onChange, unit = '万円', min = 0, max, step = 1, hint }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/60">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
        />
        {unit && <span className="text-sm text-white/40 w-10 flex-shrink-0">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  )
}
