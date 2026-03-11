import { test, expect } from 'vitest'
import * as Version from '#core/version.ts'
import * as ECLevel from '#core/error-correction-level.ts'
import * as Mode from '#core/mode.ts'
import NumericData from '#core/numeric-data.ts'
import AlphanumericData from '#core/alphanumeric-data.ts'
import KanjiData from '#core/kanji-data.ts'
import ByteData from '#core/byte-data.ts'
import { arrayWithLength, getQRVersionRange } from '#test/helpers.ts'

const EC_LEVELS = [ECLevel.L, ECLevel.M, ECLevel.Q, ECLevel.H]

const EXPECTED_NUMERIC_CAPACITY = [
  [41, 34, 27, 17],
  [77, 63, 48, 34],
  [127, 101, 77, 58],
  [187, 149, 111, 82],
  [255, 202, 144, 106],
  [322, 255, 178, 139],
  [370, 293, 207, 154],
  [461, 365, 259, 202],
  [552, 432, 312, 235],
  [652, 513, 364, 288],
  [772, 604, 427, 331],
  [883, 691, 489, 374],
  [1022, 796, 580, 427],
  [1101, 871, 621, 468],
  [1250, 991, 703, 530],
  [1408, 1082, 775, 602],
  [1548, 1212, 876, 674],
  [1725, 1346, 948, 746],
  [1903, 1500, 1063, 813],
  [2061, 1600, 1159, 919],
  [2232, 1708, 1224, 969],
  [2409, 1872, 1358, 1056],
  [2620, 2059, 1468, 1108],
  [2812, 2188, 1588, 1228],
  [3057, 2395, 1718, 1286],
  [3283, 2544, 1804, 1425],
  [3517, 2701, 1933, 1501],
  [3669, 2857, 2085, 1581],
  [3909, 3035, 2181, 1677],
  [4158, 3289, 2358, 1782],
  [4417, 3486, 2473, 1897],
  [4686, 3693, 2670, 2022],
  [4965, 3909, 2805, 2157],
  [5253, 4134, 2949, 2301],
  [5529, 4343, 3081, 2361],
  [5836, 4588, 3244, 2524],
  [6153, 4775, 3417, 2625],
  [6479, 5039, 3599, 2735],
  [6743, 5313, 3791, 2927],
  [7089, 5596, 3993, 3057],
]

const EXPECTED_ALPHANUMERIC_CAPACITY = [
  [25, 20, 16, 10],
  [47, 38, 29, 20],
  [77, 61, 47, 35],
  [114, 90, 67, 50],
  [154, 122, 87, 64],
  [195, 154, 108, 84],
  [224, 178, 125, 93],
  [279, 221, 157, 122],
  [335, 262, 189, 143],
  [395, 311, 221, 174],
  [468, 366, 259, 200],
  [535, 419, 296, 227],
  [619, 483, 352, 259],
  [667, 528, 376, 283],
  [758, 600, 426, 321],
  [854, 656, 470, 365],
  [938, 734, 531, 408],
  [1046, 816, 574, 452],
  [1153, 909, 644, 493],
  [1249, 970, 702, 557],
  [1352, 1035, 742, 587],
  [1460, 1134, 823, 640],
  [1588, 1248, 890, 672],
  [1704, 1326, 963, 744],
  [1853, 1451, 1041, 779],
  [1990, 1542, 1094, 864],
  [2132, 1637, 1172, 910],
  [2223, 1732, 1263, 958],
  [2369, 1839, 1322, 1016],
  [2520, 1994, 1429, 1080],
  [2677, 2113, 1499, 1150],
  [2840, 2238, 1618, 1226],
  [3009, 2369, 1700, 1307],
  [3183, 2506, 1787, 1394],
  [3351, 2632, 1867, 1431],
  [3537, 2780, 1966, 1530],
  [3729, 2894, 2071, 1591],
  [3927, 3054, 2181, 1658],
  [4087, 3220, 2298, 1774],
  [4296, 3391, 2420, 1852],
]

const EXPECTED_KANJI_CAPACITY = [
  [10, 8, 7, 4],
  [20, 16, 12, 8],
  [32, 26, 20, 15],
  [48, 38, 28, 21],
  [65, 52, 37, 27],
  [82, 65, 45, 36],
  [95, 75, 53, 39],
  [118, 93, 66, 52],
  [141, 111, 80, 60],
  [167, 131, 93, 74],
  [198, 155, 109, 85],
  [226, 177, 125, 96],
  [262, 204, 149, 109],
  [282, 223, 159, 120],
  [320, 254, 180, 136],
  [361, 277, 198, 154],
  [397, 310, 224, 173],
  [442, 345, 243, 191],
  [488, 384, 272, 208],
  [528, 410, 297, 235],
  [572, 438, 314, 248],
  [618, 480, 348, 270],
  [672, 528, 376, 284],
  [721, 561, 407, 315],
  [784, 614, 440, 330],
  [842, 652, 462, 365],
  [902, 692, 496, 385],
  [940, 732, 534, 405],
  [1002, 778, 559, 430],
  [1066, 843, 604, 457],
  [1132, 894, 634, 486],
  [1201, 947, 684, 518],
  [1273, 1002, 719, 553],
  [1347, 1060, 756, 590],
  [1417, 1113, 790, 605],
  [1496, 1176, 832, 647],
  [1577, 1224, 876, 673],
  [1661, 1292, 923, 701],
  [1729, 1362, 972, 750],
  [1817, 1435, 1024, 784],
]

const EXPECTED_BYTE_CAPACITY = [
  [17, 14, 11, 7],
  [32, 26, 20, 14],
  [53, 42, 32, 24],
  [78, 62, 46, 34],
  [106, 84, 60, 44],
  [134, 106, 74, 58],
  [154, 122, 86, 64],
  [192, 152, 108, 84],
  [230, 180, 130, 98],
  [271, 213, 151, 119],
  [321, 251, 177, 137],
  [367, 287, 203, 155],
  [425, 331, 241, 177],
  [458, 362, 258, 194],
  [520, 412, 292, 220],
  [586, 450, 322, 250],
  [644, 504, 364, 280],
  [718, 560, 394, 310],
  [792, 624, 442, 338],
  [858, 666, 482, 382],
  [929, 711, 509, 403],
  [1003, 779, 565, 439],
  [1091, 857, 611, 461],
  [1171, 911, 661, 511],
  [1273, 997, 715, 535],
  [1367, 1059, 751, 593],
  [1465, 1125, 805, 625],
  [1528, 1190, 868, 658],
  [1628, 1264, 908, 698],
  [1732, 1370, 982, 742],
  [1840, 1452, 1030, 790],
  [1952, 1538, 1112, 842],
  [2068, 1628, 1168, 898],
  [2188, 1722, 1228, 958],
  [2303, 1809, 1283, 983],
  [2431, 1911, 1351, 1051],
  [2563, 1989, 1423, 1093],
  [2699, 2099, 1499, 1139],
  [2809, 2213, 1579, 1219],
  [2953, 2331, 1663, 1273],
]

const EXPECTED_VERSION_BITS = [
  0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78, 0x1145d,
  0x12a17, 0x13532, 0x149a6, 0x15683, 0x168c9, 0x177ec, 0x18ec4, 0x191e1, 0x1afab, 0x1b08e, 0x1cc1a,
  0x1d33f, 0x1ed75, 0x1f250, 0x209d5, 0x216f0, 0x228ba, 0x2379f, 0x24b0b, 0x2542e, 0x26a64, 0x27541,
  0x28c69,
]

test('Version validity', () => {
  // @ts-expect-error Testing invalid input
  expect(Version.parse(), 'Should return undefined if no input').toEqual(undefined)
  expect(
    Version.parse(''),
    'Should return undefined if version cannot be parsed to an integer',
  ).toEqual(undefined)
  expect(Version.parse(0), 'Should return undefined if version is too low').toEqual(undefined)
  expect(Version.parse(41), 'Should return undefined if version is too high').toEqual(undefined)
})

test('Version parse from value', () => {
  expect(Version.parse(5), 'Should return correct version from a number').toEqual(5)
  expect(Version.parse('5'), 'Should return correct version from a string').toEqual(5)
  expect(Version.parse(1), 'Should parse lower bound').toEqual(1)
  expect(Version.parse(40), 'Should parse upper bound').toEqual(40)
})

test('Version capacity', () => {
  for (let l = 0; l < EC_LEVELS.length; l++) {
    for (const i of getQRVersionRange()) {
      expect(
        Version.getCapacity(i, EC_LEVELS[l], Mode.NUMERIC),
        'Should return correct numeric mode capacity',
      ).toEqual(EXPECTED_NUMERIC_CAPACITY[i - 1][l])

      expect(
        Version.getCapacity(i, EC_LEVELS[l], Mode.ALPHANUMERIC),
        'Should return correct alphanumeric mode capacity',
      ).toEqual(EXPECTED_ALPHANUMERIC_CAPACITY[i - 1][l])

      expect(
        Version.getCapacity(i, EC_LEVELS[l], Mode.KANJI),
        'Should return correct kanji mode capacity',
      ).toEqual(EXPECTED_KANJI_CAPACITY[i - 1][l])

      expect(
        Version.getCapacity(i, EC_LEVELS[l], Mode.BYTE),
        'Should return correct byte mode capacity',
      ).toEqual(EXPECTED_BYTE_CAPACITY[i - 1][l])
    }
  }
})

test('Version best match', () => {
  function testBestVersionForCapacity(expectedCapacity, DataCtor) {
    for (const v of getQRVersionRange()) {
      for (let l = 0; l < EC_LEVELS.length; l++) {
        const capacity = expectedCapacity[v - 1][l]
        const data = new DataCtor(arrayWithLength(capacity + 1).join('-'))

        expect(
          Version.getBestVersionForData(data, EC_LEVELS[l]),
          'Should return best version',
        ).toEqual(v)
        expect(
          Version.getBestVersionForData([data], EC_LEVELS[l]),
          'Should return best version',
        ).toEqual(v)

        if (l === 1) {
          expect(
            Version.getBestVersionForData(data, null),
            'Should return best version for ECLevel.M if error level is undefined',
          ).toEqual(v)
          expect(
            Version.getBestVersionForData([data], null),
            'Should return best version for ECLevel.M if error level is undefined',
          ).toEqual(v)
        }
      }
    }

    for (let i = 0; i < EC_LEVELS.length; i++) {
      const exceededCapacity = expectedCapacity[39][i] + 1
      const tooBigData = new DataCtor(arrayWithLength(exceededCapacity + 1).join('-'))
      const tooBigDataArray = [
        new DataCtor(arrayWithLength(Math.floor(exceededCapacity / 2)).join('-')),
        new DataCtor(arrayWithLength(Math.floor(exceededCapacity / 2) + 1).join('-')),
      ]

      expect(
        Version.getBestVersionForData(tooBigData, EC_LEVELS[i]),
        'Should return undefined if data is too big',
      ).toBeUndefined()
      expect(
        Version.getBestVersionForData([tooBigData], EC_LEVELS[i]),
        'Should return undefined if data is too big',
      ).toBeUndefined()
      expect(
        Version.getBestVersionForData(tooBigDataArray, EC_LEVELS[i]),
        'Should return undefined if data is too big',
      ).toBeUndefined()
    }
  }

  testBestVersionForCapacity(EXPECTED_NUMERIC_CAPACITY, NumericData)
  testBestVersionForCapacity(EXPECTED_ALPHANUMERIC_CAPACITY, AlphanumericData)
  testBestVersionForCapacity(EXPECTED_KANJI_CAPACITY, KanjiData)
  testBestVersionForCapacity(EXPECTED_BYTE_CAPACITY, ByteData)

  const version = Version.getBestVersionForData([new ByteData('abc'), new NumericData('1234')])
  expect(
    version && Version.MIN <= version && version <= Version.MAX,
    'Should return a version number if input array is valid',
  ).toEqual(true)

  expect(Version.getBestVersionForData([]), 'Should return 1 if array is empty').toEqual(1)
})

test('Version encoded info', () => {
  for (let v = 0; v < 7; v++) {
    expect(() => {
      // @ts-expect-error Testing invalid input
      Version.getEncodedBits(v)
    }, 'Should throw if version is invalid or less than 7').toThrow()
  }

  for (const v of getQRVersionRange(7, 40)) {
    const bch = Version.getEncodedBits(v)
    expect(bch, 'Should return correct bits').toEqual(EXPECTED_VERSION_BITS[v - 7])
  }
})
