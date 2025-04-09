import {
  createFiberFromFragment,
  createFiberFromOffscreen,
  createWorkInProgress,
} from './ReactFiber'
import {
  ContextProvider,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  MemoComponent,
  OffscreenComponent,
  SuspenseComponent,
} from './ReactWorkTags'
import { NoLanes } from './ReactFiberLane'
import {
  ChildDeletion,
  DidCapture,
  NoFlags,
  Placement,
  Ref,
} from './ReactFiberFlags'
import { renderWithHooks } from './ReactFiberHooks'
import { shallowEqual } from '../shared/shallowEqual'
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { pushProvider } from './ReactFiberNewContext'
import {
  enterHydrationState,
  resetHydrationState,
  tryToClaimNextHydratableInstance,
  tryToClaimNextHydratableTextInstance,
} from './ReactFiberHydrationContext'
import {
  pushFallbackTreeSuspenseHandler,
  pushPrimaryTreeSuspenseHandler,
} from './ReactFiberSuspenseContext'

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
  let currentChild = current.child
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
  if (workInProgress.memoizedState?.isDehydrated) {
    workInProgress.memoizedState.isDehydrated = false
    enterHydrationState(workInProgress)
    return reconcileChildren(
      null,
      workInProgress,
      workInProgress.memoizedState.element,
    )
  }
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

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  renderLanes,
) {
  // 调用组件方法获取child ReactElement对象
  const nextChildren = renderWithHooks(
    workInProgress,
    Component,
    workInProgress.pendingProps,
    renderLanes,
  )
  // 创建child ReactElement对应的FiberNode节点
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateHostComponent(current, workInProgress) {
  if (current === null) tryToClaimNextHydratableInstance(workInProgress)
  let { children: nextChildren } = workInProgress.pendingProps
  // 判断nextChildren是否是纯文本，是则不需要创建FiberNode节点，将nextChildren赋值为null
  if (typeof nextChildren === 'string' || typeof nextChildren === 'number') {
    nextChildren = null
  }
  markRef(current, workInProgress)
  // 创建child ReactElement对象对应的FiberNode节点
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateHostText(current, workInProgress) {
  if (current === null) tryToClaimNextHydratableTextInstance(workInProgress)
  return null
}

function updateMemoComponent(current, workInProgress, renderLanes) {
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
  return updateFunctionComponent(
    current,
    workInProgress,
    Component,
    renderLanes,
  )
}

function updateContextProvider(current, workInProgress) {
  const context = workInProgress.elementType
  const newProps = workInProgress.pendingProps
  const newValue = newProps.value
  pushProvider(context, newValue)
  const newChildren = newProps.children
  return reconcileChildren(current, workInProgress, newChildren)
}

function mountSuspenseFallbackChildren(
  workInProgress,
  primaryChildren,
  fallbackChildren,
) {
  const primaryChildProps = {
    mode: 'hidden',
    children: primaryChildren,
  }
  const primaryChildFragment = createFiberFromOffscreen(primaryChildProps)
  const fallbackChildFragment = createFiberFromFragment(fallbackChildren)
  primaryChildFragment.return = workInProgress
  fallbackChildFragment.return = workInProgress
  primaryChildFragment.sibling = fallbackChildFragment
  workInProgress.child = primaryChildFragment
  return fallbackChildFragment
}

function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
  const primaryChildProps = {
    mode: 'visible',
    children: primaryChildren,
  }
  const primaryChildFragment = createFiberFromOffscreen(primaryChildProps)
  primaryChildFragment.return = workInProgress
  workInProgress.child = primaryChildFragment
  return primaryChildFragment
}

function updateSuspenseFallbackChildren(
  current,
  workInProgress,
  primaryChildren,
  fallbackChildren,
) {
  const currentPrimaryChildFragment = current.child
  const currentFallbackChildFragment = currentPrimaryChildFragment.sibling
  const primaryChildProps = {
    mode: 'hidden',
    children: primaryChildren,
  }
  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    primaryChildProps,
  )
  let fallbackChildFragment
  if (currentFallbackChildFragment !== null) {
    fallbackChildFragment = createWorkInProgress(
      currentFallbackChildFragment,
      fallbackChildren,
    )
  } else {
    fallbackChildFragment = createFiberFromFragment(fallbackChildren)
    fallbackChildFragment.flags |= Placement
  }
  primaryChildFragment.return = workInProgress
  fallbackChildFragment.return = workInProgress
  primaryChildFragment.sibling = fallbackChildFragment
  workInProgress.child = primaryChildFragment
  return fallbackChildFragment
}

function updateSuspensePrimaryChildren(
  current,
  workInProgress,
  primaryChildren,
) {
  const currentPrimaryChildFragment = current.child
  const currentFallbackChildFragment = currentPrimaryChildFragment.sibling
  const primaryChildFragment = createWorkInProgress(
    currentPrimaryChildFragment,
    {
      mode: 'visible',
      children: primaryChildren,
    },
  )
  primaryChildFragment.return = workInProgress
  primaryChildFragment.sibling = null
  workInProgress.child = primaryChildFragment
  if (currentFallbackChildFragment !== null) {
    const deletions = workInProgress.deletions
    if (deletions === null) {
      workInProgress.deletions = [currentFallbackChildFragment]
      workInProgress.flags |= ChildDeletion
    } else deletions.push(currentFallbackChildFragment)
  }
  return primaryChildFragment
}

function updateSuspenseComponent(current, workInProgress) {
  const nextProps = workInProgress.pendingProps
  // 是否展示fallback组件
  let showFallback = false
  const didSuspend = (workInProgress.flags & DidCapture) !== NoFlags
  if (didSuspend) {
    showFallback = true
    workInProgress.flags &= ~DidCapture
  }
  const nextFallbackChildren = nextProps.fallback
  const nextPrimaryChildren = nextProps.children
  if (current === null) {
    if (showFallback) {
      pushFallbackTreeSuspenseHandler(workInProgress)
      const fallbackFragment = mountSuspenseFallbackChildren(
        workInProgress,
        nextPrimaryChildren,
        nextFallbackChildren,
      )
      return fallbackFragment
    } else {
      pushPrimaryTreeSuspenseHandler(workInProgress)
      return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren)
    }
  }
  if (showFallback) {
    pushFallbackTreeSuspenseHandler(workInProgress)
    return updateSuspenseFallbackChildren(
      current,
      workInProgress,
      nextPrimaryChildren,
      nextFallbackChildren,
    )
  } else {
    pushPrimaryTreeSuspenseHandler(workInProgress)
    return updateSuspensePrimaryChildren(
      current,
      workInProgress,
      nextPrimaryChildren,
    )
  }
}

function updateOffscreenComponent(current, workInProgress) {
  const nextProps = workInProgress.pendingProps
  const nextChildren = nextProps.children
  return reconcileChildren(current, workInProgress, nextChildren)
}

function updateFragment(current, workInProgress) {
  const nextChildren = workInProgress.pendingProps
  return reconcileChildren(current, workInProgress, nextChildren)
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
    switch (workInProgress.tag) {
      case HostRoot:
        resetHydrationState()
        break
    }
    return cloneChildFibers(current, workInProgress)
  }
  workInProgress.lanes = NoLanes
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case FunctionComponent: {
      // 获取组件方法
      const Component = workInProgress.elementType
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        renderLanes,
      )
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText(current, workInProgress)
    case MemoComponent:
      return updateMemoComponent(current, workInProgress, renderLanes)
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes)
    case SuspenseComponent:
      return updateSuspenseComponent(current, workInProgress, renderLanes)
    case OffscreenComponent:
      return updateOffscreenComponent(current, workInProgress, renderLanes)
    case Fragment:
      return updateFragment(current, workInProgress, renderLanes)
  }
}

export { beginWork }
