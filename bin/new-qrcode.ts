#!/usr/bin/env node
import { program, Option, InvalidArgumentError } from 'commander'
import QRCode from '#lib/index.js'
import { ALL_EC_LEVELS } from '#core/error-correction-level.ts'
import { QR_VERSION_RANGE } from '#core/version-check.ts'
import { QR_MASK_RANGE } from '#core/mask-pattern.ts'
import pkg from '../package.json' with { type: 'json' }

const OUTPUT_OPTIONS = ['png', 'svg', 'utf8'] as const

program
  .name('qrcode')
  .version(pkg.version, '--version', 'Show version number')
  .optionsGroup('QR Code options:')
  .option('-v, --qversion <number>', `QR Code symbol version ${printRange(QR_VERSION_RANGE)}`, integerBetween(...QR_VERSION_RANGE))
  .addOption(new Option('-e, --error <level>', 'Error correction level').choices(ALL_EC_LEVELS))
  .option('-m, --mask <number>', `Mask pattern ${printRange(QR_MASK_RANGE)}`, integerBetween(...QR_MASK_RANGE))
  .optionsGroup('Renderer options:')
  // IDEA: Maybe use a shared constant for valid renderers, defined by the renderers themselves
  .addOption(new Option('-t, --type <type>', 'Output type').choices(OUTPUT_OPTIONS))
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
  // The input string is a variadic argument that will include any remaining input after parsing options
  // In commander, this is indicated by the `...` suffix
  .argument('input string...')
  .showHelpAfterError()

function printRange([min, max]: readonly [number, number]) {
  return `(${min} - ${max})`
}

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

/** The raw input CLI options, matching the CLI configuration above */
type RawCliOptions = {
  qversion?: number
  error?: typeof ALL_EC_LEVELS[number]
  type?: typeof OUTPUT_OPTIONS[number]
  small?: boolean
  inverse?: boolean
  mask?: number
  qzone?: number
  width?: number
  scale?: number
  lightcolor?: string
  darkcolor?: string
  output?: string
}

/** Used after parsing and normalizing the user input. Maps to internal options in the QRCode library */
type ParsedCliOptions = {
  version?: number
  errorCorrectionLevel?: typeof ALL_EC_LEVELS[number]
  type?: typeof OUTPUT_OPTIONS[number] | 'terminal'
  small: boolean
  inverse: boolean
  maskPattern?: number
  margin?: number
  width?: number
  scale?: number
  color: {
    light?: string
    dark?: string
  }
}

function save(file: string, text: string, options: ParsedCliOptions) {
  QRCode.toFile(file, text, options, (err, _data) => {
    if (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }

    console.log('saved qrcode to: ' + file + '\n')
  })
}

function print(text: string, options: ParsedCliOptions) {
  options.type = 'terminal'
  QRCode.toString(text, options, (err, text) => {
    if (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }

    console.log(text)
  })
}

function processInputs(text: string, opts: RawCliOptions) {
  // Show help and exit when no input was passed
  if (!text.length) {
    program.help()
  }

  if (opts.output) {
    save(opts.output, text, parseOptions(opts))
  } else {
    print(text, parseOptions(opts))
  }
}

function parseOptions(args: RawCliOptions): ParsedCliOptions {
  return {
    version: args.qversion,
    errorCorrectionLevel: args.error,
    type: args.type,
    small: !!args.small,
    inverse: !!args.inverse,
    maskPattern: args.mask,
    margin: args.qzone,
    width: args.width,
    scale: args.scale,
    color: {
      light: args.lightcolor,
      dark: args.darkcolor
    }
  }
}

function main() {
   if (process.stdin.isTTY) {
     program.parse()
     const argv = program.opts<RawCliOptions>()

     console.dir({ options: argv, args: program.args }, { depth: 4 })

    processInputs(program.args.join(' '), argv)
  } else {
    let text = ''

    process.stdin.setEncoding('utf8')
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read()
      if (chunk !== null) {
        text += chunk
      }
    })

    process.stdin.on('end', () => {
      program.parse()
      const argv = program.opts<RawCliOptions>()

      console.dir({ options: argv, args: program.args }, { depth: 4 })

      // This process can be run as a command outside of a TTY
      // so if there was no data on stdin, read the command args instead
      processInputs(text.length ? text : program.args.join(' '), argv)
    })
  }
}

main()
