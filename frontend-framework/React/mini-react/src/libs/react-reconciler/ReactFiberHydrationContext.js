import {
  getFirstHydratableChild,
  getNextHydratableSibling,
  hydrateInstance,
  hydrateTextInstance,
} from '../react-dom-bindings/client/ReactFiberConfigDOM'
import { HostComponent, HostRoot } from './ReactWorkTags'

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
  // 获取下一个hydrate dom节点
  nextHydratableInstance = hydrationParentFiber
    ? getNextHydratableSibling(fiber.stateNode)
    : null
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
