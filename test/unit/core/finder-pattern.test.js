import pattern from 'core/finder-pattern'

const test = require('tap').test
test('Finder pattern', function (t) {
  for (let i = 1; i <= 40; i++) {
    t.equal(pattern.getPositions(i).length, 3, 'Should always return 3 pattern positions')
  }

  t.end()
})
