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
