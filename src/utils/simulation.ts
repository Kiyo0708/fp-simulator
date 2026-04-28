import type {
  SimulationInput,
  SimulationResult,
  YearlyData,
  IPlanItem,
  ContributionPeriod,
  IncomeCategory,
  ExpenseCategory,
  AssetCategory,
} from '../types/simulation'

const END_AGE = 90

function getActiveMonths(from: IPlanItem['from'], to: NonNullable<IPlanItem['to']>, age: number): number {
  if (age < from.age || age > to.age) return 0
  const startMonth = age === from.age ? from.month : 1
  const endMonth = age === to.age ? to.month : 12
  return Math.max(0, endMonth - startMonth + 1)
}

function getItemAnnualAmount(item: IPlanItem, age: number): number {
  if (item.to === null) return item.from.age === age ? item.value : 0
  return item.value * getActiveMonths(item.from, item.to, age)
}

function getContributionAnnualAmount(period: ContributionPeriod, age: number): number {
  if (period.to === null) {
    if (age < period.from.age) return 0
    const startMonth = age === period.from.age ? period.from.month : 1
    return period.monthlyAmount * (13 - startMonth)
  }
  return period.monthlyAmount * getActiveMonths(period.from, period.to, age)
}

export function calculate(input: SimulationInput): SimulationResult {
  const { family, incomeItems, expenseItems, assetItems } = input
  const startAge = family.representative.age
  const years: YearlyData[] = []

  const assetBalances = new Map<string, number>()
  for (const asset of assetItems) {
    if (asset.from.age <= startAge) assetBalances.set(asset.id, asset.initialAmount)
  }

  let liquidSavings = 0

  for (let age = startAge; age <= END_AGE; age++) {
    const elapsed = age - startAge
    const spouseAge = family.hasSpouse ? family.spouse.age + elapsed : null

    for (const asset of assetItems) {
      if (age === asset.from.age && !assetBalances.has(asset.id)) {
        assetBalances.set(asset.id, asset.initialAmount)
      }
    }

    // 収入
    let annualIncome = 0
    const incomeBreakdown = {} as Partial<Record<IncomeCategory, number>>
    for (const item of incomeItems) {
      const amount = getItemAnnualAmount(item, age)
      if (amount > 0) {
        annualIncome += amount
        incomeBreakdown[item.category] = (incomeBreakdown[item.category] ?? 0) + amount
      }
    }

    // 支出
    let annualExpenses = 0
    const expenseBreakdown = {} as Partial<Record<ExpenseCategory, number>>
    for (const item of expenseItems) {
      const amount = getItemAnnualAmount(item, age)
      if (amount > 0) {
        annualExpenses += amount
        expenseBreakdown[item.category] = (expenseBreakdown[item.category] ?? 0) + amount
      }
    }

    // 資産運用
    let totalContributions = 0
    let totalReturnAmount = 0
    const assetCategoryBalances = {} as Partial<Record<AssetCategory, number>>

    for (const asset of assetItems) {
      if (!assetBalances.has(asset.id)) continue
      const prevBalance = assetBalances.get(asset.id)!

      let annualContrib = 0
      for (const period of asset.contributions) {
        annualContrib += getContributionAnnualAmount(period, age)
      }
      totalContributions += annualContrib

      const returnAmount = prevBalance > 0 ? prevBalance * (asset.annualReturn / 100) : 0
      totalReturnAmount += returnAmount

      const newBalance = prevBalance + annualContrib + returnAmount
      assetBalances.set(asset.id, newBalance)

      // カテゴリ別残高を集計
      assetCategoryBalances[asset.category] =
        (assetCategoryBalances[asset.category] ?? 0) + newBalance
    }

    liquidSavings += annualIncome - annualExpenses - totalContributions

    let totalInvestments = 0
    for (const balance of assetBalances.values()) totalInvestments += balance
    const assetsEnd = liquidSavings + totalInvestments

    // 資産ごとの残高（表のブレークダウン用）
    const assetItemBalances = assetItems
      .filter((a) => assetBalances.has(a.id))
      .map((a) => ({ id: a.id, category: a.category, balance: assetBalances.get(a.id)! }))

    years.push({
      age,
      spouseAge,
      incomeAnnual: annualIncome,
      expensesAnnual: annualExpenses,
      netAnnual: annualIncome - annualExpenses,
      contributionsAnnual: totalContributions,
      investmentReturnAnnual: totalReturnAmount,
      liquidSavings,
      assetCategoryBalances,
      assetItemBalances,
      assetsEnd,
      incomeBreakdown,
      expenseBreakdown,
    })
  }

  return { years }
}
