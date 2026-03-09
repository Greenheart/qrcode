import { test, expect } from 'vitest'
import * as pattern from '#core/finder-pattern.ts'

test('Finder pattern', () => {
  for (let i = 1; i <= 40; i++) {
    expect(pattern.getPositions(i).length, 'Should always return 3 pattern positions').toEqual(3)
  }
})
