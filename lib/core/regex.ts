const numeric = '[0-9]+'
const lettersAndCharacters = '[A-Z $%*+\\-./:]+'

const kanji = `(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|\
[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|\
[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|\
[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+`.replace(/u/g, '\\u')

const byte = '(?:(?![A-Z0-9 $%*+\\-./:]|' + kanji + ')(?:.|[\r\n]))+'

// Extractor regexes, used to extract segments
export const KANJI = new RegExp(kanji, 'g')
export const BYTE_KANJI = new RegExp('[^A-Z0-9 $%*+\\-./:]+', 'g')
export const BYTE = new RegExp(byte, 'g')
export const NUMERIC = new RegExp(numeric, 'g')
export const LETTERS_AND_CHARACTERS = new RegExp(lettersAndCharacters, 'g')

// Test regex, used to verify segments include only one type of data.
export const TEST_KANJI = new RegExp('^' + kanji + '$')
export const TEST_NUMERIC = new RegExp('^' + numeric + '$')
export const TEST_ALPHANUMERIC = new RegExp('^[A-Z0-9 $%*+\\-./:]+$')
