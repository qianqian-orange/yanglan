import {
  // Incomplete,
  ShouldCapture,
} from './ReactFiberFlags'
import {
  // shellBoundary,
  suspenseHandlerStackCursor,
} from './ReactFiberSuspenseContext'
// import { renderDidSuspend } from './ReactFiberWorkLoop'
import { SuspenseComponent } from './ReactWorkTags'

export function throwException(sourceFiber, value) {
  // sourceFiber.flags |= Incomplete
  // 当前Suspense组件类型FiberNode
  const suspenseBoundary = suspenseHandlerStackCursor.current
  if (suspenseBoundary !== null) {
    switch (suspenseBoundary.tag) {
      case SuspenseComponent: {
        // if (shellBoundary !== null) {
        //   const current = suspenseBoundary.alternate
        //   if (current === null) renderDidSuspend()
        // }
        suspenseBoundary.flags |= ShouldCapture
        const retryQueue = suspenseBoundary.updateQueue
        if (retryQueue === null) suspenseBoundary.updateQueue = new Set([value])
        else retryQueue.add(value)
        return
      }
    }
  }
}
