import { DidCapture, ShouldCapture } from './ReactFiberFlags'
import { resetHydrationState } from './ReactFiberHydrationContext'
import { popSuspenseHandler } from './ReactFiberSuspenseContext'
import { OffscreenComponent, SuspenseComponent } from './ReactWorkTags'

export function unwindWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case SuspenseComponent: {
      popSuspenseHandler(workInProgress)
      const suspenseState = workInProgress.memoizedState
      if (suspenseState !== null && suspenseState.dehydrated !== null) {
        resetHydrationState()
      }
      if (workInProgress.flags & ShouldCapture) {
        workInProgress.flags =
          (workInProgress.flags & ~ShouldCapture) | DidCapture
        return workInProgress
      }
      return null
    }
    case OffscreenComponent:
      if (workInProgress.flags & ShouldCapture) {
        workInProgress.flags =
          (workInProgress.flags & ~ShouldCapture) | DidCapture
        return workInProgress
      }
      return null
    default:
      return null
  }
}
