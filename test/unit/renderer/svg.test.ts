import { test, expect, beforeEach, vi } from 'vitest'
import { Parser } from 'htmlparser2'
import { vol } from 'memfs'
import * as QRCode from '#core/qrcode.ts'
import * as SvgRenderer from '#renderer/svg.ts'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
  vol.mkdirSync(process.cwd(), { recursive: true })
})

function getExpectedViewbox(size: number, margin: number) {
  const expectedQrCodeSize = size + margin * 2
  return '0 0 ' + expectedQrCodeSize + ' ' + expectedQrCodeSize
}

type ExpectedTags = { name: string; attribs: { name: string; value: any }[] }[]

function testSvgFragment(svgFragment: string, expectedTags: ExpectedTags) {
  return new Promise((resolve, reject) => {
    const parser = new Parser(
      {
        onopentag: (name, attribs) => {
          const tag = expectedTags.shift()

          expect(tag.name, 'Should have a ' + tag.name + ' tag').toEqual(name)

          tag.attribs.forEach((attr) => {
            expect(
              attribs[attr.name],
              'Should have attrib ' + attr.name + ' with value ' + attr.value,
            ).toEqual(attr.value.toString())
          })
        },

        onend: () => {
          resolve(void 0)
        },

        onerror: (e) => {
          reject(e)
        },
      },
      { decodeEntities: true },
    )

    parser.write(svgFragment)
    parser.end()
  })
}

function buildTest(data, opts, expectedTags: ExpectedTags) {
  const svg = SvgRenderer.render(data, opts)
  return testSvgFragment(svg, expectedTags.slice())
}

test('SvgRenderer interface', () => {
  expect(SvgRenderer.render, 'Should have render function').toBeTypeOf('function')

  expect(SvgRenderer.renderToFile, 'Should have renderToFile function').toBeTypeOf('function')
})

test('SvgRenderer', () => {
  const tests = []

  const data = QRCode.create('sample text', { version: 2 })
  const size = data.modules.size

  tests.push(
    buildTest(
      data,
      {
        scale: 4,
        margin: 4,
        color: {
          light: '#ffffff80',
        },
      },
      [
        {
          name: 'svg',
          attribs: [{ name: 'viewbox', value: getExpectedViewbox(size, 4) }],
        },
        {
          name: 'path',
          attribs: [
            { name: 'fill', value: '#ffffff' },
            { name: 'fill-opacity', value: '.50' },
          ],
        },
        {
          name: 'path',
          attribs: [{ name: 'stroke', value: '#000000' }],
        },
      ],
    ),
  )

  tests.push(
    buildTest(
      data,
      {
        scale: 0,
        margin: 8,
        color: {
          light: '#0000',
          dark: '#00000080',
        },
      },
      [
        {
          name: 'svg',
          attribs: [{ name: 'viewbox', value: getExpectedViewbox(size, 8) }],
        },
        {
          name: 'path',
          attribs: [
            { name: 'stroke', value: '#000000' },
            { name: 'stroke-opacity', value: '.50' },
          ],
        },
      ],
    ),
  )

  tests.push(
    buildTest(data, {}, [
      {
        name: 'svg',
        attribs: [{ name: 'viewbox', value: getExpectedViewbox(size, 4) }],
      },
      { name: 'path', attribs: [{ name: 'fill', value: '#ffffff' }] },
      { name: 'path', attribs: [{ name: 'stroke', value: '#000000' }] },
    ]),
  )

  tests.push(
    buildTest(data, { width: 250 }, [
      {
        name: 'svg',
        attribs: [
          { name: 'width', value: '250' },
          { name: 'height', value: '250' },
          { name: 'viewbox', value: getExpectedViewbox(size, 4) },
        ],
      },
      { name: 'path', attribs: [{ name: 'fill', value: '#ffffff' }] },
      { name: 'path', attribs: [{ name: 'stroke', value: '#000000' }] },
    ]),
  )

  Promise.all(tests).then(() => {})
})

test('SVG renderToFile', () => {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const fileName = 'qrimage.svg'

  SvgRenderer.renderToFile(fileName, sampleQrData, (err) => {
    expect(err, 'Should not generate errors with only qrData param').toBeFalsy()

    expect(vol.existsSync(fileName), 'Should save file with correct filename').toBe(true)
  })

  const fileName2 = 'qrimage2.svg'

  SvgRenderer.renderToFile(
    fileName2,
    sampleQrData,
    {
      margin: 10,
      scale: 1,
    },
    (err) => {
      expect(err, 'Should not generate errors with options param').toBeFalsy()

      expect(vol.existsSync(fileName2), 'Should save file with correct filename').toBe(true)
    },
  )
})
