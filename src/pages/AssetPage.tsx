import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { AssetItem, ContributionPeriod, WithdrawalPeriod } from '../types/simulation'
import type { AssetCategory, AgeMonth } from '../types/simulation'
import { AgeMonthInput } from '../components/AgeMonthInput'

const CATEGORIES: AssetCategory[] = ['現金・預金', '積み立て', '投資', 'その他']

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  '現金・預金': '#10b981',
  '積み立て': '#6366f1',
  '投資': '#f59e0b',
  'その他': '#64748b',
}

interface AssetForm {
  category: AssetCategory
  initialAmount: number
  annualReturn: number
  from: AgeMonth
}

interface FlowForm {
  monthlyAmount: number
  from: AgeMonth
  to: AgeMonth | null
}

type EditingFlowKey = { assetId: string; kind: 'contribution' | 'drawdown'; periodId: string } | null

export default function AssetPage() {
  const { input, setAssetItems } = useSimulationStore()
  const navigate = useNavigate()
  const repAge = input.family.representative.age

  const [assets, setAssets] = useState<AssetItem[]>(input.assetItems)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [assetForm, setAssetForm] = useState<AssetForm>({
    category: '積み立て', initialAmount: 0, annualReturn: 5, from: { age: repAge, month: 1 },
  })
  const [editingFlowKey, setEditingFlowKey] = useState<EditingFlowKey>(null)
  const [flowForm, setFlowForm] = useState<FlowForm>({
    monthlyAmount: 5, from: { age: repAge, month: 1 }, to: null,
  })

  const setAF = <K extends keyof AssetForm>(k: K, v: AssetForm[K]) => setAssetForm(f => ({ ...f, [k]: v }))
  const setFF = <K extends keyof FlowForm>(k: K, v: FlowForm[K]) => setFlowForm(f => ({ ...f, [k]: v }))

  // ─── Asset CRUD ───────────────────────────────────────
  const startEditAsset = (asset: AssetItem) => {
    setAssetForm({ category: asset.category, initialAmount: asset.initialAmount, annualReturn: asset.annualReturn, from: asset.from })
    setEditingAssetId(asset.id)
  }

  const startAddAsset = () => {
    setAssetForm({ category: '積み立て', initialAmount: 0, annualReturn: 5, from: { age: repAge, month: 1 } })
    setEditingAssetId('__new__')
  }

  const commitAsset = () => {
    if (editingAssetId === '__new__') {
      setAssets(prev => [...prev, new AssetItem(crypto.randomUUID(), assetForm.category, assetForm.initialAmount, assetForm.annualReturn, assetForm.from, [], [])])
    } else {
      setAssets(prev => prev.map(a =>
        a.id === editingAssetId
          ? new AssetItem(a.id, assetForm.category, assetForm.initialAmount, assetForm.annualReturn, assetForm.from, a.contributions, a.drawdowns)
          : a
      ))
    }
    setEditingAssetId(null)
  }

  const removeAsset = (id: string) => setAssets(prev => prev.filter(a => a.id !== id))

  // ─── Flow period CRUD (共通: 積立 & 取り崩し) ──────────
  const startAddFlow = (assetId: string, kind: 'contribution' | 'drawdown') => {
    setFlowForm({ monthlyAmount: kind === 'contribution' ? 3 : 10, from: { age: repAge, month: 1 }, to: null })
    setEditingFlowKey({ assetId, kind, periodId: '__new__' })
  }

  const startEditFlow = (assetId: string, kind: 'contribution' | 'drawdown', period: ContributionPeriod | WithdrawalPeriod) => {
    setFlowForm({ monthlyAmount: period.monthlyAmount, from: period.from, to: period.to })
    setEditingFlowKey({ assetId, kind, periodId: period.id })
  }

  const commitFlow = () => {
    if (!editingFlowKey) return
    const { assetId, kind, periodId } = editingFlowKey
    const newId = periodId === '__new__' ? crypto.randomUUID() : periodId

    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a
      if (kind === 'contribution') {
        const newPeriod = new ContributionPeriod(newId, flowForm.monthlyAmount, flowForm.from, flowForm.to)
        const list = periodId === '__new__' ? [...a.contributions, newPeriod] : a.contributions.map(c => c.id === periodId ? newPeriod : c)
        return new AssetItem(a.id, a.category, a.initialAmount, a.annualReturn, a.from, list, a.drawdowns)
      } else {
        const newPeriod = new WithdrawalPeriod(newId, flowForm.monthlyAmount, flowForm.from, flowForm.to)
        const list = periodId === '__new__' ? [...a.drawdowns, newPeriod] : a.drawdowns.map(d => d.id === periodId ? newPeriod : d)
        return new AssetItem(a.id, a.category, a.initialAmount, a.annualReturn, a.from, a.contributions, list)
      }
    }))
    setEditingFlowKey(null)
  }

  const removeFlow = (assetId: string, kind: 'contribution' | 'drawdown', periodId: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a
      if (kind === 'contribution') return new AssetItem(a.id, a.category, a.initialAmount, a.annualReturn, a.from, a.contributions.filter(c => c.id !== periodId), a.drawdowns)
      return new AssetItem(a.id, a.category, a.initialAmount, a.annualReturn, a.from, a.contributions, a.drawdowns.filter(d => d.id !== periodId))
    }))
  }

  const save = () => { setAssetItems(assets); navigate('/result') }

  // ─── 資産フォーム JSX ───────────────────────────────────
  const assetFormJSX = (
    <div className="flex flex-col gap-4 pt-4 border-t border-white/10 mt-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">カテゴリ</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => setAF('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${assetForm.category === cat ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/60">初期残高（万円）</label>
          <input type="number" min={0} value={assetForm.initialAmount}
            onChange={e => setAF('initialAmount', e.target.value === '' ? 0 : Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/60">年間利回り（%）</label>
          <input type="number" min={0} max={30} step={0.1} value={assetForm.annualReturn}
            onChange={e => setAF('annualReturn', e.target.value === '' ? 0 : Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors" />
        </div>
      </div>
      <AgeMonthInput label="開始年月" value={assetForm.from} onChange={v => setAF('from', v)} repCurrentAge={repAge} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditingAssetId(null)} className="flex-1 py-2 rounded-xl text-white/50 border border-white/10 hover:bg-white/5 text-sm transition-colors">キャンセル</button>
        <button type="button" onClick={commitAsset} className="flex-1 py-2 rounded-xl text-black font-bold text-sm" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>確定</button>
      </div>
    </div>
  )

  // ─── フロー期間フォーム JSX (積立・取り崩し共用) ────────
  const isDrawdown = editingFlowKey?.kind === 'drawdown'
  const flowFormJSX = (
    <div className={`flex flex-col gap-3 p-3 rounded-xl border mt-2 ${isDrawdown ? 'bg-red-400/5 border-red-400/20' : 'bg-white/5 border-white/10'}`}>
      <p className={`text-xs font-semibold ${isDrawdown ? 'text-red-300' : 'text-white/50'}`}>
        {isDrawdown ? '取り崩し期間を設定' : '積立期間を設定'}
      </p>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">月額（万円/月）</label>
        <input type="number" min={0} value={flowForm.monthlyAmount}
          onChange={e => setFF('monthlyAmount', e.target.value === '' ? 0 : Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors" />
      </div>
      <AgeMonthInput label="開始" value={flowForm.from} onChange={v => setFF('from', v)} repCurrentAge={repAge} />
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-white/60 whitespace-nowrap">終了</label>
        <button type="button"
          onClick={() => setFF('to', flowForm.to === null ? { age: repAge + 30, month: 12 } : null)}
          className={`px-3 py-1 rounded-lg text-xs border transition-colors ${flowForm.to === null ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/50'}`}>
          {flowForm.to === null ? '終了なし' : '終了あり'}
        </button>
        {flowForm.to !== null && (
          <AgeMonthInput label="" value={flowForm.to} onChange={v => setFF('to', v)} repCurrentAge={repAge} />
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditingFlowKey(null)} className="flex-1 py-1.5 rounded-xl text-white/50 border border-white/10 text-xs hover:bg-white/5 transition-colors">キャンセル</button>
        <button type="button" onClick={commitFlow} className="flex-1 py-1.5 rounded-xl text-black font-bold text-xs" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>確定</button>
      </div>
    </div>
  )

  // ─── 期間リスト (積立 or 取り崩し) ─────────────────────
  const renderFlowList = (asset: AssetItem, kind: 'contribution' | 'drawdown') => {
    const periods = kind === 'contribution' ? asset.contributions : asset.drawdowns
    const isDD = kind === 'drawdown'
    const label = isDD ? '取り崩し期間' : '積立期間'
    const addLabel = isDD ? '－ 取り崩しを追加' : '＋ 積立を追加'
    const accentCls = isDD ? 'hover:border-red-400/40 hover:text-red-300' : 'hover:border-amber-400/40 hover:text-amber-300'
    const isEditing = (id: string) => editingFlowKey?.assetId === asset.id && editingFlowKey.kind === kind && editingFlowKey.periodId === id

    return (
      <div className={`border-t pt-3 mt-3 ${isDD ? 'border-red-400/10' : 'border-white/10'}`}>
        <p className={`text-xs mb-2 ${isDD ? 'text-red-300/50' : 'text-white/40'}`}>{label}</p>
        {periods.length === 0 && (
          <p className="text-xs text-white/25 mb-2">未設定</p>
        )}
        <div className="flex flex-col gap-2">
          {periods.map(period => (
            <div key={period.id}>
              {isEditing(period.id) ? flowFormJSX : (
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDD ? 'bg-red-400/5' : 'bg-white/5'}`}>
                  <span className={`text-sm ${isDD ? 'text-red-300/70' : 'text-white/70'}`}>
                    {isDD ? '−' : '+'}{period.monthlyAmount}万円/月 ・{' '}
                    {period.from.age}歳{period.from.month}月〜
                    {period.to ? `${period.to.age}歳${period.to.month}月` : '終了なし'}
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => startEditFlow(asset.id, kind, period)} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40 hover:bg-white/10 transition-colors">編集</button>
                    <button onClick={() => removeFlow(asset.id, kind, period.id)} className="text-xs px-2 py-0.5 rounded bg-white/5 text-red-400/60 hover:bg-red-400/10 transition-colors">削除</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isEditing('__new__') && flowFormJSX}

          {(!editingFlowKey || !(editingFlowKey.assetId === asset.id && editingFlowKey.kind === kind)) && (
            <button type="button" onClick={() => startAddFlow(asset.id, kind)}
              className={`w-full py-1.5 rounded-lg text-xs text-white/40 border border-dashed border-white/15 transition-colors ${accentCls}`}>
              {addLabel}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-white/90 mb-6">資産・運用</h1>

        <div className="flex flex-col gap-4 mb-4">
          {assets.map(asset => (
            <div key={asset.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              {editingAssetId === asset.id ? assetFormJSX : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium w-fit"
                        style={{ background: CATEGORY_COLORS[asset.category] + '22', color: CATEGORY_COLORS[asset.category] }}>
                        {asset.category}
                      </span>
                      <p className="text-white/90 font-semibold">初期 {asset.initialAmount.toLocaleString()}万円 ・ 年利 {asset.annualReturn}%</p>
                      <p className="text-xs text-white/40">開始: {asset.from.age}歳{asset.from.month}月</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEditAsset(asset)} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors">編集</button>
                      <button onClick={() => removeAsset(asset.id)} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-red-400/70 hover:bg-red-400/10 transition-colors">削除</button>
                    </div>
                  </div>

                  {renderFlowList(asset, 'contribution')}
                  {renderFlowList(asset, 'drawdown')}
                </>
              )}
            </div>
          ))}

          {editingAssetId === '__new__' && (
            <div className="rounded-2xl bg-white/5 border border-amber-400/20 p-4">
              <p className="text-sm font-semibold text-amber-300 mb-1">新しい資産を追加</p>
              {assetFormJSX}
            </div>
          )}
        </div>

        {editingAssetId === null && (
          <button type="button" onClick={startAddAsset}
            className="w-full py-3 rounded-2xl text-sm text-white/50 border border-dashed border-white/20 hover:border-amber-400/40 hover:text-amber-300 transition-colors mb-6">
            ＋ 資産・運用を追加
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
