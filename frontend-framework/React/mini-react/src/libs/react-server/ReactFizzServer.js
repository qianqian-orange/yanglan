import {
  pushEndInstance,
  pushStartInstance,
  writeBootstrap,
  writePostamble,
  writePreambleEnd,
  writePreambleStart,
} from '../react-dom-bindings/server/ReactFizzConfigDOM'
import ReactSharedInternals from '../shared/ReactSharedInternals'
import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbol'
import { HooksDispatcher } from './ReactFizzHooks'
import {
  beginWriting,
  completeWriting,
  writeChunk,
} from './ReactServerStreamConfigNode'

function createPendingSegment() {
  return {
    parentFlushed: false,
    chunks: [], // html片段
  }
}

function createRenderTask(request, node, blockedSegment) {
  request.pendingRootTasks++
  const task = {
    node, // 当前vnode
    blockedSegment,
  }
  return task
}

export function createRequest(
  children,
  resumableState,
  renderState,
  onShellReady,
) {
  const request = {
    pingedTasks: [],
    pendingRootTasks: 0,
    completedRootSegment: null, // body内容
    resumableState,
    renderState,
    onShellReady,
  }
  const rootSegment = createPendingSegment()
  rootSegment.parentFlushed = true
  const rootTask = createRenderTask(request, children, rootSegment)
  request.pingedTasks.push(rootTask)
  return request
}

function renderElement(request, task, type, props) {
  if (typeof type === 'function') {
    const children = type(props)
    task.node = children
    retryNode(request, task)
    return
  }
  if (typeof type === 'string') {
    const { chunks } = task.blockedSegment
    const children = pushStartInstance(chunks, type, props, request.renderState)
    if (type === 'head') {
      const preambleSegment = createPendingSegment()
      const preambleTask = createRenderTask(request, children, preambleSegment)
      request.pingedTasks.push(preambleTask)
    } else {
      task.node = children
      retryNode(request, task)
    }
    pushEndInstance(chunks, type, request.resumableState)
  }
}

function renderChildrenArray(request, task, children) {
  for (let i = 0; i < children.length; i++) {
    task.node = children[i]
    retryNode(request, task)
  }
}

function retryNode(request, task) {
  const { node } = task
  if (node === null) return
  if (Array.isArray(node)) {
    renderChildrenArray(request, task, node)
    return
  }
  if (typeof node === 'object') {
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        renderElement(request, task, node.type, node.props)
        break
    }
    return
  }
}

function retryTask(request, task) {
  retryNode(request, task)
  const { blockedSegment } = task
  if (blockedSegment.parentFlushed) {
    request.completedRootSegment = blockedSegment
  }
  request.pendingRootTasks--
  if (request.pendingRootTasks === 0) request.onShellReady()
}

export function performWork(request) {
  const prevDispatcher = ReactSharedInternals.H
  // 赋值服务端渲染时调用的Hook方法
  ReactSharedInternals.H = HooksDispatcher
  const pingedTasks = request.pingedTasks
  for (let i = 0; i < pingedTasks.length; i++) {
    const task = pingedTasks[i]
    retryTask(request, task)
  }
  pingedTasks.length = 0
  ReactSharedInternals.H = prevDispatcher
}

function flushPreamble(request, destination) {
  writePreambleStart(destination, request.renderState)
  writePreambleEnd(destination)
}

function flushSegment(request, destination) {
  const {
    completedRootSegment: { chunks },
  } = request
  for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
    writeChunk(destination, chunks[chunkIdx])
  }
}

export function startFlowing(request, destination) {
  beginWriting()
  const { completedRootSegment, resumableState, renderState } = request
  if (completedRootSegment !== null) {
    // 处理head
    flushPreamble(request, destination)
    // 处理body内容
    flushSegment(request, destination)
    request.completedRootSegment = null
    writeBootstrap(destination, renderState)
    // 添加body和html闭合标签
    writePostamble(destination, resumableState)
  }
  completeWriting(destination)
  destination.end()
}
