import type BitBuffer from './bit-buffer.ts'
import * as Mode from './mode.ts'

/**
 * Map of characters available in alphanumeric mode
 *
 * As per QR Code specification, each character is assigned a value
 * from 0 to 44, which in this case coincides with the array index
 *
 * Cached as a Map to get O(1) lookups during runtime compared to
 * O(n) when calling indexOf() repeatedly.
 * Tiny increase in memory usage, but lower CPU usage.
 */
const ALPHA_NUM_CHARS = new Map(([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E',
  'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':',
]).map((char, _i, arr) => [char, arr.indexOf(char)]))

export default class AlphanumericData {
  mode = Mode.ALPHANUMERIC
  data: string

  /**
   * @param data Base 45-encoded string. See https://datatracker.ietf.org/doc/rfc9285/ for more info.
   */
  constructor(data: string) {
    this.data = data
  }

  static getBitsLength(length: number) {
    return 11 * Math.floor(length / 2) + 6 * (length % 2)
  }

  getBitsLength() {
    return AlphanumericData.getBitsLength(this.data.length)
  }

  getLength() {
    return this.data.length
  }

  write(bitBuffer: BitBuffer) {
    let i: number

    // Input data characters are divided into groups of two characters
    // and encoded as 11-bit binary codes.
    for (i = 0; i + 2 <= this.data.length; i += 2) {
      // The character value of the first character is multiplied by 45
      let value = ALPHA_NUM_CHARS.get(this.data[i])! * 45

      // The character value of the second digit is added to the product
      value += ALPHA_NUM_CHARS.get(this.data[i + 1])!

      // The sum is then stored as 11-bit binary number
      bitBuffer.put(value, 11)
    }

    // If the number of input data characters is not a multiple of two,
    // the character value of the final character is encoded as a 6-bit binary number.
    if (this.data.length % 2) {
      bitBuffer.put(ALPHA_NUM_CHARS.get(this.data[i])!, 6)
    }
  }
}
