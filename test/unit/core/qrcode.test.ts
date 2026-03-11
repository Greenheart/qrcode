import { test, expect } from 'vitest'
import * as ECLevel from '#core/error-correction-level.ts'
import * as Version from '#core/version.ts'
import * as Mode from '#core/mode.ts'
import * as QRCode from '#core/qrcode.ts'
import toSJIS from '#helper/to-sjis.ts'
import { arrayWithLength } from '#test/helpers.js'

test('QRCode interface', () => {
  expect(QRCode.create, 'Should have "create" function').toBeTypeOf('function')
  expect(() => {
    // @ts-expect-error Testing invalid empty input
    QRCode.create()
  }, 'Should throw if no data is provided').toThrow()
  expect(() => {
    QRCode.create('1234567')
  }, 'Should not throw').not.toThrow()

  let qr = QRCode.create('a123456A', {
    version: 1,
    maskPattern: 1,
    errorCorrectionLevel: 'H',
  })
  expect(qr.modules.size, 'Should return correct modules count').toEqual(21)
  expect(qr.maskPattern, 'Should return correct mask pattern').toEqual(1)

  const darkModule = qr.modules.get(qr.modules.size - 8, 8)
  expect(darkModule, 'Should have a dark module at coords [size-8][8]').toEqual(1)

  expect(() => {
    // @ts-expect-error Testing invalid input data
    qr = QRCode.create({})
  }, 'Should throw if invalid data is passed').toThrow()

  expect(() => {
    qr = QRCode.create('AAAAA00000', { version: 5 })
  }, 'Should accept data as string').not.toThrow()

  expect(() => {
    qr = QRCode.create(
      [
        { data: 'ABCDEFG', mode: 'alphanumeric' },
        { data: 'abcdefg' },
        { data: '晒三', mode: 'kanji' },
        { data: '0123456', mode: 'numeric' },
      ],
      { toSJISFunc: toSJIS },
    )
  }, 'Should accept data as array of objects').not.toThrow()

  expect(() => {
    qr = QRCode.create('AAAAA00000', { errorCorrectionLevel: 'quartile' })
    qr = QRCode.create('AAAAA00000', { errorCorrectionLevel: 'q' })
  }, 'Should accept errorCorrectionLevel as string').not.toThrow()
})

test('QRCode error correction', () => {
  let qr: ReturnType<typeof QRCode.create>
  const ecValues = [
    { name: ['l', 'low'], level: ECLevel.L },
    { name: ['m', 'medium'], level: ECLevel.M },
    { name: ['q', 'quartile'], level: ECLevel.Q },
    { name: ['h', 'high'], level: ECLevel.H },
  ]

  for (let l = 0; l < ecValues.length; l++) {
    for (let i = 0; i < ecValues[l].name.length; i++) {
      expect(() => {
        qr = QRCode.create('ABCDEFG', { errorCorrectionLevel: ecValues[l].name[i] })
      }, 'Should accept errorCorrectionLevel value: ' + ecValues[l].name[i]).not.toThrow()

      expect(
        qr.errorCorrectionLevel,
        'Should have correct errorCorrectionLevel value',
      ).toStrictEqual(ecValues[l].level)

      expect(() => {
        qr = QRCode.create('ABCDEFG', { errorCorrectionLevel: ecValues[l].name[i].toUpperCase() })
      }, 'Should accept errorCorrectionLevel value: ' + ecValues[l].name[i].toUpperCase()).not.toThrow()

      expect(
        qr.errorCorrectionLevel,
        'Should have correct errorCorrectionLevel value',
      ).toStrictEqual(ecValues[l].level)
    }
  }

  // TODO: Indicate that options are optional when fixing types for QRCode.create()
  qr = QRCode.create('ABCDEFG')
  expect(qr.errorCorrectionLevel, 'Should set default EC level to M').toEqual(ECLevel.M)
})

test('QRCode version', () => {
  let qr = QRCode.create('data', { version: 9, errorCorrectionLevel: 'M' })

  expect(qr.version, 'Should create qrcode with correct version').toEqual(9)
  expect(qr.errorCorrectionLevel, 'Should set correct EC level').toEqual(ECLevel.M)

  expect(() => {
    qr = QRCode.create(arrayWithLength(Version.getCapacity(2, ECLevel.H, Mode.BYTE)).join('a'), {
      version: 1,
      errorCorrectionLevel: 'H',
    })
  }, 'Should throw if data cannot be contained with chosen version').toThrow()

  expect(() => {
    qr = QRCode.create(
      arrayWithLength(Version.getCapacity(40, ECLevel.H, Mode.BYTE) + 2).join('a'),
      {
        version: 40,
        errorCorrectionLevel: 'H',
      },
    )
  }, 'Should throw if data cannot be contained in a qr code').toThrow()

  expect(() => {
    qr = QRCode.create('abcdefg', { version: 'invalid' })
  }, 'Should use best version if the one provided is invalid').not.toThrow()
})

test('QRCode capacity', () => {
  let qr: ReturnType<typeof QRCode.create>

  qr = QRCode.create([{ data: 'abcdefg', mode: 'byte' }])
  expect(qr.version, 'Should contain 7 byte characters').toEqual(1)

  qr = QRCode.create([{ data: '12345678901234567', mode: 'numeric' }])
  expect(qr.version, 'Should contain 17 numeric characters').toEqual(1)

  qr = QRCode.create([{ data: 'ABCDEFGHIL', mode: 'alphanumeric' }])
  expect(qr.version, 'Should contain 10 alphanumeric characters').toEqual(1)

  qr = QRCode.create([{ data: 'ＡＩぐサ', mode: 'kanji' }], { toSJISFunc: toSJIS })
  expect(qr.version, 'Should contain 4 kanji characters').toEqual(1)
})
