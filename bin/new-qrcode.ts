#!/usr/bin/env node
import { parseArgs } from 'node:util'
import QRCode from '#lib/index.js'

// IDEA: For each option, add additional fields that get printed in the help:
// TODO: add description: string
// IDEA: add stricter type checking - OR just parse the options if they exist and define how they should be handled in the code
// IDEA: add helper integerBetween(min, max) to parse and validate the CLI options - or better let this be handled by the core library instead

const { values, positionals, tokens } = parseArgs({
  allowPositionals: true,
  tokens: true,
  options: {
    qversion: {
      type: 'string',
      short: 'v',
      default: '',
    },
    error: {
      type: 'string',
      short: 'e',
    }
  },
})

console.dir({tokens}, {depth: 4})

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

function save(file, text, options) {
  QRCode.toFile(file, text, options, (err, _data) => {
    if (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }

    console.log('saved qrcode to: ' + file + '\n')
  })
}

function print(text, options) {
  options.type = 'terminal'
  QRCode.toString(text, options, (err, text) => {
    if (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }

    console.log(text)
  })
}

// IDEA: implement a simple version of zod to parse options
function parseOptions(args) {
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

function processInputs(text, opts) {
  if (!text.length) {
    console.log(HELP_MESSAGE)
    process.exit(1)
  }

  if (opts.output) {
    save(opts.output, text, parseOptions(opts))
  } else {
    print(text, parseOptions(opts))
  }
}

console.dir({ values, positionals }, { depth: 4 })


// const _argv = process.argv.slice(2)

// if (process.stdin.isTTY) {
//   processInputs(_argv, argv)
// } else {
//   var text = ''
//   process.stdin.setEncoding('utf8')
//   process.stdin.on('readable', () => {
//     var chunk = process.stdin.read()
//     if (chunk !== null) {
//       text += chunk
//     }
//   })

//   process.stdin.on('end', () => {
//     // this process can be run as a command outside of a tty so if there was no
//     // data on stdin read from argv
//     processInputs(text.length ? text : argv._.join(' '), argv)
//   })
// }
