import * as Utils from './utils.ts'
import * as ECCode from './error-correction-code.ts'
import * as Mode from './mode.ts'
import type { QRVersion, QREncodingMode, ErrorCorrectionLevel, GeneratedQRCodeSegment } from '#lib/types.ts'

export const MIN = 1
export const MAX = 40
export const QR_VERSION_RANGE = [MIN, MAX] as const

/**
 * Parse and returns the QR code version (1-40), or undefined if the version is invalid.
 */
export function parse(version: unknown): QRVersion | undefined {
  let num = typeof version !== 'number' ? parseInt(version as any, 10) : version
  if (Number.isInteger(num) && MIN <= num && num <= MAX) {
    return num as QRVersion
  }
}

// Generator polynomial used to encode version information
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0)
const G18_BCH = Utils.getBCHDigit(G18)

function getBestVersionForDataLength(
  mode: QREncodingMode,
  length: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
): QRVersion | undefined {
  for (let currentVersion = MIN; currentVersion <= MAX; currentVersion++) {
    if (length <= getCapacity(currentVersion as QRVersion, errorCorrectionLevel, mode)) {
      return currentVersion as QRVersion
    }
  }

  return undefined
}

function getReservedBitsCount(mode: QREncodingMode, version: QRVersion) {
  // Character count indicator + mode indicator bits
  return Mode.getCharCountIndicator(mode, version) + 4
}

function getTotalBitsFromDataArray(segments: GeneratedQRCodeSegment[], version: QRVersion) {
  let totalBits = 0

  for (const data of segments) {
    totalBits += getReservedBitsCount(data.mode, version) + data.getBitsLength()
  }

  return totalBits
}

function getBestVersionForMixedData(segments: GeneratedQRCodeSegment[], errorCorrectionLevel: ErrorCorrectionLevel) {
  for (let currentVersion = MIN; currentVersion <= MAX; currentVersion++) {
    const length = getTotalBitsFromDataArray(segments, currentVersion as QRVersion)
    if (length <= getCapacity(currentVersion as QRVersion, errorCorrectionLevel, Mode.MIXED)) {
      return currentVersion as QRVersion
    }
  }

  return undefined
}

/**
 * Returns how much data can be stored with the specified QR code version
 * and error correction level
 *
 * @param version QR Code version (1-40)
 * @param {Number} errorCorrectionLevel Error correction level
 * @param {Mode} mode Data mode
 */
export function getCapacity(
  version: QRVersion,
  errorCorrectionLevel: ErrorCorrectionLevel,
  mode: QREncodingMode | typeof Mode.MIXED,
) {
  // Total codewords for this QR code version (Data + Error correction)
  const totalCodewords = Utils.getSymbolTotalCodewords(version)

  // Total number of error correction codewords
  const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

  // Total number of data codewords
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8

  if (mode === Mode.MIXED) {
    return dataTotalCodewordsBits
  }

  const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode as QREncodingMode, version)

  // Return max number of storable codewords
  switch (mode as QREncodingMode) {
    case Mode.NUMERIC:
      return Math.floor((usableBits / 10) * 3)

    case Mode.ALPHANUMERIC:
      return Math.floor((usableBits / 11) * 2)

    case Mode.KANJI:
      return Math.floor(usableBits / 13)

    case Mode.BYTE:
    default:
      return Math.floor(usableBits / 8)
  }
}

/**
 * Returns the minimum version needed to contain the amount of data
 */
export function getBestVersionForData(
  data: GeneratedQRCodeSegment | GeneratedQRCodeSegment[],
  errorCorrectionLevel: ErrorCorrectionLevel,
): QRVersion | undefined {
  let seg: GeneratedQRCodeSegment

  if (Array.isArray(data)) {
    if (data.length > 1) {
      return getBestVersionForMixedData(data, errorCorrectionLevel)
    }

    if (data.length === 0) {
      return 1
    }

    seg = data[0]
  } else {
    seg = data
  }

  return getBestVersionForDataLength(seg.mode, seg.getLength(), errorCorrectionLevel)
}

/**
 * Returns version information with relative error correction bits
 *
 * The version information is included in QR Code symbols of version 7 or larger.
 * It consists of an 18-bit sequence containing 6 data bits,
 * with 12 error correction bits calculated using the (18, 6) Golay code.
 *
 * @return Encoded version info bits
 */
export function getEncodedBits(version: QRVersion) {
  if (version < 7) {
    throw new Error(`Expected QR version >= 7 but got: ${version}`)
  }

  let d = version << 12

  while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
    d ^= G18 << (Utils.getBCHDigit(d) - G18_BCH)
  }

  return (version << 12) | d
}
