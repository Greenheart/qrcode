import { test, expect } from 'vitest'
// import { createCanvas } from 'canvas'
import QRCode from '#lib/index.js'
import * as QRCodeBrowser from '#lib/browser.js'
import * as Helpers from '#test/helpers.js'

test('toDataURL - no promise available', () => {
  Helpers.removeNativePromise()

  expect(() => {
    QRCode.toDataURL()
  }, 'Should throw if no arguments are provided').toThrow()

  expect(() => {
    QRCode.toDataURL(() => {})
  }, 'Should throw if text is not provided').toThrow()

  expect(() => {
    QRCode.toDataURL('some text')
  }, 'Should throw if a callback is not provided').toThrow()

  expect(() => {
    QRCode.toDataURL('some text', {})
  }, 'Should throw if a callback is not a function').toThrow()

  expect(() => {
    QRCodeBrowser.toDataURL()
  }, 'Should throw if no arguments are provided (browser)').toThrow()

  expect(() => {
    QRCodeBrowser.toDataURL(() => {})
  }, 'Should throw if text is not provided (browser)').toThrow()

  expect(() => {
    QRCodeBrowser.toDataURL('some text')
  }, 'Should throw if a callback is not provided (browser)').toThrow()

  expect(() => {
    QRCodeBrowser.toDataURL('some text', {})
  }, 'Should throw if a callback is not a function (browser)').toThrow()

  Helpers.restoreNativePromise()
})

test('toDataURL - image/png', () => {
  const expectedDataURL = [
    'data:image/png;base64,',
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

  expect(() => {
    QRCode.toDataURL()
  }, 'Should throw if no arguments are provided').toThrow()

  QRCode.toDataURL(
    'i am a pony!',
    {
      errorCorrectionLevel: 'L',
      type: 'image/png',
    },
    (err, url) => {
      expect(err, 'there should be no error').toBeFalsy()
      expect(url, 'url should match expected value for error correction L').toEqual(expectedDataURL)
    },
  )

  QRCode.toDataURL(
    'i am a pony!',
    {
      version: 1, // force version=1 to trigger an error
      errorCorrectionLevel: 'H',
      type: 'image/png',
    },
    (err, url) => {
      expect(err, 'there should be an error').toBeTruthy()
      expect(url, 'url should be undefined').toBeUndefined()
    },
  )

  expect(QRCode.toDataURL('i am a pony!').then, 'Should return a promise').toBeTypeOf('function')

  QRCode.toDataURL('i am a pony!', {
    errorCorrectionLevel: 'L',
    type: 'image/png',
  }).then((url) => {
    expect(url, 'url should match expected value for error correction L (promise)').toEqual(
      expectedDataURL,
    )
  })

  QRCode.toDataURL('i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'image/png',
  }).catch((err) => {
    expect(err, 'there should be an error (promise)').toBeTruthy()
  })
})

// TODO: This test is broken due to the `canvas@3.2.1` library.
// Maybe vitest browser mode could help with the browser tests?
test.todo('Canvas toDataURL - image/png', () => {
  // const expectedDataURL = [
  //   'data:image/png;base64,',
  //   'iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAABmJLR0QA/wD/AP+gvaeTAA',
  //   'AC20lEQVR4nO3dQY7jMAwEwM1i///lzGUurYtWEEknQNV1EidjNGhFpuTX+/1+/4Fff5/+',
  //   'AnwWgSAIBEEgCAJBEAiCQBAEgiAQBIEgCARBIAgCQRAIgkAQ/t0e4PV6VXyP/7a2b6yff9',
  //   'vecXq83eufPj+nVAiCQBAEgnA9hlhVt2jursGn1/hbt2OW6fNzSoUgCARBIAjlY4jV6TWu',
  //   'ex7hdt7g6TFA9zIaFYIgEASBILSPIbrdjhlWt/civn2prApBEAiCQBC+fgzR3R8xfa/kaS',
  //   'oEQSAIAkFoH0N82u/y03sVuzFJ9xhlmgpBEAiCQBDKxxDTv8u7+x9uP3/3+k+jQhAEgiAQ',
  //   'hOsxxNO/o0/7G07/fuvp83NKhSAIBEEgCK/u52VUzwNUr6Ponkc4Pb3V+1OcUiEIAkEQCE',
  //   'L5HlPT17zuPZ1ux0Dde2BVUyEIAkEQCEL5vYzTa271NfF2nUb1vMj097mlQhAEgiAQhPG1',
  //   'nbf3IqbnBXZjnuq9sKfncVYqBEEgCAJBGL+XsTqdp6g+/qr7Gr2q/n/0Q1BKIAgCQSjvqa',
  //   'z+3b07/qq6h3G6Z3P3/h1jCEoJBEEgCO3zEJ/ej3Cq+hlb3etSTqkQBIEgCATh4+YhqucF',
  //   'nu5fmD7+LRWCIBAEgSA83g+xmu45nH4m1+3nd1MhCAJBEAhC+x5T3br7I05193d0P5tchS',
  //   'AIBEEgCOXzEN1un3lV/Qyt6nUe3f0OOyoEQSAIAkEo3x+ielrj9Bq96h5z7Dx9b+eUCkEQ',
  //   'CIJAENr3mJpemzjdU7l7/7dRIQgCQRAIwvg+ldWm13Wc6t4Hs5oKQRAIgkAQvn4MUb1WdP',
  //   'q5nKevt08lowSCIBCE9jHE9F7R0/MGu7/f9lDqh+BRAkEQCML12s6n12Wcqp5n6N5X8/Tz',
  //   'zENQSiAIAkH4+v0hqKVCEASCIBAEgSAIBEEgCAJBEAiCQBAEgiAQBIEgCARBIAgCQfgBlZ',
  //   '7HAm5AupgAAAAASUVORK5CYII=',
  // ].join('')

  expect(() => {
    QRCodeBrowser.toDataURL()
  }, 'Should throw if no arguments are provided').toThrow()

  expect(() => {
    QRCodeBrowser.toDataURL(() => {})
  }, 'Should throw if text is not provided').toThrow()

  // const canvas = createCanvas(200, 200)
  // QRCodeBrowser.toDataURL(
  //   canvas,
  //   'i am a pony!',
  //   {
  //     errorCorrectionLevel: 'H',
  //     type: 'image/png',
  //   },
  //   (err, url) => {
  //     expect(err, 'there should be no error').toBeFalsy()
  //     expect(url, 'url generated should match expected value').toEqual(expectedDataURL)
  //   },
  // )

  // QRCodeBrowser.toDataURL(
  //   canvas,
  //   'i am a pony!',
  //   {
  //     version: 1, // force version=1 to trigger an error
  //     errorCorrectionLevel: 'H',
  //     type: 'image/png',
  //   },
  //   (err, url) => {
  //     expect(err, 'there should be an error').toBeTruthy()
  //     expect(url, 'url should be null').toBeNull()
  //   },
  // )

  // QRCodeBrowser.toDataURL(canvas, 'i am a pony!', {
  //   errorCorrectionLevel: 'H',
  //   type: 'image/png',
  // }).then((url) => {
  //   expect(url, 'url generated should match expected value (promise)').toEqual(expectedDataURL)
  // })

  // QRCodeBrowser.toDataURL(canvas, 'i am a pony!', {
  //   version: 1, // force version=1 to trigger an error
  //   errorCorrectionLevel: 'H',
  //   type: 'image/png',
  // }).catch((err) => {
  //   expect(err, 'there should be an error (promise)').toBeTruthy()
  // })

  // // Mock document object
  // global.document = {
  //   // @ts-expect-error Mocking the canvas element
  //   createElement: (el) => {
  //     if (el === 'canvas') {
  //       return createCanvas(200, 200)
  //     }
  //   },
  // }

  // QRCodeBrowser.toDataURL(
  //   'i am a pony!',
  //   {
  //     errorCorrectionLevel: 'H',
  //     type: 'image/png',
  //   },
  //   (err, url) => {
  //     expect(err, 'there should be no error').toBeFalsy()
  //     expect(url, 'url generated should match expected value').toEqual(expectedDataURL)
  //   },
  // )

  // QRCodeBrowser.toDataURL('i am a pony!', {
  //   errorCorrectionLevel: 'H',
  //   type: 'image/png',
  // }).then((url) => {
  //   expect(url, 'url generated should match expected value (promise)').toEqual(expectedDataURL)
  // })
})
