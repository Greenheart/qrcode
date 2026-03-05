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
  return Array.from({ length }, () => fillValue)
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
