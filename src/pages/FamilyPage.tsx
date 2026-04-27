import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import type { FamilyInput, Child, Gender } from '../types/simulation'

function GenderSelect({ value, onChange }: { value: Gender; onChange: (v: Gender) => void }) {
  return (
    <div className="flex gap-2">
      {(['male', 'female'] as Gender[]).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
            value === g
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
          }`}
        >
          {g === 'male' ? '男性' : '女性'}
        </button>
      ))}
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-white/60">{label}</label>
      {children}
    </div>
  )
}

export default function FamilyPage() {
  const { input, setFamily } = useSimulationStore()
  const navigate = useNavigate()
  const [form, setForm] = useState<FamilyInput>(input.family)

  const save = () => {
    setFamily(form)
    navigate('/result')
  }

  const addChild = () => {
    const child: Child = { id: crypto.randomUUID(), name: '', age: 0 }
    setForm((f) => ({ ...f, children: [...f.children, child] }))
  }

  const updateChild = (id: string, patch: Partial<Child>) =>
    setForm((f) => ({
      ...f,
      children: f.children.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))

  const removeChild = (id: string) =>
    setForm((f) => ({ ...f, children: f.children.filter((c) => c.id !== id) }))

  return (
    <div className="p-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-white/90 mb-6">家族構成</h1>

        {/* Representative */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
          <h2 className="text-sm font-semibold text-amber-300 mb-4">家族代表者</h2>
          <div className="flex flex-col gap-4">
            <FieldGroup label="お名前（任意）">
              <input
                type="text"
                value={form.representative.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, representative: { ...f.representative, name: e.target.value } }))
                }
                placeholder="例: 山田 太郎"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors placeholder:text-white/20"
              />
            </FieldGroup>
            <FieldGroup label="現在の年齢">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={form.representative.age}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      representative: { ...f.representative, age: Number(e.target.value) },
                    }))
                  }
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
                />
                <span className="text-sm text-white/40 w-6">歳</span>
              </div>
            </FieldGroup>
            <FieldGroup label="性別">
              <GenderSelect
                value={form.representative.gender}
                onChange={(g) => setForm((f) => ({ ...f, representative: { ...f.representative, gender: g } }))}
              />
            </FieldGroup>
          </div>
        </section>

        {/* Spouse */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-amber-300">配偶者</h2>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, hasSpouse: !f.hasSpouse }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.hasSpouse ? 'bg-amber-400' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.hasSpouse ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {form.hasSpouse && (
            <div className="flex flex-col gap-4">
              <FieldGroup label="お名前（任意）">
                <input
                  type="text"
                  value={form.spouse.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, spouse: { ...f.spouse, name: e.target.value } }))
                  }
                  placeholder="例: 山田 花子"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors placeholder:text-white/20"
                />
              </FieldGroup>
              <FieldGroup label="現在の年齢">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={18}
                    max={80}
                    value={form.spouse.age}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, spouse: { ...f.spouse, age: Number(e.target.value) } }))
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
                  />
                  <span className="text-sm text-white/40 w-6">歳</span>
                </div>
              </FieldGroup>
              <FieldGroup label="性別">
                <GenderSelect
                  value={form.spouse.gender}
                  onChange={(g) => setForm((f) => ({ ...f, spouse: { ...f.spouse, gender: g } }))}
                />
              </FieldGroup>
            </div>
          )}
        </section>

        {/* Children */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-amber-300">お子さま</h2>
            <button
              type="button"
              onClick={addChild}
              disabled={form.children.length >= 6}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ＋ 追加
            </button>
          </div>

          {form.children.length === 0 && (
            <p className="text-sm text-white/30 text-center py-4">お子さまを追加してください</p>
          )}

          <div className="flex flex-col gap-3">
            {form.children.map((child, i) => (
              <div key={child.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <span className="text-white/40 text-sm w-6">{i + 1}</span>
                <input
                  type="text"
                  value={child.name}
                  onChange={(e) => updateChild(child.id, { name: e.target.value })}
                  placeholder="お名前（任意）"
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-white/20"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={child.age}
                    onChange={(e) => updateChild(child.id, { age: Number(e.target.value) })}
                    className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-right text-sm focus:border-amber-400/40 focus:outline-none"
                  />
                  <span className="text-xs text-white/40">歳</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeChild(child.id)}
                  className="text-white/30 hover:text-red-400 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
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
