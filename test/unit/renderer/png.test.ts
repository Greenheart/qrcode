import sinon from 'sinon'
import fs from 'fs'
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

// TODO: continue porting tests to vitest

// test('PNG render', () => {
//   const sampleQrData = QRCode.create('sample text', { version: 2 })
//   let png: PNG

//   t.doesNotThrow(function () { png = PngRenderer.render(sampleQrData) },
//     'Should not throw with only qrData param')

//   t.ok(png instanceof PNG,
//     'Should return an instance of PNG')

//   t.equal(png.width, png.height,
//     'Should be a square image')

//   // modules: 25, margins: 4 * 2, scale: 4
//   t.equal(png.width, (25 + 4 * 2) * 4,
//     'Should have correct size')

//   t.doesNotThrow(function () {
//     png = PngRenderer.render(sampleQrData, {
//       margin: 10,
//       scale: 1
//     })
//   }, 'Should not throw with options param')

//   t.equal(png.width, png.height,
//     'Should be a square image')

//   // modules: 25, margins: 10 * 2, scale: 1
//   t.equal(png.width, 25 + 10 * 2,
//     'Should have correct size')

//   t.end()
// })

// test('PNG renderToDataURL', function (t) {
//   const sampleQrData = QRCode.create('sample text', { version: 2 })

//   t.plan(6)

//   PngRenderer.renderToDataURL(sampleQrData, function (err, url) {
//     t.ok(!err,
//       'Should not generate errors with only qrData param')

//     t.type(url, 'string',
//       'Should return a string')
//   })

//   PngRenderer.renderToDataURL(sampleQrData, { margin: 10, scale: 1 },
//     function (err, url) {
//       t.ok(!err, 'Should not generate errors with options param')

//       t.type(url, 'string',
//         'Should return a string')

//       t.equal(url.split(',')[0], 'data:image/png;base64',
//         'Should have correct header')

//       const b64png = url.split(',')[1]
//       t.equal(b64png.length % 4, 0,
//         'Should have a correct length')
//     }
//   )
// })

// test('PNG renderToFile', function (t) {
//   const sampleQrData = QRCode.create('sample text', { version: 2 })
//   const fileName = 'qrimage.png'
//   let fsStub = sinon.stub(fs, 'createWriteStream')
//   fsStub.returns(new StreamMock())

//   t.plan(5)

//   PngRenderer.renderToFile(fileName, sampleQrData, function (err) {
//     t.ok(!err,
//       'Should not generate errors with only qrData param')

//     t.equal(fsStub.getCall(0).args[0], fileName,
//       'Should save file with correct file name')
//   })

//   PngRenderer.renderToFile(fileName, sampleQrData, {
//     margin: 10,
//     scale: 1
//   }, function (err) {
//     t.ok(!err,
//       'Should not generate errors with options param')

//     t.equal(fsStub.getCall(0).args[0], fileName,
//       'Should save file with correct file name')
//   })

//   fsStub.restore()
//   fsStub = sinon.stub(fs, 'createWriteStream')
//   fsStub.returns(new StreamMock().forceErrorOnWrite())

//   PngRenderer.renderToFile(fileName, sampleQrData, function (err) {
//     t.ok(err,
//       'Should fail if error occurs during save')
//   })

//   fsStub.restore()
// })

// test('PNG renderToFileStream', function (t) {
//   const sampleQrData = QRCode.create('sample text', { version: 2 })

//   t.doesNotThrow(function () {
//     PngRenderer.renderToFileStream(new StreamMock(), sampleQrData)
//   }, 'Should not throw with only qrData param')

//   t.doesNotThrow(function () {
//     PngRenderer.renderToFileStream(new StreamMock(), sampleQrData, {
//       margin: 10,
//       scale: 1
//     })
//   }, 'Should not throw with options param')

//   t.end()
// })
