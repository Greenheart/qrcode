import { test, expect } from 'vitest'
import * as ECLevel from '#core/error-correction-level.ts'
import { ALL_EC_LEVELS } from '#test/helpers.ts'

test('Error level parsed from input value', () => {
  const levelNames = ['low', 'medium', 'quartile', 'high']

  for (let i = 0; i < levelNames.length; i++) {
    const name = levelNames[i]
    const level = ALL_EC_LEVELS[i]

    // Long name
    expect(ECLevel.parse(name)).toEqual(level)
    expect(ECLevel.parse(name.toUpperCase())).toEqual(level)

    // Short name
    expect(ECLevel.parse(name[0])).toEqual(level)
    expect(ECLevel.parse(name[0].toUpperCase())).toEqual(level)
  }

  expect(ECLevel.parse(undefined), 'Should return undefined if value is undefined').toEqual(
    undefined
  )
  expect(() => ECLevel.parse(''), 'Should throw if value is invalid').toThrow()
  expect(() => ECLevel.parse('extra'), 'Should throw if value is invalid').toThrow()
})
