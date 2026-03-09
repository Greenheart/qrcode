import { test, expect } from 'vitest'
import * as Utils from '#core/utils.ts'
import * as Version from '#core/version.ts'
import * as ECLevel from '#core/error-correction-level.ts'
import * as ECCode from '#core/error-correction-code.ts'
import * as Mode from '#core/mode.ts'
import type { QRVersion } from '#lib/types.ts'

test('Error correction codewords', () => {
  const levels = [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]

  for (let v = Version.MIN; v <= Version.MAX; v++) {
    const totalCodewords = Utils.getSymbolTotalCodewords(v as QRVersion)
    const reservedByte = Math.ceil((Mode.getCharCountIndicator(Mode.BYTE, v as QRVersion) + 4) / 8)

    for (let l = 0; l < levels.length; l++) {
      const dataCodewords = Version.getCapacity(v as QRVersion, levels[l], Mode.BYTE) + reservedByte

      const expectedCodewords = totalCodewords - dataCodewords

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
