import * as QRCode from '#core/qrcode.js'
import * as TerminalRenderer from '#renderer/terminal.js'
import { test, expect } from 'vitest'

test('TerminalRenderer interface', () => {
  expect(TerminalRenderer.render, 'Should have render function').toBeTypeOf('function')
})

test('TerminalRenderer render big', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let str

  expect(() => {
    str = TerminalRenderer.render(sampleQrData)
  }, 'Should not throw with only qrData param').not.toThrow()

  expect(() => {
    str = TerminalRenderer.render(sampleQrData, {
      margin: 10,
      scale: 1,
    })
  }, 'Should not throw with options param').not.toThrow()

  expect(str, 'Should return a string').toBeTypeOf('string')

  expect(() => {
    str = TerminalRenderer.render(sampleQrData, { inverse: true })
  }, 'Should not throw with inverse options').not.toThrow()

  expect(str, 'Should return a string if inverse option is set').toBeTypeOf('string')
})

test('TerminalRenderer render small', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let str
  let calledCallback = false
  const callback = () => {
    calledCallback = true
  }

  expect(() => {
    str = TerminalRenderer.render(sampleQrData)
  }, 'Should not throw with only qrData param').not.toThrow()

  expect(() => {
    str = TerminalRenderer.render(sampleQrData, {
      margin: 10,
      scale: 1,
      small: true,
    })
  }, 'Should not throw with options param and without callback').not.toThrow()

  expect(() => {
    str = TerminalRenderer.render(
      sampleQrData,
      {
        margin: 10,
        scale: 1,
        small: true,
      },
      callback,
    )
  }, 'Should not throw with options param and callback').not.toThrow()

  expect(str, 'string', 'Should return a string').toBeTypeOf('string')

  expect(calledCallback, 'Should call a callback').toEqual(true)

  expect(() => {
    str = TerminalRenderer.render(sampleQrData, { small: true, inverse: true })
  }, 'Should not throw with inverse options').not.toThrow()

  expect(str, 'string', 'Should return a string if inverse option is set').toBeTypeOf('string')
})
