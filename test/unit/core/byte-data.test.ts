import { test, expect } from 'vitest'
import BitBuffer from '#core/bit-buffer.js'
import ByteData from '#core/byte-data.js'
import * as Mode from '#core/mode.js'

test('Byte Data: String Input', () => {
  const text = '1234'
  const textBitLength = 32
  const textByte = [49, 50, 51, 52] // 1, 2, 3, 4
  const utf8Text = '\u00bd + \u00bc = \u00be' // 9 char, 12 byte

  const byteData = new ByteData(text)

  expect(byteData.mode, 'Mode should be BYTE').toEqual(Mode.BYTE)
  expect(byteData.getLength(), 'Should return correct length').toEqual(text.length)
  expect(byteData.getBitsLength(), 'Should return correct bit length').toEqual(textBitLength)

  const bitBuffer = new BitBuffer()
  byteData.write(bitBuffer)
  expect(bitBuffer.buffer, 'Should write correct data to buffer').toStrictEqual(textByte)

  const byteDataUtf8 = new ByteData(utf8Text)
  expect(byteDataUtf8.getLength(), 'Should return correct length for utf8 chars').toEqual(12)
})

test('Byte Data: Byte Input', () => {
  const bytes = new Uint8ClampedArray([1, 231, 32, 22])

  const byteData = new ByteData(bytes)
  expect(byteData.getLength(), 'Should return correct length').toEqual(bytes.length)
  expect(byteData.getBitsLength(), 'Should return correct bit length').toEqual(bytes.length * 8)

  const bitBuffer = new BitBuffer()
  byteData.write(bitBuffer)
  expect(bitBuffer.buffer, 'Should write correct data to buffer').toEqual([...bytes])
})
