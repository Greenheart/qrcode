import type { QRCodeToSJISFunc, QRVersion } from '#lib/types.ts'
import * as Version from '#core/version.ts'

let toSJISFunction: QRCodeToSJISFunc
const CODEWORDS_COUNT = [
  0, // Not used
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706,
]

/**
 * Returns the QR Code size for the specified version
 *
 * @param version QR Code version
 * @return Size of QR code
 */
export function getSymbolSize(version: QRVersion) {
  // IDEA: Maybe change the errors to tests instead? Unless the code depends on throwing and catching exceptions of course.
  if (!version) throw new Error('"version" cannot be null or undefined')
  if (version < Version.MIN || version > Version.MAX) throw new Error('"version" should be in range from 1 to 40')
  return version * 4 + 17
}

/**
 * Returns the total number of codewords used to store data and EC information.
 *
 * @param version QR Code version
 * @return Data length in bits
 */
export function getSymbolTotalCodewords(version: QRVersion) {
  return CODEWORDS_COUNT[version]
}

/**
 * Encode data with Bose-Chaudhuri-Hocquenghem
 *
 * @param data Value to encode
 * @return Encoded value
 */
export function getBCHDigit(data: number) {
  let digit = 0

  while (data !== 0) {
    digit++
    data >>>= 1
  }

  return digit
}

export function setToSJISFunction(f: QRCodeToSJISFunc) {
  if (typeof f !== 'function') {
    throw new Error('"toSJISFunc" is not a valid function.')
  }

  toSJISFunction = f
}

// IDEA: Maybe pass in toSJISFunction via QRCodeOptions instead
export function isKanjiModeEnabled() {
  return typeof toSJISFunction !== 'undefined'
}

export function toSJIS(kanji: string) {
  return toSJISFunction(kanji)
}
