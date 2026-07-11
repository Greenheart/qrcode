import { PNG } from 'pngjs'
import { createWriteStream, WriteStream } from 'node:fs'
import { getOptions, getImageWidth, qrToImageData } from './utils.ts'
import type { QRCode } from '#lib/types.ts'

export function render(qrData: QRCode, options) {
  const opts = getOptions(options)
  const pngOpts = opts.rendererOpts
  const size = getImageWidth(qrData.modules.size, opts)

  pngOpts.width = size
  pngOpts.height = size

  const pngImage = new PNG(pngOpts)
  qrToImageData(pngImage.data, qrData, opts)

  return pngImage
}

export function renderToDataURL(qrData: QRCode, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  renderToBuffer(qrData, options, function (err, output) {
    if (err) cb(err)
    let url = 'data:image/png;base64,'
    url += output.toString('base64')
    cb(null, url)
  })
}

// TODO: This function is indirectly tested via the renderToDataURL test
// However, since it is part of the public API, it would be good to also test this method explicitly.
export function renderToBuffer(qrData: QRCode, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  const png = render(qrData, options)
  const buffer: Uint8Array[] = []

  png.on('error', cb)

  png.on('data', function (data) {
    buffer.push(data)
  })

  png.on('end', function () {
    cb(null, Buffer.concat(buffer))
  })

  png.pack()
}

export function renderToFile(path: string, qrData: QRCode, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  let called = false
  const done = (...args: any[]) => {
    if (called) return
    called = true
    cb(...args)
  }
  const stream = createWriteStream(path)

  stream.on('error', done)
  stream.on('close', done)

  renderToFileStream(stream, qrData, options)
}

export function renderToFileStream(stream: WriteStream, qrData: QRCode, options?: unknown) {
  const png = render(qrData, options)
  png.pack().pipe(stream)
}
