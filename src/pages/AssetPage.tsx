import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSimulationStore } from '../store/simulationStore'
import { AssetItem, ContributionPeriod } from '../types/simulation'
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

interface ContribForm {
  monthlyAmount: number
  from: AgeMonth
  to: AgeMonth | null
}

export default function AssetPage() {
  const { input, setAssetItems } = useSimulationStore()
  const navigate = useNavigate()
  const repAge = input.family.representative.age

  const [assets, setAssets] = useState<AssetItem[]>(input.assetItems)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [assetForm, setAssetForm] = useState<AssetForm>({
    category: '積み立て', initialAmount: 0, annualReturn: 5, from: { age: repAge, month: 1 },
  })
  const [editingContribKey, setEditingContribKey] = useState<{ assetId: string; contribId: string } | null>(null)
  const [contribForm, setContribForm] = useState<ContribForm>({
    monthlyAmount: 3, from: { age: repAge, month: 1 }, to: null,
  })

  const setAF = <K extends keyof AssetForm>(k: K, v: AssetForm[K]) => setAssetForm((f) => ({ ...f, [k]: v }))
  const setCF = <K extends keyof ContribForm>(k: K, v: ContribForm[K]) => setContribForm((f) => ({ ...f, [k]: v }))

  // --- Asset CRUD ---
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
      setAssets((prev) => [...prev, new AssetItem(crypto.randomUUID(), assetForm.category, assetForm.initialAmount, assetForm.annualReturn, assetForm.from, [])])
    } else {
      setAssets((prev) => prev.map((a) =>
        a.id === editingAssetId
          ? new AssetItem(a.id, assetForm.category, assetForm.initialAmount, assetForm.annualReturn, assetForm.from, a.contributions)
          : a
      ))
    }
    setEditingAssetId(null)
  }

  const removeAsset = (id: string) => setAssets((prev) => prev.filter((a) => a.id !== id))

  // --- Contribution CRUD ---
  const startAddContrib = (assetId: string) => {
    setContribForm({ monthlyAmount: 3, from: { age: repAge, month: 1 }, to: null })
    setEditingContribKey({ assetId, contribId: '__new__' })
  }

  const startEditContrib = (assetId: string, contrib: ContributionPeriod) => {
    setContribForm({ monthlyAmount: contrib.monthlyAmount, from: contrib.from, to: contrib.to })
    setEditingContribKey({ assetId, contribId: contrib.id })
  }

  const commitContrib = () => {
    if (!editingContribKey) return
    const { assetId, contribId } = editingContribKey
    const newContrib = new ContributionPeriod(
      contribId === '__new__' ? crypto.randomUUID() : contribId,
      contribForm.monthlyAmount, contribForm.from, contribForm.to,
    )
    setAssets((prev) => prev.map((a) => {
      if (a.id !== assetId) return a
      const contribs = contribId === '__new__'
        ? [...a.contributions, newContrib]
        : a.contributions.map((c) => (c.id === contribId ? newContrib : c))
      return new AssetItem(a.id, a.category, a.initialAmount, a.annualReturn, a.from, contribs)
    }))
    setEditingContribKey(null)
  }

  const removeContrib = (assetId: string, contribId: string) => {
    setAssets((prev) => prev.map((a) =>
      a.id === assetId
        ? new AssetItem(a.id, a.category, a.initialAmount, a.annualReturn, a.from, a.contributions.filter((c) => c.id !== contribId))
        : a
    ))
  }

  const save = () => {
    setAssetItems(assets)
    navigate('/result')
  }

  // ── 資産フォーム（JSX変数 → 再マウント防止）
  const assetFormJSX = (
    <div className="flex flex-col gap-4 pt-4 border-t border-white/10 mt-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">カテゴリ</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setAF('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                assetForm.category === cat ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/60">初期残高（万円）</label>
          <input
            type="number" min={0}
            value={assetForm.initialAmount}
            onChange={(e) => setAF('initialAmount', e.target.value === '' ? 0 : Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/60">年間利回り（%）</label>
          <input
            type="number" min={0} max={30} step={0.1}
            value={assetForm.annualReturn}
            onChange={(e) => setAF('annualReturn', e.target.value === '' ? 0 : Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
          />
        </div>
      </div>
      <AgeMonthInput label="開始年月" value={assetForm.from} onChange={(v) => setAF('from', v)} repCurrentAge={repAge} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditingAssetId(null)}
          className="flex-1 py-2 rounded-xl text-white/50 border border-white/10 hover:bg-white/5 text-sm transition-colors">キャンセル</button>
        <button type="button" onClick={commitAsset}
          className="flex-1 py-2 rounded-xl text-black font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>確定</button>
      </div>
    </div>
  )

  // ── 積立フォーム（JSX変数 → 再マウント防止）
  const contribFormJSX = (
    <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mt-2">
      <p className="text-xs font-semibold text-white/50">積立期間を追加</p>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">月額（万円/月）</label>
        <input
          type="number" min={0}
          value={contribForm.monthlyAmount}
          onChange={(e) => setCF('monthlyAmount', e.target.value === '' ? 0 : Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-right focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-colors"
        />
      </div>
      <AgeMonthInput label="開始" value={contribForm.from} onChange={(v) => setCF('from', v)} repCurrentAge={repAge} />
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-white/60 whitespace-nowrap">終了</label>
        <button
          type="button"
          onClick={() => setCF('to', contribForm.to === null ? { age: 65, month: 12 } : null)}
          className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
            contribForm.to === null ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/50'
          }`}
        >
          {contribForm.to === null ? '終了なし' : '終了あり'}
        </button>
        {contribForm.to !== null && (
          <AgeMonthInput label="" value={contribForm.to} onChange={(v) => setCF('to', v)} repCurrentAge={repAge} />
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditingContribKey(null)}
          className="flex-1 py-1.5 rounded-xl text-white/50 border border-white/10 text-xs hover:bg-white/5 transition-colors">キャンセル</button>
        <button type="button" onClick={commitContrib}
          className="flex-1 py-1.5 rounded-xl text-black font-bold text-xs"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>確定</button>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-white/90 mb-6">資産・運用</h1>

        <div className="flex flex-col gap-4 mb-4">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              {editingAssetId === asset.id ? assetFormJSX : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium w-fit"
                        style={{ background: CATEGORY_COLORS[asset.category] + '22', color: CATEGORY_COLORS[asset.category] }}>
                        {asset.category}
                      </span>
                      <p className="text-white/90 font-semibold">
                        初期 {asset.initialAmount.toLocaleString()}万円 ・ 年利 {asset.annualReturn}%
                      </p>
                      <p className="text-xs text-white/40">開始: {asset.from.age}歳{asset.from.month}月</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEditAsset(asset)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors">編集</button>
                      <button onClick={() => removeAsset(asset.id)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-red-400/70 hover:bg-red-400/10 transition-colors">削除</button>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/40 mb-2">積立期間</p>
                    {asset.contributions.length === 0 && (
                      <p className="text-xs text-white/30 mb-2">積立なし</p>
                    )}
                    <div className="flex flex-col gap-2">
                      {asset.contributions.map((contrib) => (
                        <div key={contrib.id}>
                          {editingContribKey?.assetId === asset.id && editingContribKey.contribId === contrib.id
                            ? contribFormJSX
                            : (
                              <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                <span className="text-sm text-white/70">
                                  {contrib.monthlyAmount}万円/月 ・{' '}
                                  {contrib.from.age}歳{contrib.from.month}月〜
                                  {contrib.to ? `${contrib.to.age}歳${contrib.to.month}月` : '終了なし'}
                                </span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => startEditContrib(asset.id, contrib)}
                                    className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40 hover:bg-white/10 transition-colors">編集</button>
                                  <button onClick={() => removeContrib(asset.id, contrib.id)}
                                    className="text-xs px-2 py-0.5 rounded bg-white/5 text-red-400/60 hover:bg-red-400/10 transition-colors">削除</button>
                                </div>
                              </div>
                            )
                          }
                        </div>
                      ))}

                      {editingContribKey?.assetId === asset.id && editingContribKey.contribId === '__new__' && contribFormJSX}

                      {(!editingContribKey || editingContribKey.assetId !== asset.id) && (
                        <button type="button" onClick={() => startAddContrib(asset.id)}
                          className="w-full py-1.5 rounded-lg text-xs text-white/40 border border-dashed border-white/15 hover:border-amber-400/30 hover:text-amber-300 transition-colors">
                          ＋ 積立期間を追加
                        </button>
                      )}
                    </div>
                  </div>
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
