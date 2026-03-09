import { test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import QRCode from '#lib/index.ts'
import * as browser from '#lib/browser.ts'
import * as Helpers from '#test/helpers.js'

test('toString - no promise available', () => {
  Helpers.removeNativePromise()

  expect(() => {
    QRCode.toString()
  }, 'Should throw if text is not provided').toThrow()

  expect(() => {
    QRCode.toString('some text')
  }, 'Should throw if a callback is not provided').toThrow()

  expect(() => {
    QRCode.toString('some text', {})
  }, 'Should throw if a callback is not a function').toThrow()

  expect(() => {
    QRCode.toString()
  }, 'Should throw if text is not provided (browser)').toThrow()

  expect(() => {
    browser.toString('some text')
  }, 'Should throw if a callback is not provided (browser)').toThrow()

  expect(() => {
    browser.toString('some text', {})
  }, 'Should throw if a callback is not a function (browser)').toThrow()

  Helpers.restoreNativePromise()
})

test('toString', () => {
  expect(() => {
    QRCode.toString()
  }, 'Should throw if text is not provided').toThrow()

  QRCode.toString('some text', (err, str) => {
    expect(err, 'There should be no error').toBeFalsy()
    expect(str, 'Should return a string').toBeTypeOf('string')
  })

  expect(QRCode.toString('some text').then, 'Should return a promise').toBeTypeOf('function')

  QRCode.toString('some text', { errorCorrectionLevel: 'L' }).then((str) => {
    expect(str, 'Should return a string').toBeTypeOf('string')
  })
})

test('toString (browser)', () => {
  expect(() => {
    browser.toString()
  }, 'Should throw if text is not provided').toThrow()

  browser.toString('some text', (err, str) => {
    expect(err, 'There should be no error (browser)').toBeFalsy()
    expect(str, 'Should return a string (browser)').toBeTypeOf('string')
  })

  expect(browser.toString('some text').then, 'Should return a promise').toBeTypeOf('function')

  browser.toString('some text', { errorCorrectionLevel: 'L' }).then((str) => {
    expect(str, 'Should return a string').toBeTypeOf('string')
  })
})

test('toString svg', () => {
  const file = path.join(import.meta.dirname, '/svgtag.expected.out')

  QRCode.toString(
    'http://www.google.com',
    {
      version: 1, // force version=1 to trigger an error
      errorCorrectionLevel: 'H',
      type: 'svg',
    },
    (err, code) => {
      expect(err, 'there should be an error ')
      expect(code, 'string should be undefined').toBeUndefined()
    },
  )

  fs.readFile(file, 'utf8', (err, expectedSvg) => {
    if (err) throw err

    QRCode.toString(
      'http://www.google.com',
      {
        errorCorrectionLevel: 'H',
        type: 'svg',
      },
      (err, code) => {
        expect(err, 'There should be no error').toBeFalsy()
        expect(code, 'should output a valid svg').toEqual(expectedSvg)
      },
    )
  })

  QRCode.toString('http://www.google.com', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'svg',
  }).catch((err) => {
    expect(err, 'there should be an error (promise)')
  })

  fs.readFile(file, 'utf8', (err, expectedSvg) => {
    if (err) throw err

    QRCode.toString('http://www.google.com', {
      errorCorrectionLevel: 'H',
      type: 'svg',
    }).then((code) => {
      expect(code, 'should output a valid svg (promise)').toEqual(expectedSvg)
    })
  })
})

test('toString browser svg', () => {
  const file = path.join(import.meta.dirname, '/svgtag.expected.out')

  fs.readFile(file, 'utf8', (err, expectedSvg) => {
    if (err) throw err

    browser.toString(
      'http://www.google.com',
      {
        errorCorrectionLevel: 'H',
        type: 'svg',
      },
      (err, code) => {
        expect(err, 'There should be no error').toBeFalsy()
        expect(code, 'should output a valid svg').toEqual(expectedSvg)
      },
    )

    browser
      .toString('http://www.google.com', {
        errorCorrectionLevel: 'H',
        type: 'svg',
      })
      .then((code) => {
        expect(code, 'should output a valid svg (promise)').toEqual(expectedSvg)
      })
  })
})

test('toString utf8', () => {
  const expectedUtf8 = [
    '                                 ',
    '                                 ',
    '    █▀▀▀▀▀█ █ ▄█  ▀ █ █▀▀▀▀▀█    ',
    '    █ ███ █ ▀█▄▀▄█ ▀▄ █ ███ █    ',
    '    █ ▀▀▀ █ ▀▄ ▄ ▄▀ █ █ ▀▀▀ █    ',
    '    ▀▀▀▀▀▀▀ ▀ ▀ █▄▀ █ ▀▀▀▀▀▀▀    ',
    '    ▀▄ ▀▀▀▀█▀▀█▄ ▄█▄▀█ ▄█▄██▀    ',
    '    █▄ ▄▀▀▀▄▄█ █▀▀▄█▀ ▀█ █▄▄█    ',
    '    █▄ ▄█▄▀█▄▄  ▀ ▄██▀▀ ▄  ▄▀    ',
    '    █▀▄▄▄▄▀▀█▀▀█▀▀▀█ ▀ ▄█▀█▀█    ',
    '    ▀ ▀▀▀▀▀▀███▄▄▄▀ █▀▀▀█ ▀█     ',
    '    █▀▀▀▀▀█ █▀█▀▄ ▄▄█ ▀ █▀ ▄█    ',
    '    █ ███ █ █ █ ▀▀██▀███▀█ ██    ',
    '    █ ▀▀▀ █  █▀ ▀ █ ▀▀▄██ ███    ',
    '    ▀▀▀▀▀▀▀ ▀▀▀  ▀▀ ▀    ▀  ▀    ',
    '                                 ',
    '                                 ',
  ].join('\n')

  QRCode.toString(
    'http://www.google.com',
    {
      version: 1, // force version=1 to trigger an error
      errorCorrectionLevel: 'H',
      type: 'utf8',
    },
    (err, code) => {
      expect(err, 'there should be an error ')
      expect(code, 'string should be undefined').toBeUndefined()
    },
  )

  QRCode.toString(
    'http://www.google.com',
    {
      errorCorrectionLevel: 'M',
      type: 'utf8',
    },
    (err, code) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(code, 'should output a valid symbol').toEqual(expectedUtf8)
    },
  )

  QRCode.toString('http://www.google.com', (err, code) => {
    expect(err, 'There should be no error').toBeFalsy()
    expect(code, 'Should output a valid symbol with default options').toEqual(expectedUtf8)
  })

  QRCode.toString('http://www.google.com', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'utf8',
  }).catch((err) => {
    expect(err, 'there should be an error (promise)')
  })

  QRCode.toString('http://www.google.com', {
    errorCorrectionLevel: 'M',
    type: 'utf8',
  }).then((code) => {
    expect(code, 'should output a valid symbol (promise)').toEqual(expectedUtf8)
  })

  QRCode.toString('http://www.google.com').then((code) => {
    expect(code, 'Should output a valid symbol with default options (promise)').toEqual(
      expectedUtf8,
    )
  })
})

test('toString terminal', () => {
  const expectedTerminal =
    fs.readFileSync(path.join(import.meta.dirname, '/terminal.expected.out')) + ''

  QRCode.toString(
    'http://www.google.com',
    {
      errorCorrectionLevel: 'M',
      type: 'terminal',
    },
    (err, code) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(code + '\n', 'should output a valid symbol').toEqual(expectedTerminal)
    },
  )

  QRCode.toString('http://www.google.com', {
    errorCorrectionLevel: 'M',
    type: 'terminal',
  }).then((code) => {
    expect(code + '\n', 'should output a valid symbol (promise)').toEqual(expectedTerminal)
  })
})

test('toString byte-input', () => {
  const expectedOutput = [
    '                             ',
    '                             ',
    '    █▀▀▀▀▀█  █▄█▀ █▀▀▀▀▀█    ',
    '    █ ███ █ ▀█ █▀ █ ███ █    ',
    '    █ ▀▀▀ █   ▀ █ █ ▀▀▀ █    ',
    '    ▀▀▀▀▀▀▀ █▄▀▄█ ▀▀▀▀▀▀▀    ',
    '    ▀██▄██▀▀▀█▀▀ ▀█  ▄▀▄     ',
    '    ▀█▀▄█▄▀▄ ██ ▀ ▄ ▀▄  ▀    ',
    '    ▀ ▀ ▀▀▀▀█▄ ▄▀▄▀▄▀▄▀▄▀    ',
    '    █▀▀▀▀▀█ █  █▄█▀█▄█  ▀    ',
    '    █ ███ █ ▀█▀▀ ▀██  ▀█▀    ',
    '    █ ▀▀▀ █ ██▀ ▀ ▄ ▀▄▀▄▀    ',
    '    ▀▀▀▀▀▀▀ ▀▀▀ ▀ ▀▀▀ ▀▀▀    ',
    '                             ',
    '                             ',
  ].join('\n')
  const byteInput = new Uint8ClampedArray([1, 2, 3, 4, 5])

  QRCode.toString(
    [{ data: byteInput, mode: 'byte' }],
    { errorCorrectionLevel: 'L' },
    (err, code) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(code, 'should output the correct code').toEqual(expectedOutput)
    },
  )
})
