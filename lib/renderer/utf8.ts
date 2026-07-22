import * as Utils from './utils.ts'

const BLOCK_CHAR = {
  WW: ' ',
  WB: '▄',
  BB: '█',
  BW: '▀',
}

const INVERTED_BLOCK_CHAR = {
  BB: ' ',
  BW: '▄',
  WW: '█',
  WB: '▀',
}

function getBlockChar(top, bottom, blocks) {
  if (top && bottom) return blocks.BB
  if (top && !bottom) return blocks.BW
  if (!top && bottom) return blocks.WB
  return blocks.WW
}

export function render(qrData, options, cb) {
  const opts = Utils.getOptions(options)
  let blocks = BLOCK_CHAR
  if (opts.color.dark.hex === '#ffffff' || opts.color.light.hex === '#000000') {
    blocks = INVERTED_BLOCK_CHAR
  }

  const size = qrData.modules.size
  const data = qrData.modules.data
  const margin = Math.max(0, Math.floor(opts.margin))
  const totalSize = size + margin * 2
  const lines = []

  function getModule(x, y) {
    const dataX = x - margin
    const dataY = y - margin

    if (dataX < 0 || dataX >= size || dataY < 0 || dataY >= size) {
      return false
    }

    return data[dataY * size + dataX]
  }

  for (let y = 0; y < totalSize; y += 2) {
    let line = ''

    for (let x = 0; x < totalSize; x++) {
      line += getBlockChar(getModule(x, y), getModule(x, y + 1), blocks)
    }

    lines.push(line)
  }

  const output = lines.join('\n')

  if (typeof cb === 'function') {
    cb(null, output)
  }

  return output
}

export function renderToFile(path, qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  import('node:fs').then(({ default: fs }) => {
    const utf8 = render(qrData, options)
    fs.writeFile(path, utf8, cb)
  })
}
