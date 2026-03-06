import { test, expect } from 'vitest'
import RS from '#core/reed-solomon-encoder.js'

test('Reed-Solomon encoder', () => {
  let enc = new RS()

  expect(enc.genPoly, 'Should have an undefined generator polynomial').toBeUndefined()
  expect(() => {
    enc.encode([])
  }, 'Should throw if generator polynomial is undefined').toThrow()

  enc.initialize(2)
  expect(enc.degree, 'Should set correct degree value').toEqual(2)
  expect(enc.genPoly, 'Generator polynomial should be defined').toBeInstanceOf(Uint8Array)

  const result = enc.encode(new Uint8Array([48, 49, 50, 51, 52]))
  expect(result.length, 'Should return a number of codewords equal to gen poly degree').toEqual(2)

  enc = new RS(2)
  const genPoly = enc.genPoly
  expect(enc.degree, 'Should set correct degree value').toEqual(2)
  expect(genPoly, 'Generator polynomial should be defined').toBeInstanceOf(Uint8Array)

  enc.initialize(3)
  expect(enc.genPoly, 'Should reinitialize the generator polynomial').not.toStrictEqual(genPoly)

  enc = new RS(0)
  expect(enc.genPoly, 'Should not create a generator polynomial if degree is 0').toBeUndefined()

  enc = new RS(1)
  expect(enc.encode(new Uint8Array([0])), 'Should return correct buffer').toStrictEqual(
    new Uint8Array([0]),
  )
})
