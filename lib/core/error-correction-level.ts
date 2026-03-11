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

/**
 * Parse and return the error correction level, throwing an error if the parsed level is invalid.
 * Returns undefined and ignores non-string values that can't be parsed.
 */
export function parse(level: unknown): ErrorCorrectionLevel | undefined {
  if (typeof level === 'string') {
    // Compare the first character for backwards compatibility with
    // 1.x-versions of the library that accepted long names for each level.
    // In 2.x, the type is narrowed to expect the first letter only, e.g. 'M'
    const parsedLevel = EC_LEVELS[level[0].toUpperCase() as keyof typeof EC_LEVELS]
    if (parsedLevel) {
      return parsedLevel
    }
    throw new Error('Unknown error correction level: ' + level)
  }
}
