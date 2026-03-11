import type BitMatrix from './bit-matrix.ts'
import type { QRCodeMaskPattern } from '#lib/types.ts'

export const Patterns = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
} as const

const MIN = Patterns.PATTERN000
const MAX = Patterns.PATTERN111
export const QR_MASK_RANGE = [MIN, MAX] as const

/**
 * Weighted penalty scores for the undesirable features
 */
const PenaltyScores = {
  N1: 3,
  N2: 3,
  N3: 40,
  N4: 10,
} as const

/**
 * Returns mask pattern from a value.
 * If value is not valid, returns undefined
 *
 * @param value Mask pattern value
 * @return Valid mask pattern or undefined
 */
export function parse(mask: unknown): QRCodeMaskPattern | undefined {
  const num = typeof mask !== 'number' ? parseInt(mask as any, 10) : mask
  if (Number.isInteger(num) && MIN <= num && num <= MAX) {
    return num as QRCodeMaskPattern
  }
}

/**
 * Find adjacent modules in row/column with the same color
 * and assign a penalty value.
 *
 * Points: N1 + i
 * i is the amount by which the number of adjacent modules of the same color exceeds 5
 */
export function getPenaltyN1(data: BitMatrix) {
  const size = data.size
  let points = 0
  let sameCountCol = 0
  let sameCountRow = 0
  let lastCol = null
  let lastRow = null

  for (let row = 0; row < size; row++) {
    sameCountCol = sameCountRow = 0
    lastCol = lastRow = null

    for (let col = 0; col < size; col++) {
      let module = data.get(row, col)
      if (module === lastCol) {
        sameCountCol++
      } else {
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
        lastCol = module
        sameCountCol = 1
      }

      module = data.get(col, row)
      if (module === lastRow) {
        sameCountRow++
      } else {
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
        lastRow = module
        sameCountRow = 1
      }
    }

    if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
    if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
  }

  return points
}

/**
 * Find 2x2 blocks with the same color and assign a penalty value
 *
 * Points: N2 * (m - 1) * (n - 1)
 */
export function getPenaltyN2(data: BitMatrix) {
  const size = data.size
  let points = 0

  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const last =
        data.get(row, col) +
        data.get(row, col + 1) +
        data.get(row + 1, col) +
        data.get(row + 1, col + 1)

      if (last === 4 || last === 0) points++
    }
  }

  return points * PenaltyScores.N2
}

/**
 * Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
 * preceded or followed by light area 4 modules wide
 *
 * Points: N3 * number of pattern found
 */
export function getPenaltyN3(data: BitMatrix) {
  const size = data.size
  let points = 0
  let bitsCol = 0
  let bitsRow = 0

  for (let row = 0; row < size; row++) {
    bitsCol = bitsRow = 0
    for (let col = 0; col < size; col++) {
      bitsCol = ((bitsCol << 1) & 0x7ff) | data.get(row, col)
      if (col >= 10 && (bitsCol === 0x5d0 || bitsCol === 0x05d)) points++

      bitsRow = ((bitsRow << 1) & 0x7ff) | data.get(col, row)
      if (col >= 10 && (bitsRow === 0x5d0 || bitsRow === 0x05d)) points++
    }
  }

  return points * PenaltyScores.N3
}

/**
 * Calculate proportion of dark modules in entire symbol
 *
 * Points: N4 * k
 *
 * k is the rating of the deviation of the proportion of dark modules
 * in the symbol from 50% in steps of 5%
 */
export function getPenaltyN4(data: BitMatrix) {
  let darkCount = 0
  const modulesCount = data.data.length

  for (let i = 0; i < modulesCount; i++) darkCount += data.data[i]

  const k = Math.abs(Math.ceil((darkCount * 100) / modulesCount / 5) - 10)

  return k * PenaltyScores.N4
}

/**
 * Return mask value at given position
 *
 * @param maskPattern Pattern reference value
 * @param i Row
 * @param j Column
 */
function getMaskAt(maskPattern: QRCodeMaskPattern, i: number, j: number): boolean {
  switch (maskPattern) {
    case Patterns.PATTERN000:
      return (i + j) % 2 === 0
    case Patterns.PATTERN001:
      return i % 2 === 0
    case Patterns.PATTERN010:
      return j % 3 === 0
    case Patterns.PATTERN011:
      return (i + j) % 3 === 0
    case Patterns.PATTERN100:
      return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
    case Patterns.PATTERN101:
      return ((i * j) % 2) + ((i * j) % 3) === 0
    case Patterns.PATTERN110:
      return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0
    case Patterns.PATTERN111:
      return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0

    default:
      throw new Error('Bad maskPattern:' + maskPattern)
  }
}

/**
 * Apply a mask pattern to a BitMatrix
 */
export function applyMask(pattern: QRCodeMaskPattern, data: BitMatrix) {
  const size = data.size

  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size; row++) {
      if (data.isReserved(row, col)) continue
      data.xor(row, col, getMaskAt(pattern, row, col) ? 1 : 0)
    }
  }
}

/**
 * Returns the best mask pattern for data
 */
export function getBestMask(
  data: BitMatrix,
  setupFormatFunc: (mask: QRCodeMaskPattern) => void,
): QRCodeMaskPattern {
  let bestPattern: QRCodeMaskPattern = 0
  let lowerPenalty = Infinity

  for (let p = MIN; p <= MAX; p++) {
    setupFormatFunc(p)
    applyMask(p, data)

    // Calculate penalty
    const penalty =
      getPenaltyN1(data) + getPenaltyN2(data) + getPenaltyN3(data) + getPenaltyN4(data)

    // Undo previously applied mask
    applyMask(p, data)

    if (penalty < lowerPenalty) {
      lowerPenalty = penalty
      bestPattern = p as QRCodeMaskPattern
    }
  }

  return bestPattern
}
