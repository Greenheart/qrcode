import { test, expect } from 'vitest'
import * as FormatInfo from '#core/format-info.js'
import * as ECLevel from '#core/error-correction-level.ts'
import * as MaskPattern from '#core/mask-pattern.ts'

const EXPECTED_FORMAT_BITS = [
  [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976],
  [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0],
  [0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed],
  [0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b],
]

test('Format encoded info', () => {
  const levels = [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]
  const patterns = Object.keys(MaskPattern.Patterns).length

  for (let l = 0; l < levels.length; l++) {
    for (let p = 0; p < patterns; p++) {
      const bch = FormatInfo.getEncodedBits(levels[l], p)
      expect(bch, 'Should return correct bits').toEqual(EXPECTED_FORMAT_BITS[l][p])
    }
  }
})
