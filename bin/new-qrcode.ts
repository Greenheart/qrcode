#!/usr/bin/env node
import { program, InvalidArgumentError, Option } from 'commander'
import QRCode from '#lib/index.js'
import { ALL_EC_LEVELS } from '#core/error-correction-level.ts'

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
  .option('-v, --qversion <number>', 'QR Code symbol version (1 - 40)', integer)
  .addOption(new Option('-e, --error <number>', 'Error correction level').choices(ALL_EC_LEVELS))
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
