import { test, expect } from 'vitest'
import BitBuffer from '#core/bit-buffer.ts'

test('Bit Buffer', () => {
  const testData = 0x41 // 'A'
  const expectedDataBits = [false, true, false, false, false, false, false, true]

  const bitBuffer = new BitBuffer()

  expect(bitBuffer.getLengthInBits(), 'Initial length should be 0').toEqual(0)

  bitBuffer.put(testData, 8)
  expect(bitBuffer.getLengthInBits(), 'Length should be 8').toEqual(8)

  for (let i = 0; i < 8; i++) {
    expect(bitBuffer.get(i), 'Should return correct bit value').toEqual(expectedDataBits[i])
  }
})
