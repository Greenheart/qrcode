import { test, expect } from 'vitest'
import sinon from 'sinon'
import QRCode from '#lib/index.js'
import StreamMock from '../mocks/writable-stream.js'

test('toFileStream png', () => {
  expect(() => {
    QRCode.toFileStream('some text')
  }, 'Should throw if stream is not provided').toThrow()

  expect(() => {
    QRCode.toFileStream(new StreamMock())
  }, 'Should throw if text is not provided').toThrow()

  const fstream = new StreamMock()
  const spy = sinon.spy(fstream, 'emit')

  QRCode.toFileStream(fstream, 'i am a pony!')

  QRCode.toFileStream(fstream, 'i am a pony!', {
    type: 'image/png',
  })

  expect(spy.neverCalledWith('error'), 'There should be no error')

  spy.restore()
})

test('toFileStream png with write error', () => {
  const fstreamErr = new StreamMock().forceErrorOnWrite()
  QRCode.toFileStream(fstreamErr, 'i am a pony!')

  fstreamErr.on('error', (e) => {
    expect(e, 'Should return an error').toBeTruthy()
  })
})

test('toFileStream png with qrcode error', () => {
  const fstreamErr = new StreamMock()
  const bigString = Array(200).join('i am a pony!')

  fstreamErr.on('error', (e) => {
    expect(e, 'Should return an error').toBeTruthy()
  })

  QRCode.toFileStream(fstreamErr, bigString)
  QRCode.toFileStream(fstreamErr, 'i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
  })
})
