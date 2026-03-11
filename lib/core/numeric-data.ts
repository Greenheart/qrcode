import * as Mode from './mode.ts'
import BitBuffer from './bit-buffer.ts'

export default class NumericData {
  mode = Mode.NUMERIC
  data: string

  // TODO: Find the data input type
  // Can this be Uint8Array and similar?
  constructor(data: unknown) {
    this.data = data.toString()
  }

  // IDEA: Maybe convert this to a static method?
  // IDEA: Maybe get length from the instance instead?
  static getBitsLength(length: number) {
    return 10 * Math.floor(length / 3) + (length % 3 ? (length % 3) * 3 + 1 : 0)
  }

  // IDEA: This method only makes sense if the NumericData internals are private
  // otherwise, just read the length of the NumericData directly
  getLength() {
    return this.data.length
  }

  // NOTE: Why does this method exist? Why not call getBitsLength directly on the instance?
  getBitsLength() {
    return NumericData.getBitsLength(this.data.length)
  }

  write(bitBuffer: BitBuffer) {
    let i: number, group: string, value: number

    // The input data string is divided into groups of three digits,
    // and each group is converted to its 10-bit binary equivalent.
    for (i = 0; i + 3 <= this.data.length; i += 3) {
      group = this.data.slice(i, i + 3)
      value = parseInt(group, 10)

      bitBuffer.put(value, 10)
    }

    // If the number of input digits is not an exact multiple of three,
    // the final one or two digits are converted to 4 or 7 bits respectively.
    const remainingNum = this.data.length - i
    if (remainingNum > 0) {
      group = this.data.slice(i)
      value = parseInt(group, 10)

      bitBuffer.put(value, remainingNum * 3 + 1)
    }
  }
}
