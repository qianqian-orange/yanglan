import { createWorkInProgress } from './ReactFiber'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  MemoComponent,
} from './ReactWorkTags'
import { NoLanes } from './ReactFiberLane'
import { Ref } from './ReactFiberFlags'
import { renderWithHooks } from './ReactFiberHooks'
import { shallowEqual } from './shared/shallowEqual'
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'

function markRef(current, workInProgress) {
  if (workInProgress.ref === null) {
    // 说明旧节点存在ref对象而新节点没有
    if (current !== null && current.ref !== null) workInProgress.flags |= Ref
  } else {
    // 说明新节点ref对象有变更
    if (current === null || current.ref !== workInProgress.ref) {
      workInProgress.flags |= Ref
    }
  }
}

function cloneChildFibers(current, workInProgress) {
  if (current.child === null) return null
  let newChild = createWorkInProgress(current.child, current.pendingProps)
  newChild.return = workInProgress
  workInProgress.child = newChild
  while (newChild.sibling !== null) {
    newChild = newChild.sibling = createWorkInProgress(
      newChild.sibling,
      newChild.pendingProps,
    )
    newChild.return = workInProgress
  }
  return workInProgress.child
}

/**
 * @param {*} current 旧FiberNode节点
 * @param {*} workInProgress FiberNode节点
 * @param {*} nextChildren child ReactElement对象
 */
export function reconcileChildren(current, workInProgress, nextChildren) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
    )
  }
  return workInProgress.child
}

function updateHostRoot(current, workInProgress) {
  if (current.child !== null) {
    const newChild = createWorkInProgress(current.child, current.pendingProps)
    newChild.return = workInProgress
    workInProgress.child = newChild
    return workInProgress.child
  }
  const { children: nextChildren } = workInProgress.pendingProps
  // 创建child ReactElement对象对应的FiberNode节点
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateFunctionComponent(current, workInProgress, Component) {
  // 调用组件方法获取child ReactElement对象
  const nextChildren = renderWithHooks(
    workInProgress,
    Component,
    workInProgress.pendingProps,
  )
  // 创建child ReactElement对应的FiberNode节点
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateHostComponent(current, workInProgress) {
  let { children: nextChildren } = workInProgress.pendingProps
  // 判断nextChildren是否是纯文本，是则不需要创建FiberNode节点，将nextChildren赋值为null
  if (typeof nextChildren === 'string' || typeof nextChildren === 'number') {
    nextChildren = null
  }
  markRef(current, workInProgress)
  // 创建child ReactElement对象对应的FiberNode节点
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateMemoComponent(current, workInProgress) {
  if (current !== null) {
    // 获取比对props方法
    const compare = workInProgress.elementType.compare || shallowEqual
    // 获取旧属性值
    const prevProps = current.pendingProps
    // 获取新属性值
    const nextProp = workInProgress.pendingProps
    // 比对属性值是否相同，相同复用旧child FiberNode节点
    if (compare(prevProps, nextProp)) {
      return cloneChildFibers(current, workInProgress)
    }
  }
  // 获取组件方法
  const Component = workInProgress.elementType.type
  // 调用组件方法获取新的child ReactElement
  return updateFunctionComponent(current, workInProgress, Component)
}

/**
 * @param {*} workInProgress FiberNode节点
 */
function beginWork(workInProgress, renderLanes) {
  // 获取旧FiberNode节点
  const current = workInProgress.alternate
  if (
    current !== null &&
    current.pendingProps === workInProgress.pendingProps &&
    (workInProgress.lanes & renderLanes) === NoLanes
  ) {
    return cloneChildFibers(current, workInProgress)
  }
  workInProgress.lanes = NoLanes
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case FunctionComponent: {
      // 获取组件方法
      const Component = workInProgress.elementType
      return updateFunctionComponent(current, workInProgress, Component)
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText: {
      return null
    }
    case MemoComponent:
      return updateMemoComponent(current, workInProgress)
  }
}

export { beginWork }
