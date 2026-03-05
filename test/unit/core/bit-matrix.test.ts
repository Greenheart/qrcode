import { test, expect } from 'vitest'
import BitMatrix from '#core/bit-matrix.js'

test('Bit Matrix', () => {
  expect(() => {
    BitMatrix(0)
  }, 'Should throw if size is 0').toThrow()
  expect(() => {
    BitMatrix(-1)
  }, 'Should throw if size less than 0').toThrow()

  const bm = new BitMatrix(2)

  expect(bm.size, 'Should have correct size').toEqual(2)
  expect(bm.data.length, 'Should correctly set buffer size').toEqual(4)

  bm.set(0, 1, true, true)
  expect(bm.get(0, 1), 'Should correctly set bit to true').toEqual(1)
  expect(bm.isReserved(0, 1), 'Should correctly set bit as reserved').toEqual(1)

  // TODO: check if the type is correct - would be better to return 1 | 0 rather than boolean or number
  bm.xor(0, 1, 1)
  expect(bm.get(0, 1), 'Should correctly xor bit').toEqual(0)

  // TODO: Improve parameter types for BitMatrix.set()
  bm.set(0, 1, false)
  expect(bm.get(0, 1), 'Should correctly set bit to false').toEqual(0)
})
