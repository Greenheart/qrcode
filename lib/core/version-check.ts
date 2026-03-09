import type { QRVersion } from "#lib/types.ts"

const MIN = 1
const MAX = 40
export const QR_VERSION_RANGE = [MIN, MAX] as const

/**
 * Check if QR Code version is valid
 *
 * @param version QR Code version
 * @return true if valid version, false otherwise
 */
export function isValid(version: number) {
  return !isNaN(version) && MIN <= version && version <= MAX
}

/**
 * Parse and returns the QR code version (1-40), or undefined if the version is invalid.
 */
export function parse(version: unknown): QRVersion | undefined {
  let num =  typeof version !== 'number' ? parseInt(version as any, 10) : version
  if (Number.isInteger(num) && MIN <= num && num <= MAX) {
    return num as QRVersion
  }
}
