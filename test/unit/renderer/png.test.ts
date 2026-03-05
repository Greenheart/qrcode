import sinon from 'sinon'
import fs, { WriteStream } from 'fs'
import { PNG } from 'pngjs'
import { test, expect } from 'vitest'
import * as QRCode from '#core/qrcode.js'
import * as PngRenderer from '#renderer/png.js'
import StreamMock from '../../mocks/writable-stream.js'

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

  // modules: 25, margins: 4 * 2, scale: 4
  expect(png.width, 'Should have correct size').toEqual((25 + 4 * 2) * 4)

  expect(() => {
    png = PngRenderer.render(sampleQrData, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()

  expect(png.width, 'Should be a square image').toEqual(png.height)

  // modules: 25, margins: 10 * 2, scale: 1
  expect(png.width, 'Should have correct size').toEqual(25 + 10 * 2)
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
  const fileName = 'qrimage.png'
  // IDEA: Maybe use `memfs` to mock the file system?
  // This could improve the performance and reliability of tests
  // https://vitest.dev/guide/mocking/file-system.html#example
  let fsStub = sinon.stub(fs, 'createWriteStream')
  // TODO: Fix the type, or maybe typecast to ignore warning in the few places where its used.
  fsStub.returns(new StreamMock() as unknown as WriteStream)

  PngRenderer.renderToFile(fileName, sampleQrData, (err) => {
    expect(err, 'Should not generate errors with only qrData param').toBeFalsy()

    expect(fsStub.getCall(0).args[0], 'Should save file with correct file name').toEqual(fileName)
  })

  PngRenderer.renderToFile(
    fileName,
    sampleQrData,
    {
      margin: 10,
      scale: 1,
    },
    (err) => {
      expect(err, 'Should not generate errors with options param').toBeFalsy()
      expect(fsStub.getCall(0).args[0], 'Should save file with correct file name').toEqual(fileName)
    },
  )

  fsStub.restore()
  fsStub = sinon.stub(fs, 'createWriteStream')
  fsStub.returns(new StreamMock().forceErrorOnWrite() as unknown as WriteStream)

  PngRenderer.renderToFile(fileName, sampleQrData, (err) => {
    expect(err, 'Should fail if error occurs during save').toBeTruthy()
  })

  fsStub.restore()
})

test('PNG renderToFileStream', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })

  expect(() => {
    PngRenderer.renderToFileStream(new StreamMock(), sampleQrData)
  }, 'Should not throw with only qrData param').not.toThrow()

  expect(() => {
    PngRenderer.renderToFileStream(new StreamMock(), sampleQrData, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()
})
