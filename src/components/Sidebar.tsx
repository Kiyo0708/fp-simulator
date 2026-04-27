import { NavLink } from 'react-router-dom'
import { useRef } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import { exportToJSON, parseJSON } from '../utils/jsonIO'

const NAV_ITEMS = [
  { to: '/result', icon: '📊', label: '結果・グラフ' },
  { to: '/family', icon: '👨‍👩‍👧', label: '家族構成' },
  { to: '/income', icon: '💼', label: '収入' },
  { to: '/expenses', icon: '🏠', label: '支出' },
]

export function Sidebar() {
  const { input, loadInput } = useSimulationStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseJSON(ev.target?.result as string)
        loadInput(parsed)
      } catch {
        alert('ファイルの読み込みに失敗しました')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/10 bg-white/[0.02]">
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-amber-400 font-bold text-lg tracking-tight">FP Simulator</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-400/15 text-amber-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 flex flex-col gap-2 border-t border-white/10 pt-4">
        <button
          onClick={() => exportToJSON(input)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <span>📥</span> プランを保存
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <span>📤</span> プランを読み込む
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </aside>
  )
}
