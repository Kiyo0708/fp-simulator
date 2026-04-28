import type {
  SimulationInput,
  SimulationResult,
  YearlyData,
  IPlanItem,
  ContributionPeriod,
  IncomeCategory,
  ExpenseCategory,
} from '../types/simulation'

const END_AGE = 90

/**
 * 指定年齢においてアイテムが有効な月数を返す。
 * to === null のアイテムは一時金なので 0 を返す（getOneTimeAmount で別途処理）。
 */
function getActiveMonths(from: IPlanItem['from'], to: NonNullable<IPlanItem['to']>, age: number): number {
  if (age < from.age || age > to.age) return 0
  const startMonth = age === from.age ? from.month : 1
  const endMonth = age === to.age ? to.month : 12
  return Math.max(0, endMonth - startMonth + 1)
}

function getItemAnnualAmount(item: IPlanItem, age: number): number {
  if (item.to === null) {
    // 一時金: from.age の年のみ適用
    return item.from.age === age ? item.value : 0
  }
  return item.value * getActiveMonths(item.from, item.to, age)
}

function getContributionAnnualAmount(period: ContributionPeriod, age: number): number {
  if (period.to === null) {
    // 終了なし（indefinitely）
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

  // 開始時点で既に始まっているアセットを初期化
  const assetBalances = new Map<string, number>()
  for (const asset of assetItems) {
    if (asset.from.age <= startAge) {
      assetBalances.set(asset.id, asset.initialAmount)
    }
  }

  let liquidSavings = 0

  for (let age = startAge; age <= END_AGE; age++) {
    const elapsed = age - startAge
    const spouseAge = family.hasSpouse ? family.spouse.age + elapsed : null

    // 今年から始まるアセットを初期化
    for (const asset of assetItems) {
      if (age === asset.from.age && !assetBalances.has(asset.id)) {
        assetBalances.set(asset.id, asset.initialAmount)
      }
    }

    // 収入集計
    let annualIncome = 0
    const incomeBreakdown = {} as Record<IncomeCategory, number>
    for (const item of incomeItems) {
      const amount = getItemAnnualAmount(item, age)
      if (amount > 0) {
        annualIncome += amount
        incomeBreakdown[item.category] = (incomeBreakdown[item.category] ?? 0) + amount
      }
    }

    // 支出集計
    let annualExpenses = 0
    const expenseBreakdown = {} as Record<ExpenseCategory, number>
    for (const item of expenseItems) {
      const amount = getItemAnnualAmount(item, age)
      if (amount > 0) {
        annualExpenses += amount
        expenseBreakdown[item.category] = (expenseBreakdown[item.category] ?? 0) + amount
      }
    }

    // 資産運用: 積立 + 運用益
    let totalAnnualContributions = 0
    for (const asset of assetItems) {
      if (!assetBalances.has(asset.id)) continue
      const prevBalance = assetBalances.get(asset.id)!

      let annualContrib = 0
      for (const period of asset.contributions) {
        annualContrib += getContributionAnnualAmount(period, age)
      }
      totalAnnualContributions += annualContrib

      const returnAmount = prevBalance > 0 ? prevBalance * (asset.annualReturn / 100) : 0
      assetBalances.set(asset.id, prevBalance + annualContrib + returnAmount)
    }

    // 現金収支（収入 - 支出 - 積立拠出）
    liquidSavings += annualIncome - annualExpenses - totalAnnualContributions

    // 総資産 = 現金 + 運用資産合計
    let totalInvestments = 0
    for (const balance of assetBalances.values()) totalInvestments += balance
    const assetsEnd = liquidSavings + totalInvestments

    years.push({
      age,
      spouseAge,
      incomeAnnual: annualIncome,
      expensesAnnual: annualExpenses,
      netAnnual: annualIncome - annualExpenses,
      assetsEnd,
      incomeBreakdown,
      expenseBreakdown,
    })
  }

  return { years }
}
