import { create } from 'zustand'
import {
  IncomeItem,
  ExpenseItem,
  AssetItem,
  ContributionPeriod,
  type SimulationInput,
  type SimulationResult,
} from '../types/simulation'

import { calculate } from '../utils/simulation'

const AGE = 35

const DEFAULT_INPUT: SimulationInput = {
  family: {
    representative: { name: '', age: AGE, gender: 'male' },
    hasSpouse: false,
    spouse: { name: '', age: 33, gender: 'female' },
    children: [],
  },
  incomeItems: [
    new IncomeItem('default-income-1', { age: AGE, month: 1 }, { age: 65, month: 12 }, 40, 'representative', '給与'),
  ],
  expenseItems: [
    new ExpenseItem('default-expense-1', { age: AGE, month: 1 }, { age: 90, month: 12 }, 20, null, '生活費'),
    new ExpenseItem('default-expense-2', { age: AGE, month: 1 }, { age: 90, month: 12 }, 10, null, '住宅'),
  ],
  assetItems: [
    new AssetItem('default-asset-1', '現金・預金', 500, 0, { age: AGE, month: 1 }, [], []),
    new AssetItem('default-asset-2', '積み立て', 0, 5, { age: AGE, month: 1 }, [
      new ContributionPeriod('default-contrib-1', 3, { age: AGE, month: 1 }, null),
    ], []),
  ],
}

interface SimulationStore {
  input: SimulationInput
  result: SimulationResult
  setFamily: (family: SimulationInput['family']) => void
  setIncomeItems: (items: IncomeItem[]) => void
  setExpenseItems: (items: ExpenseItem[]) => void
  setAssetItems: (items: AssetItem[]) => void
  loadInput: (input: SimulationInput) => void
}

function recalc(input: SimulationInput) {
  return { input, result: calculate(input) }
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  input: DEFAULT_INPUT,
  result: calculate(DEFAULT_INPUT),

  setFamily: (family) => set(recalc({ ...get().input, family })),
  setIncomeItems: (incomeItems) => set(recalc({ ...get().input, incomeItems })),
  setExpenseItems: (expenseItems) => set(recalc({ ...get().input, expenseItems })),
  setAssetItems: (assetItems) => set(recalc({ ...get().input, assetItems })),
  loadInput: (input) => set(recalc(input)),
}))
