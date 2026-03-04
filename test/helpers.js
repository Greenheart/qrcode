const nativePromise = global.Promise

export function removeNativePromise () {
  if (global.Promise) {
    delete global.Promise
  }
}

export function restoreNativePromise () {
  if (!global.Promise) {
    global.Promise = nativePromise
  }
}
