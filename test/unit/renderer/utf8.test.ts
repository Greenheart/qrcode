import { test, expect, vi, beforeEach } from 'vitest'
import { vol } from 'memfs'

import * as QRCode from '#core/qrcode.ts'
import * as Utf8Renderer from '#renderer/utf8.ts'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
  vol.mkdirSync(process.cwd(), { recursive: true })
})

test('Utf8Renderer interface', () => {
  expect(Utf8Renderer.render, 'Should have render function').toBeTypeOf('function')
})

test('Utf8Renderer render', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let str: string

  expect(() => {
    str = Utf8Renderer.render(sampleQrData)
  }, 'Should not throw with only qrData param').not.toThrow()

  expect(() => {
    str = Utf8Renderer.render(sampleQrData, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()

  expect(str, 'Should return a string').toBeTypeOf('string')
})

test('Utf8 renderToFile', async () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const fileName = 'qrimage-tofile.txt'

  await new Promise<void>((resolve) => {
    Utf8Renderer.renderToFile(fileName, sampleQrData, (err) => {
      expect(err, 'Should not generate errors with only qrData param').toBeFalsy()
      expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)
      resolve()
    })
  })

  await new Promise<void>(resolve => {
    const fileName = 'qr-utf8.txt'
    Utf8Renderer.renderToFile(
      fileName,
      sampleQrData,
      {
        margin: 10,
        scale: 1,
      },
      (err) => {
        expect(err, 'Should not generate errors with options param').toBeFalsy()
        expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)
        resolve()
      },
    )
  })
})
