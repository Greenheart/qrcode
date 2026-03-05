import { test, expect } from 'vitest'
import * as Utils from '#core/utils.js'
import * as Version from '#core/version.js'
import * as ECLevel from '#core/error-correction-level.js'
import * as ECCode from '#core/error-correction-code.js'
import * as Mode from '#core/mode.js'

test('Error correction codewords', () => {
  const levels = [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]

  for (let v = 1; v <= 40; v++) {
    const totalCodewords = Utils.getSymbolTotalCodewords(v)
    const reservedByte = Math.ceil((Mode.getCharCountIndicator(Mode.BYTE, v) + 4) / 8)

    for (let l = 0; l < levels.length; l++) {
      const dataCodewords = Version.getCapacity(v, levels[l], Mode.BYTE) + reservedByte

      const expectedCodewords = totalCodewords - dataCodewords

      // TODO: fix type errors for parameters
      expect(
        ECCode.getTotalCodewordsCount(v, levels[l]),
        'Should return correct codewords number',
      ).toEqual(expectedCodewords)
    }
  }

  expect(
    ECCode.getTotalCodewordsCount(1),
    'Should return undefined if EC level is not specified',
  ).toEqual(undefined)
})

test('Error correction blocks', () => {
  const levels = [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]

  for (let v = 1; v <= 40; v++) {
    for (let l = 0; l < levels.length; l++) {
      expect(
        ECCode.getBlocksCount(v, levels[l]),
        'Should return a positive number',
      ).toBeGreaterThan(0)
    }
  }

  expect(ECCode.getBlocksCount(1), 'Should return undefined if EC level is not specified').toEqual(
    undefined,
  )
})
