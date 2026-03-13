import type { QRCodeByteSegment } from '#lib/types.ts'
import type BitBuffer from './bit-buffer.ts'
import * as Mode from './mode.ts'

export default class ByteData {
  mode = Mode.BYTE
  data: Uint8Array

  constructor(data: string | QRCodeByteSegment['data']) {
    if (typeof data === 'string') {
      this.data = new TextEncoder().encode(data)
    } else {
      this.data = new Uint8Array(data)
    }
  }

  static getBitsLength(length: number) {
    return length * 8
  }

  getLength() {
    return this.data.length
  }

  getBitsLength() {
    return ByteData.getBitsLength(this.data.length)
  }

  write(bitBuffer: BitBuffer) {
    for (let i = 0, l = this.data.length; i < l; i++) {
      bitBuffer.put(this.data[i], 8)
    }
  }
}
