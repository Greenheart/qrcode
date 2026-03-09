import { test, expect } from 'vitest'

import BitMatrix from '#core/bit-matrix.ts'
import * as MaskPattern from '#core/mask-pattern.ts'
import { arrayWithFill } from '#test/helpers.js'

test('Mask pattern - Pattern references', () => {
  const patternsCount = Object.keys(MaskPattern.Patterns).length
  expect(patternsCount, 'Should return 8 patterns').toEqual(8)
})

const expectedPattern000 = new Uint8Array([
  1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0,
  1, 0, 1,
])

const expectedPattern001 = new Uint8Array([
  1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0,
  0, 0, 0,
])

const expectedPattern010 = new Uint8Array([
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  1, 0, 0,
])

const expectedPattern011 = new Uint8Array([
  1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0,
  0, 1, 0,
])

const expectedPattern100 = new Uint8Array([
  1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
  0, 0, 0,
])

const expectedPattern101 = new Uint8Array([
  1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
  0, 0, 0,
])

const expectedPattern110 = new Uint8Array([
  1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0,
  0, 1, 1,
])

const expectedPattern111 = new Uint8Array([
  1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
  1, 0, 0,
])

test('MaskPattern parse invalid input', () => {
  // @ts-expect-error Testing invalid input
  expect(MaskPattern.parse(), 'Should return undefined if no input').toEqual(undefined)
  expect(MaskPattern.parse(''), 'Should return undefined if value is not a number').toEqual(
    undefined,
  )
  expect(MaskPattern.parse(-1), 'Should return undefined if value is not in range').toEqual(
    undefined,
  )
  expect(MaskPattern.parse(8), 'Should return undefined if value is not in range').toEqual(
    undefined,
  )
  expect(MaskPattern.parse(null), 'Should return undefined if value is null').toEqual(undefined)
  expect(MaskPattern.parse(NaN), 'Should return undefined if value is NaN').toEqual(undefined)
})

test('MaskPattern parse value', () => {
  expect(MaskPattern.parse(5), 'Should return correct mask pattern from a number').toEqual(5)
  expect(MaskPattern.parse('5'), 'Should return correct mask pattern from a string').toEqual(5)
  expect(MaskPattern.parse(-1), 'Should return undefined if value is too small').toEqual(undefined)
  expect(MaskPattern.parse(8), 'Should return undefined if value is too big').toEqual(undefined)
  expect(MaskPattern.parse(6.5), 'Should return undefined if value is a float').toEqual(undefined)
})

test('Mask pattern - Apply mask', () => {
  const patterns = Object.keys(MaskPattern.Patterns).length
  const expectedPatterns = [
    expectedPattern000,
    expectedPattern001,
    expectedPattern010,
    expectedPattern011,
    expectedPattern100,
    expectedPattern101,
    expectedPattern110,
    expectedPattern111,
  ]

  for (let p = 0; p < patterns; p++) {
    const matrix = new BitMatrix(6)
    MaskPattern.applyMask(p, matrix)
    expect(matrix.data, 'Should return correct pattern').toStrictEqual(
      new Uint8Array(expectedPatterns[p]),
    )
  }

  const matrix = new BitMatrix(2)
  matrix.set(0, 0, false, true)
  matrix.set(0, 1, false, true)
  matrix.set(1, 0, false, true)
  matrix.set(1, 1, false, true)
  MaskPattern.applyMask(0, matrix)

  expect(matrix.data, 'Should leave reserved bit unchanged').toStrictEqual(
    new Uint8Array([0, 0, 0, 0]),
  )

  expect(() => {
    MaskPattern.applyMask(-1, new BitMatrix(1))
  }, 'Should throw if pattern is invalid').toThrow()
})

test('Mask pattern - Penalty N1', () => {
  let matrix = new BitMatrix(11)
  matrix.data = new Uint8Array([
    1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1,
    1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1,
    1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
  ])

  expect(MaskPattern.getPenaltyN1(matrix), 'Should return correct penalty points').toEqual(59)

  matrix = new BitMatrix(6)
  matrix.data = expectedPattern000

  expect(MaskPattern.getPenaltyN1(matrix), 'Should return correct penalty points').toEqual(0)

  matrix.data = expectedPattern001

  expect(MaskPattern.getPenaltyN1(matrix), 'Should return correct penalty points').toEqual(24)

  matrix.data = expectedPattern010

  expect(MaskPattern.getPenaltyN1(matrix), 'Should return correct penalty points').toEqual(24)

  matrix.data = expectedPattern101

  expect(MaskPattern.getPenaltyN1(matrix), 'Should return correct penalty points').toEqual(20)
})

test('Mask pattern - Penalty N2', () => {
  let matrix = new BitMatrix(8)
  matrix.data = new Uint8Array([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1,
  ])

  expect(MaskPattern.getPenaltyN2(matrix), 'Should return correct penalty points').toEqual(45)

  matrix = new BitMatrix(6)
  matrix.data = expectedPattern000

  expect(MaskPattern.getPenaltyN2(matrix), 'Should return correct penalty points').toEqual(0)

  matrix.data = expectedPattern010

  expect(MaskPattern.getPenaltyN2(matrix), 'Should return correct penalty points').toEqual(30)

  matrix.data = expectedPattern100

  expect(MaskPattern.getPenaltyN2(matrix), 'Should return correct penalty points').toEqual(36)
})

test('Mask pattern - Penalty N3', () => {
  const matrix = new BitMatrix(11)
  matrix.data = new Uint8Array([
    0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0,
    1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0,
  ])

  expect(MaskPattern.getPenaltyN3(matrix), 'Should return correct penalty points').toEqual(160)

  matrix.data = new Uint8Array([
    1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0,
    0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1,
    1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1,
    0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
  ])

  expect(MaskPattern.getPenaltyN3(matrix), 'Should return correct penalty points').toEqual(280)
})

test('Mask pattern - Penalty N4', () => {
  const matrix = new BitMatrix(10)
  matrix.data = new Uint8Array([...arrayWithFill(50, 1), ...arrayWithFill(50, 0)])

  expect(MaskPattern.getPenaltyN4(matrix), 'Should return correct penalty points').toEqual(0)

  const matrix2 = new BitMatrix(21)
  matrix2.data = new Uint8Array([...arrayWithFill(190, 1), ...arrayWithFill(251, 0)])

  expect(MaskPattern.getPenaltyN4(matrix2), 'Should return correct penalty points').toEqual(10)

  const matrix3 = new BitMatrix(10)
  matrix3.data = new Uint8Array([...arrayWithFill(22, 1), ...arrayWithFill(78, 0)])

  expect(MaskPattern.getPenaltyN4(matrix3), 'Should return correct penalty points').toEqual(50)
})

test('Mask pattern - Best mask', () => {
  const matrix = new BitMatrix(11)
  matrix.data = new Uint8Array([
    0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0,
    1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0,
  ])

  const mask = MaskPattern.getBestMask(matrix, () => {})
  expect(Number.isInteger(mask), 'Should return a number').toEqual(true)

  expect(mask >= 0 && mask < 8, 'Should return a number in range 0,7').toBeTruthy()
})
