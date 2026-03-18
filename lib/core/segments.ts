import { test, expect } from 'vitest'
import { findPath } from 'dijkstra-find-path'

import * as Mode from './mode.ts'
import NumericData from './numeric-data.ts'
import AlphanumericData from './alphanumeric-data.ts'
import ByteData from './byte-data.ts'
import KanjiData from './kanji-data.ts'
import * as Regex from './regex.ts'
import * as Utils from './utils.ts'
import type {
  QRCodeSegment,
  QRVersion,
  QRCodeByteSegment,
  QRCodeAlphanumericSegment,
  QRCodeNumericSegment,
  QRCodeKanjiSegment,
  QREncodingMode,
  GeneratedQRCodeSegment,
} from '#lib/types.ts'

/**
 * Returns UTF8 byte length
 */
function getStringByteLength(str: string): number {
  return unescape(encodeURIComponent(str)).length
}

/**
 * Raw, unoptimized segments.
 * These are used to build a graph and find the optimal way to encode data.
 */
type RawSegment = {
  data: string
  mode: QREncodingMode
  length: number
}

/**
 * Use a regex to extract a list of segments of the specified mode from a string
 *
 * @return {Array} Array of object with segments data
 */
function getSegments(
  regex: RegExp,
  mode: QREncodingMode,
  str: string,
): (RawSegment & { index: number })[] {
  const segments: (RawSegment & { index: number })[] = []
  let result: ReturnType<RegExp['exec']>

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
 */
function getSegmentsFromString(dataStr: string): RawSegment[] {
  const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr)
  const alphaNumSegs = getSegments(Regex.LETTERS_AND_CHARACTERS, Mode.ALPHANUMERIC, dataStr)
  let byteSegs: (RawSegment & { index: number })[]
  let kanjiSegs: (RawSegment & { index: number })[]

  if (Utils.isKanjiModeEnabled()) {
    byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr)
    kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr)
  } else {
    byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr)
    kanjiSegs = []
  }

  const segs = [...numSegs, ...alphaNumSegs, ...byteSegs, ...kanjiSegs]

  return (
    segs
      .sort((s1, s2) => s1.index - s2.index)
      // Remove the index property after sorting
      .map(({ data, mode, length }) => ({ data, mode, length }))
  )
}

/**
 * Returns how many bits are needed to encode a string of
 * specified length with the specified mode
 */
function getSegmentBitsLength(length: number, mode: QREncodingMode) {
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

  throw new Error('Invalid mode: ' + mode)
}

/**
 * Representing a node in a graph of raw data segments.
 * These nodes will eventually be used to find the optimal encoding by
 * finding the optimal path through the graph by combining the nodes.
 */
type Node = NumericNode | AlphanumericNode | KanjiNode | ByteNode

type NumericNode = [
  RawSegment,
  { data: string; mode: QREncodingMode<'Alphanumeric'>; length: number },
  ByteNode[0],
]
type AlphanumericNode = [RawSegment, ByteNode[0]]
type KanjiNode = [RawSegment, ByteNode[0]]
type ByteNode = [{ data: string; mode: QREncodingMode<'Byte'>; length: number }]

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
 * @return Array of object with segments data
 */
function buildNodes(segs: RawSegment[]): Node[] {
  const nodes: Node[] = []
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
 * This graph consists of a `map` (the actual graph) and a lookup `table`.
 * The purpose is to enable path finding to find the optimal way to encode
 * segments of the QR code data.
 *
 * Since each segment can be encoded in 1-3 different ways, the `map` includes
 * nodes for each encoding mode. This enables the path finding to traverse all
 * unique nodes with the shortest total distance, which in our cases means
 * to find the most optimal way to encode all data segments for the QR code.
 *
 * IDEA: It would be possible to make this type generic and add inferred type params
 * to express that the Graph `table` always contains the keys of the `map`,
 * excluding the special `start` node.
 */
type Graph = {
  map: GraphMap
  table: GraphTable
}

// NOTE: Here's a sample for the generic Graph where the keys match
// type Graph<Map extends GraphMap, NodeId extends Omit<(keyof Map), 'start'>> = {
//   map: Map,
//   table: {
//     // Mapped object type?
//     [nodeId: NodeId]: {
//        node: RawSegment
//        lastCount: number
//     }
//   }
// }

/**
 * The actual graph used for path finding
 */
type GraphMap = {
  [nodeId: string]: {
    [nodeId: string]: number
  } & { end?: number }
  start: {
    [nodeId: string]: number
  }
}

/**
 * A lookup table, mapping each node to its corresponding segment data
 */
type GraphTable = {
  [nodeId: string]: {
    node: RawSegment
    lastCount: number
  }
}

/**
 * Builds a graph from a list of nodes.
 * All segments in each node group will be connected with all the segments of
 * the next group and so on.
 *
 * At each connection will be assigned a weight depending on the
 * segment's byte length.
 *
 * @return Graph of all possible segments.
 */
function buildGraph(nodes: Node[], version: QRVersion): Graph {
  const table: GraphTable = {}
  const graph: GraphMap = { start: {} }
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
  modeHint?: QRCodeSegment['mode'] | QREncodingMode,
): GeneratedQRCodeSegment {
  const bestMode = Mode.getBestModeForData(data)
  let mode = Mode.parse(modeHint) ?? bestMode

  // Make sure data can be encoded
  if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
    throw new Error(
      `"${data}" cannot be encoded with mode ${mode.id}. Suggested mode is: ${bestMode.id}`,
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

  throw new Error('Invalid mode: ' + mode)
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
export function fromArray(input: Array<string | QRCodeSegment | RawSegment>): GeneratedQRCodeSegment[] {
  const segments: GeneratedQRCodeSegment[] = []
  for (const seg of input) {
    if (typeof seg === 'string') {
      segments.push(buildSingleSegment(seg))
    } else if (seg.data) {
      segments.push(buildSingleSegment(seg.data, seg.mode))
    }
  }
  return segments
}

/**
 * Builds an optimized sequence of segments from a string,
 * which will produce the shortest possible bitstream.
 */
export function fromString(data: string, version: QRVersion): GeneratedQRCodeSegment[] {
  const segs = getSegmentsFromString(data)

  const nodes = buildNodes(segs)
  const graph = buildGraph(nodes, version)
  const path = findPath(graph.map, 'start', 'end') as (keyof typeof graph.table)[]

  const optimizedSegs: RawSegment[] = []

  // Skip the `start` and `end` nodes since they were only added for the path finding.
  for (let i = 1; i < path.length - 1; i++) {
    const current = graph.table[path[i]].node
    const prev = optimizedSegs.at(-1)

    // Merge adjacent segments with the same encoding mode to save space.
    if (prev && prev.mode === current.mode) {
      prev.data += current.data
    } else {
      optimizedSegs.push(current)
    }
  }

  return fromArray(optimizedSegs)
}

/**
 * Splits a string in various segments with the modes which
 * best represent their content.
 * The produced segments are far from being optimized.
 * The output of this function is only used to estimate a QR Code version
 * which may contain the data.
 */
export function rawSplit(data: string): GeneratedQRCodeSegment[] {
  return fromArray(getSegmentsFromString(data))
}

if (import.meta.vitest) {
  test('buildGraph should return correct length - issue 272', () => {
    // Nodes created from the input string `ABCDEF123`, matching issue 272
    // Learn more: https://github.com/soldair/node-qrcode/issues/272
    const NODES: Node[] = [
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
    const GRAPH_CORRECT: Graph = {
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
