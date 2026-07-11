import { test, expect, vi, beforeEach } from 'vitest'
import { vol } from 'memfs'
import QRCode from '#lib/index.ts'
import * as Helpers from '#test/helpers.js'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
  vol.mkdirSync(process.cwd(), { recursive: true })
})

test('toFile - no promise available', () => {
  Helpers.removeNativePromise()
  const fileName = 'qrimage1.png'

  expect(() => {
    QRCode.toFile(fileName, 'some text')
  }, 'Should throw if a callback is not provided').toThrow()

  expect(() => {
    QRCode.toFile(fileName, 'some text', {})
  }, 'Should throw if a callback is not a function').toThrow()

  Helpers.restoreNativePromise()
})

test('toFile', async () => {
  const fileName = 'qrimage2.png'

  expect(() => {
    QRCode.toFile('some text', () => {})
  }, 'Should throw if path is not provided').toThrow()

  expect(() => {
    QRCode.toFile(fileName)
  }, 'Should throw if text is not provided').toThrow()

  await new Promise<void>((resolve) => {
    const promise = QRCode.toFile(fileName, 'some text')
    expect(promise.then, 'Should return a promise').toBeTypeOf('function')
    promise.then(resolve)
  })
})

test('toFile png', async () => {
  const expectedBase64Output = [
    'iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKzSU',
    'RBVO3BQW7kQAwEwSxC//9y7h55akCQxvYQjIj/scYo1ijFGqVYoxRrlGKNUqxRijVKsUYp',
    '1ijFGqVYoxRrlGKNUqxRijXKxUNJ+EkqdyShU+mS0Kl0SfhJKk8Ua5RijVKsUS5epvKmJD',
    'yh8iaVNyXhTcUapVijFGuUiw9Lwh0qdyShU+mS0Kl0Kk8k4Q6VTyrWKMUapVijXHw5lROV',
    'kyR0Kt+sWKMUa5RijXIxTBI6lS4JkxVrlGKNUqxRLj5M5Tcl4UTlCZW/pFijFGuUYo1y8b',
    'Ik/KQkdCpdEjqVLgmdykkS/rJijVKsUYo1ysVDKt9M5UTlmxRrlGKNUqxRLh5Kwh0qXRJ+',
    'UxLuULkjCZ3KJxVrlGKNUqxRLh5S6ZLQqXRJ6FS6JHQqXRKeSEKn0iWhUzlJwolKl4QTlS',
    'eKNUqxRinWKBe/LAmdSpeETuUkCZ1Kl4QTlS4Jd6h0SehUuiS8qVijFGuUYo1y8WFJ6FS6',
    'JJyofFISOpVOpUtCp3KicqLypmKNUqxRijXKxYep3JGEE5UuCZ3KHSp3qHRJ6FR+U7FGKd',
    'YoxRol/scXS8ITKidJeEKlS8KJyhPFGqVYoxRrlIuHkvCTVE5U7kjCicpJEk6S8JOKNUqx',
    'RinWKBcvU3lTEu5IwolKp/KEyh1J6FTeVKxRijVKsUa5+LAk3KHyJpWTJHQqdyShU/lNxR',
    'qlWKMUa5SLL6fSJaFLwhNJeCIJP6lYoxRrlGKNcvHlknCicpKEE5UuCSdJOFHpktCpPFGs',
    'UYo1SrFGufgwlZ+k0iWhU+lUnlDpktCpdEnoVN5UrFGKNUqxRrl4WRL+EpU7ktCpdCpdEj',
    'qVO5LQqTxRrFGKNUqxRon/scYo1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN',
    'UqxRijXKP0OHEepgrecVAAAAAElFTkSuQmCC',
  ].join('')

  await new Promise<void>((resolve) => {
    const fileName = 'qr1.png'
    QRCode.toFile(
      fileName,
      'i am a pony!',
      {
        errorCorrectionLevel: 'L',
      },
      (err) => {
        expect(err, 'There should be no error').toBeFalsy()

        expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)

        const base64Output = vol.readFileSync(fileName).toString('base64')
        expect(base64Output, 'Should write correct content').toEqual(expectedBase64Output)
        resolve()
      },
    )
  })

  await new Promise<void>((resolve) => {
    const fileName = 'qr2.png'
    QRCode.toFile(
      fileName,
      'i am a pony!',
      {
        errorCorrectionLevel: 'L',
        type: 'png',
      },
      (err) => {
        expect(err, 'There should be no errors if file type is specified').toBeFalsy()
        resolve()
      },
    )
  })

  const fileName = 'qr3.png'

  await QRCode.toFile(fileName, 'i am a pony!', {
    errorCorrectionLevel: 'L',
  }).then(() => {
    expect(vol.existsSync(fileName), 'Should save file with correct file name (promise)').toBe(true)

    const base64Output = vol.readFileSync(fileName).toString('base64')
    expect(base64Output, 'Should write correct content (promise)').toEqual(expectedBase64Output)
  })
})

test('toFile svg', async () => {
  const expectedOutput = `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m3 0h1m2 0h3m6 0h7M4 5.5h1m5 0h1m3 0h1m1 0h2m1 0h2m5 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m3 0h1m2 0h1m1 0h1m3 0h1m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m3 0h1m2 0h3m1 0h1m4 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h3m1 0h1m1 0h2m3 0h1m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m2 0h1m1 0h1m2 0h7m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h6m2 0h1M6 12.5h2m2 0h3m1 0h1m1 0h1m2 0h2m1 0h2m1 0h2m1 0h1M5 13.5h1m2 0h1m2 0h1m1 0h1m3 0h1m1 0h1m2 0h1m1 0h3m1 0h1m3 0h1M4 14.5h1m1 0h2m2 0h2m1 0h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1M4 15.5h1m4 0h1m1 0h1m1 0h1m1 0h4m5 0h1m2 0h1m4 0h1M5 16.5h2m1 0h3m1 0h1m2 0h6m2 0h3m1 0h1m2 0h3M4 17.5h3m1 0h1m4 0h3m2 0h1m1 0h2m1 0h1m2 0h2m1 0h2m1 0h1M4 18.5h1m1 0h3m1 0h1m1 0h4m1 0h2m2 0h3m1 0h1m1 0h3m1 0h2M4 19.5h1m4 0h1m2 0h2m1 0h1m3 0h3m3 0h2m1 0h2M4 20.5h8m1 0h1m5 0h3m2 0h2m1 0h3m2 0h1M6 21.5h1m1 0h1m4 0h4m1 0h2m1 0h3m3 0h1m1 0h1M4 22.5h1m1 0h1m3 0h1m1 0h4m1 0h1m2 0h1m3 0h1m1 0h1m1 0h3M6 23.5h2m6 0h1m1 0h1m3 0h3m2 0h2m2 0h3M5 24.5h1m1 0h2m1 0h1m1 0h1m2 0h1m3 0h2m1 0h11M12 25.5h1m2 0h1m1 0h1m2 0h1m2 0h2m3 0h2m1 0h2M4 26.5h7m1 0h1m3 0h4m1 0h4m1 0h1m1 0h1m1 0h2M4 27.5h1m5 0h1m2 0h4m1 0h1m1 0h2m2 0h1m3 0h1m3 0h1M4 28.5h1m1 0h3m1 0h1m2 0h3m2 0h1m5 0h7m1 0h1M4 29.5h1m1 0h3m1 0h1m1 0h1m5 0h2m1 0h3m4 0h2m1 0h1M4 30.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m3 0h1m2 0h1m2 0h1m1 0h1M4 31.5h1m5 0h1m4 0h3m1 0h1m3 0h2m3 0h2m1 0h1M4 32.5h7m4 0h1m2 0h3m2 0h3m1 0h1m3 0h1"/></svg>\n`

  await new Promise<void>((resolve) => {
    const fileName = 'qrimage.svg'
    QRCode.toFile(
      fileName,
      'https://publiccode.eu',
      {
        errorCorrectionLevel: 'H',
      },
      (err) => {
        expect(err, 'There should be no error').toBeFalsy()
        expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)
        expect(vol.readFileSync(fileName, 'utf-8'), 'Should write correct content').toEqual(
          expectedOutput,
        )
        resolve()
      },
    )
  })

  await new Promise<void>((resolve) => {
    const fileName2 = 'qrimage2.svg'
    QRCode.toFile(
      fileName2,
      'https://publiccode.eu',
      {
        errorCorrectionLevel: 'H',
        type: 'svg',
      },
      (err) => {
        expect(err, 'There should be no errors if file type is specified').toBeFalsy()
        resolve()
      },
    )
  })

  const fileName3 = 'qrimage3.svg'
  await QRCode.toFile(fileName3, 'https://publiccode.eu', {
    errorCorrectionLevel: 'H',
  }).then(() => {
    expect(vol.existsSync(fileName3), 'Should save file with correct filename (promise)').toBe(true)

    expect(vol.readFileSync(fileName3, 'utf-8'), 'Should write correct content (promise)').toEqual(
      expectedOutput,
    )
  })
})

test('toFile utf8', async () => {
  const expectedOutput = [
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

  await new Promise<void>((resolve) => {
    const fileName = 'qrimage-utf8.txt'

    QRCode.toFile(fileName, 'https://publiccode.eu', (err) => {
      expect(err, 'There should be no error').toBeFalsy()
      expect(vol.existsSync(fileName), 'Should save file with correct file name').toBe(true)
      expect(vol.readFileSync(fileName, 'utf-8'), 'Should write correct content').toEqual(
        expectedOutput,
      )
      resolve()
    })
  })

  await new Promise<void>((resolve) => {
    const fileName2 = 'qr2.txt'

    QRCode.toFile(
      fileName2,
      'https://publiccode.eu',
      {
        errorCorrectionLevel: 'M',
        type: 'utf8',
      },
      (err) => {
        expect(err, 'There should be no errors if file type is specified').toBeFalsy()
        resolve()
      },
    )
  })

  const fileName3 = 'qr3.txt'
  await QRCode.toFile(fileName3, 'https://publiccode.eu').then(() => {
    expect(vol.existsSync(fileName3), 'Should save file with correct filename (promise)').toBe(true)
    expect(vol.readFileSync(fileName3, 'utf-8'), 'Should write correct content (promise)').toEqual(
      expectedOutput,
    )
  })
})

test('toFile manual segments', async () => {
  const fileName = 'qrimage-manual-segments.txt'
  const segments = [
    { data: 'ABCDEFG', mode: 'alphanumeric' },
    { data: '0123456', mode: 'numeric' },
  ]
  const expectedOutput = [
    '                             ',
    '                             ',
    '    █▀▀▀▀▀█ ██▀██ █▀▀▀▀▀█    ',
    '    █ ███ █  █▀█▄ █ ███ █    ',
    '    █ ▀▀▀ █ █ ▄ ▀ █ ▀▀▀ █    ',
    '    ▀▀▀▀▀▀▀ █▄█▄▀ ▀▀▀▀▀▀▀    ',
    '    ▀██ ▄▀▀▄█▀▀▀▀██▀▀▄ █▀    ',
    '     ▀█▀▀█▀█▄ ▄ ▄█▀▀▀█▀      ',
    '    ▀ ▀▀▀ ▀ ▄▀ ▄ ▄▀▄  ▀▄     ',
    '    █▀▀▀▀▀█ ▄  █▀█ ▀▀▀▄█▄    ',
    '    █ ███ █  █▀▀▀ ██▀▀ ▀▀    ',
    '    █ ▀▀▀ █ ██  ▄▀▀▀▀▄▀▀█    ',
    '    ▀▀▀▀▀▀▀ ▀    ▀▀▀▀ ▀▀▀    ',
    '                             ',
    '                             ',
  ].join('\n')

  await new Promise<void>((resolve) => {
    QRCode.toFile(
      fileName,
      segments,
      {
        errorCorrectionLevel: 'L',
      },
      (err) => {
        expect(err, 'There should be no errors if text is not string').toBeFalsy()
        expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)
        expect(vol.readFileSync(fileName, 'utf-8'), 'Should write correct content').toEqual(
          expectedOutput,
        )
        resolve()
      },
    )
  })
})
