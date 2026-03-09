import { test, expect } from 'vitest'
import * as Mode from '#core/mode.ts'

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

  // TODO: See if v can be declared locally for each loop?
  let v
  for (v = 1; v < 10; v++) {
    expect(Mode.getCharCountIndicator(Mode.NUMERIC, v)).toEqual(EXPECTED_BITS.numeric[0])
    expect(Mode.getCharCountIndicator(Mode.ALPHANUMERIC, v)).toEqual(EXPECTED_BITS.alphanumeric[0])
    expect(Mode.getCharCountIndicator(Mode.BYTE, v)).toEqual(EXPECTED_BITS.byte[0])
    expect(Mode.getCharCountIndicator(Mode.KANJI, v)).toEqual(EXPECTED_BITS.kanji[0])
  }

  for (v = 10; v < 27; v++) {
    expect(Mode.getCharCountIndicator(Mode.NUMERIC, v)).toEqual(EXPECTED_BITS.numeric[1])
    expect(Mode.getCharCountIndicator(Mode.ALPHANUMERIC, v)).toEqual(EXPECTED_BITS.alphanumeric[1])
    expect(Mode.getCharCountIndicator(Mode.BYTE, v)).toEqual(EXPECTED_BITS.byte[1])
    expect(Mode.getCharCountIndicator(Mode.KANJI, v)).toEqual(EXPECTED_BITS.kanji[1])
  }

  for (v = 27; v <= 40; v++) {
    expect(Mode.getCharCountIndicator(Mode.NUMERIC, v)).toEqual(EXPECTED_BITS.numeric[2])
    expect(Mode.getCharCountIndicator(Mode.ALPHANUMERIC, v)).toEqual(EXPECTED_BITS.alphanumeric[2])
    expect(Mode.getCharCountIndicator(Mode.BYTE, v)).toEqual(EXPECTED_BITS.byte[2])
    expect(Mode.getCharCountIndicator(Mode.KANJI, v)).toEqual(EXPECTED_BITS.kanji[2])
  }

  expect(() => {
    Mode.getCharCountIndicator({}, 1)
  }, 'Should throw if mode is invalid').toThrow()

  expect(() => {
    Mode.getCharCountIndicator(Mode.BYTE, 0)
  }, 'Should throw if version is invalid').toThrow()
})

test('Best mode', () => {
  /* eslint-disable quote-props */
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

  Object.keys(EXPECTED_MODE).forEach(function (data) {
    expect(
      Mode.getBestModeForData(data),
      'Should return mode ' + Mode.toString(EXPECTED_MODE[data]) + ' for data: ' + data,
    ).toEqual(EXPECTED_MODE[data])
  })
})

test('Is valid', () => {
  expect(Mode.isValid(Mode.NUMERIC)).toEqual(true)
  expect(Mode.isValid(Mode.ALPHANUMERIC)).toEqual(true)
  expect(Mode.isValid(Mode.BYTE)).toEqual(true)
  expect(Mode.isValid(Mode.KANJI)).toEqual(true)

  expect(Mode.isValid(undefined)).toEqual(false)
  expect(Mode.isValid({ bit: 1 })).toEqual(false)
  expect(Mode.isValid({ ccBits: [] })).toEqual(false)
})

test('From value', () => {
  const modes = [
    { name: 'numeric', mode: Mode.NUMERIC },
    { name: 'alphanumeric', mode: Mode.ALPHANUMERIC },
    { name: 'kanji', mode: Mode.KANJI },
    { name: 'byte', mode: Mode.BYTE },
  ]

  for (let m = 0; m < modes.length; m++) {
    // TODO: Fix type for method - or even better, parse the input and return a distinct type. default value might be handled separately
    expect(Mode.from(modes[m].name)).toEqual(modes[m].mode)
    expect(Mode.from(modes[m].name.toUpperCase())).toEqual(modes[m].mode)
    expect(Mode.from(modes[m].mode)).toEqual(modes[m].mode)
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
    Mode.toString({})
  }, 'Should throw if mode is invalid').toThrow()
})
