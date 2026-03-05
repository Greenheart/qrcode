import * as Utils from '#renderer/utils.js'
import { test, expect } from 'vitest'

test('Utils getOptions', () => {
  const defaultOptions = {
    width: undefined,
    scale: 4,
    margin: 4,
    color: {
      dark: { r: 0, g: 0, b: 0, a: 255, hex: '#000000' },
      light: { r: 255, g: 255, b: 255, a: 255, hex: '#ffffff' },
    },
    type: undefined,
    rendererOpts: {},
  }

  expect(Utils.getOptions, 'getOptions should be defined').toBeTruthy()

  expect(Utils.getOptions(), 'Should return default options if called without param').toStrictEqual(
    defaultOptions,
  )

  expect(Utils.getOptions({ scale: 8 }).scale, 'Should return correct scale value').toEqual(8)

  expect(
    Utils.getOptions({ width: 300 }).scale,

    'Should reset scale value to default if width is set',
  ).toEqual(4)

  expect(
    Utils.getOptions({ margin: null }).margin,
    'Should return default margin if specified value is null',
  ).toEqual(4)

  expect(
    Utils.getOptions({ margin: -1 }).margin,

    'Should return default margin if specified value is < 0',
  ).toEqual(4)

  expect(Utils.getOptions({ margin: 20 }).margin, 'Should return correct margin value').toEqual(20)

  expect(
    Utils.getOptions({ color: { dark: '#fff', light: '#000000' } }).color,
    'Should return correct colors value from strings',
  ).toStrictEqual({
    dark: { r: 255, g: 255, b: 255, a: 255, hex: '#ffffff' },
    light: { r: 0, g: 0, b: 0, a: 255, hex: '#000000' },
  })

  expect(
    Utils.getOptions({ color: { dark: 111, light: 999 } }).color,
    'Should return correct colors value from numbers',
  ).toStrictEqual({
    dark: { r: 17, g: 17, b: 17, a: 255, hex: '#111111' },
    light: { r: 153, g: 153, b: 153, a: 255, hex: '#999999' },
  })

  expect(() => {
    Utils.getOptions({ color: { dark: true } })
  }, 'Should throw if color is not a string').toThrow()

  expect(() => {
    Utils.getOptions({ color: { dark: '#aa' } })
  }, 'Should throw if color is not in a valid hex format').toThrow()
})

test('Utils getScale', () => {
  const symbolSize = 21

  expect(Utils.getScale(symbolSize, { scale: 5 }), 'Should return correct scale value').toEqual(5)

  expect(
    Utils.getScale(symbolSize, { width: 50, margin: 2 }),
    'Should calculate correct scale from width and margin',
  ).toEqual(2)

  expect(
    Utils.getScale(symbolSize, { width: 21, margin: 2, scale: 4 }),
    'Should return default scale if width is too small to contain the symbol',
  ).toEqual(4)
})

test('Utils getImageWidth', () => {
  const symbolSize = 21

  expect(
    Utils.getImageWidth(symbolSize, { scale: 5, margin: 0 }),
    'Should return correct width value',
  ).toEqual(105)

  expect(
    Utils.getImageWidth(symbolSize, { width: 250, margin: 2 }),

    'Should return specified width value',
  ).toEqual(250)

  expect(
    Utils.getImageWidth(symbolSize, { width: 10, margin: 4, scale: 4 }),
    'Should ignore width option if too small to contain the symbol',
  ).toEqual(116)
})

test('Utils qrToImageData', () => {
  expect(Utils.qrToImageData, 'qrToImageData should be defined').toBeTruthy()

  const sampleQrData = {
    modules: {
      data: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
      size: 4,
    },
  }

  const margin = 4
  const scale = 2
  const width = 100

  const color = {
    dark: { r: 255, g: 255, b: 255, a: 255 },
    light: { r: 0, g: 0, b: 0, a: 255 },
  }

  const opts = {
    margin,
    scale,
    color,
  }

  let imageData = []
  const expectedImageSize = (sampleQrData.modules.size + margin * 2) * scale
  let expectedImageDataLength = Math.pow(expectedImageSize, 2) * 4

  Utils.qrToImageData(imageData, sampleQrData, opts)

  expect(imageData.length, 'Should return correct imageData length').toEqual(
    expectedImageDataLength,
  )

  imageData = []
  expectedImageDataLength = Math.pow(width, 2) * 4

  Utils.qrToImageData(imageData, sampleQrData, { ...opts, width })

  expect(imageData.length, 'Should return correct imageData length').toEqual(
    expectedImageDataLength,
  )
})
