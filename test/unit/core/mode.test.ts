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
      'Should return mode ' + expectedMode.id + ' for data: ' + data,
    ).toEqual(expectedMode)
  }
})

test('Parse mode from existing mode', () => {
  // Should parse valid modes
  expect(Mode.parse(Mode.NUMERIC)).toEqual(Mode.NUMERIC)
  expect(Mode.parse(Mode.ALPHANUMERIC)).toEqual(Mode.ALPHANUMERIC)
  expect(Mode.parse(Mode.BYTE)).toEqual(Mode.BYTE)
  expect(Mode.parse(Mode.KANJI)).toEqual(Mode.KANJI)

  // Should return undefined for invalid input
  expect(Mode.parse(undefined)).toEqual(undefined)
  expect(Mode.parse({ bit: 1 })).toEqual(undefined)
  expect(Mode.parse({ ccBits: [] })).toEqual(undefined)
})

test('Parse mode from string', () => {
  const modes = [
    { id: 'numeric', mode: Mode.NUMERIC },
    { id: 'alphanumeric', mode: Mode.ALPHANUMERIC },
    { id: 'kanji', mode: Mode.KANJI },
    { id: 'byte', mode: Mode.BYTE },
  ]

  for (const { id, mode } of modes) {
    expect(Mode.parse(id), 'Should parse from mode id').toEqual(mode)
    expect(Mode.parse(id.toUpperCase()), 'Should handle uppercase').toEqual(mode)
  }

  expect(Mode.parse(''), 'Should return undefined if mode is invalid').toEqual(undefined)
  expect(Mode.parse('custom'), 'Should return undefined if mode is invalid').toEqual(undefined)
  expect(Mode.parse(undefined), 'Should return undefined if mode is undefined').toEqual(undefined)
})
