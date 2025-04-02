import {
  getFirstHydratableChild,
  getNextHydratableSibling,
  hydrateInstance,
  hydrateTextInstance,
} from '../react-dom-bindings/ReactFiberConfigDOM'
import { HostComponent, HostRoot } from './ReactWorkTags'

// 判断是否处于hydrate阶段
let isHydrating = false
// 当前hydrate fiber节点
let hydrationParentFiber = null
// 当前hydrate dom节点
let nextHydratableInstance = null

export function enterHydrationState(fiber) {
  const parentInstance = fiber.stateNode.containerInfo
  nextHydratableInstance = getFirstHydratableChild(parentInstance)
  isHydrating = true
  hydrationParentFiber = fiber
}

export function tryToClaimNextHydratableInstance(fiber) {
  if (!isHydrating) return
  if (nextHydratableInstance !== null) {
    fiber.stateNode = nextHydratableInstance
    hydrationParentFiber = fiber
    nextHydratableInstance = getFirstHydratableChild(nextHydratableInstance)
  }
}

export function tryToClaimNextHydratableTextInstance(fiber) {
  if (!isHydrating) return
  if (nextHydratableInstance !== null) {
    fiber.stateNode = nextHydratableInstance
    hydrationParentFiber = fiber
    nextHydratableInstance = null
  }
}

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
  if (!isHydrating) return false
  popToNextHostParent(fiber)
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
