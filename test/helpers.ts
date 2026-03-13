import * as Version from '#core/version.ts'
import { EC_LEVELS } from '#lib/core/error-correction-level.ts'
import type { QRVersion } from '#lib/types.ts'

const nativePromise = global.Promise

/**
 * Create an array of `length`
 * @param length The length
 */
export function arrayWithLength(length: number) {
  return Array.from({ length })
}

/**
 * Create an array of `length` filled with `fillValue`
 * @param length The length
 * @param fillValue The value to fill the array with
 */
export function arrayWithFill<T>(length: number, fillValue: T) {
  return Array.from({ length }).fill(fillValue) as T[]
}

// IDEA: Consider replacing this hack with a proper Vitest Promise mock.
// NOTE: Or even better, once we switch to only use Promises for async APIs,
// we can remove the `can-promise.ts` module and tests that temporarily remove the promise object
// using these methods
export function removeNativePromise() {
  if (global.Promise) {
    delete global.Promise
  }
}

export function restoreNativePromise() {
  if (!global.Promise) {
    global.Promise = nativePromise
  }
}

/**
 * Get a range of QR code versions between (min - max).
 *
 * Useful for tests.
 * In the core library, use the Version MIN and MAX constants instead for a lower performance overhead.
 *
 * @param min Lower bound
 * @param max Upper bound, inclusive
 */
export function getQRVersionRange(min = Version.MIN, max = Version.MAX, step = 1): QRVersion[] {
  if (min < Version.MIN || max > Version.MAX) {
    throw new Error(
      `Invalid QR code version range (${min} - ${max}) should be within (${Version.MIN} - ${Version.MAX})`,
    )
  }
  return range(min, max, step) as QRVersion[]
}

function range(min: number, max: number, step = 1) {
  return Array.from({ length: Math.ceil((max - min) / step) }, (_, i) => min + i * step)
}

/**
 * All error correction levels. Useful for tests
 */
export const ALL_EC_LEVELS = Object.values(EC_LEVELS)
