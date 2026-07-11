import { PNG } from 'pngjs'
import { test, expect, vi, beforeEach } from 'vitest'
import { fs, vol } from 'memfs'
import * as QRCode from '#core/qrcode.ts'
import * as PngRenderer from '#renderer/png.ts'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
  vol.mkdirSync(process.cwd(), { recursive: true })
})

test('PNG renderer interface', () => {
  expect(PngRenderer.render, 'Should have render function').toBeTypeOf('function')

  expect(PngRenderer.renderToDataURL, 'Should have renderToURL function').toBeTypeOf('function')

  expect(PngRenderer.renderToFile, 'Should have renderToFile function').toBeTypeOf('function')
  expect(PngRenderer.renderToFileStream, 'Should have renderToFileStream function').toBeTypeOf(
    'function',
  )
})

test('PNG render', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let png: PNG

  expect(() => {
    png = PngRenderer.render(sampleQrData)
  }, 'Should not throw with only qrData param').not.toThrow()

  expect(png, 'Should return an instance of PNG').toBeInstanceOf(PNG)

  expect(png.width, 'Should be a square image').toEqual(png.height)

  const modules = 25
  const margins = 4 * 2
  const scale = 4

  expect(png.width, 'Should have correct size').toEqual((modules + margins) * scale)

  expect(() => {
    png = PngRenderer.render(sampleQrData, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()

  expect(png.width, 'Should be a square image').toEqual(png.height)

  const modules2 = 25
  const margins2 = 10 * 2
  const scale2 = 1

  expect(png.width, 'Should have correct size').toEqual((modules2 + margins2) * scale2)
})

test('PNG renderToDataURL', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })

  PngRenderer.renderToDataURL(sampleQrData, (err, url) => {
    expect(err, 'Should not generate errors with only qrData param').toBeFalsy()
    expect(url, 'Should return a string').toBeTypeOf('string')
  })

  PngRenderer.renderToDataURL(sampleQrData, { margin: 10, scale: 1 }, (err, url) => {
    expect(err, 'Should not generate errors with options param').toBeFalsy()

    expect(url, 'Should return a string').toBeTypeOf('string')

    expect(url.split(',')[0], 'Should have correct header').toEqual('data:image/png;base64')

    const b64png = url.split(',')[1]
    expect(b64png.length % 4, 'Should have a correct length').toEqual(0)
  })
})

test('PNG renderToFile', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const fileName = 'qr1.png'

  // IDEA: Maybe all async stream operations need to be wrapped in promises?
  // If we await the promises, then perhaps the files will be accepted?

  PngRenderer.renderToFile(fileName, sampleQrData, (err) => {
    expect(err, 'Should not generate errors with only qrData param').toBeFalsy()

    expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)
  })

  const fileName2 = 'qr2.png'
  PngRenderer.renderToFile(
    fileName2,
    sampleQrData,
    {
      margin: 10,
      scale: 1,
    },
    (err) => {
      expect(err, 'Should not generate errors with options param').toBeFalsy()

      expect(vol.existsSync(fileName2), 'Should save file with correct filename').toBe(true)
    },
  )
})

test('PNG renderToFileStream', async () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })

  // const stream1 = fs.createWriteStream('streamed.png')
  // const stream2 = fs.createWriteStream('streamed2.png')

  // stream1.once('finish', () => stream1.close())
  // stream2.once('finish', () => stream1.close())

  expect(() => {
    PngRenderer.renderToFileStream(
      fs.createWriteStream('streamed.png', { autoClose: true }),
      sampleQrData,
    )
  }, 'Should not throw with only qrData param').not.toThrow()

  expect(() => {
    PngRenderer.renderToFileStream(
      fs.createWriteStream('streamed2.png', { autoClose: true }),
      sampleQrData,
      {
        margin: 10,
        scale: 1,
      },
    )
  }, 'Should not throw with options param').not.toThrow()
})
