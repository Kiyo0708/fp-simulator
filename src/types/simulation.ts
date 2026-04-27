export type Gender = 'male' | 'female'

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

export interface IncomeInput {
  representativeMonthly: number  // 万円/月
  spouseMonthly: number          // 万円/月
  currentSavings: number         // 万円（現在の総資産）
  expectedReturn: number         // 年率 %
  retirementAge: number          // 退職年齢
}

export interface ExpenseInput {
  livingMonthly: number   // 万円/月（生活費）
  housingMonthly: number  // 万円/月（家賃）
  otherMonthly: number    // 万円/月（その他固定費）
}

export interface SimulationInput {
  family: FamilyInput
  income: IncomeInput
  expenses: ExpenseInput
}

export interface YearlyData {
  age: number
  spouseAge: number | null
  incomeAnnual: number
  expensesAnnual: number
  netAnnual: number
  investmentReturn: number
  assetsEnd: number
  expenseBreakdown: {
    living: number
    housing: number
    other: number
  }
}

export interface SimulationResult {
  years: YearlyData[]
}
