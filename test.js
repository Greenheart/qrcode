import path from 'path'
import { spawn } from 'node:child_process'

const opt = {
  cwd: import.meta.dirname,
  env: (function () {
    process.env.NODE_PATH = './' + path.delimiter + './lib'
    return process.env
  })(),
  stdio: [process.stdin, process.stdout, process.stderr]
}

spawn(
  'node',
  ['node_modules/.bin/tap', process.argv[2] || 'test/**/*.test.js'],
  opt
)
