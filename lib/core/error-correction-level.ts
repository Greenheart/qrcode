import type { ErrorCorrectionLevel, QRCodeErrorCorrectionLevel } from '#lib/types.ts'

/**
 * Maps error correction levels from the public API to the internal runtime values.
 */
export const EC_LEVELS: Record<
  Extract<QRCodeErrorCorrectionLevel, 'L' | 'M' | 'Q' | 'H'>,
  ErrorCorrectionLevel
> = {
  /** Low */
  L: { bit: 1, offset: 0 },
  /** Medium */
  M: { bit: 0, offset: 1 },
  /** Quartile */
  Q: { bit: 3, offset: 2 },
  /** High */
  H: { bit: 2, offset: 3 },
} as const

// TODO: Since this is only used for the CLI, consider solving this in another way instead so we don't include this array for other versions.
// IDEA: We could export the EC_LEVELS object instead and use that in the CLI as well as below.
export const ALL_EC_LEVELS = Object.keys(EC_LEVELS) as (keyof typeof EC_LEVELS)[]

// TODO: we do use the EC Levels in multiple places, like in version.test.ts for example, and could use
// an array of EC levels from here instead of re-creating it in every test module
// IDEA: We could also use a helper function to get all EC Levels for tests

// TODO: Use a simpler definition for error correction levels
// IDEA: Maybe parse like `input.trimStart()[0].toLowerCase()` to be backwards compatible even if the longer string is passed in.
// Or just implement the breaking change to keep the library smaller, only accepting the single character strings as input

// NOTE: For backwards compatibility.
// Maybe simplify how the levels are defined to improve type safety
export const L = EC_LEVELS.L
export const M = EC_LEVELS.M
export const Q = EC_LEVELS.Q
export const H = EC_LEVELS.H

// IDEA: Maybe parse and instead return undefined if no value was found?
function fromString(string: string) {
  if (typeof string !== 'string') {
    throw new Error('Param is not a string')
  }

  const lcStr = string.toLowerCase()

  switch (lcStr) {
    case 'l':
    case 'low':
      return L

    case 'm':
    case 'medium':
      return M

    case 'q':
    case 'quartile':
      return Q

    case 'h':
    case 'high':
      return H

    default:
      throw new Error('Unknown EC Level: ' + string)
  }
}

export function isValid(level) {
  return Boolean(level && typeof level.bit !== 'undefined' && level.bit >= 0 && level.bit < 4)
}

export function from(value, defaultValue) {
  if (isValid(value)) {
    return value
  }

  try {
    return fromString(value)
    // oxlint-disable no-unused-vars
  } catch (e) {
    return defaultValue
  }
}

/**
 * Parse and returns the error correction level, or return undefined if not valid.
 */
export function parse(level: unknown): ErrorCorrectionLevel | undefined {
  if (typeof level === 'string') {
    const parsedLevel = EC_LEVELS[level[0].toUpperCase() as keyof typeof EC_LEVELS]
    if (parsedLevel) {
      return parsedLevel
    }
    throw new Error('Unknown EC level: ' + level)
  }
}
