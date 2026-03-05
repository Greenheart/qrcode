import { test, expect } from 'vitest'

import toSJIS from '#helper/to-sjis.js'

test('SJIS from char', () => {
  expect(toSJIS(''), 'Should return undefined if character is invalid').toEqual(undefined)

  expect(toSJIS('A'), 'Should return undefined if character is not a kanji').toEqual(undefined)

  expect(toSJIS('襦'), 'Should return correct SJIS value').toEqual(0xe640)

  expect(toSJIS('￢'), 'Should return correct SJIS value').toEqual(0x81ca)

  expect(toSJIS('≧'), 'Should return correct SJIS value').toEqual(0x8186)

  expect(toSJIS('⊥'), 'Should return correct SJIS value').toEqual(0x81db)

  expect(toSJIS('愛'), 'Should return correct SJIS value').toEqual(0x88a4)

  expect(toSJIS('衣'), 'Should return correct SJIS value').toEqual(0x88df)

  expect(toSJIS('蔭'), 'Should return correct SJIS value').toEqual(0x88fc)
})
