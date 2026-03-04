import big from './terminal/terminal.js'
import small from './terminal/terminal-small.js'
export function render (qrData, options, cb) {
  if (options && options.small) {
    return small.render(qrData, options, cb)
  }
  return big.render(qrData, options, cb)
}
