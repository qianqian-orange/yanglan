import { createCursor, pop, push } from './ReactFiberStack'

// 记录当前Suspense组件类型FiberNode
export const suspenseHandlerStackCursor = createCursor(null)

export let shellBoundary = null

export function pushPrimaryTreeSuspenseHandler(fiber) {
  push(suspenseHandlerStackCursor, fiber)
  if (shellBoundary === null) shellBoundary = fiber
}

export function pushFallbackTreeSuspenseHandler() {
  push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current)
}

export function popSuspenseHandler(fiber) {
  pop(suspenseHandlerStackCursor)
  if (shellBoundary === fiber) shellBoundary = null
}
