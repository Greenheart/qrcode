/// <reference types="node" />

import stream = require('stream')

/**
 * Creates QR Code symbol and returns a qrcode object.
 * @param text Text to encode or a list of objects describing segments.
 */
export function create(text: string | QRCodeSegment[], options?: QRCodeOptions): QRCode

/**
 * Draws qr code symbol to canvas.
 */
export function toCanvas(
  canvasElement: HTMLCanvasElement,
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined) => void,
): void
/**
 * Draws qr code symbol to canvas.
 */
export function toCanvas(
  canvasElement: HTMLCanvasElement,
  text: string | QRCodeSegment[],
  options?: QRCodeRenderersOptions,
): Promise<void>
/**
 * Draws qr code symbol to canvas.
 */
export function toCanvas(
  canvasElement: HTMLCanvasElement,
  text: string | QRCodeSegment[],
  options: QRCodeRenderersOptions,
  callback: (error: Error | null | undefined) => void,
): void
/**
 * Draws qr code symbol to canvas.
 */
export function toCanvas(
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined, canvas: HTMLCanvasElement) => void,
): void
/**
 * Draws qr code symbol to canvas.
 */
export function toCanvas(
  text: string | QRCodeSegment[],
  options?: QRCodeRenderersOptions,
): Promise<HTMLCanvasElement>
/**
 * Draws qr code symbol to canvas.
 */
export function toCanvas(
  text: string | QRCodeSegment[],
  options: QRCodeRenderersOptions,
  callback: (error: Error | null | undefined, canvas: HTMLCanvasElement) => void,
): void
/**
 * Draws qr code symbol to node canvas.
 */
export function toCanvas(
  canvas: any,
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined) => void,
): void
/**
 * Draws qr code symbol to node canvas.
 */
export function toCanvas(
  canvas: any,
  text: string | QRCodeSegment[],
  options?: QRCodeRenderersOptions,
): Promise<void>
/**
 * Draws qr code symbol to node canvas.
 */
export function toCanvas(
  canvas: any,
  text: string | QRCodeSegment[],
  options: QRCodeRenderersOptions,
  callback: (error: Error | null | undefined) => void,
): void

/**
 * Returns a Data URI containing a representation of the QR Code image.
 */
export function toDataURL(
  canvasElement: HTMLCanvasElement,
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined, url: string) => void,
): void
/**
 * Returns a Data URI containing a representation of the QR Code image.
 */
export function toDataURL(
  canvasElement: HTMLCanvasElement,
  text: string | QRCodeSegment[],
  options?: QRCodeToDataURLOptions,
): Promise<string>
/**
 * Returns a Data URI containing a representation of the QR Code image.
 */
export function toDataURL(
  canvasElement: HTMLCanvasElement,
  text: string | QRCodeSegment[],
  options: QRCodeToDataURLOptions,
  callback: (error: Error | null | undefined, url: string) => void,
): void

/**
 * Returns a Data URI containing a representation of the QR Code image.
 */
export function toDataURL(
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined, url: string) => void,
): void
/**
 * Returns a Data URI containing a representation of the QR Code image.
 */
export function toDataURL(
  text: string | QRCodeSegment[],
  options?: QRCodeToDataURLOptions,
): Promise<string>
/**
 * Returns a Data URI containing a representation of the QR Code image.
 */
export function toDataURL(
  text: string | QRCodeSegment[],
  options: QRCodeToDataURLOptions,
  callback: (error: Error | null | undefined, url: string) => void,
): void

/**
 * Returns a string representation of the QR Code.
 */
export function toString(
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined, string: string) => void,
): void
/**
 * Returns a string representation of the QR Code.
 */
export function toString(
  text: string | QRCodeSegment[],
  options?: QRCodeToStringOptions,
): Promise<string>
/**
 * Returns a string representation of the QR Code.
 */
export function toString(
  text: string | QRCodeSegment[],
  options: QRCodeToStringOptions,
  callback: (error: Error | null | undefined, string: string) => void,
): void

/**
 * Saves QR Code to image file.
 * If `options.type` is not specified, the format will be guessed from file extension.
 */
export function toFile(
  path: string,
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined) => void,
): void
/**
 * Saves QR Code to image file.
 * If `options.type` is not specified, the format will be guessed from file extension.
 */
export function toFile(
  path: string,
  text: string | QRCodeSegment[],
  options?: QRCodeToFileOptions,
): Promise<void>
/**
 * Saves QR Code to image file.
 * If `options.type` is not specified, the format will be guessed from file extension.
 */
export function toFile(
  path: string,
  text: string | QRCodeSegment[],
  options: QRCodeToFileOptions,
  callback: (error: Error | null | undefined) => void,
): void

/**
 * Writes QR Code image to stream. Only works with png format for now.
 */
export function toFileStream(
  stream: stream.Writable,
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined) => void,
): void
/**
 * Writes QR Code image to stream. Only works with png format for now.
 */
export function toFileStream(
  stream: stream.Writable,
  text: string | QRCodeSegment[],
  options?: QRCodeToFileStreamOptions,
): Promise<void>
/**
 * Writes QR Code image to stream. Only works with png format for now.
 */
export function toFileStream(
  stream: stream.Writable,
  text: string | QRCodeSegment[],
  options: QRCodeToFileStreamOptions,
  callback: (error: Error | null | undefined) => void,
): void

/**
 * Returns a Buffer containing a representation of the QR Code image. Only works with png format.
 */
export function toBuffer(
  text: string | QRCodeSegment[],
  callback: (error: Error | null | undefined, buffer: Buffer) => void,
): void
/**
 * Returns a Buffer containing a representation of the QR Code image. Only works with png format.
 */
export function toBuffer(
  text: string | QRCodeSegment[],
  options?: QRCodeToBufferOptions,
): Promise<Buffer>
/**
 * Returns a Buffer containing a representation of the QR Code image. Only works with png format.
 */
export function toBuffer(
  text: string | QRCodeSegment[],
  options: QRCodeToBufferOptions,
  callback: (error: Error | null | undefined, buffer: Buffer) => void,
): void
