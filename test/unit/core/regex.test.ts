import { test, expect } from 'vitest'
import * as Regex from '#core/regex.ts'

test('Regex', () => {
  expect(Regex.NUMERIC, 'Should export a regex for NUMERIC').toBeInstanceOf(RegExp)

  expect(Regex.LETTERS_AND_CHARACTERS, 'Should export a regex for ALPHANUMERIC').toBeInstanceOf(
    RegExp,
  )

  expect(Regex.BYTE, 'Should export a regex for BYTE').toBeInstanceOf(RegExp)

  expect(Regex.KANJI, 'Should export a regex for KANJI').toBeInstanceOf(RegExp)

  expect(Regex.BYTE_KANJI, 'Should export a regex for BYTE_KANJI').toBeInstanceOf(RegExp)
})

test('Regex test', () => {
  expect(Regex.TEST_NUMERIC.test('123456'), 'Should return true if is a number').toEqual(true)
  expect(Regex.TEST_NUMERIC.test('a12345'), 'Should return false if is not a number').toEqual(false)
  expect(Regex.TEST_NUMERIC.test('ABC123'), 'Should return false if is not a number').toEqual(false)

  expect(Regex.TEST_ALPHANUMERIC.test('123ABC'), 'Should return true if is alphanumeric').toEqual(
    true,
  )
  expect(Regex.TEST_ALPHANUMERIC.test('123456'), 'Should return true if is alphanumeric').toEqual(
    true,
  )
  expect(
    Regex.TEST_ALPHANUMERIC.test('ABCabc'),
    'Should return false if is not alphanumeric',
  ).toEqual(false)

  expect(Regex.TEST_KANJI.test('乂ЁЖぞβ'), 'Should return true if is a kanji').toEqual(true)
  expect(Regex.TEST_KANJI.test('皿a晒三A'), 'Should return false if is not a kanji').toEqual(false)
  expect(Regex.TEST_KANJI.test('123456'), 'Should return false if is not a kanji').toEqual(false)
  expect(Regex.TEST_KANJI.test('ABC123'), 'Should return false if is not a kanji').toEqual(false)
  expect(Regex.TEST_KANJI.test('abcdef'), 'Should return false if is not a kanji').toEqual(false)
})
