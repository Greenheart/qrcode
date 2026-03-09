import canPromise from './can-promise.ts'
import * as QRCode from './core/qrcode.ts'
import * as PngRenderer from './renderer/png.ts'
import * as Utf8Renderer from './renderer/utf8.ts'
import * as TerminalRenderer from './renderer/terminal.ts'
import * as SvgRenderer from './renderer/svg.ts'

function checkParams(text, opts, cb) {
  if (typeof text === 'undefined') {
    throw new Error('String required as first argument')
  }

  if (typeof cb === 'undefined') {
    cb = opts
    opts = {}
  }

  if (typeof cb !== 'function') {
    if (!canPromise()) {
      throw new Error('Callback required as last argument')
    } else {
      opts = cb || {}
      cb = null
    }
  }

  return {
    opts,
    cb,
  }
}

const STRING_RENDERERS = {
  svg: SvgRenderer,
  terminal: TerminalRenderer,
  utf8: Utf8Renderer,
} as const

const RENDERERS = {
  svg: SvgRenderer,
  txt: Utf8Renderer,
  utf8: Utf8Renderer,
  png: PngRenderer,
  'image/png': PngRenderer,
} as const

type RendererType = keyof typeof RENDERERS
type StringRendererType = keyof typeof STRING_RENDERERS

function getTypeFromFilename(path: string) {
  return path.slice(((path.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase()
}

function getRendererFromType<T extends RendererType>(type: T): typeof RENDERERS[T] {
  // TODO: Fix the return type - maybe the PngRenderer is different than the other renderers
  return RENDERERS[type] ?? PngRenderer
}

function getStringRendererFromType<T extends StringRendererType>(type: T): typeof STRING_RENDERERS[T] {
  return STRING_RENDERERS[type] ?? Utf8Renderer
}

function render(renderFunc, text, params) {
  if (!params.cb) {
    return new Promise(function (resolve, reject) {
      try {
        const data = QRCode.create(text, params.opts)
        return renderFunc(data, params.opts, function (err, data) {
          return err ? reject(err) : resolve(data)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  try {
    const data = QRCode.create(text, params.opts)
    return renderFunc(data, params.opts, params.cb)
  } catch (e) {
    params.cb(e)
  }
}

export const create = QRCode.create
export { toCanvas } from './browser.ts'

export function toString(text, opts, cb) {
  const params = checkParams(text, opts, cb)
  const type = params.opts ? params.opts.type : undefined
  const renderer = getStringRendererFromType(type)
  return render(renderer.render, text, params)
}

export function toDataURL(text, opts, cb) {
  const params = checkParams(text, opts, cb)
  const renderer = getRendererFromType(params.opts.type)
  return render(renderer.renderToDataURL, text, params)
}

export function toBuffer(text, opts, cb) {
  const params = checkParams(text, opts, cb)
  const renderer = getRendererFromType(params.opts.type)
  return render(renderer.renderToBuffer, text, params)
}

export function toFile(path, text, opts, cb) {
  if (typeof path !== 'string' || !(typeof text === 'string' || typeof text === 'object')) {
    throw new Error('Invalid argument')
  }

  if (arguments.length < 3 && !canPromise()) {
    throw new Error('Too few arguments provided')
  }

  const params = checkParams(text, opts, cb)
  const type = params.opts.type || getTypeFromFilename(path)
  const renderer = getRendererFromType(type)
  const renderToFile = renderer.renderToFile.bind(null, path)

  return render(renderToFile, text, params)
}

export function toFileStream(stream, text, opts) {
  if (arguments.length < 2) {
    throw new Error('Too few arguments provided')
  }

  const params = checkParams(text, opts, stream.emit.bind(stream, 'error'))
  const renderer = getRendererFromType('png') // Only png support for now
  const renderToFileStream = renderer.renderToFileStream.bind(null, stream)
  render(renderToFileStream, text, params)
}
