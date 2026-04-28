import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { ExpenseItem } from '../types/simulation'
import type { ExpenseCategory, AgeMonth } from '../types/simulation'
import { AgeMonthInput } from '../components/AgeMonthInput'

const CATEGORIES: ExpenseCategory[] = ['生活費', '住宅', '子供関連', '保険', 'その他']

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  '生活費': '#6366f1',
  '住宅': '#f59e0b',
  '子供関連': '#ec4899',
  '保険': '#8b5cf6',
  'その他': '#64748b',
}

interface FormState {
  familyMemberId: string | null
  category: ExpenseCategory
  isOneTime: boolean
  from: AgeMonth
  to: AgeMonth
  value: number
}

export default function ExpensePage() {
  const { input, setExpenseItems } = useSimulationStore()
  const navigate = useNavigate()
  const rep = input.family.representative
  const repAge = rep.age

  const familyOptions = useMemo(() => {
    const opts: { id: string | null; label: string; currentAge: number | null }[] = [
      { id: null, label: '世帯全体', currentAge: null },
      { id: 'representative', label: `${rep.name || '家族代表者'}（${rep.age}歳）`, currentAge: rep.age },
    ]
    if (input.family.hasSpouse) {
      const s = input.family.spouse
      opts.push({ id: 'spouse', label: `${s.name || '配偶者'}（${s.age}歳）`, currentAge: s.age })
    }
    for (const c of input.family.children) {
      opts.push({ id: c.id, label: `${c.name || 'お子さま'}（${c.age}歳）`, currentAge: c.age })
    }
    return opts
  }, [rep, input.family])

  const defaultForm = (): FormState => ({
    familyMemberId: null,
    category: '生活費',
    isOneTime: false,
    from: { age: repAge, month: 1 },
    to: { age: 90, month: 12 },
    value: 10,
  })

  const [items, setItems] = useState<ExpenseItem[]>(input.expenseItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm())

  const selectedPersonAge = useMemo(
    () => familyOptions.find((o) => o.id === form.familyMemberId)?.currentAge ?? null,
    [familyOptions, form.familyMemberId]
  )

  const startEdit = (item: ExpenseItem) => {
    setForm({
      familyMemberId: item.familyMemberId,
      category: item.category,
      isOneTime: item.to === null,
      from: item.from,
      to: item.to ?? { age: 90, month: 12 },
      value: item.value,
    })
    setEditingId(item.id)
  }

  const startAdd = () => {
    setForm(defaultForm())
    setEditingId('__new__')
  }

  const cancelEdit = () => setEditingId(null)

  const commitForm = () => {
    const newItem = new ExpenseItem(
      editingId === '__new__' ? crypto.randomUUID() : editingId!,
      form.from,
      form.isOneTime ? null : form.to,
      form.value,
      form.familyMemberId,
      form.category,
    )
    setItems((prev) =>
      editingId === '__new__'
        ? [...prev, newItem]
        : prev.map((it) => (it.id === editingId ? newItem : it))
    )
    setEditingId(null)
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))

  const save = () => {
    setExpenseItems(items)
    navigate('/result')
  }

  const setF = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onPersonChange = (id: string | null) => {
    setForm((f) => ({ ...f, familyMemberId: id, from: { age: repAge, month: f.from.month } }))
  }

  const fmtPeriod = (item: ExpenseItem) => {
    const personAge = familyOptions.find((o) => o.id === item.familyMemberId)?.currentAge ?? repAge
    const ageDiff = repAge - personAge
    const fromDisplay = `${item.from.age - ageDiff}歳${item.from.month}月`
    if (item.to === null) return `${fromDisplay} 一時払い`
    return `${fromDisplay} 〜 ${item.to.age - ageDiff}歳${item.to.month}月`
  }

  const fmtValue = (item: ExpenseItem) =>
    item.to === null
      ? `${item.value.toLocaleString()}万円（一時払い）`
      : `${item.value.toLocaleString()}万円/月`

  const memberLabel = (id: string | null) =>
    familyOptions.find((o) => o.id === id)?.label ?? '世帯全体'

  const InlineForm = () => (
    <div className="flex flex-col gap-4 pt-4 border-t border-white/10 mt-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">カテゴリ</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setF('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                form.category === cat
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">対象者</label>
        <select
          value={form.familyMemberId ?? '__null__'}
          onChange={(e) => onPersonChange(e.target.value === '__null__' ? null : e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-400/40 focus:outline-none transition-colors"
        >
          {familyOptions.map((o) => (
            <option key={o.id ?? '__null__'} value={o.id ?? '__null__'} className="bg-[#0f1623]">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-white/60">種別</label>
        <div className="flex gap-2">
          {[false, true].map((isOne) => (
            <button key={String(isOne)} type="button" onClick={() => setF('isOneTime', isOne)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                form.isOneTime === isOne
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}>
              {isOne ? '一時払い' : '月次（継続）'}
            </button>
          ))}
        </div>
      </div>

      <AgeMonthInput
        label="開始"
        value={form.from}
        onChange={(v) => setF('from', v)}
        repCurrentAge={repAge}
        personCurrentAge={selectedPersonAge}
      />
      {!form.isOneTime && (
        <AgeMonthInput
          label="終了"
          value={form.to}
          onChange={(v) => setF('to', v)}
          repCurrentAge={repAge}
          personCurrentAge={selectedPersonAge}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">
          {form.isOneTime ? '金額（万円）' : '月額（万円/月）'}
        </label>
        <input type="number" min={0} value={form.value}
          onChange={(e) => setF('value', Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors" />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={cancelEdit}
          className="flex-1 py-2 rounded-xl text-white/50 border border-white/10 hover:bg-white/5 text-sm transition-colors">
          キャンセル
        </button>
        <button type="button" onClick={commitForm}
          className="flex-1 py-2 rounded-xl text-black font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
          確定
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-white/90 mb-6">支出</h1>

        <div className="flex flex-col gap-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              {editingId === item.id ? <InlineForm /> : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ background: CATEGORY_COLORS[item.category] + '22', color: CATEGORY_COLORS[item.category] }}>
                        {item.category}
                      </span>
                      <span className="text-xs text-white/40">{memberLabel(item.familyMemberId)}</span>
                    </div>
                    <p className="text-white/90 font-semibold">{fmtValue(item)}</p>
                    <p className="text-xs text-white/40">{fmtPeriod(item)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(item)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors">編集</button>
                    <button onClick={() => removeItem(item.id)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-red-400/70 hover:bg-red-400/10 transition-colors">削除</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {editingId === '__new__' && (
            <div className="rounded-2xl bg-white/5 border border-amber-400/20 p-4">
              <p className="text-sm font-semibold text-amber-300 mb-1">新しい支出を追加</p>
              <InlineForm />
            </div>
          )}
        </div>

        {editingId === null && (
          <button type="button" onClick={startAdd}
            className="w-full py-3 rounded-2xl text-sm text-white/50 border border-dashed border-white/20 hover:border-amber-400/40 hover:text-amber-300 transition-colors mb-6">
            ＋ 支出を追加
          </button>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/result')}
            className="flex-1 py-3 rounded-2xl text-white/60 border border-white/10 hover:bg-white/5 transition-colors">
            キャンセル
          </button>
          <button type="button" onClick={save}
            className="flex-1 py-3 rounded-2xl font-bold text-black"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
            保存して戻る
          </button>
        </div>
      </motion.div>
    </div>
  )
}
