type Bit = 1 | 0

/**
 * Helper class to handle QR Code symbol modules
 */
export default class BitMatrix {
  // TODO: See if these fields could be made private only or if they need to be publicly accessible

  /** Symbol size */
  size: number
  data: Uint8Array
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
  set(row: number, col: number, value: Bit, reserved: boolean = false) {
    const index = row * this.size + col
    this.data[index] = +value
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
  xor(row: number, col: number, value: Bit | boolean) {
    this.data[row * this.size + col] ^= +value
  }

  /**
   * Check if bit at specified location is reserved
   */
  isReserved(row: number, col: number): boolean {
    return Boolean(this.reservedBit[row * this.size + col])
  }
}
