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

test('Error level validity', () => {
  for (let l = 0; l < EC_LEVELS.length; l++) {
    expect(ECLevel.isValid(EC_LEVELS[l]), 'Should return true if error level is valid').toEqual(
      true,
    )
  }

  expect(ECLevel.isValid(undefined), 'Should return false if level is undefined').toEqual(false)
  expect(ECLevel.isValid({}), 'Should return false if bit property is undefined').toEqual(false)
  expect(ECLevel.isValid({ bit: -1 }), 'Should return false if bit property value is < 0').toEqual(
    false,
  )
  expect(ECLevel.isValid({ bit: 4 }), 'Should return false if bit property value is > 3').toEqual(
    false,
  )
})
