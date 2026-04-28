export type Gender = 'male' | 'female'

// --- 時間型 ---

export interface AgeMonth {
  age: number    // 家族代表者の年齢
  month: number  // 1〜12
}

// --- 基底インターフェース ---

export interface IPlanItem {
  id: string
  from: AgeMonth
  /** null = 一時金（from の年齢・月のみ発生）。継続の場合は終了年月 */
  to: AgeMonth | null
  /** 継続の場合は万円/月、一時金の場合は万円（総額） */
  value: number
}

// --- カテゴリ型 ---

export type IncomeCategory = '給与' | '年金' | '補助' | 'その他'
export type ExpenseCategory = '生活費' | '住宅' | '子供関連' | '保険' | 'その他'
export type AssetCategory = '投資' | '積み立て' | '現金・預金' | 'その他'

// --- 収入クラス ---

export class IncomeItem implements IPlanItem {
  id: string
  from: AgeMonth
  to: AgeMonth | null
  value: number
  familyMemberId: string | null
  category: IncomeCategory

  constructor(id: string, from: AgeMonth, to: AgeMonth | null, value: number, familyMemberId: string | null, category: IncomeCategory) {
    this.id = id; this.from = from; this.to = to; this.value = value
    this.familyMemberId = familyMemberId; this.category = category
  }
}

// --- 支出クラス ---

export class ExpenseItem implements IPlanItem {
  id: string
  from: AgeMonth
  to: AgeMonth | null
  value: number
  familyMemberId: string | null
  category: ExpenseCategory

  constructor(id: string, from: AgeMonth, to: AgeMonth | null, value: number, familyMemberId: string | null, category: ExpenseCategory) {
    this.id = id; this.from = from; this.to = to; this.value = value
    this.familyMemberId = familyMemberId; this.category = category
  }
}

// --- 資産運用クラス ---

export class ContributionPeriod {
  id: string
  monthlyAmount: number
  from: AgeMonth
  /** null = 終了なし（indefinitely） */
  to: AgeMonth | null

  constructor(id: string, monthlyAmount: number, from: AgeMonth, to: AgeMonth | null) {
    this.id = id; this.monthlyAmount = monthlyAmount; this.from = from; this.to = to
  }
}

export class AssetItem {
  id: string
  category: AssetCategory
  initialAmount: number
  annualReturn: number
  from: AgeMonth
  contributions: ContributionPeriod[]

  constructor(id: string, category: AssetCategory, initialAmount: number, annualReturn: number, from: AgeMonth, contributions: ContributionPeriod[]) {
    this.id = id; this.category = category; this.initialAmount = initialAmount
    this.annualReturn = annualReturn; this.from = from; this.contributions = contributions
  }
}

// --- 家族 ---

export interface FamilyMember {
  name: string
  age: number
  gender: Gender
}

export interface Child {
  id: string
  name: string
  age: number
}

export interface FamilyInput {
  representative: FamilyMember
  hasSpouse: boolean
  spouse: FamilyMember
  children: Child[]
}

// --- シミュレーション入出力 ---

export interface SimulationInput {
  family: FamilyInput
  incomeItems: IncomeItem[]
  expenseItems: ExpenseItem[]
  assetItems: AssetItem[]
}

export interface YearlyData {
  age: number
  spouseAge: number | null
  incomeAnnual: number
  expensesAnnual: number
  netAnnual: number
  contributionsAnnual: number                              // 年間積立総額
  investmentReturnAnnual: number                           // 年間運用益
  liquidSavings: number                                    // 現金余剰（累積）
  assetCategoryBalances: Partial<Record<AssetCategory, number>>  // カテゴリ別残高
  assetItemBalances: Array<{ id: string; category: AssetCategory; balance: number }>  // 資産ごとの残高
  assetsEnd: number
  incomeBreakdown: Partial<Record<IncomeCategory, number>>
  expenseBreakdown: Partial<Record<ExpenseCategory, number>>
}

export interface SimulationResult {
  years: YearlyData[]
}
