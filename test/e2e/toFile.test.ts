import { test, expect } from 'vitest'
import fs, { WriteStream } from 'fs'
import path from 'path'
import os from 'os'
import sinon from 'sinon'
import QRCode from '#lib/index.js'
import * as Helpers from '#test/helpers.js'
import StreamMock from '#test/mocks/writable-stream.js'

test('toFile - no promise available', () => {
  Helpers.removeNativePromise()
  const fileName = path.join(os.tmpdir(), 'qrimage.png')

  expect(() => {
    QRCode.toFile(fileName, 'some text')
  }, 'Should throw if a callback is not provided').toThrow()

  expect(() => {
    QRCode.toFile(fileName, 'some text', {})
  }, 'Should throw if a callback is not a function').toThrow()

  Helpers.restoreNativePromise()
})

test('toFile', () => {
  const fileName = path.join(os.tmpdir(), 'qrimage.png')

  expect(() => {
    QRCode.toFile('some text', () => {})
  }, 'Should throw if path is not provided').toThrow()

  expect(() => {
    QRCode.toFile(fileName)
  }, 'Should throw if text is not provided').toThrow()

  expect(QRCode.toFile(fileName, 'some text').then, 'Should return a promise').toBeTypeOf(
    'function',
  )
})

test('toFile png', () => {
  const fileName = path.join(os.tmpdir(), 'qrimage.png')
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

  QRCode.toFile(
    fileName,
    'i am a pony!',
    {
      errorCorrectionLevel: 'L',
    },
    (err) => {
      expect(err, 'There should be no error').toBeFalsy()

      fs.stat(fileName, (err) => {
        expect(err, 'Should save file with correct file name').toBeFalsy()
      })

      fs.readFile(fileName, (err, buffer) => {
        if (err) throw err

        expect(buffer.toString('base64'), 'Should write correct content').toEqual(
          expectedBase64Output,
        )
      })
    },
  )

  QRCode.toFile(
    fileName,
    'i am a pony!',
    {
      errorCorrectionLevel: 'L',
      type: 'png',
    },
    (err) => {
      expect(err, 'There should be no errors if file type is specified').toBeFalsy()
    },
  )

  QRCode.toFile(fileName, 'i am a pony!', {
    errorCorrectionLevel: 'L',
  }).then(() => {
    fs.stat(fileName, (err) => {
      expect(err, 'Should save file with correct file name (promise)').toBeFalsy()
    })

    fs.readFile(fileName, (err, buffer) => {
      if (err) throw err

      expect(buffer.toString('base64'), 'Should write correct content (promise)').toEqual(
        expectedBase64Output,
      )
    })
  })

  const fsStub = sinon.stub(fs, 'createWriteStream')
  fsStub.returns(new StreamMock().forceErrorOnWrite() as unknown as WriteStream)

  QRCode.toFile(
    fileName,
    'i am a pony!',
    {
      errorCorrectionLevel: 'L',
    },
    (err) => {
      expect(err, 'There should be an error').toBeTruthy()
    },
  )

  QRCode.toFile(fileName, 'i am a pony!', {
    errorCorrectionLevel: 'L',
  }).catch((err) => {
    expect(err, 'Should catch an error (promise)').toBeTruthy()
  })

  fsStub.restore()
})

test('toFile svg', () => {
  const fileName = path.join(os.tmpdir(), 'qrimage.svg')
  const expectedOutput = fs.readFileSync(
    path.join(import.meta.dirname, '/svg.expected.out'),
    'utf-8',
  )

  QRCode.toFile(
    fileName,
    'http://www.google.com',
    {
      errorCorrectionLevel: 'H',
    },
    (err) => {
      expect(err, 'There should be no error').toBeFalsy()

      fs.stat(fileName, (err) => {
        expect(err, 'Should save file with correct file name').toBeFalsy()
      })

      fs.readFile(fileName, 'utf8', (err, content) => {
        if (err) throw err
        expect(content, 'Should write correct content').toEqual(expectedOutput)
      })
    },
  )

  QRCode.toFile(
    fileName,
    'http://www.google.com',
    {
      errorCorrectionLevel: 'H',
      type: 'svg',
    },
    (err) => {
      expect(err, 'There should be no errors if file type is specified').toBeFalsy()
    },
  )

  QRCode.toFile(fileName, 'http://www.google.com', {
    errorCorrectionLevel: 'H',
  }).then(() => {
    fs.stat(fileName, (err) => {
      expect(err, 'Should save file with correct file name (promise)').toBeFalsy()
    })

    fs.readFile(fileName, 'utf8', (err, content) => {
      if (err) throw err
      expect(content, 'Should write correct content (promise)').toEqual(expectedOutput)
    })
  })
})

test('toFile utf8', () => {
  const fileName = path.join(os.tmpdir(), 'qrimage.txt')
  const expectedOutput = [
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

  QRCode.toFile(fileName, 'http://www.google.com', (err) => {
    expect(err, 'There should be no error').toBeFalsy()

    fs.stat(fileName, (err) => {
      expect(err, 'Should save file with correct file name').toBeFalsy()
    })

    fs.readFile(fileName, 'utf8', (err, content) => {
      if (err) throw err
      expect(content, 'Should write correct content').toEqual(expectedOutput)
    })
  })

  QRCode.toFile(
    fileName,
    'http://www.google.com',
    {
      errorCorrectionLevel: 'M',
      type: 'utf8',
    },
    (err) => {
      expect(err, 'There should be no errors if file type is specified').toBeFalsy()
    },
  )

  QRCode.toFile(fileName, 'http://www.google.com').then(() => {
    fs.stat(fileName, (err) => {
      expect(err, 'Should save file with correct file name (promise)').toBeFalsy()
    })

    fs.readFile(fileName, 'utf8', (err, content) => {
      if (err) throw err
      expect(content, 'Should write correct content (promise)').toEqual(expectedOutput)
    })
  })
})

test('toFile manual segments', () => {
  const fileName = path.join(os.tmpdir(), 'qrimage-manual-segments.txt')
  const segs = [
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

  QRCode.toFile(
    fileName,
    segs,
    {
      errorCorrectionLevel: 'L',
    },
    (err) => {
      expect(err, 'There should be no errors if text is not string').toBeFalsy()

      fs.stat(fileName, (err) => {
        expect(err, 'Should save file with correct file name').toBeFalsy()
      })

      fs.readFile(fileName, 'utf8', (err, content) => {
        if (err) throw err
        expect(content, 'Should write correct content').toEqual(expectedOutput)
      })
    },
  )
})
