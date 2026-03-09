import { test, expect } from 'vitest'
import BitMatrix from '#core/bit-matrix.ts'

test('Bit Matrix', () => {
  expect(() => {
    new BitMatrix(0)
  }, 'Should throw if size is 0').toThrow()
  expect(() => {
    new BitMatrix(-1)
  }, 'Should throw if size less than 0').toThrow()

  const bm = new BitMatrix(2)

  expect(bm.size, 'Should have correct size').toEqual(2)
  expect(bm.data.length, 'Should correctly set buffer size').toEqual(4)

  bm.set(0, 1, 1, true)
  expect(bm.get(0, 1), 'Should correctly set bit to true').toEqual(1)
  expect(bm.isReserved(0, 1), 'Should correctly set bit as reserved').toEqual(true)

  bm.xor(0, 1, 1)
  expect(bm.get(0, 1), 'Should correctly xor bit').toEqual(0)

  bm.set(0, 1, 0)
  expect(bm.get(0, 1), 'Should correctly set bit to false').toEqual(0)
})
