import * as big from './terminal/terminal.ts'
import * as small from './terminal/terminal-small.ts'
export function render(qrData, options, cb) {
  if (options && options.small) {
    return small.render(qrData, options, cb)
  }
  return big.render(qrData, options, cb)
}
