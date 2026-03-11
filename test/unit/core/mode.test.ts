import { test, expect } from 'vitest'
import * as Mode from '#core/mode.ts'
import { getQRVersionRange } from '#test/helpers.ts'

test('Mode bits', () => {
  const EXPECTED_BITS = {
    numeric: 1,
    alphanumeric: 2,
    byte: 4,
    kanji: 8,
    mixed: -1,
  }

  expect(Mode.NUMERIC.bit).toEqual(EXPECTED_BITS.numeric)
  expect(Mode.ALPHANUMERIC.bit).toEqual(EXPECTED_BITS.alphanumeric)
  expect(Mode.BYTE.bit).toEqual(EXPECTED_BITS.byte)
  expect(Mode.KANJI.bit).toEqual(EXPECTED_BITS.kanji)
  expect(Mode.MIXED.bit).toEqual(EXPECTED_BITS.mixed)
})

test('Char count bits', () => {
  const EXPECTED_BITS = {
    numeric: [10, 12, 14],
    alphanumeric: [9, 11, 13],
    byte: [8, 16, 16],
    kanji: [8, 10, 12],
  }

  // Depending on the QR code version, different bits are used for the char count

  for (const v of getQRVersionRange(1, 9)) {
    expect(Mode.getCharCountIndicator(Mode.NUMERIC, v)).toEqual(EXPECTED_BITS.numeric[0])
    expect(Mode.getCharCountIndicator(Mode.ALPHANUMERIC, v)).toEqual(EXPECTED_BITS.alphanumeric[0])
    expect(Mode.getCharCountIndicator(Mode.BYTE, v)).toEqual(EXPECTED_BITS.byte[0])
    expect(Mode.getCharCountIndicator(Mode.KANJI, v)).toEqual(EXPECTED_BITS.kanji[0])
  }

  for (const v of getQRVersionRange(10, 26)) {
    expect(Mode.getCharCountIndicator(Mode.NUMERIC, v)).toEqual(EXPECTED_BITS.numeric[1])
    expect(Mode.getCharCountIndicator(Mode.ALPHANUMERIC, v)).toEqual(EXPECTED_BITS.alphanumeric[1])
    expect(Mode.getCharCountIndicator(Mode.BYTE, v)).toEqual(EXPECTED_BITS.byte[1])
    expect(Mode.getCharCountIndicator(Mode.KANJI, v)).toEqual(EXPECTED_BITS.kanji[1])
  }

  for (const v of getQRVersionRange(27, 40)) {
    expect(Mode.getCharCountIndicator(Mode.NUMERIC, v)).toEqual(EXPECTED_BITS.numeric[2])
    expect(Mode.getCharCountIndicator(Mode.ALPHANUMERIC, v)).toEqual(EXPECTED_BITS.alphanumeric[2])
    expect(Mode.getCharCountIndicator(Mode.BYTE, v)).toEqual(EXPECTED_BITS.byte[2])
    expect(Mode.getCharCountIndicator(Mode.KANJI, v)).toEqual(EXPECTED_BITS.kanji[2])
  }

  expect(() => {
    // NOTE: Ideally we should ensure the mode is valid closer to the
    // public API surface and use strict types to enforce internal usage.
    // Then we could stop throwing errors in getCharCountIndicator()
    // @ts-expect-error Testing invalid mode
    Mode.getCharCountIndicator({}, 1)
  }, 'Should throw if mode is invalid').toThrow()
})

test(Mode.getBestModeForData.name, () => {
  const EXPECTED_MODE = {
    12345: Mode.NUMERIC,
    abcde: Mode.BYTE,
    '1234a': Mode.BYTE,
    ABCDa: Mode.BYTE,
    ABCDE: Mode.ALPHANUMERIC,
    '12ABC': Mode.ALPHANUMERIC,
    乂ЁЖぞβ: Mode.KANJI,
    ΑΒΓψωЮЯабв: Mode.KANJI,
    皿a晒三: Mode.BYTE,
  }

  for (const [data, expectedMode] of Object.entries(EXPECTED_MODE)) {
    expect(
      Mode.getBestModeForData(data),
      'Should return mode ' + Mode.toString(expectedMode) + ' for data: ' + data,
    ).toEqual(expectedMode)
  }
})

// TODO: Refactor so we parse the mode and remove the need for isValid
// TODO: Move these tests to cover Mode.parse instead
test('Is valid', () => {
  expect(Mode.isValid(Mode.NUMERIC)).toEqual(true)
  expect(Mode.isValid(Mode.ALPHANUMERIC)).toEqual(true)
  expect(Mode.isValid(Mode.BYTE)).toEqual(true)
  expect(Mode.isValid(Mode.KANJI)).toEqual(true)

  expect(Mode.isValid(undefined)).toEqual(false)
  expect(Mode.isValid({ bit: 1 })).toEqual(false)
  expect(Mode.isValid({ ccBits: [] })).toEqual(false)
})

// TODO: Refactor so we parse the mode and remove the need for isValid
// TODO: Move these tests to cover Mode.parse instead
test('From value', () => {
  const modes = [
    { name: 'numeric', mode: Mode.NUMERIC },
    { name: 'alphanumeric', mode: Mode.ALPHANUMERIC },
    { name: 'kanji', mode: Mode.KANJI },
    { name: 'byte', mode: Mode.BYTE },
  ]

  for (const { name, mode } of modes) {
    // TODO: Fix type for method - or even better, parse the input and return a distinct type. default value might be handled separately
    expect(Mode.from(name)).toEqual(mode)
    expect(Mode.from(name.toUpperCase())).toEqual(mode)
    expect(Mode.from(mode)).toEqual(mode)
  }

  expect(Mode.from('', Mode.NUMERIC), 'Should return default value if mode is invalid').toEqual(
    Mode.NUMERIC,
  )

  expect(
    Mode.from(null, Mode.NUMERIC),

    'Should return default value if mode undefined',
  ).toEqual(Mode.NUMERIC)
})

test('To string', () => {
  expect(Mode.toString(Mode.NUMERIC)).toEqual('Numeric')
  expect(Mode.toString(Mode.ALPHANUMERIC)).toEqual('Alphanumeric')
  expect(Mode.toString(Mode.BYTE)).toEqual('Byte')
  expect(Mode.toString(Mode.KANJI)).toEqual('Kanji')

  expect(() => {
    // @ts-expect-error Testing invalid input
    Mode.toString({})
  }, 'Should throw if mode is invalid').toThrow()
})
