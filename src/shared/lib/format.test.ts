import { describe, expect, it } from 'vitest'
import { formatKm } from './format'

describe('formatKm', () => {
  it('formats thousands with a dot separator and a Km suffix', () => {
    expect(formatKm(53292)).toBe('53.292 Km')
  })

  it('formats numbers under a thousand with no separator', () => {
    expect(formatKm(950)).toBe('950 Km')
  })

  it('formats numbers in the millions with multiple separators', () => {
    expect(formatKm(1234567)).toBe('1.234.567 Km')
  })
})
