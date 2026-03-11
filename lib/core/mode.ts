import * as Regex from './regex.ts'
import type { QRCodeSegment, QREncodingMode, QREncodingModeId, QRVersion } from '#lib/types.ts'

/**
 * Numeric mode encodes data from the decimal digit set (0 - 9)
 * (byte values 30HEX to 39HEX).
 * Normally, 3 data characters are represented by 10 bits.
 */
export const NUMERIC: QREncodingMode<'Numeric'> = {
  id: 'Numeric',
  bit: 1 << 0,
  ccBits: [10, 12, 14],
} as const

/**
 * Alphanumeric mode encodes data from a set of 45 characters,
 * i.e. 10 numeric digits (0 - 9),
 *      26 alphabetic characters (A - Z),
 *   and 9 symbols (Space, $, %, *, +, -, ., /, :).
 *
 * This is Base45 encoding, specified in https://datatracker.ietf.org/doc/rfc9285/
 *
 * Normally, two input characters are represented by 11 bits.
 */
export const ALPHANUMERIC: QREncodingMode<'Alphanumeric'> = {
  id: 'Alphanumeric',
  bit: 1 << 1,
  ccBits: [9, 11, 13],
} as const

/**
 * In byte mode, data is encoded at 8 bits per character.
 */
export const BYTE: QREncodingMode<'Byte'> = {
  id: 'Byte',
  bit: 1 << 2,
  ccBits: [8, 16, 16],
} as const

/**
 * The Kanji mode efficiently encodes Kanji characters in accordance with
 * the Shift JIS system based on JIS X 0208.
 * The Shift JIS values are shifted from the JIS X 0208 values.
 * JIS X 0208 gives details of the shift coded representation.
 * Each two-byte character value is compacted to a 13-bit binary codeword.
 */
export const KANJI: QREncodingMode<'Kanji'> = {
  id: 'Kanji',
  bit: 1 << 3,
  ccBits: [8, 10, 12],
} as const

/**
 * Mixed mode will contain a sequences of data in a combination of any of
 * the modes described above
 *
 * TODO: See how the MIXED mode is used, and if it should be added to the Mode type or remain a separate type
 * It is only used in two places, in getCapacity() and getBestVersionForMixedData()
 */
export const MIXED = {
  bit: -1,
} as const

/**
 * Returns the number of bits needed to store the data length
 * according to QR Code specifications.
 */
export function getCharCountIndicator(mode: QREncodingMode, version: QRVersion): number {
  // TODO: See how this function is called, and if the validation is needed.
  // Since it is a internal API in the module, it should be safe to rely on TypeScript types instead of manual checks and throwing errors
  if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

  if (version < 10) return mode.ccBits[0]
  else if (version < 27) return mode.ccBits[1]
  return mode.ccBits[2]
}

/**
 * Returns the most efficient mode to store the specified data
 */
export function getBestModeForData(data: string | QRCodeSegment['data']): QREncodingMode {
  if (Regex.testNumeric(data)) return NUMERIC
  else if (Regex.testAlphanumeric(data)) return ALPHANUMERIC
  else if (Regex.testKanji(data)) return KANJI
  else return BYTE
}

/**
 * Return mode name as string
 */
export function toString(mode: QREncodingMode): QREncodingModeId {
  if (mode && mode.id) return mode.id
  // IDEA: Consider replacing this error with stricter type checking instead. Might be OK if we only call this internally in the library.
  // TODO: Check usage of Mode.toString() and see if we could rely on the type system here instead.
  throw new Error('Invalid mode')
}

/**
 * Check if input param is a valid mode object
 */
export function isValid(mode: unknown): mode is QREncodingMode {
  return Boolean(mode && (mode as QREncodingMode).bit && (mode as QREncodingMode).ccBits)
}

/**
 * Get mode object from its name
 */
function fromString(name: string): QREncodingMode {
  if (typeof name !== 'string') {
    throw new Error('Param is not a string')
  }

  switch (name.toLowerCase()) {
    case 'numeric':
      return NUMERIC
    case 'alphanumeric':
      return ALPHANUMERIC
    case 'kanji':
      return KANJI
    case 'byte':
      return BYTE
    default:
      throw new Error('Unknown mode: ' + name)
  }
}

/**
 * Returns mode from a value.
 * If value is not a valid mode, returns defaultValue
 *
 * TODO: Replace from() with parse() instead, potentially returning undefined, and assign default values outside of the function
 *
 * @param  {Mode|String} value        Encoding mode
 * @param  {Mode}        defaultValue Fallback value
 * @return {Mode}                     Encoding mode
 */
export function from(value, defaultValue) {
  if (isValid(value)) {
    return value
  }

  try {
    return fromString(value)
    // oxlint-disable no-unused-vars
  } catch (e) {
    return defaultValue
  }
}
