import {
  canHydrateSuspenseInstance,
  getFirstHydratableChild,
  getFirstHydratableChildWithinSuspenseInstance,
  getNextHydratableInstanceAfterSuspenseInstance,
  getNextHydratableSibling,
  hydrateInstance,
  hydrateSuspenseInstance,
  hydrateTextInstance,
} from '../react-dom-bindings/client/ReactFiberConfigDOM'
import { createFiberFromDehydratedFragment } from './ReactFiber'
import { OffscreenLane } from './ReactFiberLane'
import { HostComponent, HostRoot, SuspenseComponent } from './ReactWorkTags'

// 判断是否处于hydrate阶段
export let isHydrating = false
// 当前hydrate fiber节点
let hydrationParentFiber = null
// 当前hydrate dom节点
let nextHydratableInstance = null

// 处理根FiberNode hydrate逻辑
export function enterHydrationState(fiber) {
  const parentInstance = fiber.stateNode.containerInfo
  nextHydratableInstance = getFirstHydratableChild(parentInstance)
  isHydrating = true
  hydrationParentFiber = fiber
}

export function reenterHydrationStateFromDehydratedSuspenseInstance(
  fiber,
  suspenseInstance,
) {
  nextHydratableInstance =
    getFirstHydratableChildWithinSuspenseInstance(suspenseInstance)
  isHydrating = true
  hydrationParentFiber = fiber
}

// 处理HostComponent类型FiberNode hydrate逻辑
export function tryToClaimNextHydratableInstance(fiber) {
  if (!isHydrating) return
  if (nextHydratableInstance !== null) {
    fiber.stateNode = nextHydratableInstance
    hydrationParentFiber = fiber
    nextHydratableInstance = getFirstHydratableChild(nextHydratableInstance)
  }
}

// 处理HostText类型FiberNode hydrate逻辑
export function tryToClaimNextHydratableTextInstance(fiber) {
  if (!isHydrating) return
  if (nextHydratableInstance !== null) {
    fiber.stateNode = nextHydratableInstance
    hydrationParentFiber = fiber
    nextHydratableInstance = null
  }
}

// 处理SuspenseComponent类型FiberNode hydrate逻辑
export function tryToClaimNextHydratableSuspenseInstance(fiber) {
  if (!isHydrating) return
  if (nextHydratableInstance !== null) {
    const suspenseInstance = canHydrateSuspenseInstance(nextHydratableInstance)
    if (suspenseInstance === null) return
    const suspenseState = {
      dehydrated: suspenseInstance,
      retryLane: OffscreenLane,
    }
    fiber.memoizedState = suspenseState
    const dehydratedFragment =
      createFiberFromDehydratedFragment(suspenseInstance)
    dehydratedFragment.return = fiber
    fiber.child = dehydratedFragment
    hydrationParentFiber = fiber
    nextHydratableInstance = null
  }
}

// 获取父FiberNode
function popToNextHostParent(fiber) {
  hydrationParentFiber = fiber.return
  while (hydrationParentFiber) {
    switch (hydrationParentFiber.tag) {
      case HostRoot:
      case HostComponent:
        return
      default:
        hydrationParentFiber = hydrationParentFiber.return
    }
  }
}

export function popHydrationState(fiber) {
  if (fiber !== hydrationParentFiber) return false
  if (!isHydrating) return false
  popToNextHostParent(fiber)
  if (fiber.tag === SuspenseComponent) {
    const suspenseState = fiber.memoizedState
    const suspenseInstance =
      suspenseState !== null ? suspenseState.dehydrated : null
    nextHydratableInstance =
      getNextHydratableInstanceAfterSuspenseInstance(suspenseInstance)
  } else {
    // 获取下一个hydrate dom节点
    nextHydratableInstance = hydrationParentFiber
      ? getNextHydratableSibling(fiber.stateNode)
      : null
  }
  return true
}

export function resetHydrationState() {
  nextHydratableInstance = hydrationParentFiber = null
  isHydrating = false
}

export function prepareToHydrateHostInstance(fiber) {
  hydrateInstance(fiber.stateNode, fiber.pendingProps, fiber)
}

export function prepareToHydrateHostTextInstance(fiber) {
  hydrateTextInstance(fiber.stateNode, fiber)
}

export function prepareToHydrateHostSuspenseInstance(fiber) {
  const suspenseState = fiber.memoizedState
  const suspenseInstance = suspenseState.dehydrated
  hydrateSuspenseInstance(suspenseInstance, fiber)
}
