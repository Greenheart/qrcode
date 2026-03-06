import { test, expect } from 'vitest'
import * as Regex from '#core/regex.js'

test('Regex', () => {
  expect(Regex.NUMERIC, 'Should export a regex for NUMERIC').toBeInstanceOf(RegExp)

  expect(Regex.ALPHANUMERIC, 'Should export a regex for ALPHANUMERIC').toBeInstanceOf(RegExp)

  expect(Regex.BYTE, 'Should export a regex for BYTE').toBeInstanceOf(RegExp)

  expect(Regex.KANJI, 'Should export a regex for KANJI').toBeInstanceOf(RegExp)

  expect(Regex.BYTE_KANJI, 'Should export a regex for BYTE_KANJI').toBeInstanceOf(RegExp)
})

test('Regex test', () => {
  expect(Regex.testNumeric('123456'), 'Should return true if is a number').toEqual(true)
  expect(Regex.testNumeric('a12345'), 'Should return false if is not a number').toEqual(false)
  expect(Regex.testNumeric('ABC123'), 'Should return false if is not a number').toEqual(false)

  expect(Regex.testAlphanumeric('123ABC'), 'Should return true if is alphanumeric').toEqual(true)
  expect(Regex.testAlphanumeric('123456'), 'Should return true if is alphanumeric').toEqual(true)
  expect(Regex.testAlphanumeric('ABCabc'), 'Should return false if is not alphanumeric').toEqual(
    false,
  )

  expect(Regex.testKanji('乂ЁЖぞβ'), 'Should return true if is a kanji').toEqual(true)
  expect(Regex.testKanji('皿a晒三A'), 'Should return false if is not a kanji').toEqual(false)
  expect(Regex.testKanji('123456'), 'Should return false if is not a kanji').toEqual(false)
  expect(Regex.testKanji('ABC123'), 'Should return false if is not a kanji').toEqual(false)
  expect(Regex.testKanji('abcdef'), 'Should return false if is not a kanji').toEqual(false)
})
