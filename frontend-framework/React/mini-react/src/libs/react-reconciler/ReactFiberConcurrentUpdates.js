import { HostRoot } from './ReactWorkTags'

// 获取FiberRootNode对象
export function getRootForUpdatedFiber(fiber) {
  while (fiber.tag !== HostRoot) {
    fiber = fiber.return
  }
  return fiber.stateNode
}

export function enqueueConcurrentRenderForLane(fiber, lanes) {
  fiber.lanes |= lanes
  if (fiber.alternate !== null) fiber.alternate.lanes |= lanes
  return getRootForUpdatedFiber(fiber)
}
