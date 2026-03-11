import * as GF from './galois-field.ts'
/**
 * Multiplies two polynomials inside Galois Field
 *
 * @param p1 Polynomial
 * @param p2 Polynomial
 * @return Product of p1 and p2
 */
export function mul(p1: Uint8Array, p2: Uint8Array) {
  const coeff = new Uint8Array(p1.length + p2.length - 1)

  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      coeff[i + j] ^= GF.mul(p1[i], p2[j])
    }
  }

  return coeff
}

/**
 * Calculate the remainder of polynomials division
 *
 * @param divident Polynomial
 * @param divisor Polynomial
 * @return Remainder
 */
export function mod(divident: Uint8Array, divisor: Uint8Array) {
  let result = new Uint8Array(divident)

  while (result.length - divisor.length >= 0) {
    const coeff = result[0]

    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= GF.mul(divisor[i], coeff)
    }

    // remove all zeros from buffer head
    let offset = 0
    while (offset < result.length && result[offset] === 0) offset++
    result = result.slice(offset)
  }

  return result
}

/**
 * Generate an irreducible generator polynomial of specified degree
 * (used by Reed-Solomon encoder)
 *
 * @param degree Degree of the generator polynomial
 * @return Uint8Array containing polynomial coefficients
 */
export function generateECPolynomial(degree: number) {
  let poly = new Uint8Array([1])
  for (let i = 0; i < degree; i++) {
    poly = mul(poly, new Uint8Array([1, GF.exp(i)]))
  }

  return poly
}
