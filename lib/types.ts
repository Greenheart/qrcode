import type BitMatrix from './core/bit-matrix.ts'

export type QRCodeErrorCorrectionLevel =
  | 'low'
  | 'medium'
  | 'quartile'
  | 'high'
  | 'L'
  | 'M'
  | 'Q'
  | 'H'
export type QRCodeMaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type QRCodeToSJISFunc = (codePoint: string) => number
/** QR Code version (1-40) */
export type QRVersion =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40

export type Bit = 1 | 0

export interface QRCodeOptions {
  /**
   * QR Code version. If not specified the most suitable value will be calculated.
   */
  version?: QRVersion | undefined
  /**
   * Error correction level.
   * @default 'M'
   */
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel | undefined
  /**
   * Mask pattern used to mask the symbol.
   *
   * If not specified the most suitable value will be calculated.
   */
  maskPattern?: QRCodeMaskPattern | undefined
  /**
   * Helper function used internally to convert a kanji to its Shift JIS value.
   * Provide this function if you need support for Kanji mode.
   */
  toSJISFunc?: QRCodeToSJISFunc | undefined
}

export type QRCodeDataURLType = 'image/png' | 'image/jpeg' | 'image/webp'
export type QRCodeToDataURLOptions = QRCodeToDataURLOptionsJpegWebp | QRCodeToDataURLOptionsOther
export interface QRCodeToDataURLOptionsJpegWebp extends QRCodeRenderersOptions {
  /**
   * Data URI format.
   * @default 'image/png'
   */
  type: 'image/jpeg' | 'image/webp'
  rendererOpts?:
    | {
        /**
         * A number between `0` and `1` indicating image quality.
         * @default 0.92
         */
        quality?: number | undefined
      }
    | undefined
}
export interface QRCodeToDataURLOptionsOther extends QRCodeRenderersOptions {
  /**
   * Data URI format.
   * @default 'image/png'
   */
  type?: Exclude<QRCodeDataURLType, 'image/jpeg' | 'image/webp'> | undefined
}

export type QRCodeStringType = 'utf8' | 'svg' | 'terminal'
export type QRCodeToStringOptions = QRCodeToStringOptionsTerminal | QRCodeToStringOptionsOther
export interface QRCodeToStringOptionsTerminal extends QRCodeRenderersOptions {
  /**
   * Output format.
   * @default 'utf8'
   */
  type: 'terminal'
  /**
   * Outputs smaller QR code.
   * @default false
   */
  small?: boolean | undefined
}
export interface QRCodeToStringOptionsOther extends QRCodeRenderersOptions {
  /**
   * Output format.
   * @default 'utf8'
   */
  type?: Exclude<QRCodeStringType, 'terminal'> | undefined
}

export type QRCodeFileType = 'png' | 'svg' | 'utf8'
export type QRCodeToFileOptions = QRCodeToFileOptionsPng | QRCodeToFileOptionsOther
export interface QRCodeToFileOptionsPng extends QRCodeRenderersOptions {
  /**
   * Output format.
   * @default 'png'
   */
  type?: 'png' | undefined
  rendererOpts?:
    | {
        /**
         * Compression level for deflate.
         * @default 9
         */
        deflateLevel?: number | undefined
        /**
         * Compression strategy for deflate.
         * @default 3
         */
        deflateStrategy?: number | undefined
      }
    | undefined
}
export interface QRCodeToFileOptionsOther extends QRCodeRenderersOptions {
  /**
   * Output format.
   * @default 'png'
   */
  type: Exclude<QRCodeFileType, 'png'> | undefined
}

export type QRCodeFileStreamType = 'png'
export interface QRCodeToFileStreamOptions extends QRCodeRenderersOptions {
  /**
   * Output format. Only png supported for file stream.
   */
  type?: QRCodeFileStreamType | undefined
  rendererOpts?:
    | {
        /**
         * Compression level for deflate.
         * @default 9
         */
        deflateLevel?: number | undefined
        /**
         * Compression strategy for deflate.
         * @default 3
         */
        deflateStrategy?: number | undefined
      }
    | undefined
}

export type QRCodeBufferType = 'png'
export interface QRCodeToBufferOptions extends QRCodeRenderersOptions {
  /**
   * Output format. Only png supported for Buffer.
   */
  type?: QRCodeBufferType | undefined
  rendererOpts?:
    | {
        /**
         * Compression level for deflate.
         * @default 9
         */
        deflateLevel?: number | undefined
        /**
         * Compression strategy for deflate.
         * @default 3
         */
        deflateStrategy?: number | undefined
      }
    | undefined
}

export interface QRCodeRenderersOptions extends QRCodeOptions {
  /**
   * Define how much wide the quiet zone should be.
   * @default 4
   */
  margin?: number | undefined
  /**
   * Scale factor. A value of `1` means 1px per modules (black dots).
   * @default 4
   */
  scale?: number | undefined
  /**
   * Forces a specific width for the output image.
   * If width is too small to contain the qr symbol, this option will be ignored.
   * Takes precedence over `scale`.
   */
  width?: number | undefined
  color?:
    | {
        /**
         * Color of dark module. Value must be in hex format (RGBA).
         * Note: dark color should always be darker than `color.light`.
         * @default '#000000ff'
         */
        dark?: string | undefined
        /**
         * Color of light module. Value must be in hex format (RGBA).
         * @default '#ffffffff'
         */
        light?: string | undefined
      }
    | undefined
}

export type QRCodeSegmentMode = 'alphanumeric' | 'numeric' | 'byte' | 'kanji'

/**
 * Input QR code segments.
 */
export type QRCodeSegment =
  | QRCodeNumericSegment
  | QRCodeAlphanumericSegment
  | QRCodeByteSegment
  | QRCodeKanjiSegment
  | {
      mode?: never
      data: string | Buffer | Uint8ClampedArray | Uint8Array
    }

export interface QRCodeNumericSegment {
  mode: 'numeric'
  data: string | number
}

export interface QRCodeAlphanumericSegment {
  mode: 'alphanumeric'
  data: string
}

export interface QRCodeByteSegment {
  mode: 'byte'
  data: Buffer | Uint8ClampedArray | Uint8Array
}

export interface QRCodeKanjiSegment {
  mode: 'kanji'
  data: string
}

export interface QRCode {
  /**
   * BitMatrix class with modules data
   */
  modules: BitMatrix
  /**
   * Calculated QR Code version
   */
  version: QRVersion
  /**
   * Error Correction Level
   */
  errorCorrectionLevel: ErrorCorrectionLevel
  /**
   * Calculated Mask pattern
   */
  maskPattern: QRCodeMaskPattern | undefined
  /**
   * Generated segments
   */
  segments: GeneratedQRCodeSegment[]
}

/**
 * The parsed error correction level to use internally in the library.
 * Not to be confused with the public type {@link QRCodeErrorCorrectionLevel}
 */
export interface ErrorCorrectionLevel {
  bit: 0 | 1 | 2 | 3
}

export type QREncodingModeId = 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji'

/**
 * Encoding mode for a segment in the QR code.
 *
 * @prop id Unique identifier
 * @prop bit This bit is used to indicate the encoding mode for each segment in the QR code.
 * @prop ccBits This array of three numbers represents the number of bits needed to store the data length.
 *              Larger QR code versions need more bits for this purpose.
 */
export interface QREncodingMode<TModeId extends QREncodingModeId = QREncodingModeId> {
  id: TModeId
  bit: number
  ccBits: readonly number[]
}

export type GeneratedQRCodeSegment = NumericData | AlphanumericData | ByteData | KanjiData

/**
 * Processed segment containing a part of the QR code data.
 */
export interface DataSegment {
  getLength(): number
  getBitsLength(): number
}

export interface NumericData extends DataSegment {
  mode: QREncodingMode<'Numeric'>
  data: string
}

export interface AlphanumericData extends DataSegment {
  mode: QREncodingMode<'Alphanumeric'>
  data: string
}

export interface ByteData extends DataSegment {
  mode: QREncodingMode<'Byte'>
  data: Uint8Array
}

export interface KanjiData extends DataSegment {
  mode: QREncodingMode<'Kanji'>
  data: string
}
