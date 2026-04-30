import {
  IncomeItem,
  ExpenseItem,
  AssetItem,
  ContributionPeriod,
  WithdrawalPeriod,
  type SimulationInput,
  type FamilyInput,
  type AgeMonth,
} from '../types/simulation'

export function exportToJSON(input: SimulationInput) {
  const payload = { version: '1.0', savedAt: new Date().toISOString(), ...input }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fp-plan.json'
  a.click()
  URL.revokeObjectURL(url)
}

// ── ヘルパー ──────────────────────────────────────────────

function id(raw: any): string {
  return typeof raw?.id === 'string' && raw.id ? raw.id : crypto.randomUUID()
}

function ageMonth(raw: any, fallback: AgeMonth): AgeMonth {
  if (raw && typeof raw.age === 'number' && typeof raw.month === 'number') {
    return { age: raw.age, month: raw.month }
  }
  return fallback
}

function ageMonthOrNull(raw: any): AgeMonth | null {
  if (raw == null) return null
  if (typeof raw.age === 'number' && typeof raw.month === 'number') {
    return { age: raw.age, month: raw.month }
  }
  return null
}

const DEFAULT_AGE: AgeMonth = { age: 35, month: 1 }

// ── 各クラスのサニタイザー ─────────────────────────────────

function sanitizeContribution(raw: any): ContributionPeriod {
  return new ContributionPeriod(
    id(raw),
    typeof raw?.monthlyAmount === 'number' ? raw.monthlyAmount : 0,
    ageMonth(raw?.from, DEFAULT_AGE),
    ageMonthOrNull(raw?.to),
  )
}

function sanitizeWithdrawal(raw: any): WithdrawalPeriod {
  return new WithdrawalPeriod(
    id(raw),
    typeof raw?.monthlyAmount === 'number' ? raw.monthlyAmount : 0,
    ageMonth(raw?.from, DEFAULT_AGE),
    ageMonthOrNull(raw?.to),
  )
}

function sanitizeAssetItem(raw: any): AssetItem {
  return new AssetItem(
    id(raw),
    raw?.category ?? '現金・預金',
    typeof raw?.initialAmount === 'number' ? raw.initialAmount : 0,
    typeof raw?.annualReturn === 'number' ? raw.annualReturn : 0,
    ageMonth(raw?.from, DEFAULT_AGE),
    Array.isArray(raw?.contributions) ? raw.contributions.map(sanitizeContribution) : [],
    // 旧フォーマットには drawdowns がないためデフォルトで空配列
    Array.isArray(raw?.drawdowns) ? raw.drawdowns.map(sanitizeWithdrawal) : [],
  )
}

function sanitizeIncomeItem(raw: any): IncomeItem {
  return new IncomeItem(
    id(raw),
    ageMonth(raw?.from, DEFAULT_AGE),
    ageMonthOrNull(raw?.to),
    typeof raw?.value === 'number' ? raw.value : 0,
    raw?.familyMemberId ?? null,
    raw?.category ?? 'その他',
  )
}

function sanitizeExpenseItem(raw: any): ExpenseItem {
  return new ExpenseItem(
    id(raw),
    ageMonth(raw?.from, DEFAULT_AGE),
    ageMonthOrNull(raw?.to),
    typeof raw?.value === 'number' ? raw.value : 0,
    raw?.familyMemberId ?? null,
    raw?.category ?? 'その他',
  )
}

function sanitizeFamily(raw: any): FamilyInput {
  const repAge = typeof raw?.representative?.age === 'number' ? raw.representative.age : 35
  return {
    representative: {
      name: raw?.representative?.name ?? '',
      age: repAge,
      gender: raw?.representative?.gender ?? 'male',
    },
    hasSpouse: raw?.hasSpouse === true,
    spouse: {
      name: raw?.spouse?.name ?? '',
      age: typeof raw?.spouse?.age === 'number' ? raw.spouse.age : repAge - 2,
      gender: raw?.spouse?.gender ?? 'female',
    },
    children: Array.isArray(raw?.children)
      ? raw.children.map((c: any) => ({
          id: id(c),
          name: c?.name ?? '',
          age: typeof c?.age === 'number' ? c.age : 0,
        }))
      : [],
  }
}

// ── メイン parse 関数 ──────────────────────────────────────

export function parseJSON(jsonString: string): SimulationInput {
  const raw = JSON.parse(jsonString)
  return {
    family: sanitizeFamily(raw?.family),
    incomeItems: Array.isArray(raw?.incomeItems) ? raw.incomeItems.map(sanitizeIncomeItem) : [],
    expenseItems: Array.isArray(raw?.expenseItems) ? raw.expenseItems.map(sanitizeExpenseItem) : [],
    assetItems: Array.isArray(raw?.assetItems) ? raw.assetItems.map(sanitizeAssetItem) : [],
  }
}
