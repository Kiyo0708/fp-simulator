import type { SimulationInput, SimulationResult, YearlyData } from '../types/simulation'

const END_AGE = 90

export function calculate(input: SimulationInput): SimulationResult {
  const { family, income, expenses } = input
  const startAge = family.representative.age
  const years: YearlyData[] = []
  let prevAssets = income.currentSavings

  for (let age = startAge; age <= END_AGE; age++) {
    const elapsed = age - startAge
    const spouseAge = family.hasSpouse ? family.spouse.age + elapsed : null

    const repIncome = age < income.retirementAge ? income.representativeMonthly * 12 : 0
    const spouseIncome =
      family.hasSpouse && spouseAge !== null && spouseAge < income.retirementAge
        ? income.spouseMonthly * 12
        : 0
    const annualIncome = repIncome + spouseIncome

    const livingAnnual = expenses.livingMonthly * 12
    const housingAnnual = expenses.housingMonthly * 12
    const otherAnnual = expenses.otherMonthly * 12
    const annualExpenses = livingAnnual + housingAnnual + otherAnnual

    const netAnnual = annualIncome - annualExpenses
    const investmentReturn = prevAssets > 0 ? prevAssets * (income.expectedReturn / 100) : 0
    const assetsEnd = prevAssets + netAnnual + investmentReturn

    years.push({
      age,
      spouseAge,
      incomeAnnual: annualIncome,
      expensesAnnual: annualExpenses,
      netAnnual,
      investmentReturn,
      assetsEnd,
      expenseBreakdown: { living: livingAnnual, housing: housingAnnual, other: otherAnnual },
    })

    prevAssets = assetsEnd
  }

  return { years }
}
