import { test, expect } from 'vitest'
import * as pattern from '#core/finder-pattern.ts'
import { getQRVersionRange } from '#test/helpers.ts'

test('Finder pattern', () => {
  for (const v of getQRVersionRange()) {
    expect(pattern.getPositions(v).length, 'Should always return 3 pattern positions').toEqual(3)
  }
})
