// NOTE: The benefit of this definition is that it allows
// generating a TS union for all valid string values
const EC_LEVELS = {
  L: { bit: 1 },
  M: { bit: 0 },
  Q: { bit: 3 },
  H: { bit: 2 },
} as const

export const ALL_EC_LEVELS = Object.keys(EC_LEVELS) as (keyof typeof EC_LEVELS)[]

// NOTE: For backwards compatibility.
// Maybe simplify how the levels are defined to improve type safety
export const L = EC_LEVELS.L
export const M = EC_LEVELS.M
export const Q = EC_LEVELS.Q
export const H = EC_LEVELS.H

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
