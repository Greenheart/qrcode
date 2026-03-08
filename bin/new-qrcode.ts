#!/usr/bin/env node
import { program, InvalidArgumentError, Option } from 'commander'
import QRCode from '#lib/index.js'
import { ALL_EC_LEVELS } from '#core/error-correction-level.ts'
import { QR_VERSION_RANGE } from '#core/version-check.ts'
import pkg from '../package.json' with { type: 'json' }

// NOTE: Maybe get these constants from the QR version and QR Mask modules instead?
const QR_MASK_RANGE = [0, 7] as const

function range([min, max]: readonly [number, number]) {
  return `(${min} - ${max})`
}

program
  .name('qrcode')
  .version(pkg.version, '--version', 'Show version number')
  .optionsGroup('QR Code options:')
  .option('-v, --qversion <number>', `QR Code symbol version ${range(QR_VERSION_RANGE)}`, integerBetween(...QR_VERSION_RANGE))
  .addOption(new Option('-e, --error <level>', 'Error correction level').choices(ALL_EC_LEVELS))
  .option('-m, --mask <number>', `Mask pattern ${range(QR_MASK_RANGE)}`, integerBetween(...QR_MASK_RANGE))
  .optionsGroup('Renderer options:')
  // IDEA: Maybe use a shared constant for valid renderers, defined by the renderers themselves
  .addOption(new Option('-t, --type <type>', 'Output type').choices(['png', 'svg', 'utf8']))
  .option('-i, --inverse', 'Invert colors')
  .option('-w, --width <number>', 'Image width (px)', integerBetween(0))
  .option('-s, --scale <number>', 'Scale factor', integer)
  .option('-q, --qzone <number>', 'Quiet zone size', integerBetween(0))
  .option('-l, --lightcolor <color>', 'Light RGBA hex color')
  .option('-d, --darkcolor <color>', 'Dark RGBA hex color')
  .option('--small', 'Output smaller QR code to terminal')
  .optionsGroup('Options:')
  .helpOption('-h, --help', 'Show help')
  .option('-o, --output <path>', 'Output file')
  .argument('<input string>')
  .showHelpAfterError()

program.parse()

console.dir({options: program.opts(), args: program.args}, { depth: 4 })

function integer(value: string) {
  const parsedValue = parseInt(value, 10)
  if (Number.isInteger(parsedValue)) {
    return parsedValue
  }

  throw new InvalidArgumentError('Must be an integer')
}

function integerBetween(min: number, max: number = Number.MAX_SAFE_INTEGER) {
  return (value: string) => {
    const n = integer(value)

    if (min <= n && n <= max) {
      return n
    }

    throw new InvalidArgumentError(`Must be between ${min} and ${max}`)
  }
}
