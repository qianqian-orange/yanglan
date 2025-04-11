import { TextEncoder } from 'util'

// 数据块大小，为2kb
const VIEW_SIZE = 2048
// 数据块
let currentView = null
// 当前数据块字节数
let writtenBytes = 0

const textEncoder = new TextEncoder()

// 将字符串转成字节
export function stringToPrecomputedChunk(content) {
  const precomputedChunk = textEncoder.encode(content)
  return precomputedChunk
}

export function beginWriting() {
  currentView = new Uint8Array(VIEW_SIZE)
  writtenBytes = 0
}

export function completeWriting(destination) {
  if (currentView && writtenBytes > 0)
    destination.write(currentView.subarray(0, writtenBytes))
  currentView = null
  writtenBytes = 0
}

function writeToDestination(destination, view) {
  destination.write(view)
}

function writeStringChunk(destination, stringChunk) {
  if (stringChunk.length === 0) return
  // 由于当个字符占的字节数不定，有可能1-4个字节，如果当前字符串所占最大字节数已经超过了2kb，需要作为当个数据块写入缓存区
  if (stringChunk.length * 3 > VIEW_SIZE) {
    // 先把当前数据块写入缓冲区
    if (writtenBytes > 0) {
      writeToDestination(destination, currentView.subarray(0, writtenBytes))
      currentView = new Uint8Array(VIEW_SIZE)
      writtenBytes = 0
    }
    writeToDestination(destination, stringChunk)
    return
  }
  let target = currentView
  if (writtenBytes > 0) {
    target = currentView.subarray(writtenBytes)
  }
  const { written, read } = textEncoder.encodeInto(stringChunk, target)
  writtenBytes += written
  // 说明当前数据块不够容纳stringChunk
  if (read < stringChunk.length) {
    writeToDestination(destination, currentView.subarray(0, writtenBytes))
    currentView = new Uint8Array(VIEW_SIZE)
    writtenBytes = textEncoder.encodeInto(
      stringChunk.slice(read),
      currentView,
    ).written
  }
  if (writtenBytes === VIEW_SIZE) {
    writeToDestination(destination, currentView)
    currentView = new Uint8Array(VIEW_SIZE)
    writtenBytes = 0
  }
}

function writeViewChunk(destination, chunk) {
  if (chunk.byteLength === 0) return
  if (chunk.byteLength > VIEW_SIZE) {
    if (writtenBytes > 0) {
      writeToDestination(destination, currentView.subarray(0, writtenBytes))
      currentView = new Uint8Array(VIEW_SIZE)
      writtenBytes = 0
    }
    writeToDestination(destination, chunk)
    return
  }
  let bytesToWrite = chunk
  const allowableBytes = currentView.length - writtenBytes
  // 说明当前数据块不够容纳chunk
  if (allowableBytes < bytesToWrite.byteLength) {
    if (allowableBytes === 0) writeToDestination(destination, currentView)
    else {
      currentView.set(bytesToWrite.subarray(0, allowableBytes), writtenBytes)
      writtenBytes += allowableBytes
      writeToDestination(destination, currentView)
      bytesToWrite = bytesToWrite.subarray(allowableBytes)
    }
    currentView = new Uint8Array(VIEW_SIZE)
    writtenBytes = 0
  }
  currentView.set(bytesToWrite, writtenBytes)
  writtenBytes += bytesToWrite.byteLength
  if (writtenBytes === VIEW_SIZE) {
    writeToDestination(destination, currentView)
    currentView = new Uint8Array(VIEW_SIZE)
    writtenBytes = 0
  }
}

/**
 * @param {*} destination response实例
 * @param {*} chunk 要返回的数据，字符串/字节流格式
 */
export function writeChunk(destination, chunk) {
  if (typeof chunk === 'string') writeStringChunk(destination, chunk)
  else writeViewChunk(destination, chunk)
}
