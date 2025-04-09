import { createCursor, pop, push } from './ReactFiberStack'

// const DefaultSuspenseContext = 0
// const SubtreeSuspenseContextMask = 1
// export const ForceSuspenseFallback = 2

// const suspenseStackCursor = createCursor(DefaultSuspenseContext)
// 记录当前Suspense组件类型FiberNode
export const suspenseHandlerStackCursor = createCursor(null)

export let shellBoundary = null

// function setDefaultShallowSuspenseListContext(parentContext) {
//   return parentContext & SubtreeSuspenseContextMask
// }

// function pushSuspenseListContext(newContext) {
//   push(suspenseStackCursor, newContext)
// }

// function popSuspenseListContext() {
//   pop(suspenseStackCursor)
// }

export function pushPrimaryTreeSuspenseHandler(fiber) {
  // pushSuspenseListContext(
  //   setDefaultShallowSuspenseListContext(suspenseStackCursor.current),
  // )
  push(suspenseHandlerStackCursor, fiber)
  if (shellBoundary === null) shellBoundary = fiber
}

export function pushFallbackTreeSuspenseHandler() {
  // pushSuspenseListContext(suspenseStackCursor.current)
  push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current)
}

export function popSuspenseHandler(fiber) {
  pop(suspenseHandlerStackCursor)
  // popSuspenseListContext()
  if (shellBoundary === fiber) shellBoundary = null
}
