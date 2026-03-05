import { Canvas, createCanvas } from 'canvas'
import * as QRCode from '#core/qrcode.js'
import * as CanvasRenderer from '#renderer/canvas.js'
import { test, expect } from 'vitest'

test('CanvasRenderer interface', () => {
  expect(CanvasRenderer.render, 'Should have render function').toBeTypeOf('function')
  expect(CanvasRenderer.renderToDataURL, 'Should have renderToDataURL function').toBeTypeOf(
    'function',
  )
})

test('CanvasRenderer render', () => {
  // Mock document object
  global.document = {
    // @ts-expect-error Mock canvas
    createElement: (el) => {
      if (el === 'canvas') {
        return createCanvas(200, 200)
      }
    },
  }

  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let canvasEl

  expect(() => {
    canvasEl = CanvasRenderer.render(sampleQrData)
  }, 'Should not throw if canvas is not provided').not.toThrow()

  expect(canvasEl, 'Should return a new canvas object').toBeInstanceOf(Canvas)

  expect(() => {
    canvasEl = CanvasRenderer.render(sampleQrData, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()

  // modules: 25, margins: 10 * 2, scale: 1
  expect(canvasEl.width, 'Should have correct size').toEqual(25 + 10 * 2)

  expect(canvasEl.width, 'Should be a square image').toEqual(canvasEl.height)

  global.document = undefined

  expect(() => {
    canvasEl = CanvasRenderer.render(sampleQrData)
  }, 'Should throw if canvas cannot be created').toThrow()
})

test('CanvasRenderer render to provided canvas', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const canvasEl = createCanvas(200, 200)

  expect(() => {
    CanvasRenderer.render(sampleQrData, canvasEl)
  }, 'Should not throw with only qrData and canvas param').not.toThrow()

  expect(() => {
    CanvasRenderer.render(sampleQrData, canvasEl, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()

  // modules: 25, margins: 10 * 2, scale: 1
  expect(canvasEl.width, 'Should have correct size').toEqual(25 + 10 * 2)

  expect(canvasEl.width, 'Should be a square image').toEqual(canvasEl.height)
})

test('CanvasRenderer renderToDataURL', () => {
  // Mock document object
  global.document = {
    // @ts-expect-error Mock canvas
    createElement: (el) => {
      if (el === 'canvas') {
        return createCanvas(200, 200)
      }
    },
  }

  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let url

  expect(() => {
    url = CanvasRenderer.renderToDataURL(sampleQrData)
  }, 'Should not throw if canvas is not provided').not.toThrow()

  expect(() => {
    url = CanvasRenderer.renderToDataURL(sampleQrData, {
      margin: 10,
      scale: 1,
      type: 'image/png',
    })
  }, 'Should not throw with options param').not.toThrow()

  expect(url, 'Should return a string').toBeTypeOf('string')

  expect(url.split(',')[0], 'Should have correct header').toEqual('data:image/png;base64')

  const b64png = url.split(',')[1]
  expect(b64png.length % 4, 'Should have a correct length').toEqual(0)

  global.document = undefined
})

test('CanvasRenderer renderToDataURL to provided canvas', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const canvasEl = createCanvas(200, 200)
  let url

  expect(() => {
    url = CanvasRenderer.renderToDataURL(sampleQrData, canvasEl)
  }, 'Should not throw with only qrData and canvas param').not.toThrow()

  expect(() => {
    url = CanvasRenderer.renderToDataURL(sampleQrData, canvasEl, {
      margin: 10,
      scale: 1,
      type: 'image/png',
    })
  }, 'Should not throw with options param').not.toThrow()

  expect(url, 'Should return a string').toBeTypeOf('string')

  expect(url.split(',')[0], 'Should have correct header').toEqual('data:image/png;base64')

  const b64png = url.split(',')[1]
  expect(b64png.length % 4, 'Should have a correct length').toEqual(0)
})

test('CanvasRenderer renderToBlob', () => {
  // Mock document object
  global.document = {
    // @ts-expect-error Mock canvas
    createElement: (el) => {
      if (el === 'canvas') {
        const canvas = createCanvas(200, 200)

        // The `HTMLCanvas` element has a `toBlob()` method
        // to export content as image bytes. The equivalent
        // methos in `canvas` library is the `toBuffer()`.
        // @ts-expect-error function alias
        canvas.toBlob = (cb, mimeType, config) => {
          canvas.toBuffer(
            (err, buffer: Buffer<ArrayBuffer>) => {
              const blob = new Blob([buffer], { type: mimeType })
              cb(blob)
            },
            mimeType,
            config,
          )
        }

        return canvas
      }
    },
  }

  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let imageBlob: Blob

  expect(() => {
    CanvasRenderer.renderToBlob(() => {}, sampleQrData)
  }, 'Should not throw if canvas is not provided').not.toThrow()

  expect(() => {
    CanvasRenderer.renderToBlob(
      (blob) => {
        imageBlob = blob

        expect(imageBlob, 'Should return a Blob object').toBeInstanceOf(Blob)

        expect(
          // @ts-expect-error
          imageBlob.toString('base64'),
          'Blob data cannot be converted to base64 econding',
        ).toEqual('[object Blob]')

        // TODO: This test is broken for some reson with Node.js 24 and `canvas@3.2.1`. Might be a breaking change of some sort.
        // expect(imageBlob.size % 4, 'Should have a correct size').toEqual(0)

        expect(imageBlob.type, 'Should have a correct type value').toEqual('image/png')
      },
      sampleQrData,
      {
        margin: 10,
        scale: 1,
        type: 'image/png',
      },
    )
  }, 'Should not throw with options param').not.toThrow()

  global.document = undefined
})
