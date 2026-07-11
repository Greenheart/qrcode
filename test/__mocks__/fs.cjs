// Mocked file system based on https://vitest.dev/guide/mocking/file-system
const { fs } = require('memfs')
module.exports = fs
