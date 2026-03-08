import { test, expect } from 'vitest'
import sinon from 'sinon'
import fs from 'fs'

import * as QRCode from '#core/qrcode.js'
import * as Utf8Renderer from '#renderer/utf8.js'

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


test.skip('Utf8 renderToFile', () => {
  // TODO: Broken test due to mixed Node.js and non-Node.js environment in the UTF-8 renderer.
  // See the renderToFile() method for suggested resolution.
  // NOTE: This might be possible to solve with better mocking of the file system calls

  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const fileName = 'qrimage.txt'
  let fsStub = sinon.stub(fs, 'writeFile').callsArg(2)

  Utf8Renderer.renderToFile(fileName, sampleQrData, (err) => {
    expect(err, 'Should not generate errors with only qrData param').toBeFalsy()

    expect(fsStub.getCall(0).args[0], 'Should save file with correct file name').toEqual(fileName)
  })

  Utf8Renderer.renderToFile(
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
  fsStub = sinon.stub(fs, 'writeFile').callsArgWith(2, new Error())

  Utf8Renderer.renderToFile(fileName, sampleQrData, (err) => {
    expect(err, 'Should fail if error occurs during save').toBeTruthy()
  })

  fsStub.restore()
})
