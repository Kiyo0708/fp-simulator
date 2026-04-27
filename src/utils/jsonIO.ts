import type { SimulationInput } from '../types/simulation'

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

export function parseJSON(jsonString: string): SimulationInput {
  const { family, income, expenses } = JSON.parse(jsonString)
  return { family, income, expenses }
}
