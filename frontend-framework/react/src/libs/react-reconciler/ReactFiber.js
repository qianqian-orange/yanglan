import { NoFlags } from './ReactFiberFlags'
import { NoLanes } from './ReactFiberLane'
import {
  DehydratedFragment,
  Fragment,
  OffscreenComponent,
} from './ReactWorkTags'

function FiberNode(tag, pendingProps, key = null) {
  this.tag = tag // FiberNode节点类型
  this.key = key // 对应ReactElement的key属性
  this.elementType = null // 对应ReactElement的type属性
  this.return = null // 父FiberNode节点
  this.child = null // 子FiberNode节点
  this.sibling = null // 兄弟FiberNode节点
  this.alternate = null // FiberNode副本节点
  this.deletions = null // 删除的FiberNode节点
  this.stateNode = null // FiberNode节点对应的DOM节点
  this.pendingProps = pendingProps // 对应ReactElement的props属性
  this.memoizedState = null // 记录Hook链表节点
  this.updateQueue = null // 记录effect数据
  this.ref = null // 记录ref数据
  this.flags = NoFlags // FiberNode节点状态
  this.subtreeFlags = NoFlags // 子树FiberNode节点状态
  this.lanes = NoLanes // 优先级标记
  this.childLanes = NoLanes // 子树FiberNode节点优先级
}

/**
 * @param {*} current FiberNode节点
 * @param {*} pendingProps 对应ReactElement对象的props
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate
  if (workInProgress !== null) {
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
    workInProgress.deletions = null
    workInProgress.pendingProps = pendingProps
  } else {
    workInProgress = new FiberNode(current.tag, pendingProps)
    workInProgress.alternate = current
    current.alternate = workInProgress
  }
  workInProgress.key = current.key
  workInProgress.elementType = current.elementType
  workInProgress.child = current.child
  workInProgress.sibling = current.sibling
  workInProgress.stateNode = current.stateNode
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.ref = current.ref
  workInProgress.lanes = current.lanes
  workInProgress.childLanes = current.childLanes
  return workInProgress
}

export function createFiber(tag, pendingProps) {
  return new FiberNode(tag, pendingProps)
}

export function createFiberFromFragment(elements) {
  const fiber = createFiber(Fragment, elements)
  return fiber
}

export function createFiberFromOffscreen(pendingProps) {
  const fiber = createFiber(OffscreenComponent, pendingProps)
  return fiber
}

export function createFiberFromDehydratedFragment(dehydratedNode) {
  const fiber = createFiber(DehydratedFragment, null)
  fiber.stateNode = dehydratedNode
  return fiber
}

export default FiberNode
