import { create } from 'zustand'
import type { SimulationInput, SimulationResult } from '../types/simulation'
import { calculate } from '../utils/simulation'

const DEFAULT_INPUT: SimulationInput = {
  family: {
    representative: { name: '', age: 35, gender: 'male' },
    hasSpouse: false,
    spouse: { name: '', age: 33, gender: 'female' },
    children: [],
  },
  income: {
    representativeMonthly: 40,
    spouseMonthly: 25,
    currentSavings: 500,
    expectedReturn: 3,
    retirementAge: 65,
  },
  expenses: {
    livingMonthly: 20,
    housingMonthly: 10,
    otherMonthly: 0,
  },
}

interface SimulationStore {
  input: SimulationInput
  result: SimulationResult
  setFamily: (family: SimulationInput['family']) => void
  setIncome: (income: SimulationInput['income']) => void
  setExpenses: (expenses: SimulationInput['expenses']) => void
  loadInput: (input: SimulationInput) => void
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  input: DEFAULT_INPUT,
  result: calculate(DEFAULT_INPUT),

  setFamily: (family) => {
    const input = { ...get().input, family }
    set({ input, result: calculate(input) })
  },
  setIncome: (income) => {
    const input = { ...get().input, income }
    set({ input, result: calculate(input) })
  },
  setExpenses: (expenses) => {
    const input = { ...get().input, expenses }
    set({ input, result: calculate(input) })
  },
  loadInput: (input) => set({ input, result: calculate(input) }),
}))
