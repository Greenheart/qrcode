import type { Bit } from '#lib/types.ts'

/**
 * Helper class to handle QR Code symbol modules
 */
export default class BitMatrix {
  /** Symbol size */
  size: number
  /** The actual symbol data */
  data: Uint8Array
  /** Reserved bits are used to indicate which bits should be ignored during the masking process */
  reservedBit: Uint8Array

  constructor(size: number) {
    if (!size || size < 1) {
      throw new Error('BitMatrix size must be defined and greater than 0')
    }

    this.size = size
    this.data = new Uint8Array(size * size)
    this.reservedBit = new Uint8Array(size * size)
  }

  /**
   * Set bit value at specified location
   * If reserved flag is set, this bit will be ignored during masking process.
   */
  set(row: number, col: number, value: Bit, reserved = false) {
    const index = row * this.size + col
    this.data[index] = value
    if (reserved) this.reservedBit[index] = 1
  }

  /**
   * @return Bit value at specified location.
   */
  get(row: number, col: number): Bit {
    return this.data[row * this.size + col] as Bit
  }

  /**
   * Applies xor operator at specified location (used during masking process)
   */
  xor(row: number, col: number, value: Bit) {
    this.data[row * this.size + col] ^= value
  }

  /**
   * Check if bit at specified location is reserved
   */
  isReserved(row: number, col: number): boolean {
    return Boolean(this.reservedBit[row * this.size + col])
  }
}
