import { test, expect } from 'vitest'
import { Canvas, createCanvas } from 'canvas'
import QRCode from '#lib/index.ts'
import * as Helpers from '#test/helpers.js'

test('toCanvas - no promise available', () => {
  Helpers.removeNativePromise()

  // Mock document object
  global.document = {
    // @ts-expect-error Mocking the canvas element
    createElement: (el) => {
      if (el === 'canvas') {
        return createCanvas(200, 200)
      }
    },
  }
  const canvasEl = createCanvas(200, 200)

  expect(() => {
    QRCode.toCanvas()
  }, 'Should throw if no arguments are provided').toThrow()

  expect(() => {
    QRCode.toCanvas('some text')
  }, 'Should throw if a callback is not provided').toThrow()

  expect(() => {
    QRCode.toCanvas(canvasEl, 'some text')
  }, 'Should throw if a callback is not provided').toThrow()

  expect(() => {
    QRCode.toCanvas(canvasEl, 'some text', {})
  }, 'Should throw if callback is not a function').toThrow()

  global.document = undefined
  Helpers.restoreNativePromise()
})

test('toCanvas', () => {
  // Mock document object
  global.document = {
    // @ts-expect-error Mocking the canvas element
    createElement: (el) => {
      if (el === 'canvas') {
        return createCanvas(200, 200)
      }
    },
  }

  expect(() => {
    QRCode.toCanvas()
  }, 'Should throw if no arguments are provided').toThrow()

  QRCode.toCanvas('some text', (err, canvasEl) => {
    expect(err, 'There should be no error').toBeFalsy()
    expect(canvasEl, 'Should return a new canvas object').toBeInstanceOf(Canvas)
  })

  QRCode.toCanvas(
    'some text',
    {
      errorCorrectionLevel: 'H',
    },
    (err, canvasEl) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(canvasEl, 'Should return a new canvas object').toBeInstanceOf(Canvas)
    },
  )

  QRCode.toCanvas('some text').then((canvasEl) => {
    expect(canvasEl, 'Should return a new canvas object (promise)').toBeInstanceOf(Canvas)
  })

  QRCode.toCanvas('some text', {
    errorCorrectionLevel: 'H',
  }).then((canvasEl) => {
    expect(canvasEl, 'Should return a new canvas object (promise)').toBeInstanceOf(Canvas)
  })

  global.document = undefined
})

test('toCanvas with specified canvas element', () => {
  const canvasEl = createCanvas(200, 200)

  QRCode.toCanvas(canvasEl, 'some text', (err, canvasEl) => {
    expect(err, 'There should be no error').toBeFalsy()
    expect(canvasEl, 'Should return a new canvas object').toBeInstanceOf(Canvas)
  })

  QRCode.toCanvas(
    canvasEl,
    'some text',
    {
      errorCorrectionLevel: 'H',
    },
    (err, canvasEl) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(canvasEl, 'Should return a new canvas object').toBeInstanceOf(Canvas)
    },
  )

  QRCode.toCanvas(canvasEl, 'some text').then((canvasEl) => {
    expect(canvasEl, 'Should return a new canvas object (promise)').toBeInstanceOf(Canvas)
  })

  QRCode.toCanvas(canvasEl, 'some text', {
    errorCorrectionLevel: 'H',
  }).then((canvasEl) => {
    expect(canvasEl, 'Should return a new canvas object (promise)').toBeInstanceOf(Canvas)
  })
})
