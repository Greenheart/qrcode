import { test, expect } from 'vitest'
import RS from '#core/reed-solomon-encoder.ts'

test('Reed-Solomon encoder', () => {
  let enc = new RS(2)

  expect(enc.degree, 'Should set correct degree value').toEqual(2)
  expect(enc.genPoly, 'Generator polynomial should be defined').toBeInstanceOf(Uint8Array)

  const result = enc.encode(new Uint8Array([48, 49, 50, 51, 52]))
  expect(result.length, 'Should return a number of codewords equal to gen poly degree').toEqual(2)

  enc = new RS(2)
  const genPoly = enc.genPoly
  expect(enc.degree, 'Should set correct degree value').toEqual(2)
  expect(genPoly, 'Generator polynomial should be defined').toBeInstanceOf(Uint8Array)

  expect(() => new RS(0), 'Should not create a generator polynomial if degree is 0').toThrow()
  expect(() => new RS(-1), 'Should not create a generator polynomial if degree is < 0').toThrow()

  enc = new RS(1)
  expect(enc.encode(new Uint8Array([0])), 'Should return correct buffer').toStrictEqual(
    new Uint8Array([0]),
  )
})
