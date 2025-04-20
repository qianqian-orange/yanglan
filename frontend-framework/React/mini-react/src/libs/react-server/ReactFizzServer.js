import {
  pushEndInstance,
  pushStartInstance,
  pushTextInstance,
  writeBootstrap,
  writeCompletedSegmentInstruction,
  writeEndPendingSuspenseBoundary,
  writeEndSegment,
  writePostamble,
  writePreambleEnd,
  writePreambleStart,
  writeStartPendingSuspenseBoundary,
  writeStartSegment,
} from '../react-dom-bindings/server/ReactFizzConfigDOM'
import ReactSharedInternals from '../shared/ReactSharedInternals'
import { REACT_ELEMENT_TYPE, REACT_SUSPENSE_TYPE } from '../shared/ReactSymbol'
import { HooksDispatcher } from './ReactFizzHooks'
import { getSuspendedThenable, SuspenseException } from './ReactFizzThenable'
import {
  beginWriting,
  completeWriting,
  writeChunk,
} from './ReactServerStreamConfigNode'

const OPENING = 10
// const OPEN = 11
// const CLOSING = 13
const CLOSED = 14

function noop() {}

function createPendingSegment(index, boundary) {
  return {
    id: -1,
    index, // 插入chunk位置下标
    parentFlushed: false,
    lastPushedText: false, // 上一个dom节点是否是纯文本
    chunks: [], // html片段
    children: [],
    boundary,
  }
}

function createSuspenseBoundary() {
  return {
    rootSegmentID: -1,
    pendingTasks: 0,
    completedSegments: [],
    parentFlushed: false,
  }
}

function pingTask(request, task) {
  const { pingedTasks } = request
  pingedTasks.push(task)
  queueMicrotask(() => performWork(request))
}

function createRenderTask(request, node, blockedBoundary, blockedSegment) {
  request.allPendingTasks++
  if (blockedBoundary === null) request.pendingRootTasks++
  else blockedBoundary.pendingTasks++
  const task = {
    node, // 当前vnode
    blockedBoundary,
    blockedSegment,
    ping: () => pingTask(request, task),
  }
  return task
}

export function createRequest(
  children,
  resumableState,
  renderState,
  onShellReady,
  onAllReady,
) {
  const request = {
    status: OPENING,
    pingedTasks: [],
    allPendingTasks: 0, // 包含同步/异步任务
    pendingRootTasks: 0, // 包含同步任务
    completedBoundaries: [], // 已fulfilled的suspense boundary
    completedRootSegment: null, // body内容
    nextSegmentId: 0, // segment唯一标识
    destination: null, // response实例
    resumableState,
    renderState,
    onShellReady: onShellReady || noop,
    onAllReady: onAllReady || noop,
  }
  const rootSegment = createPendingSegment(0, null)
  rootSegment.parentFlushed = true
  const rootTask = createRenderTask(request, children, null, rootSegment)
  request.pingedTasks.push(rootTask)
  return request
}

// 解析Function Component
function renderFunctionComponent(request, task, type, props) {
  const children = type(props)
  task.node = children
  retryNode(request, task)
}

// 解析元素标签
function renderHostElement(request, task, type, props) {
  const { blockedSegment, blockedBoundary } = task
  const children = pushStartInstance(
    blockedSegment.chunks,
    type,
    props,
    request.renderState,
  )
  blockedSegment.lastPushedText = false
  if (type === 'head') {
    const preambleSegment = createPendingSegment(0, null)
    const preambleTask = createRenderTask(
      request,
      children,
      blockedBoundary,
      preambleSegment,
    )
    request.pingedTasks.push(preambleTask)
  } else {
    task.node = children
    retryNode(request, task)
  }
  pushEndInstance(blockedSegment.chunks, type, request.resumableState)
}

// 解析SuspenseComponent
function renderSuspenseBoundary(request, task, props) {
  const parentBoundary = task.blockedBoundary
  const parentSegment = task.blockedSegment
  const newBoundary = createSuspenseBoundary()
  // 记录插入suspense chunk的下标
  const insertionIndex = parentSegment.chunks.length
  const boundarySegment = createPendingSegment(insertionIndex, newBoundary)
  parentSegment.children.push(boundarySegment)
  parentSegment.lastPushedText = false
  const { fallback, children } = props
  task.node = children
  try {
    retryNode(request, task)
  } catch (thrownValue) {
    if (thrownValue === SuspenseException) {
      const wakeable = getSuspendedThenable()
      const newTask = createRenderTask(
        request,
        children,
        newBoundary,
        createPendingSegment(0, null),
      )
      wakeable.then(newTask.ping, newTask.ping)
    }
  }
  // 获取fallback chunks
  const suspendedFallbackTask = createRenderTask(
    request,
    fallback,
    parentBoundary,
    boundarySegment,
  )
  request.pingedTasks.push(suspendedFallbackTask)
}

function renderElement(request, task, type, props) {
  if (typeof type === 'function') {
    renderFunctionComponent(request, task, type, props)
    return
  }
  if (typeof type === 'string') {
    renderHostElement(request, task, type, props)
    return
  }
  switch (type) {
    case REACT_SUSPENSE_TYPE:
      renderSuspenseBoundary(request, task, props)
      break
  }
}

function renderChildrenArray(request, task, children) {
  for (let i = 0; i < children.length; i++) {
    task.node = children[i]
    retryNode(request, task)
  }
}

function retryNode(request, task) {
  const { node, blockedSegment } = task
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
  if (typeof node === 'string') {
    blockedSegment.lastPushedText = pushTextInstance(
      blockedSegment.chunks,
      node,
      blockedSegment.lastPushedText,
    )
    return
  }
  if (typeof node === 'number') {
    blockedSegment.lastPushedText = pushTextInstance(
      blockedSegment.chunks,
      node + '',
      blockedSegment.lastPushedText,
    )
  }
}

function finishedTask(request, boundary, segment) {
  if (boundary === null) {
    if (segment.parentFlushed) request.completedRootSegment = segment
    request.pendingRootTasks--
    if (request.pendingRootTasks === 0) request.onShellReady()
  } else {
    boundary.pendingTasks--
    if (boundary.pendingTasks === 0) {
      boundary.completedSegments.push(segment)
    }
    if (boundary.parentFlushed) {
      request.completedBoundaries.push(boundary)
    }
  }
  request.allPendingTasks--
  if (request.allPendingTasks === 0) request.onAllReady()
}

function retryTask(request, task) {
  retryNode(request, task)
  finishedTask(request, task.blockedBoundary, task.blockedSegment)
}

export function performWork(request) {
  if (request.status === CLOSED) return
  const prevDispatcher = ReactSharedInternals.H
  // 赋值服务端渲染时调用的Hook方法
  ReactSharedInternals.H = HooksDispatcher
  const pingedTasks = request.pingedTasks
  for (let i = 0; i < pingedTasks.length; i++) {
    const task = pingedTasks[i]
    retryTask(request, task)
  }
  pingedTasks.length = 0
  if (request.destination) flushCompletedQueues(request, request.destination)
  ReactSharedInternals.H = prevDispatcher
}

function flushPreamble(request, destination) {
  const { renderState } = request
  writePreambleStart(destination, renderState)
  writePreambleEnd(destination, renderState)
}

function flushSubtree(request, destination, segment) {
  segment.parentFlushed = true
  const { chunks, children } = segment
  let chunkIdx = 0
  for (let childIdx = 0; childIdx < children.length; childIdx++) {
    const nextChild = children[childIdx]
    for (; chunkIdx < nextChild.index; chunkIdx++) {
      writeChunk(destination, chunks[chunkIdx])
    }
    flushSegment(request, destination, nextChild)
  }
  for (; chunkIdx < chunks.length; chunkIdx++) {
    writeChunk(destination, chunks[chunkIdx])
  }
}

function flushSegment(request, destination, segment) {
  const { boundary } = segment
  if (boundary === null) {
    flushSubtree(request, destination, segment)
    return
  }
  boundary.parentFlushed = true
  boundary.rootSegmentID = request.nextSegmentId++
  writeStartPendingSuspenseBoundary(
    destination,
    request.renderState,
    boundary.rootSegmentID,
  )
  flushSubtree(request, destination, segment)
  writeEndPendingSuspenseBoundary(destination)
}

function flushSegmentContainer(request, destination, segment) {
  writeStartSegment(destination, request.renderState, segment.id)
  flushSegment(request, destination, segment)
  writeEndSegment(destination)
}

function flushPartiallyCompletedSegment(
  request,
  destination,
  boundary,
  segment,
) {
  if (segment.id === -1) segment.id = boundary.rootSegmentID
  flushSegmentContainer(request, destination, segment)
}

function flushCompletedBoundary(request, destination, boundary) {
  const { completedSegments } = boundary
  for (let i = 0; i < completedSegments.length; i++) {
    flushPartiallyCompletedSegment(
      request,
      destination,
      boundary,
      completedSegments[i],
    )
  }
  completedSegments.length = 0
  // 插入script脚本
  writeCompletedSegmentInstruction(
    destination,
    request.renderState,
    boundary.rootSegmentID,
  )
}

function flushCompletedQueues(request, destination) {
  beginWriting()
  const {
    completedRootSegment,
    completedBoundaries,
    resumableState,
    renderState,
  } = request
  if (completedRootSegment !== null) {
    // 处理head
    flushPreamble(request, destination)
    // 处理body内容
    flushSegment(request, destination, completedRootSegment)
    request.completedRootSegment = null
    // 处理script标签
    writeBootstrap(destination, renderState)
  }
  for (let i = 0; i < completedBoundaries.length; i++) {
    const boundary = completedBoundaries[i]
    flushCompletedBoundary(request, destination, boundary)
  }
  completedBoundaries.length = 0
  if (
    request.allPendingTasks === 0 &&
    request.pingedTasks.length === 0 &&
    request.completedBoundaries.length === 0
  ) {
    // 添加body和html闭合标签
    writePostamble(destination, resumableState)
    completeWriting(destination)
    request.status = CLOSED
    destination.end()
    request.destination = null
  } else {
    completeWriting(destination)
  }
}

export function startFlowing(request, destination) {
  if (request.status === CLOSED) return
  if (request.destination !== null) return
  request.destination = destination
  flushCompletedQueues(request, destination)
}
