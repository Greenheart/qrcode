import { test, expect } from 'vitest'

import BitBuffer from '#core/bit-buffer.ts'
import KanjiData from '#core/kanji-data.ts'
import * as Mode from '#core/mode.ts'
import toSJIS from '#helper/to-sjis.ts'
import { setToSJISFunction } from '#lib/core/utils.ts'

setToSJISFunction(toSJIS)

test('Kanji Data', () => {
  const data = '漢字漾癶'
  const length = 4
  const bitLength = 52 // length * 13

  const dataBit = [57, 250, 134, 174, 129, 134, 0]

  let kanjiData = new KanjiData(data)

  expect(kanjiData.mode, 'Mode should be KANJI').toEqual(Mode.KANJI)
  expect(kanjiData.getLength(), 'Should return correct length').toEqual(length)
  expect(kanjiData.getBitsLength(), 'Should return correct bit length').toEqual(bitLength)

  let bitBuffer = new BitBuffer()
  kanjiData.write(bitBuffer)
  expect(bitBuffer.buffer, 'Should write correct data to buffer').toStrictEqual(dataBit)

  kanjiData = new KanjiData('abc')
  bitBuffer = new BitBuffer()
  expect(() => {
    kanjiData.write(bitBuffer)
  }, 'Should throw if data is invalid').toThrow()
})
