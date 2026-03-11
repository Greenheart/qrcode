import { test, expect } from 'vitest'
import * as Utils from '#core/utils.ts'
import * as Version from '#core/version.ts'
import * as ECLevel from '#core/error-correction-level.ts'
import * as ECCode from '#core/error-correction-code.ts'
import * as Mode from '#core/mode.ts'
import { getQRVersionRange } from '#test/helpers.ts'

test('Error correction codewords', () => {
  for (const v of getQRVersionRange()) {
    const totalCodewords = Utils.getSymbolTotalCodewords(v)
    const reservedByte = Math.ceil((Mode.getCharCountIndicator(Mode.BYTE, v) + 4) / 8)

    // TODO: Create a test helper for looping over all ECLevels to reduce risk for errors
    for (const level of [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]) {
      const dataCodewords = Version.getCapacity(v, level, Mode.BYTE) + reservedByte

      const expectedCodewords = totalCodewords - dataCodewords

      expect(
        ECCode.getTotalCodewordsCount(v, level),
        'Should return correct codewords number',
      ).toEqual(expectedCodewords)
    }
  }
})

test('Error correction blocks', () => {
  for (const v of getQRVersionRange()) {
    for (const level of [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]) {
      expect(ECCode.getBlocksCount(v, level), 'Should return a positive number').toBeGreaterThan(0)
    }
  }
})
