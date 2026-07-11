import { test, expect, vi, beforeEach } from 'vitest'
import { vol, fs } from 'memfs'
import QRCode from '#lib/index.ts'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
  vol.mkdirSync(process.cwd(), { recursive: true })
})

test('toFileStream png', async () => {
  expect(() => {
    QRCode.toFileStream('some text')
  }, 'Should throw if stream is not provided').toThrow()

  expect(() => {
    QRCode.toFileStream(fs.createWriteStream('streamed-qr', { autoClose: true }))
  }, 'Should throw if text is not provided').toThrow()

  await new Promise<void>((resolve) => {
    const stream = fs.createWriteStream('first-stream', { autoClose: true })

    stream.once('close', resolve)

    expect(() => {
      QRCode.toFileStream(stream, 'i am a pony!')
    }, 'There should be no error').not.toThrow()
  })

  await new Promise<void>((resolve) => {
    const stream = fs.createWriteStream('second-stream', { autoClose: true })

    stream.once('close', resolve)

    expect(() => {
      QRCode.toFileStream(stream, 'i am a pony!', {
        type: 'image/png',
      })
    }, 'There should be no error').not.toThrow()
  })
})

test('toFileStream png with qrcode error', async () => {
  const stream = fs.createWriteStream('qr-with-error', { autoClose: true })
  const bigString = Array(200).join('i am a pony!')

  stream.on('error', (e) => {
    expect(e, 'Should return an error').toBeTruthy()
  })

  QRCode.toFileStream(stream, bigString)
  QRCode.toFileStream(stream, 'i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
  })
})
