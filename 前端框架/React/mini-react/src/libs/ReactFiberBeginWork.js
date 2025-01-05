import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  NoLanes,
} from './FiberNode'
import { renderWithHooks } from './ReactFiberHooks'
import { createWorkInProgress, reconcileChildren } from './ReactFiberReconciler'

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
    if (workInProgress.child === null) {
      return null
    }
    let currentChild = workInProgress.child
    let newChild = createWorkInProgress(currentChild, currentChild.pendingProps)
    newChild.return = workInProgress
    workInProgress.child = newChild
    while (currentChild.sibling !== null) {
      currentChild = currentChild.sibling
      newChild = newChild.sibling = createWorkInProgress(
        currentChild,
        currentChild.pendingProps,
      )
      newChild.return = workInProgress
    }
    return workInProgress.child
  }
  workInProgress.lanes = NoLanes
  switch (workInProgress.tag) {
    case HostRoot: {
      if (current.child) {
        const newChild = createWorkInProgress(
          current.child,
          current.pendingProps,
        )
        newChild.return = workInProgress
        workInProgress.child = newChild
        return workInProgress.child
      }
      const { children: nextChildren } = workInProgress.pendingProps
      // 创建child ReactElement对象对应的FiberNode节点
      return reconcileChildren(current, workInProgress, nextChildren)
    }
    case FunctionComponent: {
      // 获取组件方法
      const Component = workInProgress.elementType
      // 调用组件方法获取child ReactElement对象
      const nextChildren = renderWithHooks(
        current,
        workInProgress,
        Component,
        workInProgress.pendingProps,
      )
      // 创建child ReactElement对应的FiberNode节点
      return reconcileChildren(current, workInProgress, nextChildren)
    }
    case HostComponent: {
      let { children: nextChildren } = workInProgress.pendingProps
      // 判断nextChildren是否是纯文本，是则不需要创建FiberNode节点，将nextChildren赋值为null
      if (
        typeof nextChildren === 'string' ||
        typeof nextChildren === 'number'
      ) {
        nextChildren = null
      }
      // 创建child ReactElement对象对应的FiberNode节点
      return reconcileChildren(current, workInProgress, nextChildren)
    }
    case HostText: {
      return null
    }
  }
}

export { beginWork }
