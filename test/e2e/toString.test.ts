import { test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
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

test('toString svg', async () => {
  const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m3 0h1m2 0h3m6 0h7M4 5.5h1m5 0h1m3 0h1m1 0h2m1 0h2m5 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m3 0h1m2 0h1m1 0h1m3 0h1m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m3 0h1m2 0h3m1 0h1m4 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h3m1 0h1m1 0h2m3 0h1m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m2 0h1m1 0h1m2 0h7m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h6m2 0h1M6 12.5h2m2 0h3m1 0h1m1 0h1m2 0h2m1 0h2m1 0h2m1 0h1M5 13.5h1m2 0h1m2 0h1m1 0h1m3 0h1m1 0h1m2 0h1m1 0h3m1 0h1m3 0h1M4 14.5h1m1 0h2m2 0h2m1 0h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1M4 15.5h1m4 0h1m1 0h1m1 0h1m1 0h4m5 0h1m2 0h1m4 0h1M5 16.5h2m1 0h3m1 0h1m2 0h6m2 0h3m1 0h1m2 0h3M4 17.5h3m1 0h1m4 0h3m2 0h1m1 0h2m1 0h1m2 0h2m1 0h2m1 0h1M4 18.5h1m1 0h3m1 0h1m1 0h4m1 0h2m2 0h3m1 0h1m1 0h3m1 0h2M4 19.5h1m4 0h1m2 0h2m1 0h1m3 0h3m3 0h2m1 0h2M4 20.5h8m1 0h1m5 0h3m2 0h2m1 0h3m2 0h1M6 21.5h1m1 0h1m4 0h4m1 0h2m1 0h3m3 0h1m1 0h1M4 22.5h1m1 0h1m3 0h1m1 0h4m1 0h1m2 0h1m3 0h1m1 0h1m1 0h3M6 23.5h2m6 0h1m1 0h1m3 0h3m2 0h2m2 0h3M5 24.5h1m1 0h2m1 0h1m1 0h1m2 0h1m3 0h2m1 0h11M12 25.5h1m2 0h1m1 0h1m2 0h1m2 0h2m3 0h2m1 0h2M4 26.5h7m1 0h1m3 0h4m1 0h4m1 0h1m1 0h1m1 0h2M4 27.5h1m5 0h1m2 0h4m1 0h1m1 0h2m2 0h1m3 0h1m3 0h1M4 28.5h1m1 0h3m1 0h1m2 0h3m2 0h1m5 0h7m1 0h1M4 29.5h1m1 0h3m1 0h1m1 0h1m5 0h2m1 0h3m4 0h2m1 0h1M4 30.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m3 0h1m2 0h1m2 0h1m1 0h1M4 31.5h1m5 0h1m4 0h3m1 0h1m3 0h2m3 0h2m1 0h1M4 32.5h7m4 0h1m2 0h3m2 0h3m1 0h1m3 0h1"/></svg>\n`

  QRCode.toString(
    'https://publiccode.eu',
    {
      version: 1, // force version=1 to trigger an error
      errorCorrectionLevel: 'H',
      type: 'svg',
    },
    (err, code) => {
      expect(err, 'there should be an error')
      expect(code, 'string should be undefined').toBeUndefined()
    },
  )

  QRCode.toString(
    'https://publiccode.eu',
    {
      errorCorrectionLevel: 'H',
      type: 'svg',
    },
    (err, code) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(code, 'should output a valid svg').toEqual(expectedSvg)
    },
  )

  await QRCode.toString('https://publiccode.eu', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'svg',
  }).catch((err) => {
    expect(err, 'there should be an error (promise)')
  })

  await QRCode.toString('https://publiccode.eu', {
    errorCorrectionLevel: 'H',
    type: 'svg',
  }).then((code) => {
    expect(code, 'should output a valid svg (promise)').toEqual(expectedSvg)
  })
})

test('toString browser svg', () => {
  const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m3 0h1m2 0h3m6 0h7M4 5.5h1m5 0h1m3 0h1m1 0h2m1 0h2m5 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m3 0h1m2 0h1m1 0h1m3 0h1m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m3 0h1m2 0h3m1 0h1m4 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h3m1 0h1m1 0h2m3 0h1m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m2 0h1m1 0h1m2 0h7m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h6m2 0h1M6 12.5h2m2 0h3m1 0h1m1 0h1m2 0h2m1 0h2m1 0h2m1 0h1M5 13.5h1m2 0h1m2 0h1m1 0h1m3 0h1m1 0h1m2 0h1m1 0h3m1 0h1m3 0h1M4 14.5h1m1 0h2m2 0h2m1 0h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1M4 15.5h1m4 0h1m1 0h1m1 0h1m1 0h4m5 0h1m2 0h1m4 0h1M5 16.5h2m1 0h3m1 0h1m2 0h6m2 0h3m1 0h1m2 0h3M4 17.5h3m1 0h1m4 0h3m2 0h1m1 0h2m1 0h1m2 0h2m1 0h2m1 0h1M4 18.5h1m1 0h3m1 0h1m1 0h4m1 0h2m2 0h3m1 0h1m1 0h3m1 0h2M4 19.5h1m4 0h1m2 0h2m1 0h1m3 0h3m3 0h2m1 0h2M4 20.5h8m1 0h1m5 0h3m2 0h2m1 0h3m2 0h1M6 21.5h1m1 0h1m4 0h4m1 0h2m1 0h3m3 0h1m1 0h1M4 22.5h1m1 0h1m3 0h1m1 0h4m1 0h1m2 0h1m3 0h1m1 0h1m1 0h3M6 23.5h2m6 0h1m1 0h1m3 0h3m2 0h2m2 0h3M5 24.5h1m1 0h2m1 0h1m1 0h1m2 0h1m3 0h2m1 0h11M12 25.5h1m2 0h1m1 0h1m2 0h1m2 0h2m3 0h2m1 0h2M4 26.5h7m1 0h1m3 0h4m1 0h4m1 0h1m1 0h1m1 0h2M4 27.5h1m5 0h1m2 0h4m1 0h1m1 0h2m2 0h1m3 0h1m3 0h1M4 28.5h1m1 0h3m1 0h1m2 0h3m2 0h1m5 0h7m1 0h1M4 29.5h1m1 0h3m1 0h1m1 0h1m5 0h2m1 0h3m4 0h2m1 0h1M4 30.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m3 0h1m2 0h1m2 0h1m1 0h1M4 31.5h1m5 0h1m4 0h3m1 0h1m3 0h2m3 0h2m1 0h1M4 32.5h7m4 0h1m2 0h3m2 0h3m1 0h1m3 0h1"/></svg>\n`

  browser.toString(
    'https://publiccode.eu',
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
    .toString('https://publiccode.eu', {
      errorCorrectionLevel: 'H',
      type: 'svg',
    })
    .then((code) => {
      expect(code, 'should output a valid svg (promise)').toEqual(expectedSvg)
    })
})

test('toString utf8', () => {
  const expectedUtf8 = [
    '                                 ',
    '                                 ',
    '    █▀▀▀▀▀█  ▄▀██ ▄▄▀ █▀▀▀▀▀█    ',
    '    █ ███ █ ██▄▀ ▄▀█▀ █ ███ █    ',
    '    █ ▀▀▀ █ █▀▀███▄▄█ █ ▀▀▀ █    ',
    '    ▀▀▀▀▀▀▀ █ ▀▄█ ▀ █ ▀▀▀▀▀▀▀    ',
    '    ▀▄█▀██▀▄▄▄▄ █▀▀ ▄▄▀█▀▀▀▄     ',
    '    █ ▀▄ ▄▀█▄▄ ██ █▀▀██  ▀ ▀█    ',
    '    █▀█ ▄█▀█▀█ ▀▀▀█▀▄▀▀█▀▄▀█▀    ',
    '    █ ▄▀█▀▀ █▄▀█▀ █▀▀ ▀██▀ ▀█    ',
    '    ▀ ▀ ▀ ▀ █  ▀▄▄ ██▀▀▀█▄▀      ',
    '    █▀▀▀▀▀█ ▄█  ▄█▀ █ ▀ █▄▀██    ',
    '    █ ███ █ ██  ▀ ▀▀▀██▀█▄███    ',
    '    █ ▀▀▀ █ ▀▄██▀ ▄██▄ ▄▄█▀ █    ',
    '    ▀▀▀▀▀▀▀ ▀▀ ▀      ▀▀▀▀▀▀▀    ',
    '                                 ',
    '                                 ',
  ].join('\n')

  QRCode.toString(
    'https://publiccode.eu',
    {
      version: 1, // force version=1 to trigger an error
      errorCorrectionLevel: 'H',
      type: 'utf8',
    },
    (err, code) => {
      expect(err, 'there should be an error')
      expect(code, 'string should be undefined').toBeUndefined()
    },
  )

  QRCode.toString(
    'https://publiccode.eu',
    {
      errorCorrectionLevel: 'M',
      type: 'utf8',
    },
    (err, code) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(code, 'should output a valid symbol').toEqual(expectedUtf8)
    },
  )

  QRCode.toString('https://publiccode.eu', (err, code) => {
    expect(err, 'There should be no error').toBeFalsy()
    expect(code, 'Should output a valid symbol with default options').toEqual(expectedUtf8)
  })

  QRCode.toString('https://publiccode.eu', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'utf8',
  }).catch((err) => {
    expect(err, 'there should be an error (promise)')
  })

  QRCode.toString('https://publiccode.eu', {
    errorCorrectionLevel: 'M',
    type: 'utf8',
  }).then((code) => {
    expect(code, 'should output a valid symbol (promise)').toEqual(expectedUtf8)
  })

  QRCode.toString('https://publiccode.eu').then((code) => {
    expect(code, 'Should output a valid symbol with default options (promise)').toEqual(
      expectedUtf8,
    )
  })
})

test('toString utf8 supports odd margins', async () => {
  await new Promise<void>((resolve, reject) => {
    QRCode.toString(
      'http://www.google.com',
      {
        errorCorrectionLevel: 'M',
        type: 'utf8',
        margin: 3,
      },
      (err, code) => {
        try {
          expect(err, 'there should be no error for odd margins').toBeFalsy()
          expect(code, 'should output a valid symbol').toBeTypeOf('string')
          expect(code?.split('\n').length, 'the output should have multiple lines').toBeGreaterThan(0)
          resolve()
        } catch (error) {
          reject(error)
        }
      },
    )
  })

  const code = await QRCode.toString('http://www.google.com', {
    errorCorrectionLevel: 'M',
    type: 'utf8',
    margin: 1,
  })

  expect(code, 'should output a valid symbol (promise)').toBeTypeOf('string')
  expect(code.split('\n').length, 'the promise output should have multiple lines').toBeGreaterThan(0)
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
