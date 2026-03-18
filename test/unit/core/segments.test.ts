import { test, expect } from 'vitest'
import * as Mode from '#core/mode.ts'
import * as Segments from '#core/segments.ts'
import type { RawSegment } from '#core/segments.ts'
import NumericData from '#core/numeric-data.ts'
import AlphanumericData from '#core/alphanumeric-data.ts'
import ByteData from '#core/byte-data.ts'
import toSJIS from '#helper/to-sjis.ts'
import * as Utils from '#core/utils.js'

let testData: { input: string; result: RawSegment[] }[] = [
  {
    input: '1A1',
    result: [{ data: '1A1', mode: Mode.ALPHANUMERIC, length: 3 }],
  },
  {
    input: 'a-1-b-2?',
    result: [{ data: 'a-1-b-2?', mode: Mode.BYTE, length: 8 }],
  },
  {
    input: 'AB123456CDF',
    result: [{ data: 'AB123456CDF', mode: Mode.ALPHANUMERIC, length: 11 }],
  },
  {
    input: 'aABC000000-?-----a',
    result: [
      { data: 'aABC', mode: Mode.BYTE, length: 4 },
      { data: '000000', mode: Mode.NUMERIC, length: 6 },
      { data: '-?-----a', mode: Mode.BYTE, length: 8 },
    ],
  },
  {
    input: 'aABC000000A?',
    result: [
      { data: 'aABC', mode: Mode.BYTE, length: 4 },
      { data: '000000', mode: Mode.NUMERIC, length: 6 },
      { data: 'A?', mode: Mode.BYTE, length: 2 },
    ],
  },
  {
    input: 'a1234ABCDEF?',
    result: [
      { data: 'a', mode: Mode.BYTE, length: 1 },
      { data: '1234ABCDEF', mode: Mode.ALPHANUMERIC, length: 10 },
      { data: '?', mode: Mode.BYTE, length: 1 },
    ],
  },
  {
    input: '12345A12345',
    result: [{ data: '12345A12345', mode: Mode.ALPHANUMERIC, length: 11 }],
  },
  {
    input: 'aABCDEFGHILMNa',
    result: [
      { data: 'a', mode: Mode.BYTE, length: 1 },
      { data: 'ABCDEFGHILMN', mode: Mode.ALPHANUMERIC, length: 12 },
      { data: 'a', mode: Mode.BYTE, length: 1 },
    ],
  },
  {
    input: 'Aa12345',
    result: [
      { data: 'Aa', mode: Mode.BYTE, length: 2 },
      { data: '12345', mode: Mode.NUMERIC, length: 5 },
    ],
  },
  {
    input: 'a1A2B3C4D5E6F4G7',
    result: [
      { data: 'a', mode: Mode.BYTE, length: 1 },
      { data: '1A2B3C4D5E6F4G7', mode: Mode.ALPHANUMERIC, length: 15 },
    ],
  },
  {
    input: '123456789QWERTYUIOPASD',
    result: [
      { data: '123456789', mode: Mode.NUMERIC, length: 9 },
      { data: 'QWERTYUIOPASD', mode: Mode.ALPHANUMERIC, length: 13 },
    ],
  },
  {
    input: 'QWERTYUIOPASD123456789',
    result: [
      { data: 'QWERTYUIOPASD', mode: Mode.ALPHANUMERIC, length: 13 },
      { data: '123456789', mode: Mode.NUMERIC, length: 9 },
    ],
  },
  {
    input: 'ABCDEF123456a',
    result: [
      { data: 'ABCDEF123456', mode: Mode.ALPHANUMERIC, length: 12 },
      { data: 'a', mode: Mode.BYTE, length: 1 },
    ],
  },
  {
    input: 'abcdefABCDEF',
    result: [
      { data: 'abcdef', mode: Mode.BYTE, length: 6 },
      { data: 'ABCDEF', mode: Mode.ALPHANUMERIC, length: 6 },
    ],
  },
  {
    input: 'a123456ABCDEa',
    result: [
      { data: 'a', mode: Mode.BYTE, length: 1 },
      { data: '123456ABCDE', mode: Mode.ALPHANUMERIC, length: 11 },
      { data: 'a', mode: Mode.BYTE, length: 1 },
    ],
  },
  {
    input: 'AAAAA12345678?A1A',
    result: [
      { data: 'AAAAA', mode: Mode.ALPHANUMERIC, length: 5 },
      { data: '12345678', mode: Mode.NUMERIC, length: 8 },
      { data: '?A1A', mode: Mode.BYTE, length: 4 },
    ],
  },
  {
    input: 'Aaa',
    result: [{ data: 'Aaa', mode: Mode.BYTE, length: 3 }],
  },
  {
    input: 'Aa12345A',
    result: [
      { data: 'Aa', mode: Mode.BYTE, length: 2 },
      { data: '12345A', mode: Mode.ALPHANUMERIC, length: 6 },
    ],
  },
  {
    input: 'ABC\nDEF',
    result: [{ data: 'ABC\nDEF', mode: Mode.BYTE, length: 7 }],
  },
]

const kanjiTestData: { input: string; result: RawSegment[] }[] = [
  {
    input: '乂ЁЖぞβ',
    result: [{ data: '乂ЁЖぞβ', mode: Mode.KANJI, length: 5 }],
  },
  {
    input: 'ΑΒΓψωЮЯабв',
    result: [{ data: 'ΑΒΓψωЮЯабв', mode: Mode.KANJI, length: 10 }],
  },
  {
    input: '皿a晒三',
    result: [
      { data: '皿a', mode: Mode.BYTE, length: 2 },
      { data: '晒三', mode: Mode.KANJI, length: 2 },
    ],
  },
  {
    input: '皿a\n晒三',
    result: [
      { data: '皿a\n', mode: Mode.BYTE, length: 4 },
      { data: '晒三', mode: Mode.KANJI, length: 2 },
    ],
  },
]

testData = [...testData, ...kanjiTestData]

test('Segments from array', () => {
  expect(
    Segments.fromArray(['abcdef', '12345']),
    'Should return correct segment from array of strings',
  ).toStrictEqual([new ByteData('abcdef'), new NumericData('12345')])

  expect(
    Segments.fromArray([
      { data: 'abcdef', mode: Mode.BYTE, length: 6 },
      { data: '12345', mode: Mode.NUMERIC, length: 5 },
    ]),
    'Should return correct segment from array of objects',
  ).toStrictEqual([new ByteData('abcdef'), new NumericData('12345')])

  expect(
    Segments.fromArray([
      { data: new TextEncoder().encode('abcdef'), mode: 'byte' },
      { data: '12345', mode: 'numeric' },
    ]),
    'Should return correct segment from array of objects if mode is specified as string',
  ).toStrictEqual([new ByteData('abcdef'), new NumericData('12345')])

  expect(
    Segments.fromArray([{ data: 'abcdef' }, { data: '12345' }]),
    'Should return correct segment from array of objects if mode is not specified',
  ).toStrictEqual([new ByteData('abcdef'), new NumericData('12345')])

  // @ts-expect-error Testing empty input
  expect(Segments.fromArray([{}]), 'Should return an empty array').toStrictEqual([])

  expect(() => {
    Segments.fromArray([{ data: 'ABCDE', mode: 'numeric' }])
  }, 'Should throw if segment cannot be encoded with specified mode').toThrow()

  expect(
    Segments.fromArray([{ data: '０１２３', mode: Mode.KANJI, length: 4 }]),
    'Should use Byte mode if kanji support is disabled',
  ).toStrictEqual([new ByteData('０１２３')])
})

test('Segments optimization', () => {
  expect(
    Segments.fromString('乂ЁЖ', 1),
    'Should use Byte mode if Kanji support is disabled',
  ).toStrictEqual(Segments.fromArray([{ data: new TextEncoder().encode('乂ЁЖ'), mode: 'byte' }]))

  Utils.setToSJISFunction(toSJIS)
  testData.forEach((data) => {
    expect(Segments.fromString(data.input, 1)).toStrictEqual(Segments.fromArray(data.result))
  })
})

test('Segments raw split', () => {
  const splitted = [new ByteData('abc'), new AlphanumericData('DEF'), new NumericData('123')]

  expect(Segments.rawSplit('abcDEF123')).toStrictEqual(splitted)
})
