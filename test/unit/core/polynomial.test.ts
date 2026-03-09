import { test, expect } from 'vitest'
import * as Poly from '#core/polynomial.ts'

test('Generator polynomial', () => {
  const result = Poly.generateECPolynomial(0)
  expect(result, 'Should return an Uint8Array').toBeInstanceOf(Uint8Array)
  expect(result, 'Should return coeff [1] for polynomial of degree 0').toStrictEqual(
    new Uint8Array([1]),
  )

  for (let e = 2; e <= 68; e++) {
    expect(
      Poly.generateECPolynomial(e).length,
      'Should return a number of coefficients equal to (degree + 1)',
    ).toEqual(e + 1)
  }
})

test('Polynomial', () => {
  const p1 = new Uint8Array([0, 1, 2, 3, 4])
  const p2 = new Uint8Array([5, 6])

  let result = Poly.mul(p1, p2)
  expect(result, 'Should return an Uint8Array').toBeInstanceOf(Uint8Array)
  expect(result.length, 'Should return correct number of coefficients').toEqual(6)

  result = Poly.mod(p1, Poly.generateECPolynomial(2))
  expect(result, 'Should return an Uint8Array').toBeInstanceOf(Uint8Array)
  expect(result.length, 'Should return correct number of coefficients').toEqual(2)
})
