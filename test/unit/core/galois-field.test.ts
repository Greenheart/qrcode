import * as GF from '#core/galois-field.ts'
import { expect, test } from 'vitest'

test('Galois Field', () => {
  expect(() => {
    GF.log(0)
  }, 'Should throw for log(n) with n < 1').toThrow()

  for (let i = 1; i < 255; i++) {
    expect(GF.log(GF.exp(i)), 'log and exp should be one the inverse of the other').toEqual(i)
    expect(GF.exp(GF.log(i)), 'exp and log should be one the inverse of the other').toEqual(i)
  }

  expect(GF.mul(0, 1), 'Should return 0 if first param is 0').toEqual(0)
  expect(GF.mul(1, 0), 'Should return 0 if second param is 0').toEqual(0)
  expect(GF.mul(0, 0), 'Should return 0 if both params are 0').toEqual(0)

  for (let j = 1; j < 255; j++) {
    expect(GF.mul(j, 255 - j), 'Multiplication should be commutative').toEqual(GF.mul(255 - j, j))
  }
})
