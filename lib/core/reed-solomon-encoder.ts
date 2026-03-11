import * as Polynomial from './polynomial.ts'

export default class ReedSolomonEncoder {
  genPoly: Uint8Array<ArrayBuffer> | undefined
  degree: number

  /**
   * Initialize a new encoder.
   * @param degree The number of error correction codewords.
   */
  constructor(degree: number) {
    if (!degree || degree < 1) throw new Error('Degree must be >= 1')

    this.degree = degree
    // Create an irreducible generator polynomial
    this.genPoly = Polynomial.generateECPolynomial(degree)
  }

  /**
   * Encodes a chunk of data
   *
   * @param  {Uint8Array} data Buffer containing input data
   * @return {Uint8Array}      Buffer containing encoded data
   */
  encode(data: Uint8Array): Uint8Array {
    if (!this.genPoly) {
      throw new Error('Encoder not initialized')
    }

    // Calculate EC for this data block
    // extends data size to data+genPoly size
    const paddedData = new Uint8Array(data.length + this.degree)
    paddedData.set(data)

    // The error correction codewords are the remainder after dividing the data codewords
    // by a generator polynomial
    const remainder = Polynomial.mod(paddedData, this.genPoly)

    // return EC data blocks (last n byte, where n is the degree of genPoly)
    // If coefficients number in remainder are less than genPoly degree,
    // pad with 0s to the left to reach the needed number of coefficients
    const start = this.degree - remainder.length
    if (start > 0) {
      const buff = new Uint8Array(this.degree)
      buff.set(remainder, start)

      return buff
    }

    return remainder
  }
}
