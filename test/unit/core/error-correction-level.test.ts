import { test, expect } from 'vitest'
import * as ECLevel from '#core/error-correction-level.ts'

const EC_LEVELS = [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]

test('Error level parsed from input value', () => {
  const values = [
    ['l', 'low'],
    ['m', 'medium'],
    ['q', 'quartile'],
    ['h', 'high'],
  ]

  for (let l = 0; l < values.length; l++) {
    for (let i = 0; i < values[l].length; i++) {
      expect(ECLevel.parse(values[l][i])).toEqual(EC_LEVELS[l])
      expect(ECLevel.parse(values[l][i].toUpperCase())).toEqual(EC_LEVELS[l])
    }
  }

  expect(ECLevel.parse(undefined), 'Should return undefined if value is undefined').toEqual(
    undefined
  )
  expect(() => ECLevel.parse(''), 'Should throw if value is invalid').toThrow()
  expect(() => ECLevel.parse('extra'), 'Should throw if value is invalid').toThrow()
})
