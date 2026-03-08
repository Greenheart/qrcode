#!/usr/bin/env node
import { program, InvalidArgumentError, Option } from 'commander'
import QRCode from '#lib/index.js'
import { ALL_EC_LEVELS } from '#core/error-correction-level.ts'
import pkg from '../package.json' with { type: 'json' }

// IDEA: Create this help message based on the actual options
const HELP_MESSAGE = `
Usage: qrcode [options] <input string>

QR Code options:
  -v, --qversion  QR Code symbol version (1 - 40)                       [number]
  -e, --error     Error correction level           [choices: "L", "M", "Q", "H"]
  -m, --mask      Mask pattern (0 - 7)                                  [number]

Renderer options:
  -t, --type        Output type                  [choices: "png", "svg", "utf8"]
  -i, --inverse     Invert colors                                      [boolean]
  -w, --width       Image width (px)                                    [number]
  -s, --scale       Scale factor                                        [number]
  -q, --qzone       Quiet zone size                                     [number]
  -l, --lightcolor  Light RGBA hex color
  -d, --darkcolor   Dark RGBA hex color
      --small       Output smaller QR code to terminal                 [boolean]

Options:
  -o, --output   Output file
  -h, --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
`

program
  .name('qrcode')
  .version(pkg.version, '--version', 'Show version number')
  .optionsGroup('QR Code options:')
  .option('-v, --qversion <number>', 'QR Code symbol version (1 - 40)', integerBetween(1, 40))
  .addOption(new Option('-e, --error <number>', 'Error correction level').choices(ALL_EC_LEVELS))
  .option('-m, --mask <number>', 'Mask pattern (0 - 7)', integerBetween(0, 7))
  .optionsGroup('Renderer options:')
  // IDEA: Maybe use a shared constant for valid renderers
  .addOption(new Option('-t, --type <type>', 'Output type').choices(['png', 'svg', 'utf8']))
  .option('-i, --inverse', 'Invert colors')
  .option('-w, --width <number>', 'Image width (px)', integerBetween(0))
  .option('-s, --scale <number>', 'Scale factor', integer)
  .option('-q, --qzone <number>', 'Quiet zone size', integerBetween(0))
  .option('-l, --lightcolor <color>', 'Light RGBA hex color')
  .option('-d, --darkcolor <color>', 'Dark RGBA hex color')
  .option('--small', 'Output smaller QR code to terminal')
  .optionsGroup('Options:')
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
