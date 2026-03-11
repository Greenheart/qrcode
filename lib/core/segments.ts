import { test, expect } from 'vitest'
import { findPath } from 'dijkstra-find-path'

import * as Mode from './mode.ts'
import NumericData from './numeric-data.ts'
import AlphanumericData from './alphanumeric-data.ts'
import ByteData from './byte-data.ts'
import KanjiData from './kanji-data.ts'
import * as Regex from './regex.ts'
import * as Utils from './utils.ts'
import type { DataSegment, QRCodeSegment, QRVersion, QREncodingMode, QRCodeByteSegment, QRCodeAlphanumericSegment, QRCodeNumericSegment, QRCodeKanjiSegment } from '#lib/types.ts'

/**
 * Returns UTF8 byte length
 *
 * @param str Input string
 * @return Number of bytes
 *
 * NOTE: See if there's a better alternative to unescape?
 */
function getStringByteLength(str: string) {
  return unescape(encodeURIComponent(str)).length
}

/**
 * Get a list of segments of the specified mode
 * from a string
 *
 * @param  {Mode}   mode Segment mode
 * @param  {String} str  String to process
 * @return {Array}       Array of object with segments data
 */
function getSegments(regex, mode, str) {
  const segments = []
  let result

  while ((result = regex.exec(str)) !== null) {
    segments.push({
      data: result[0],
      index: result.index,
      mode,
      length: result[0].length,
    })
  }

  return segments
}

/**
 * Extracts a series of segments with the appropriate
 * modes from a string
 *
 * @param  {String} dataStr Input string
 * @return {Array}          Array of object with segments data
 */
function getSegmentsFromString(dataStr) {
  const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr)
  const alphaNumSegs = getSegments(Regex.LETTERS_AND_CHARACTERS, Mode.ALPHANUMERIC, dataStr)
  let byteSegs
  let kanjiSegs

  if (Utils.isKanjiModeEnabled()) {
    byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr)
    kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr)
  } else {
    byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr)
    kanjiSegs = []
  }

  const segs = [...numSegs, ...alphaNumSegs, ...byteSegs, ...kanjiSegs]

  return segs
    .sort(function (s1, s2) {
      return s1.index - s2.index
    })
    .map(function (obj) {
      return {
        data: obj.data,
        mode: obj.mode,
        length: obj.length,
      }
    })
}

/**
 * Returns how many bits are needed to encode a string of
 * specified length with the specified mode
 *
 * @param  {Number} length String length
 * @param  {Mode} mode     Segment mode
 * @return {Number}        Bit length
 */
function getSegmentBitsLength(length, mode) {
  switch (mode) {
    case Mode.NUMERIC:
      return NumericData.getBitsLength(length)
    case Mode.ALPHANUMERIC:
      return AlphanumericData.getBitsLength(length)
    case Mode.KANJI:
      return KanjiData.getBitsLength(length)
    case Mode.BYTE:
      return ByteData.getBitsLength(length)
  }
}

/**
 * Merges adjacent segments which have the same mode
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function mergeSegments(segs) {
  return segs.reduce(function (acc, curr) {
    const prevSeg = acc.length - 1 >= 0 ? acc.at(-1) : null
    if (prevSeg && prevSeg.mode === curr.mode) {
      acc.at(-1).data += curr.data
      return acc
    }

    acc.push(curr)
    return acc
  }, [])
}

/**
 * Generates a list of all possible nodes combination which
 * will be used to build a segments graph.
 *
 * Nodes are divided by groups. Each group will contain a list of all the modes
 * in which is possible to encode the given text.
 *
 * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
 * The group for '12345' will contain then 3 objects, one for each
 * possible encoding mode.
 *
 * Each node represents a possible segment.
 *
 * @param  {Array} segs Array of object with segments data
 * @return {Array}      Array of object with segments data
 */
function buildNodes(segs) {
  const nodes = []
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i]

    switch (seg.mode) {
      case Mode.NUMERIC:
        nodes.push([
          seg,
          { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
          { data: seg.data, mode: Mode.BYTE, length: seg.length },
        ])
        break
      case Mode.ALPHANUMERIC:
        nodes.push([seg, { data: seg.data, mode: Mode.BYTE, length: seg.length }])
        break
      case Mode.KANJI:
        nodes.push([
          seg,
          { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) },
        ])
        break
      case Mode.BYTE:
        nodes.push([{ data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }])
    }
  }

  return nodes
}

/**
 * Builds a graph from a list of nodes.
 * All segments in each node group will be connected with all the segments of
 * the next group and so on.
 *
 * At each connection will be assigned a weight depending on the
 * segment's byte length.
 *
 * @param {Array} nodes Array of object with segments data
 * @param version QR Code version
 * @return {Object} Graph of all possible segments.
 *
 * TODO: Create a Graph type to clearly define the properties and types
 */
function buildGraph(nodes, version: QRVersion) {
  const table = {}
  const graph = { start: {} }
  let prevNodeIds = ['start']

  for (let i = 0; i < nodes.length; i++) {
    const nodeGroup = nodes[i]
    const currentNodeIds = []

    for (let j = 0; j < nodeGroup.length; j++) {
      const node = nodeGroup[j]
      const key = '' + i + j

      currentNodeIds.push(key)
      table[key] = { node, lastCount: 0 }
      graph[key] = {}

      for (let n = 0; n < prevNodeIds.length; n++) {
        const prevNodeId = prevNodeIds[n]

        if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
          graph[prevNodeId][key] =
            getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
            getSegmentBitsLength(table[prevNodeId].lastCount, node.mode)

          table[key].lastCount += node.length
        } else {
          graph[prevNodeId][key] =
            getSegmentBitsLength(node.length, node.mode) +
            4 +
            Mode.getCharCountIndicator(node.mode, version) // switch cost

          table[key].lastCount = node.length
        }
      }
    }

    prevNodeIds = currentNodeIds
  }

  for (let n = 0; n < prevNodeIds.length; n++) {
    graph[prevNodeIds[n]].end = 0
  }

  return { map: graph, table }
}

/**
 * Builds a segment from a specified data and mode.
 * If a mode is not specified, the more suitable will be used.
 */
function buildSingleSegment(
  data: string | QRCodeSegment['data'],
  modeHint?: string | QRCodeSegment['mode'],
): DataSegment {
  let mode: QREncodingMode
  const bestMode = Mode.getBestModeForData(data)

  // TODO: Replace with Mode.parse()
  mode = Mode.from(modeHint, bestMode)

  // Make sure data can be encoded
  if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
    throw new Error(
      `"${data}" cannot be encoded with mode ${Mode.toString(mode)}. Suggested mode is: ${Mode.toString(bestMode)}`,
    )
  }

  // Use Mode.BYTE if Kanji support is disabled
  if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
    mode = Mode.BYTE
  }

  switch (mode) {
    case Mode.NUMERIC:
      return new NumericData(data as QRCodeNumericSegment['data'])

    case Mode.ALPHANUMERIC:
      return new AlphanumericData(data as QRCodeAlphanumericSegment['data'])

    case Mode.KANJI:
      return new KanjiData(data as QRCodeKanjiSegment['data'])

    case Mode.BYTE:
      return new ByteData(data as QRCodeByteSegment['data'])
  }
}

/**
 * Builds a list of segments from an array.
 * Array can contain Strings or Objects with segment's info.
 *
 * For each item which is a string, will be generated a segment with the given
 * string and the more appropriate encoding mode.
 *
 * For each item which is an object, will be generated a segment with the given
 * data and mode.
 * Objects must contain at least the property "data".
 * If property "mode" is not present, the more suitable mode will be used.
 */
export function fromArray(input: Array<string | QRCodeSegment>): DataSegment[] {
  const dataSegments: DataSegment[] = []
  for (const seg of input) {
    if (typeof seg === 'string') {
      dataSegments.push(buildSingleSegment(seg))
    } else if (seg.data) {
      dataSegments.push(buildSingleSegment(seg.data, seg.mode))
    }
  }
  return dataSegments
}

/**
 * Builds an optimized sequence of segments from a string,
 * which will produce the shortest possible bitstream.
 *
 * @param data Input string
 * @param version QR Code version
 * @return {Array} Array of segments
 *
 * TODO: Improve return type
 */
export function fromString(data: string, version: QRVersion) {
  const segs = getSegmentsFromString(data)

  const nodes = buildNodes(segs)
  const graph = buildGraph(nodes, version)
  const path = findPath(graph.map, 'start', 'end')

  const optimizedSegs = []
  for (let i = 1; i < path.length - 1; i++) {
    optimizedSegs.push(graph.table[path[i]].node)
  }

  return fromArray(mergeSegments(optimizedSegs))
}

/**
 * Splits a string in various segments with the modes which
 * best represent their content.
 * The produced segments are far from being optimized.
 * The output of this function is only used to estimate a QR Code version
 * which may contain the data.
 */
export function rawSplit(data: string): DataSegment[] {
  return fromArray(getSegmentsFromString(data))
}

if (import.meta.vitest) {
  test.only('buildGraph should return correct length - issue 272', () => {
    // Nodes created from the input string `ABCDEF123`, matching issue 272
    // Learn more: https://github.com/soldair/node-qrcode/issues/272
    const NODES = [
      [
        {
          data: 'ABCDEF',
          mode: Mode.ALPHANUMERIC,
          length: 6,
        },
        {
          data: 'ABCDEF',
          mode: Mode.BYTE,
          length: 6,
        },
      ],
      [
        {
          data: '123',
          mode: Mode.NUMERIC,
          length: 3,
        },
        {
          data: '123',
          mode: Mode.ALPHANUMERIC,
          length: 3,
        },
        {
          data: '123',
          mode: Mode.BYTE,
          length: 3,
        },
      ],
    ]

    // In issue 272, the cost between '00' and '11' was incorrectly calculated.
    // The cost was 16 but should be 17, like in the example output below:
    const GRAPH_CORRECT = {
      map: {
        10: { end: 0 },
        11: { end: 0 },
        12: { end: 0 },
        start: { '00': 46, '01': 60 },
        '00': { 10: 24, 11: 17, 12: 36 },
        '01': { 10: 24, 11: 30, 12: 24 },
      },
      table: {
        10: {
          node: {
            data: '123',
            mode: Mode.NUMERIC,
            length: 3,
          },
          lastCount: 3,
        },
        11: {
          node: {
            data: '123',
            mode: Mode.ALPHANUMERIC,
            length: 3,
          },
          lastCount: 3,
        },
        12: {
          node: {
            data: '123',
            mode: Mode.BYTE,
            length: 3,
          },
          lastCount: 6,
        },
        '00': {
          node: {
            data: 'ABCDEF',
            mode: Mode.ALPHANUMERIC,
            length: 6,
          },
          lastCount: 6,
        },
        '01': {
          node: {
            data: 'ABCDEF',
            mode: Mode.BYTE,
            length: 6,
          },
          lastCount: 6,
        },
      },
    }

    // Use hardcoded version 1 to simplify the test case.
    expect(buildGraph(NODES, 1)).toStrictEqual(GRAPH_CORRECT)
  })
}
