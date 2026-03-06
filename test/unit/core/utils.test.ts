import { test, expect } from 'vitest'
import * as Utils from '#core/utils.js'

/**
 * QR Code sizes. Each element refers to a version
 */
const EXPECTED_SYMBOL_SIZES = [
  21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93, 97, 101, 105, 109,
  113, 117, 121, 125, 129, 133, 137, 141, 145, 149, 153, 157, 161, 165, 169, 173, 177,
]

test('Symbol size', () => {
  expect(() => {
    // @ts-expect-error Testing invalid arguments
    Utils.getSymbolSize()
  }, 'Should throw if version is undefined').toThrow()
  expect(() => {
    Utils.getSymbolSize(0)
  }, 'Should throw if version is not in range').toThrow()
  expect(() => {
    Utils.getSymbolSize(41)
  }, 'Should throw if version is not in range').toThrow()

  for (let i = 1; i <= 40; i++) {
    expect(Utils.getSymbolSize(i), 'Should return correct symbol size').toEqual(
      EXPECTED_SYMBOL_SIZES[i - 1],
    )
  }
})

test('Symbol codewords', () => {
  for (let i = 1; i <= 40; i++) {
    expect(Utils.getSymbolTotalCodewords(i), 'Should return positive number').toBeGreaterThan(0)
  }
})

test('BCH Digit', () => {
  const testData = [
    { data: 0, bch: 0 },
    { data: 1, bch: 1 },
    { data: 2, bch: 2 },
    { data: 4, bch: 3 },
    { data: 8, bch: 4 },
  ]

  testData.forEach((d) => {
    expect(Utils.getBCHDigit(d.data), 'Should return correct BCH for value: ' + d.data).toEqual(
      d.bch,
    )
  })
})

test('Set/Get SJIS function', () => {
  expect(() => {
    Utils.setToSJISFunction()
  }, 'Should throw if param is not a function').toThrow()

  expect(
    Utils.isKanjiModeEnabled(),
    'Kanji mode should be disabled if "toSJIS" function is not set',
  ).toEqual(false)

  function testFunc(c: string) {
    return 'test_' + c
  }

  Utils.setToSJISFunction(testFunc)

  expect(
    Utils.isKanjiModeEnabled(),
    'Kanji mode should be enabled if "toSJIS" function is set',
  ).toEqual(true)

  expect(Utils.toSJIS('a'), 'Should correctly call "toSJIS" function').toEqual('test_a')
})
