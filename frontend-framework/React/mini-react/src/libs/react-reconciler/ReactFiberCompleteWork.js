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
import { setInitialProperties } from '../react-dom-bindings/client/ReactDOMComponent'
import { NoFlags, Snapshot, Update, Visibility } from './ReactFiberFlags'
import { NoLanes } from './ReactFiberLane'
import { popProvider } from './ReactFiberNewContext'
import {
  popHydrationState,
  prepareToHydrateHostInstance,
  prepareToHydrateHostTextInstance,
} from './ReactFiberHydrationContext'
import {
  createInstance,
  createTextInstance,
} from '../react-dom-bindings/client/ReactFiberConfigDOM'
import { popSuspenseHandler } from './ReactFiberSuspenseContext'

function markUpdate(workInProgress) {
  workInProgress.flags |= Update
}

export function appendAllChildren(el, workInProgress) {
  let nextChild = workInProgress.child
  while (nextChild !== null) {
    if (nextChild.tag === HostComponent || nextChild.tag === HostText) {
      el.appendChild(nextChild.stateNode)
    } else {
      appendAllChildren(el, nextChild)
    }
    nextChild = nextChild.sibling
  }
}

function scheduleRetryEffect(workInProgress, retryQueue) {
  if (retryQueue !== null) markUpdate(workInProgress)
}

// 收集子树节点副作用
function bubbleProperties(workInProgress) {
  let subtreeFlags = NoFlags
  let child = workInProgress.child
  let newChildLanes = NoLanes
  while (child !== null) {
    newChildLanes |= child.lanes
    newChildLanes |= child.childLanes
    subtreeFlags |= child.flags
    subtreeFlags |= child.subtreeFlags
    child = child.sibling
  }
  workInProgress.childLanes = newChildLanes
  workInProgress.subtreeFlags |= subtreeFlags
}

function completeWork(workInProgress) {
  const current = workInProgress.alternate
  switch (workInProgress.tag) {
    // HostRoot和FunctionComponent类型的FiberNode节点没有对应的DOM节点，没有构建DOM树逻辑，只需要收集子树FiberNode节点副作用即可
    case HostRoot: {
      if (current !== null && current.child === null) {
        const wasHydrated = popHydrationState(workInProgress)
        if (!wasHydrated) workInProgress.flags |= Snapshot
      }
      bubbleProperties(workInProgress)
      return
    }
    case FunctionComponent:
    case MemoComponent:
    case Fragment:
      bubbleProperties(workInProgress)
      return
    case HostComponent: {
      if (current !== null) {
        if (workInProgress.pendingProps) markUpdate(workInProgress)
        bubbleProperties(workInProgress)
        return
      }
      // 处理FiberNode hydrate逻辑
      const wasHydrated = popHydrationState(workInProgress)
      if (wasHydrated) {
        prepareToHydrateHostInstance(workInProgress)
        bubbleProperties(workInProgress)
        return
      }
      // 创建DOM节点
      const { elementType, pendingProps } = workInProgress
      const instance = createInstance(elementType, pendingProps, workInProgress)
      // 将DOM节点赋值给FiberNode的stateNode属性
      workInProgress.stateNode = instance
      // 设置DOM节点属性
      setInitialProperties(instance, pendingProps)
      // 递归遍历FiberNode节点将对应的DOM节点添加到父DOM节点中，构建DOM树
      appendAllChildren(instance, workInProgress)
      // 收集子树FiberNode节点副作用
      bubbleProperties(workInProgress)
      return
    }
    case HostText: {
      if (current !== null) {
        if (workInProgress.pendingProps !== current.pendingProps)
          markUpdate(workInProgress)
        bubbleProperties(workInProgress)
        return
      }
      // 处理FiberNode hydrate逻辑
      const wasHydrated = popHydrationState(workInProgress)
      if (wasHydrated) {
        prepareToHydrateHostTextInstance(workInProgress)
        bubbleProperties(workInProgress)
        return
      }
      const { pendingProps } = workInProgress
      const instance = createTextInstance(pendingProps, workInProgress)
      workInProgress.stateNode = instance
      bubbleProperties(workInProgress)
      return
    }
    case ContextProvider:
      popProvider(workInProgress.elementType)
      bubbleProperties(workInProgress)
      return
    case SuspenseComponent: {
      popSuspenseHandler(workInProgress)
      if (current !== null) {
        const currentOffscreenFiber = current.child
        const offscreenFiber = workInProgress.child
        if (
          currentOffscreenFiber.pendingProps.mode !==
          offscreenFiber.pendingProps.mode
        )
          offscreenFiber.flags |= Visibility
      }
      const retryQueue = workInProgress.updateQueue
      scheduleRetryEffect(workInProgress, retryQueue)
      bubbleProperties(workInProgress)
      return
    }
    case OffscreenComponent:
      bubbleProperties(workInProgress)
      return
  }
}

export { completeWork }
