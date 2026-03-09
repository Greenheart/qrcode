import { test, expect } from 'vitest'

import BitBuffer from '#core/bit-buffer.ts'
import AlphanumericData from '#core/alphanumeric-data.ts'
import * as Mode from '#core/mode.ts'

const testData = [
  {
    data: 'A',
    length: 1,
    bitLength: 6,
    dataBit: [40],
  },
  {
    data: 'AB',
    length: 2,
    bitLength: 11,
    dataBit: [57, 160],
  },
  {
    data: 'ABC12',
    length: 5,
    bitLength: 28,
    dataBit: [57, 168, 116, 32],
  },
]

test('Alphanumeric Data', () => {
  testData.forEach((data) => {
    const alphanumericData = new AlphanumericData(data.data)

    expect(alphanumericData.mode, 'Mode should be ALPHANUMERIC').toEqual(Mode.ALPHANUMERIC)
    expect(alphanumericData.getLength(), 'Should return correct length').toEqual(data.length)
    expect(alphanumericData.getBitsLength(), 'Should return correct bit length').toEqual(
      data.bitLength,
    )

    const bitBuffer = new BitBuffer()
    alphanumericData.write(bitBuffer)
    expect(bitBuffer.buffer, 'Should write correct data to buffer').toStrictEqual(data.dataBit)
  })
})
