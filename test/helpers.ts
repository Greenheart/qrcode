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
  return Array.from({ length }).fill(fillValue)
}

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
